from .utils.rag_client import score_assignment_text
from django.db import transaction
from django.db import transaction
from .models import StudentAssignment
import logging
logger = logging.getLogger(__name__)


PLAG_WEIGHT = 0.4
CORRECTNESS_WEIGHT = 0.6

def run_rag_grading(assignment, eligible_submissions):
    if not assignment.rag_collection:
        raise RuntimeError("Assignment has no RAG collection")

    for submission in eligible_submissions:
        try:
            if not submission.extracted_text:
                logger.warning(f"No extracted text for {submission.id}")
                continue

            rag_response = score_assignment_text(
                collection_name=assignment.rag_collection,
                extracted_text=submission.extracted_text
            )

            if not rag_response.get("success"):
                logger.error(f"RAG failed: {rag_response}")
                submission.correctness_status = "failed"
                submission.save(update_fields=["correctness_status"])
                continue

            correctness_score = rag_response["score"]
            if correctness_score > 10:
                correctness_score = round(correctness_score / 10, 2)

            submission.correctness_score = correctness_score
            submission.status = "processed_rag"
            submission.correctness_status = "graded"

            submission.save(
                update_fields=["correctness_score", "status", "correctness_status"]
            )

        except Exception as e:
            logger.exception("RAG exception")
            submission.correctness_status = "error"
            submission.ocr_error = str(e)
            submission.save(update_fields=["correctness_status", "ocr_error"])

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