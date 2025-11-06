from django.db import models
from django.conf import settings
import uuid 

# Create your models here.
class Teacher(models.Model):
     GENDER = [
          ('MALE', 'MALE'),
          ('FEMALE', 'FEMALE'),
     ]
     STATUS = [
          ('VERIFIED', 'VERIFIED'),
          ('BLOCK', 'BLOCK'),
          ('PENDING', 'PENDING'),
     ]
     
     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  
     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
     first_name = models.CharField(max_length=50)
     middle_name = models.CharField(max_length=50, blank=True, null=True)
     last_name = models.CharField(max_length=50)
     email = models.EmailField(unique=True)
     gender = models.CharField(choices=GENDER, max_length=7)
     university = models.CharField(max_length=200)
     phone_no = models.CharField(max_length=15, unique=True)
     status = models.CharField(choices=STATUS, max_length=10, default='PENDING')
     verified = models.BooleanField(default=False)
     requested_at = models.DateTimeField(blank=True, null=True)
     approved_at = models.DateTimeField(blank=True, null=True)
     
     class Meta:
         verbose_name = 'Teacher'
         verbose_name_plural = 'Teachers'
     
     def __str__(self):
         return f"{self.first_name} {self.last_name} - {self.university}"
     
class Classroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher_classes',
        limit_choices_to={'role': 'teacher'}
    )
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.teacher.username})"


class JoinRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    classroom = models.ForeignKey(
        Classroom, on_delete=models.CASCADE, related_name='join_requests'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='class_join_requests',
        limit_choices_to={'role': 'student'}
    )
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='pending'
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('classroom', 'student')

    def __str__(self):
        return f"{self.student.username} -> {self.classroom.name} ({self.status})"


class StudentClassroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    classroom = models.ForeignKey(
        Classroom, on_delete=models.CASCADE, related_name='students'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrolled_classes',
        limit_choices_to={'role': 'student'}
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('classroom', 'student')

    def __str__(self):
        return f"{self.student.username} in {self.classroom.name}"
     