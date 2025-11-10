from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Classroom, JoinRequest
from .serializers import *
from django.shortcuts import get_object_or_404
from student.models import Student

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'STUDENT'
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
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        student = self.request.user.student_profile
        classroom_id = self.request.data.get('classroom')

        try:
            classroom = Classroom.objects.get(id=classroom_id)
        except Classroom.DoesNotExist:
            raise serializers.ValidationError({"classroom": "Invalid classroom ID."})

        serializer.save(classroom=classroom, student=student)



class TeacherJoinRequestListView(generics.ListAPIView):
    serializer_class = JoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        teacher = self.request.user.teacher_profile
        return JoinRequest.objects.filter(classroom__teacher=teacher).order_by('-requested_at')


class JoinRequestUpdateView(generics.UpdateAPIView):
    queryset = JoinRequest.objects.all()
    serializer_class = JoinRequestUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        teacher = request.user.teacher_profile

        # Ensure the teacher owns the classroom
        if instance.classroom.teacher != teacher:
            return Response({'error': 'You are not authorized to manage this request.'}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

class TeachersByUniversityView(generics.ListAPIView):
    serializer_class = TeacherListSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        user = self.request.user
        try:
            student_profile = user.student_profile
        except Student.DoesNotExist:
            return Teacher.objects.none()

        return Teacher.objects.filter(university=student_profile.university, verified=True)
    
class TeacherClassroomsView(generics.ListAPIView):
    serializer_class = TeacherClassroomSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        teacher_id = self.kwargs.get('teacher_id')
        return Classroom.objects.filter(teacher__id=teacher_id)
    
class EnrolledClassesView(generics.ListAPIView):
    serializer_class = EnrolledClassSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        # get the logged-in student's profile
        student = self.request.user.student_profile
        return StudentClassroom.objects.filter(student=student).select_related('classroom__teacher')
    
class StudentJoinRequestListView(generics.ListAPIView):
    serializer_class = StudentJoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        student = self.request.user.student_profile
        return JoinRequest.objects.filter(student=student).select_related('classroom__teacher')  