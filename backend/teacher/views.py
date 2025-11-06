from rest_framework import generics, permissions
from .models import Teacher
from .serializers import TeacherSerializer, TeacherListSerializer, TeacherListVerifiedSerializer
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

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'TEACHER'
    
class TeacherVerificationView(generics.CreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated, IsUser]

    def perform_create(self, serializer):
        serializer.save()

class TeacherVerificationCheckView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsUser]
    def get(self, request):
        try:
            user_instance = Teacher.objects.get(email=request.user.email)
            return Response({
                "status": user_instance.status,
                "found": True
            }, status=status.HTTP_200_OK)
        except Teacher.DoesNotExist:
            return Response({
                "status": "NOT_FOUND",
                "found": False
            }, status=status.HTTP_200_OK)

class TeacherListView(APIView):
    permission_classes = [permissions.IsAuthenticated,IsAdmin]  
    def get(self, request):
        teacher = Teacher.objects.filter(status='PENDING').order_by('-requested_at')
        serializer = TeacherListSerializer(teacher, many=True)
        print("Request made by:", request.user) 
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class TeacherVerifiedListView(APIView):
    permission_classes = [permissions.IsAuthenticated,IsAdmin]  
    def get(self, request):
        # print('Hi')
        students = Teacher.objects.filter(status='VERIFIED').order_by('-requested_at')
        # print('Hi')
        serializer = TeacherListVerifiedSerializer(students, many=True)
        print("Request made by:", request.user) 
        return Response(serializer.data, status=status.HTTP_200_OK)

class TeacherApprove(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    def post(self, request):
        email = request.data.get("email")
        teacher = Teacher.objects.get(email=email)
        if teacher.verified == True:
            return Response(
                {
                    "status":"ALREADY VERIFIED",
                    "msg":"Teacher already approved."
                }
            )
        teacher.verified = True
        teacher.status = "VERIFIED"
        teacher.approved_at = timezone.now()
        teacher.save()
        user_role = User.objects.get(email=email)
        user_role.role = "TEACHER"
        user_role.save()
        print(email)
        return Response(
                {
                    "status":"VERIFIED",
                    "msg":"Teacher approved"
                }            
            )
    