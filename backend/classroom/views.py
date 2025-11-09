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
        teacher = self.request.user.teacher_profile
        print('xxxxxxxxxxxxxxxxxxx',teacher)
        return Classroom.objects.filter(teacher=teacher)


    def perform_create(self, serializer):
        teacher = self.request.user.teacher_profile
        print('xxxxxxxxxxxxxxxxxxx',teacher)
        serializer.save(teacher=teacher)

class ClassroomDeleteView(generics.DestroyAPIView):
    serializer_class = ClassroomSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        teacher = self.request.user.teacher_profile
        return Classroom.objects.filter(teacher=teacher)


class ClassroomUpdateView(generics.UpdateAPIView):
    serializer_class = ClassroomSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        teacher = self.request.user.teacher_profile
        return Classroom.objects.filter(teacher=teacher)

    def partial_update(self, request, *args, **kwargs):
        teacher = request.user.teacher_profile
        instance = self.get_object()
        if instance.teacher != teacher:
            return Response({"detail": "You are not allowed to update this class."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)
    
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
