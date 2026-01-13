from celery import shared_task
from django.utils import timezone
from .models import Assignment, StudentAssignment
from .utils.plag_client import (
    run_plagiarism_check,
    build_plagiarism_payload
)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=30, retry_kwargs={'max_retries': 3})
def evaluate_assignment_after_deadline(self, assignment_id):
    assignment = Assignment.objects.get(id=assignment_id)

    if timezone.now() < assignment.deadline:
        return "Deadline not reached"

    submissions_qs = StudentAssignment.objects.filter(
        assignment=assignment,
        status="submitted",
        extracted_text__isnull=False
    )

    if not submissions_qs.exists():
        return "No submissions"

    # 1️⃣ Build payload
    submissions_payload = build_plagiarism_payload(
        assignment,
        submissions_qs
    )

    # 2️⃣ Call plagiarism microservice
    plagiarism_results = run_plagiarism_check(
        assignment_id=str(assignment.id),
        submissions=submissions_payload
    )

    # 3️⃣ Persist plagiarism results
    save_plagiarism_results(plagiarism_results)

    # 4️⃣ Select eligible submissions
    eligible = submissions_qs.exclude(plagiarism_score=0)

    # 5️⃣ Run RAG correctness only for eligible
    run_rag_grading(assignment, eligible)

    # 6️⃣ Finalize marks
    finalize_marks(assignment)

    assignment.status = "GRADED"
    assignment.save(update_fields=["status"])

    return "Evaluation complete"
