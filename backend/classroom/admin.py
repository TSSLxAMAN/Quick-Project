from django.contrib import admin
from .models import (
    Classroom, StudentClassroom, JoinRequest,
    Assignment, StudentAssignment,
    Quiz, StudentQuizResponse
)

admin.site.register(Classroom)
admin.site.register(StudentClassroom)
admin.site.register(JoinRequest)

admin.site.register(Assignment)
admin.site.register(StudentAssignment)

admin.site.register(Quiz)
admin.site.register(StudentQuizResponse)
