import requests
from requests.exceptions import RequestException
from decouple import config
import logging
import json

logger = logging.getLogger(__name__)
PLAG_PATH = config("PLAG_PATH")  # e.g. 
CHECK_URL = f"{PLAG_PATH}/plagiarism/check"

def run_plagiarism_check(
    assignment_id: str,
    submissions: list,
    timeout: int = 120
):
    payload = {
        "assignment_group_id": str(assignment_id),
        "assignments": submissions
    }

    # Log ACTUAL JSON, not Python repr
    logger.info(
        "Plagiarism Check Payload:\n%s",
        json.dumps(payload, indent=2, ensure_ascii=False)
    )

    try:
        resp = requests.post(
            CHECK_URL,
            json=payload,   # ← THIS WAS ALWAYS CORRECT
            timeout=timeout
        )
        resp.raise_for_status()
        return resp.json()

    except RequestException as e:
        raise RuntimeError(f"Plagiarism check failed: {str(e)}")


def build_plagiarism_payload(assignment, student_assignments):

    submissions = []

    for sub in student_assignments:
        if not sub.extracted_text:
            continue  # skip OCR failures

        submissions.append({
            "assignment_id": str(sub.id),
            "extracted_text": sub.extracted_text,
            "student_id": str(sub.student.id),
            "submitted_at": sub.submitted_at.isoformat()
        })   

    return submissions
