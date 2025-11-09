from rest_framework import serializers
from .models import Classroom, JoinRequest, StudentClassroom


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
    student_name = serializers.CharField(source='student.username', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = JoinRequest
        fields = ['id', 'classroom', 'classroom_name', 'student', 'student_name', 'status', 'requested_at', 'reviewed_at']
        read_only_fields = ['status', 'requested_at', 'reviewed_at']


class JoinRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoinRequest
        fields = ['status']


class StudentClassroomSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = StudentClassroom
        fields = ['id', 'classroom', 'classroom_name', 'student', 'joined_at']
