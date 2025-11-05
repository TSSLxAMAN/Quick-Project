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