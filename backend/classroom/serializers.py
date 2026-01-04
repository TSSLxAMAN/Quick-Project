from rest_framework import serializers
from .models import *
from teacher.models import Teacher
from django.utils import timezone

class ClassroomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'subject_code', 'description', 'teacher_name']
        read_only_fields = ['teacher']

    def get_teacher_name(self, obj):
        return f"{obj.teacher.first_name} {obj.teacher.last_name}"

    def validate(self, data):
        request = self.context.get('request')
        if not request:
            return data

        teacher = getattr(request.user, 'teacher_profile', None)
        if teacher is None:
            raise serializers.ValidationError("This user is not registered as a teacher.")

        subject_code = data.get('subject_code')

        if subject_code:
            existing = Classroom.objects.filter(teacher=teacher, subject_code=subject_code)
            if self.instance:
                existing = existing.exclude(id=self.instance.id)

            if existing.exists():
                raise serializers.ValidationError(
                    {"subject_code": "You already have a class with this subject code."}
                )

        return data

class JoinRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = JoinRequest
        fields = [
            'id',
            'classroom',
            'classroom_name',
            'student',
            'student_name',
            'status',
            'requested_at',
            'reviewed_at'
        ]
        read_only_fields = ['student', 'status', 'requested_at', 'reviewed_at']

    def validate(self, attrs):
        request = self.context['request']
        student = getattr(request.user, 'student_profile', None)
        classroom = attrs.get('classroom')

        if not student:
            raise serializers.ValidationError("Only students can send join requests.")
        if not classroom:
            raise serializers.ValidationError("Classroom ID is required.")

        # Prevent duplicate join requests
        if JoinRequest.objects.filter(classroom=classroom, student=student).exists():
            raise serializers.ValidationError("You’ve already sent a request for this class.")

        return attrs



class JoinRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoinRequest
        fields = ['status']


class StudentClassroomSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = StudentClassroom
        fields = ['id', 'classroom', 'classroom_name', 'student', 'joined_at']

class TeacherListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = ['id', 'full_name', 'email', 'university']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class TeacherClassroomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.teacher_profile.first_name', read_only=True)

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'subject_code', 'description', 'teacher_name']

class EnrolledClassSerializer(serializers.ModelSerializer):
    class_id = serializers.UUIDField(source='classroom.id', read_only=True)
    class_name = serializers.CharField(source='classroom.name', read_only=True)
    subject_code = serializers.CharField(source='classroom.subject_code', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    teacher_email = serializers.SerializerMethodField()

    class Meta:
        model = StudentClassroom
        fields = [
            'class_id',
            'class_name',
            'subject_code',
            'teacher_name',
            'teacher_email',
            'joined_at',
        ]

    def get_teacher_name(self, obj):
        teacher = obj.classroom.teacher
        if teacher:
            return f"{teacher.first_name} {teacher.last_name}"
        return None

    def get_teacher_email(self, obj):
        teacher = obj.classroom.teacher
        return teacher.email if teacher else None
    
class StudentJoinRequestSerializer(serializers.ModelSerializer):
    request_id = serializers.UUIDField(source='id', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    subject_code = serializers.CharField(source='classroom.subject_code', read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = JoinRequest
        fields = [
            'request_id',
            'classroom_name',
            'subject_code',
            'teacher_name',
            'status',
            'requested_at',
            'reviewed_at'
        ]

    def get_teacher_name(self, obj):
        teacher = obj.classroom.teacher
        if teacher:
            return f"{teacher.first_name} {teacher.last_name}"
        return None
    
class AssignmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'classroom',
            'classroom_name',
            'teacher_name',

            # PDFs
            'question_pdf',
            'resource_pdf',

            # workflow
            'questionMethod',
            'questions_ready',

            # RAG metadata (read-only)
            'rag_collection',
            'rag_trained',
            'rag_trained_at',

            # time
            'deadline',
            'created_at',
        ]

        read_only_fields = [
            'teacher',
            'created_at',
            'questions_ready',
            'rag_collection',
            'rag_trained',
            'rag_trained_at',
        ]

    def get_teacher_name(self, obj):
        teacher = obj.teacher
        return f"{teacher.first_name} {teacher.last_name}" if teacher else None

    def validate(self, attrs):
        questionMethod = attrs.get('questionMethod')
        question_pdf = attrs.get('question_pdf')
        resource_pdf = attrs.get('resource_pdf')

        # Resource PDF is mandatory for both flows
        if not resource_pdf:
            raise serializers.ValidationError({
                "resource_pdf": "Resource PDF is required for training and evaluation."
            })

        if questionMethod == "upload":
            # Manual mode → questions must already exist
            if not question_pdf:
                raise serializers.ValidationError({
                    "question_pdf": "Question PDF is required in manual mode."
                })

        elif questionMethod == "generate":
            # Generated mode → questions must NOT be provided yet
            if question_pdf:
                raise serializers.ValidationError({
                    "question_pdf": "Do not upload question PDF when using generated mode."
                })

        else:
            raise serializers.ValidationError({
                "questionMethod": "Invalid generation mode."
            })

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        teacher = request.user.teacher_profile

        validated_data['teacher'] = teacher
        validated_data['questions_ready'] = (
            validated_data.get('questionMethod') == "upload"
        )

        return super().create(validated_data)

class StudentAssignmentSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    classroom_name = serializers.CharField(source='assignment.classroom.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    question_pdf = serializers.SerializerMethodField()
    deadline = serializers.DateTimeField(source='assignment.deadline', read_only=True)
    submitted_file = serializers.FileField(required=False)

    class Meta:
        model = StudentAssignment
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "classroom_name",
            "teacher_name",
            "question_pdf",
            "deadline",
            "submitted_file",

            "status",
            "submitted_at",

            # Newly added OCR fields:
            "extracted_text",
            "ocr_status",
            "ocr_error",

            # Teacher-side fields (read-only for student)
            "marks",
            "plagiarism_score",
        ]

        read_only_fields = [
            "status",
            "submitted_at",

            "extracted_text",
            "ocr_status",
            "ocr_error",

            "marks",
            "plagiarism_score",
        ]

    def get_teacher_name(self, obj):
        teacher = obj.assignment.teacher
        return f"{teacher.first_name} {teacher.last_name}" if teacher else None

    def get_question_pdf(self, obj):
        request = self.context.get("request")
        if obj.assignment.question_pdf:
            return request.build_absolute_uri(obj.assignment.question_pdf.url)
        return None

    def create(self, validated_data):
        student = self.context["request"].user.student_profile
        assignment = validated_data["assignment"]

        # Prevent duplicate submissions
        if StudentAssignment.objects.filter(student=student, assignment=assignment).exists():
            raise serializers.ValidationError("You’ve already uploaded this assignment.")

        # Prevent submissions after deadline
        if timezone.now() > assignment.deadline:
            raise serializers.ValidationError("Deadline has passed. Submission not allowed.")

        validated_data["student"] = student
        validated_data["submitted_at"] = timezone.now()
        validated_data["status"] = "submitted"

        return super().create(validated_data)
    
class StudentSubmissionStatusSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    student_name = serializers.CharField()
    enrollment_no = serializers.CharField()
    assignment_id = serializers.UUIDField()
    assignment_title = serializers.CharField()
    deadline = serializers.DateTimeField()
    submitted_file = serializers.FileField(allow_null=True)
    status = serializers.CharField()
    submitted_at = serializers.DateTimeField(allow_null=True)
    marks = serializers.FloatField(allow_null=True)
    plagiarism_score = serializers.FloatField(allow_null=True)

class StudentAssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAssignment
        fields = ['id', 'assignment', 'submitted_file']
        read_only_fields = ['id']

    def create(self, validated_data):
        return super().create(validated_data)
    
class AssignmentDraftCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'classroom',
            'resource_pdf',
            'deadline'
        ]

    def validate(self, data):
        if not data.get("resource_pdf"):
            raise serializers.ValidationError("Resource PDF is required.")
        return data

class GenerateQuestionsSerializer(serializers.Serializer):
    num_questions = serializers.IntegerField(min_value=1, max_value=50)
    difficulty = serializers.ChoiceField(
        choices=["easy", "moderate", "hard"]
    )
    
class GeneratedAssignmentCreateSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    classroom = serializers.UUIDField()
    deadline = serializers.DateTimeField()
    resource_pdf = serializers.FileField()
    questions = serializers.ListField(
        child=serializers.CharField()
    )


