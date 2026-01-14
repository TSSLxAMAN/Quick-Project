from django.db import transaction
from classroom.models import StudentAssignment


def save_plagiarism_results(plagiarism_response: dict):
    """
    Persist plagiarism results into StudentAssignment table.

    Expected plagiarism_response format:
    {
        "success": true,
        "results": [
            {
                "assignment_id": "...",
                "plagiarism_score": 0.96,
                "marks": 0,
                "status": "COPIED",
                ...
            }
        ]
    }
    """

    if not plagiarism_response.get("success"):
        raise ValueError("Plagiarism service returned unsuccessful response")

    results = plagiarism_response.get("results", [])

    with transaction.atomic():
        for result in results:
            submission_id = result["assignment_id"]

            # Defensive: never crash on one bad row
            try:
                submission = StudentAssignment.objects.select_for_update().get(
                    id=submission_id
                )
            except StudentAssignment.DoesNotExist:
                continue

            similarity = float(result.get("plagiarism_score", 0))
            marks = float(result.get("marks", 0))

            # Hard rule enforcement (safety net)
            if result.get("status") == "COPIED":
                marks = 0.0

            submission.plagiarism_score = round(similarity, 4)
            submission.marks = round(marks, 2)

            # Do NOT mark graded yet
            submission.save(
                update_fields=["plagiarism_score", "marks"]
            )
