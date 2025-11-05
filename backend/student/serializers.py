from rest_framework import serializers
from .models import Student

from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['user', 'status', 'verified', 'id']

    def validate_email(self, value):
        request = self.context.get('request')
        if request and request.user.email != value:
            raise serializers.ValidationError("Email must match your account email.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            raise serializers.ValidationError("You already have a student verification request.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['email'] = user.email
        validated_data['status'] = 'PENDING'
        validated_data['verified'] = False
        return super().create(validated_data)

class VerificationStudentCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['status']

class StudentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'first_name',
            'middle_name',
            'last_name',
            'enroll_no',
            'university',
            'email',
            'phone_no',
            'course',
            'year',
            'semester',
            'status',
            'verified',
            'requested_at',
        ]
        read_only_fields = ['id', 'verified', 'status']

class StudentListVerifiedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'first_name',
            'middle_name',
            'last_name',
            'enroll_no',
            'university',
            'email',
            'phone_no',
            'course',
            'year',
            'semester',
            'status',
            'verified',
            'requested_at',
            'approved_at',
        ]
        read_only_fields = ['id', 'verified', 'status']