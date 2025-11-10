from rest_framework import serializers
from .models import Classroom, JoinRequest, StudentClassroom
from teacher.models import Teacher

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