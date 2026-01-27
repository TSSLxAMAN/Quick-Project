from .utils.rag_client import score_assignment_pdf
from django.db import transaction
from django.db import transaction
from .models import StudentAssignment


PLAG_WEIGHT = 0.4
CORRECTNESS_WEIGHT = 0.6

def run_rag_grading(assignment, eligible_submissions):
    if not assignment.rag_collection:
        raise RuntimeError("Assignment has no RAG collection")

    # Iterate without select_for_update to avoid locking the DB during network calls
    for submission in eligible_submissions:
        try:
            if not submission.submitted_file:
                continue

            # API CALL
            rag_response = score_assignment_pdf(
                collection_name=assignment.rag_collection,
                pdf_path=submission.submitted_file.path
            )

            if not rag_response.get("success"):
                # Log error but DO NOT raise exception, allow other students to proceed
                print(f"RAG failed for {submission.id}") 
                continue

            correctness_score = rag_response["score"]
            if correctness_score > 10:
                correctness_score = round(correctness_score / 10, 2)

            # SAVE TO DB
            submission.correctness_score = correctness_score
            # REMOVED: submission.marks = ... (Don't overwrite this!)
            submission.status = "processed_rag" # Intermediate status
            submission.save(update_fields=["correctness_score", "status"])

        except Exception as e:
            # Handle individual failure so one student doesn't stop the whole class
            submission.ocr_error = str(e) # reusing error field or create a new one
            submission.save(update_fields=["ocr_error"])
            continue

def finalize_marks(assignment):
    # Fetch everyone who has been processed by RAG
    # Cheaters are already marked "graded" and 0, so we skip them here
    submissions = StudentAssignment.objects.filter(
        assignment=assignment,
        status="processed_rag" 
    )

    for sub in submissions:
        # Retrieve scores explicitly
        plag_marks = sub.plagiarism_score or 0  # Use the specific field
        correctness = sub.correctness_score or 0 # Use the specific field

        final = (
            plag_marks * PLAG_WEIGHT +
            correctness * CORRECTNESS_WEIGHT
        )

        final = round(max(0, min(final, 10)), 2)

        sub.final_score = final
        sub.status = "graded" # Now they are fully graded
        sub.save(update_fields=["final_score", "status"])