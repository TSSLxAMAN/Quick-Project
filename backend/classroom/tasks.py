from celery import shared_task
from django.utils import timezone
from .models import Assignment, StudentAssignment
from .utils.plag_client import run_plagiarism_check,    build_plagiarism_payload

from .utils.plagiarism_persistence import save_plagiarism_results
from .task_helpers import run_rag_grading, finalize_marks

from .models import StudentAssignment
from .utils.ocr_client import extract_text_from_pdf_file
import logging
logger = logging.getLogger(__name__)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=30, retry_kwargs={'max_retries': 3})
def evaluate_assignment_after_deadline(self, assignment_id):

    logger.info(f"[TASK START] evaluate_assignment_after_deadline | assignment_id={assignment_id}")

    assignment = Assignment.objects.get(id=assignment_id)
    logger.info(f"[ASSIGNMENT STATUS] {assignment.status}")

    submissions_qs = StudentAssignment.objects.filter(
        assignment=assignment,
        status="submitted",
        extracted_text__isnull=False
    )

    logger.info(f"[PLAG INPUT COUNT] {submissions_qs.count()}")

    if submissions_qs.exists():
        plagiarism_results = run_plagiarism_check(
            assignment_id=str(assignment.id),
            submissions=build_plagiarism_payload(assignment, submissions_qs)
        )
        save_plagiarism_results(plagiarism_results)

    cheaters = StudentAssignment.objects.filter(
        assignment=assignment,
        plagiarism_score__lte=0,
        status="submitted"
    )

    logger.info(f"[CHEATERS COUNT] {cheaters.count()}")

    for cheater in cheaters:
        cheater.final_score = 0.0
        cheater.status = "graded"
        cheater.save(update_fields=["final_score", "status"])

    eligible_for_rag = list(
        StudentAssignment.objects.filter(
            assignment=assignment,
            plagiarism_score__gt=0,
            status="submitted",
            extracted_text__isnull=False
        )
    )

    logger.info(f"[RAG ELIGIBLE COUNT] {len(eligible_for_rag)}")

    if eligible_for_rag:
        run_rag_grading(assignment, eligible_for_rag)
    else:
        logger.warning("[RAG SKIPPED] No eligible submissions")

    finalize_marks(assignment)

    assignment.status = "GRADED"
    assignment.save(update_fields=["status"])

    logger.info("[TASK END] Evaluation complete")

    return "Evaluation complete"



@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=20,
    retry_kwargs={"max_retries": 3},
)

def run_ocr_for_submission(self, submission_id):
    submission = StudentAssignment.objects.get(id=submission_id)

    try:
        file_path = submission.submitted_file.path
        extracted_text, _ = extract_text_from_pdf_file(file_path)

        submission.extracted_text = extracted_text
        submission.ocr_status = "success"
        submission.ocr_error = ""
        submission.save(update_fields=[
            "extracted_text",
            "ocr_status",
            "ocr_error"
        ])

        return "OCR success"

    except Exception as e:
        submission.ocr_status = "failed"
        submission.ocr_error = str(e)[:500]
        submission.save(update_fields=[
            "ocr_status",
            "ocr_error"
        ])
        raise
