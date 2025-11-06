from rest_framework import serializers
from .models import Classroom, JoinRequest, StudentClassroom


class ClassroomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.username', read_only=True)

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'subject', 'description', 'teacher', 'teacher_name', 'created_at']


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
