from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from classroom.models import JoinRequest, StudentClassroom

@receiver(post_save, sender=JoinRequest)
def handle_join_request_status(sender, instance, created, **kwargs):
    # When a join request is approved
    if instance.status == 'approved':
        # Create student-classroom mapping if not already present
        StudentClassroom.objects.get_or_create(
            classroom=instance.classroom,
            student=instance.student
        )

        # Only set reviewed_at once (no recursion)
        if instance.reviewed_at is None:
            JoinRequest.objects.filter(pk=instance.pk).update(
                reviewed_at=timezone.now()
            )
