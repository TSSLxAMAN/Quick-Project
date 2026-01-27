from django_celery_beat.models import ClockedSchedule, PeriodicTask
from django.utils import timezone
import json

def schedule_assignment_evaluation(assignment):
    """
    Schedule Celery task to run exactly at assignment.deadline
    """
    print(assignment)
    # Prevent scheduling in the past
    if assignment.deadline <= timezone.now():
        raise ValueError("Deadline is in the past")

    clocked, _ = ClockedSchedule.objects.get_or_create(
        clocked_time=assignment.deadline
    )

    task_name = f"evaluate_assignment_{assignment.id}"

    PeriodicTask.objects.create(
        clocked=clocked,
        name=task_name,
        task="classroom.tasks.evaluate_assignment_after_deadline",
        one_off=True,
        args=json.dumps([str(assignment.id)]),
    )
