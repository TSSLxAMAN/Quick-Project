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
    
class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        teacher = self.request.user.teacher_profile
        return Assignment.objects.filter(teacher=teacher).select_related('classroom')

    def perform_create(self, serializer):
        teacher = self.request.user.teacher_profile
        serializer.save(teacher=teacher)


# Student: View assignments from classes they are enrolled in
class StudentAssignmentListView(generics.ListAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        student = self.request.user.student_profile
        enrolled_classes = student.student_classrooms.values_list('classroom_id', flat=True)
        return Assignment.objects.filter(classroom_id__in=enrolled_classes).select_related('teacher', 'classroom')
    
class StudentAssignmentsStatusView(generics.ListAPIView):
    serializer_class = StudentAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def list(self, request, *args, **kwargs):
        student = request.user.student_profile

        # 1. Find all enrolled classrooms for this student
        enrolled_class_ids = student.student_classrooms.values_list('classroom_id', flat=True)

        # 2. Fetch all assignments for those classrooms
        assignments = Assignment.objects.filter(classroom_id__in=enrolled_class_ids)

        # 3. Fetch all submissions by this student (to merge data)
        submissions = {
            sub.assignment.id: sub
            for sub in StudentAssignment.objects.filter(student=student)
        }

        # 4. Build combined response: all assignments, merged with submission data (if exists)
        response_data = []
        for assignment in assignments:
            submission = submissions.get(assignment.id)

            data = {
                "id": str(submission.id) if submission else None,
                "assignment": str(assignment.id),
                "assignment_title": assignment.title,
                "classroom_name": assignment.classroom.name,
                "teacher_name": f"{assignment.teacher.first_name} {assignment.teacher.last_name}",
                "question_pdf": request.build_absolute_uri(assignment.question_pdf.url)
                    if assignment.question_pdf else None,
                "deadline": assignment.deadline,
                "submitted_file": (
                    request.build_absolute_uri(submission.submitted_file.url)
                    if submission and submission.submitted_file else None
                ),
                "status": submission.status if submission else "pending",
                "submitted_at": submission.submitted_at if submission else None,
                "marks": submission.marks if submission else None,
                "plagiarism_score": submission.plagiarism_score if submission else None,
            }

            response_data.append(data)

        return Response(response_data, status=status.HTTP_200_OK)
    
class StudentAssignmentSubmitView(generics.CreateAPIView):
    serializer_class = StudentAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        serializer.save()

class ClassroomSubmissionStatusView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    serializer_class = StudentSubmissionStatusSerializer

    def get(self, request, classroom_id):
        teacher = request.user.teacher_profile

        # ✅ Ensure teacher owns the classroom
        try:
            classroom = Classroom.objects.get(id=classroom_id, teacher=teacher)
        except Classroom.DoesNotExist:
            return Response({'error': 'Classroom not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Fetch all assignments in this classroom
        assignments = Assignment.objects.filter(classroom=classroom)
        if not assignments.exists():
            return Response({'message': 'No assignments found for this classroom.'}, status=status.HTTP_200_OK)

        # ✅ Get all enrolled students
        enrolled_students = StudentClassroom.objects.filter(classroom=classroom).select_related('student')
        if not enrolled_students.exists():
            return Response({'message': 'No students enrolled in this classroom.'}, status=status.HTTP_200_OK)

        # ✅ Get all submissions for those assignments
        submissions = StudentAssignment.objects.filter(
            assignment__in=assignments,
            student__in=[sc.student for sc in enrolled_students]
        ).select_related('assignment', 'student')

        # Build submission lookup
        submission_map = {(s.student.id, s.assignment.id): s for s in submissions}

        response_data = []
        for enrolled in enrolled_students:
            student = enrolled.student
            for assignment in assignments:
                submission = submission_map.get((student.id, assignment.id))

                # ✅ Build submission entry
                entry = {
                    "student_id": student.id,
                    "student_name": f"{student.first_name} {student.last_name}",
                    "enrollment_no": student.enroll_no,
                    "assignment_id": assignment.id,
                    "assignment_title": assignment.title,
                    "deadline": assignment.deadline,
                    "question_pdf": request.build_absolute_uri(assignment.question_pdf.url)
                        if assignment.question_pdf else None,
                    "submitted_file": (
                        request.build_absolute_uri(submission.submitted_file.url)
                        if submission and submission.submitted_file else None
                    ),
                    "status": submission.status if submission else "pending",
                    "submitted_at": submission.submitted_at if submission else None,
                    "marks": submission.marks if submission else None,
                    "plagiarism_score": submission.plagiarism_score if submission else None,
                }

                response_data.append(entry)

        return Response(response_data, status=status.HTTP_200_OK)