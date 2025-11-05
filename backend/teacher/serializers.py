from rest_framework import serializers
from .models import Teacher

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = ['user', 'status', 'verified', 'id']

    def validate_email(self, value):
        request = self.context.get('request')
        if request and request.user.email != value:
            raise serializers.ValidationError("Email must match your account email.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'teacher_profile'):
            raise serializers.ValidationError("You already have a teacher verification request.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['email'] = user.email
        validated_data['status'] = 'PENDING'
        validated_data['verified'] = False
        return super().create(validated_data)
    
class VerificationTeacherCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['status']

class TeacherListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = [
            'first_name',
            'middle_name',
            'last_name',
            'university',
            'email',
            'phone_no',
            'status',
            'verified',
            'requested_at',
        ]
        read_only_fields = ['id', 'verified', 'status']


class TeacherListVerifiedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = [
            'first_name',
            'middle_name',
            'last_name',
            'university',
            'email',
            'phone_no',
            'status',
            'verified',
            'requested_at',
            'approved_at',
        ]
        read_only_fields = ['id', 'verified', 'status']
