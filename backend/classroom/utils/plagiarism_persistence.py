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
                continue

            try:
                submission = StudentAssignment.objects.select_for_update().get(
                    id=submission_id
                )
            except StudentAssignment.DoesNotExist:
                continue

            # 1. GET THE PENALTY (0.0 to 1.0)
            # The microservice returns "plagiarism_score" as the PENALTY.
            # 0.0 = Original (Good), 1.0 = Copied (Bad)
            plag_penalty = result.get("plagiarism_score") 
            similarity = result.get("max_similarity")
            status = result.get("status")

            # Defensive defaults
            plag_penalty = float(plag_penalty) if plag_penalty is not None else 0.0
            similarity = float(similarity) if similarity is not None else 0.0

            # 2. CONVERT PENALTY TO MARKS (10.0 Scale)
            # If Penalty is 0.0 (Original) -> Marks = 10.0
            # If Penalty is 1.0 (Copied)   -> Marks = 0.0
            # If Penalty is 0.5 (Suspect)  -> Marks = 5.0
            MAX_PLAG_MARKS = 10.0
            plag_marks = MAX_PLAG_MARKS * (1.0 - plag_penalty)
            
            # Round for cleanliness
            plag_marks = round(plag_marks, 2)

            # 3. SAVE TO DB
            submission.plagiarism_similarity = round(similarity, 4)
            submission.plagiarism_score = plag_marks  # Now this is a SCORE (High is Good)
            submission.plagiarism_status = status

            # IMPORTANT: Don't set `submission.marks` here yet if you want to keep them separate.
            # But if your frontend relies on it temporarily, you can keep it.
            
            submission.save(
                update_fields=[
                    "plagiarism_similarity",
                    "plagiarism_score",
                    "plagiarism_status"
                ]
            )

            logger.info(
                f"Plagiarism saved for {submission.id}: "
                f"Penalty={plag_penalty}, Marks={plag_marks}, Status={status}"
            )
