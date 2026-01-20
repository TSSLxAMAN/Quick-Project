from .utils.rag_client import score_assignment_pdf
from django.db import transaction
from django.db import transaction
from .models import StudentAssignment


PLAG_WEIGHT = 0.4
CORRECTNESS_WEIGHT = 0.6

def run_rag_grading(assignment, eligible_submissions):
    """
    Runs RAG correctness scoring on eligible submissions only
    """

    if not assignment.rag_collection:
        raise RuntimeError("Assignment has no RAG collection")

    for submission in eligible_submissions.select_for_update():
        # Skip already graded
        if submission.status == "graded":
            continue

        # Skip missing PDF
        if not submission.submitted_file:
            continue

        # Call RAG
        rag_response = score_assignment_pdf(
            collection_name=assignment.rag_collection,
            pdf_path=submission.submitted_file.path
        )

        # Expected RAG response:
        # {
        #   success: true,
        #   score: 78.5,
        #   feedback: "...",
        #   details: {...}
        # }

        if not rag_response.get("success"):
            raise RuntimeError("RAG scoring failed")

        correctness_score = rag_response["score"]  # already 0–100 or 0–10

        # Normalize to 0–10 if needed
        if correctness_score > 10:
            correctness_score = round(correctness_score / 10, 2)

        submission.correctness_score = correctness_score
        submission.marks = correctness_score  # temp, final comes later
        submission.status = "graded"

        submission.save(update_fields=[
            "correctness_score",
            "marks",
            "status"
        ])

def finalize_marks(assignment):
    """
    Combine plagiarism + correctness into final score
    """

    submissions = StudentAssignment.objects.filter(
        assignment=assignment,
        status="graded"
    )

    for sub in submissions.select_for_update():

        # Absolute rule: copied = zero
        if sub.plagiarism_score == 0:
            sub.final_score = 0.0
            sub.save(update_fields=["final_score"])
            continue

        # Safety checks
        plag_marks = sub.marks or 0
        correctness = sub.correctness_score or 0

        final = (
            plag_marks * PLAG_WEIGHT +
            correctness * CORRECTNESS_WEIGHT
        )

        # Clamp to 0–10
        final = round(max(0, min(final, 10)), 2)

        sub.final_score = final
        sub.save(update_fields=["final_score"])
