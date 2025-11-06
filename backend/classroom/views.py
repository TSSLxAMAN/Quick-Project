from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Classroom, JoinRequest
from .serializers import (
    ClassroomSerializer,
    JoinRequestSerializer,
    JoinRequestUpdateSerializer,
)
from django.shortcuts import get_object_or_404


class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'TEACHER'
    
class ClassroomListCreateView(generics.ListCreateAPIView):
    serializer_class = ClassroomSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Classroom.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

class JoinRequestCreateView(generics.CreateAPIView):
    serializer_class = JoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class TeacherJoinRequestListView(generics.ListAPIView):
    serializer_class = JoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return JoinRequest.objects.filter(classroom__teacher=self.request.user)


class JoinRequestUpdateView(generics.UpdateAPIView):
    queryset = JoinRequest.objects.all()
    serializer_class = JoinRequestUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.classroom.teacher != request.user:
            return Response({'error': 'You are not the teacher of this class.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
