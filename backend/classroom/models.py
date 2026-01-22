from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from teacher.models import Teacher
from users.models import User

class Classroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        'teacher.Teacher',
        on_delete=models.CASCADE,
        related_name='classrooms',
        blank=True,
        null=True
    )
    name = models.CharField(max_length=100)
    subject_code = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} "


class JoinRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    classroom = models.ForeignKey('Classroom', on_delete=models.CASCADE, related_name='join_requests')
    student = models.ForeignKey(
        'student.Student',
        on_delete=models.CASCADE,
        related_name='join_requests'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('classroom', 'student')

    def __str__(self):
        return f"{self.student.first_name} -> {self.classroom.name} ({self.status})"

class StudentClassroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    student = models.ForeignKey(
        'student.Student',
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'STUDENT'},
        related_name='student_classrooms'
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('classroom', 'student')

    def __str__(self):
        return f"{self.student.username} in {self.classroom.name}"

class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    classroom = models.ForeignKey(
        'classroom.Classroom',
        on_delete=models.CASCADE,
        related_name='assignments'
    )

    teacher = models.ForeignKey(
        'teacher.Teacher',
        on_delete=models.CASCADE,
        related_name='teacher_assignments'
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    # PDFs
    resource_pdf = models.FileField(
        upload_to='assignments/resources/',
        blank=True,
        null=True
    )

    question_pdf = models.FileField(
        upload_to='assignments/questions/',
        blank=True,
        null=True
    )

    # Assignment mode
    questionMethod = models.CharField(
        max_length=20,
        choices=[
            ("upload", "Upload Manual Questions"),
            ("generate", "AI Generated Questions"),
        ],
        blank=True,
        null=True
    )

    questions_ready = models.BooleanField(default=False)

    # RAG metadata
    rag_collection = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="ChromaDB collection name used for this assignment"
    )

    rag_trained = models.BooleanField(default=False, blank=True, null=True)
    rag_trained_at = models.DateTimeField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=[('DRAFT', 'Draft'), ('ACTIVE', 'Active')],
        default='DRAFT',
        null=True,
        blank=True
    )


    deadline = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["rag_collection"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.classroom.name})"

    @property
    def is_deadline_passed(self):
        return timezone.now() > self.deadline

class StudentAssignment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
        ('late', 'Late Submission'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        'classroom.Assignment',
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    student = models.ForeignKey(
        'student.Student',
        on_delete=models.CASCADE,
        related_name='submitted_assignments'
    )
    submitted_file = models.FileField(upload_to='assignments/submissions/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    extracted_text = models.TextField(blank=True, null=True)
    ocr_status = models.CharField(max_length=20, default='pending')
    ocr_error = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    marks = models.FloatField(blank=True, null=True)
    plagiarism_score = models.FloatField(blank=True, null=True)
    plagiarism_similarity = models.FloatField(blank=True, null=True)
    correctness_score = models.FloatField(blank=True, null=True)
    final_score = models.FloatField(blank=True, null=True)
    
    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student.first_name} - {self.assignment.title}"

    @property
    def is_past_deadline(self):
        return timezone.now() > self.assignment.deadline

# ------------------------------
# Quiz Module
# ------------------------------

class Quiz(models.Model):
    QUESTION_METHOD_CHOICES = (
        ("manual", "Manual"),
        ("generated", "Generated"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    classroom = models.ForeignKey(Classroom, related_name="quizzes", on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, related_name="quizzes", on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    time_per_question = models.PositiveIntegerField(default=60)

    question_method = models.CharField(max_length=20, choices=QUESTION_METHOD_CHOICES, default="manual")

    resource_pdf = models.FileField(upload_to="quiz_resources/", blank=True, null=True)
    embedding_id = models.CharField(max_length=128, blank=True, null=True, db_index=True)

    questions = models.JSONField(default=list)  # list of MCQ objects
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.classroom.name})"


class StudentQuizResponse(models.Model):
    STATUS_CHOICES = (
        ("not_started", "Not Started"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, related_name="submissions", on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, related_name="quiz_submissions", on_delete=models.CASCADE)
    student = models.ForeignKey(User, related_name="quiz_submissions", on_delete=models.CASCADE)

    answers = models.JSONField(default=dict)  # {question_index: selected_option}
    score = models.FloatField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    time_taken = models.PositiveIntegerField(blank=True, null=True)  # seconds

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="completed")
    submitted_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("quiz", "student")

    def __str__(self):
        return f"{self.student.email} -> {self.quiz.title}"

