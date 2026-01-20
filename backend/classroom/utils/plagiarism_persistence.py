from django.db import transaction
from classroom.models import StudentAssignment
import logging

logger = logging.getLogger(__name__)


def save_plagiarism_results(plagiarism_response: dict):
    """
    Persist plagiarism results returned by plagiarism microservice
    """

    if not plagiarism_response.get("success"):
        raise ValueError("Plagiarism response unsuccessful")

    results = plagiarism_response.get("results", [])
    if not results:
        logger.warning("No plagiarism results to persist")
        return

    with transaction.atomic():
        for result in results:
            submission_id = result.get("assignment_id")

            if not submission_id:
                logger.warning("Missing assignment_id in plagiarism result")
                continue

            try:
                submission = StudentAssignment.objects.select_for_update().get(
                    id=submission_id
                )
            except StudentAssignment.DoesNotExist:
                logger.error(
                    f"StudentAssignment {submission_id} not found. Skipping."
                )
                continue

            # Similarity is always cosine similarity (0–1)
            similarity = result.get("max_similarity")

            # Marks from plagiarism service (0–10 scale)
            plag_marks = result.get("marks")

            # Defensive defaults
            similarity = float(similarity) if similarity is not None else 0.0
            plag_marks = float(plag_marks) if plag_marks is not None else 0.0

            submission.plagiarism_similarity = round(similarity, 4)
            submission.plagiarism_score = plag_marks

            # Temporarily store plagiarism marks in `marks`
            # Final score will overwrite this later
            submission.marks = plag_marks

            submission.save(
                update_fields=[
                    "plagiarism_similarity",
                    "plagiarism_score",
                    "marks",
                ]
            )

            logger.info(
                f"Plagiarism saved for submission {submission.id}: "
                f"similarity={similarity}, marks={plag_marks}"
            )
