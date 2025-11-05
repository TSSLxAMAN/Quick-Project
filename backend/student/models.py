from django.db import models
from django.conf import settings
import uuid
# Create your models here.

class Student(models.Model):
     GENDER = [
          ('MALE', 'MALE'),
          ('FEMALE', 'FEMALE'),
     ]
     STATUS = [
          ('VERIFIED', 'VERIFIED'),
          ('BLOCK', 'BLOCK'),
          ('PENDING', 'PENDING'),
          ('REJECTED', 'REJECTED'),
          ('RE_APPLY', 'RE_APPLY'),
     ]
     
     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 
     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
     first_name = models.CharField(max_length=50)
     middle_name = models.CharField(max_length=50, blank=True, null=True)
     last_name = models.CharField(max_length=50)
     enroll_no = models.CharField(max_length=15)
     email = models.EmailField(unique=True)
     phone_no = models.CharField(max_length=15, unique=True)
     gender = models.CharField(choices=GENDER, max_length=7)
     date_of_birth = models.DateField()
     course = models.CharField(max_length=100)
     year = models.CharField(max_length=10)
     semester = models.CharField(max_length=10)
     university = models.CharField(max_length=200)
     status = models.CharField(choices=STATUS, max_length=10, default='PENDING')
     verified = models.BooleanField(default=False)
     requested_at = models.DateTimeField(blank=True, null=True, auto_now=True)
     approved_at = models.DateTimeField(blank=True, null=True)
     class Meta:
         verbose_name = 'Student'
         verbose_name_plural = 'Students'
     
     def __str__(self):
         return f"{self.first_name} {self.last_name} - {self.enroll_no}"
