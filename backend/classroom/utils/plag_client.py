import requests
from requests.exceptions import RequestException
from decouple import config

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

    try:
        resp = requests.post(
            CHECK_URL,
            json=payload,
            timeout=timeout
        )
        resp.raise_for_status()
        return resp.json()

    except RequestException as e:
        # Let caller decide retry / rollback
        raise RuntimeError(f"Plagiarism check failed: {str(e)}")

def build_plagiarism_payload(assignment, student_assignments):

    submissions = []

    for sub in student_assignments:
        if not sub.extracted_text:
            continue  # skip OCR failures

        submissions.append({
            "assignment_id": str(sub.id),
            "student_id": str(sub.student.id),
            "extracted_text": sub.extracted_text,
            "submitted_at": sub.submitted_at.isoformat()
        })

    return submissions
