from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import JoinRequest, StudentClassroom

@receiver(post_save, sender=JoinRequest)
def handle_join_request(sender, instance, **kwargs):
    if instance.status == 'approved':
        StudentClassroom.objects.get_or_create(
            classroom=instance.classroom,
            student=instance.student,
        )
        if not instance.reviewed_at:
            instance.reviewed_at = timezone.now()
            instance.save()
