from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin with role field
    """
    list_display = ['username', 'email', 'role', 'is_staff', 'is_active', 'created_at']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name', 'role'),
        }),
    )