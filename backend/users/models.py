from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with role-based access control
    """
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        MANAGER = 'MANAGER', 'Manager'
        USER = 'USER', 'User'
    
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
        help_text='User role for dashboard access'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    @property
    def is_manager(self):
        return self.role == self.Role.MANAGER
    
    @property
    def is_regular_user(self):
        return self.role == self.Role.USER