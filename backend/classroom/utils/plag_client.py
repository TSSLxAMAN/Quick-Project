import requests
from django.conf import settings
from typing import List

PLAG_SERVICE_URL = getattr(
    settings,
    "PLAGIARISM_SERVICE_URL",
    "http://localhost:8002/api/plagiarism/check"
)

def run_plagiarism_check(assignment, submissions):
    """
    Sends all student submissions of an assignment to the
    plagiarism microservice and returns the results.

    Does NOT write to DB.
    """

    payload = {
        "assignment_group_id": str(assignment.id),
        "assignments": []
    }

    for sub in submissions:
        if not sub.extracted_text:
            continue  # safety guard

        payload["assignments"].append({
            "assignment_id": str(sub.id),
            "student_id": str(sub.student.id),
            "extracted_text": sub.extracted_text,
            "submitted_at": sub.submitted_at.isoformat()
        })

    if len(payload["assignments"]) < 2:
        # No plagiarism possible
        return {
            "success": True,
            "results": []
        }

    try:
        response = requests.post(
            PLAG_SERVICE_URL,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        return response.json()

    except requests.RequestException as e:
        raise RuntimeError(f"Plagiarism service failed: {str(e)}")
