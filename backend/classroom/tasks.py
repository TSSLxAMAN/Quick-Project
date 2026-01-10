from celery import shared_task
from django.utils import timezone
from .models import Assignment

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, retry_kwargs={'max_retries': 3})
def evaluate_assignment_after_deadline(self, assignment_id):
    """
    This will later:
    1. Run plagiarism check
    2. Run RAG correctness check
    3. Compute final score
    """
    assignment = Assignment.objects.get(id=assignment_id)

    # Placeholder log
    print(f"Evaluating assignment {assignment.id} at {timezone.now()}")

    return True
