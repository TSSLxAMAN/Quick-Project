from rest_framework import generics, permissions
from .models import Student
from .serializers import StudentSerializer, StudentListSerializer, StudentListVerifiedSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
User = get_user_model()

class IsUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'USER'
    
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'STUDENT'

class StudentVerificationView(generics.CreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated, IsUser]

    def perform_create(self, serializer):
        serializer.save()

class StudentVerificationCheckView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsUser]
    def get(self, request):
        try:
            user_instance = Student.objects.get(email=request.user.email)
            return Response({
                "status": user_instance.status,
                "found": True
            }, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response({
                "status": "NOT_FOUND",
                "found": False
            }, status=status.HTTP_200_OK)
        
class StudentListView(APIView):
    permission_classes = [permissions.IsAuthenticated,IsAdmin]  
    def get(self, request):
        print('Hi')
        students = Student.objects.filter(status='PENDING').order_by('-requested_at')
        print('Hi')
        serializer = StudentListSerializer(students, many=True)
        print("Request made by:", request.user) 
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class StudentVerifiedListView(APIView):
    permission_classes = [permissions.IsAuthenticated,IsAdmin]  
    def get(self, request):
        # print('Hi')
        students = Student.objects.filter(status='VERIFIED').order_by('-requested_at')
        # print('Hi')
        serializer = StudentListVerifiedSerializer(students, many=True)
        print("Request made by:", request.user) 
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class StudentApprove(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    def post(self, request):
        email = request.data.get("email")
        student = Student.objects.get(email=email)
        if student.verified == True:
            return Response(
                {
                    "status":"ALREADY VERIFIED",
                    "msg":"Student already approved."
                }
            )
        student.verified = True
        student.status = "VERIFIED"
        student.approved_at = timezone.now()
        student.save()
        user_role = User.objects.get(email=email)
        user_role.role = "STUDENT"
        user_role.save()
        return Response(
                {
                    "status":"VERIFIED",
                    "msg":"Student approved"
                }            
            )
