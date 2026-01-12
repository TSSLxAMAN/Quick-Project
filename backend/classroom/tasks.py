from celery import shared_task
from django.utils import timezone
from .models import Assignment
from .models import StudentAssignment

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=30, retry_kwargs={'max_retries': 3})
def evaluate_assignment_after_deadline(self, assignment_id):
    assignment = Assignment.objects.select_for_update().get(id=assignment_id)

    if timezone.now() < assignment.deadline:
        return "Deadline not reached"

    submissions = StudentAssignment.objects.filter(
        assignment=assignment,
        status="submitted",
        extracted_text__isnull=False
    )

    if not submissions.exists():
        return "No submissions"

    # 1️⃣ Call plagiarism microservice
    plagiarism_results = run_plagiarism_check(assignment, submissions)

    # 2️⃣ Persist plagiarism results
    save_plagiarism_results(plagiarism_results)

    # 3️⃣ Select eligible submissions
    eligible = submissions.exclude(plagiarism_score=0)

    # 4️⃣ Run RAG correctness only for eligible
    run_rag_grading(assignment, eligible)

    # 5️⃣ Finalize marks
    finalize_marks(assignment)

    assignment.status = "GRADED"
    assignment.save(update_fields=["status"])

    return "Evaluation complete"

