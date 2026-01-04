from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Classroom, JoinRequest
from .serializers import *
from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from student.models import Student
from .utils.ocr_client import extract_text_from_pdf_file
from .utils.rag_client import train_rag_from_pdf, generate_rag_collection_name, delete_rag_collection, generate_questions_from_rag
from .utils.generate_questions_pdf import generate_questions_pdf
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.files import File  
import uuid

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

        resource_pdf = self.request.FILES.get("resource_pdf")
        if not resource_pdf:
            raise ValidationError({
                "resource_pdf": "Resource PDF is required to train the assignment."
            })

        with transaction.atomic():
            assignment = serializer.save(
                teacher=teacher,
                rag_trained=False
            )

            collection_name = generate_rag_collection_name(assignment.id)

            try:
                train_rag_from_pdf(
                    file_path=assignment.resource_pdf.path,
                    collection_name=collection_name
                )

                assignment.rag_collection = collection_name
                assignment.rag_trained = True
                assignment.rag_trained_at = timezone.now()
                assignment.save(update_fields=[
                    "rag_collection",
                    "rag_trained",
                    "rag_trained_at"
                ])

            except Exception as e:
                # 🔥 rollback happens automatically
                raise ValidationError({
                    "rag": "RAG training failed. Assignment was not created.",
                    "details": str(e)
                })

class AssignmentDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    queryset = Assignment.objects.all()

    def get_object(self):
        assignment = super().get_object()
        if assignment.teacher != self.request.user.teacher_profile:
            raise PermissionDenied("Not allowed to delete this assignment")
        return assignment

    def perform_destroy(self, assignment):
        with transaction.atomic():

            # 1️⃣ Delete RAG collection
            if assignment.rag_collection:
                try:
                    delete_rag_collection(assignment.rag_collection)
                except Exception as e:
                    raise ValidationError({
                        "rag": "Failed to delete RAG collection",
                        "details": str(e)
                    })

            # 2️⃣ Delete PDFs from filesystem
            for file_field in ["resource_pdf", "question_pdf"]:
                file_obj = getattr(assignment, file_field)
                if file_obj and os.path.exists(file_obj.path):
                    os.remove(file_obj.path)

            # 3️⃣ Delete related student submissions
            StudentAssignment.objects.filter(
                assignment=assignment
            ).delete()

            # 4️⃣ Delete assignment DB row
            assignment.delete()
    
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

        enrolled_class_ids = student.student_classrooms.values_list('classroom_id', flat=True)

        assignments = Assignment.objects.filter(classroom_id__in=enrolled_class_ids)

        submissions = {
            sub.assignment.id: sub
            for sub in StudentAssignment.objects.filter(student=student)
        }

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
        submission = serializer.save()

        try:
            file_path = submission.submitted_file.path

            extracted_text, meta = extract_text_from_pdf_file(file_path)

            submission.extracted_text = extracted_text
            submission.ocr_status = "success"
            submission.ocr_error = ""
            submission.save()

        except Exception as e:
            submission.ocr_status = "failed"
            submission.ocr_error = str(e)[:500]
            submission.save()

class ClassroomSubmissionStatusView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    serializer_class = StudentSubmissionStatusSerializer

    def get(self, request, classroom_id):
        teacher = request.user.teacher_profile

        try:
            classroom = Classroom.objects.get(id=classroom_id, teacher=teacher)
        except Classroom.DoesNotExist:
            return Response({'error': 'Classroom not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

        assignments = Assignment.objects.filter(classroom=classroom)
        if not assignments.exists():
            return Response({'message': 'No assignments found for this classroom.'}, status=status.HTTP_200_OK)

        enrolled_students = StudentClassroom.objects.filter(classroom=classroom).select_related('student')
        if not enrolled_students.exists():
            return Response({'message': 'No students enrolled in this classroom.'}, status=status.HTTP_200_OK)

        submissions = StudentAssignment.objects.filter(
            assignment__in=assignments,
            student__in=[sc.student for sc in enrolled_students]
        ).select_related('assignment', 'student')

        submission_map = {(s.student.id, s.assignment.id): s for s in submissions}

        response_data = []
        for enrolled in enrolled_students:
            student = enrolled.student
            for assignment in assignments:
                submission = submission_map.get((student.id, assignment.id))

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
    
class GenerateAssignmentQuestionsView(generics.GenericAPIView):
    serializer_class = GenerateQuestionsSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def post(self, request):
        # 1. Validate file
        resource_pdf = request.FILES.get("resource_pdf")
        if not resource_pdf:
            raise ValidationError({"resource_pdf": "Resource PDF is required."})

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2. Save PDF temporarily
        temp_name = f"rag_tmp_{uuid.uuid4().hex[:8]}.pdf"
        temp_path = default_storage.save(
            f"temp/{temp_name}",
            ContentFile(resource_pdf.read())
        )
        full_path = default_storage.path(temp_path)

        # 3. Create valid collection name
        collection_name = f"{uuid.uuid4().hex[:12]}"

        try:
            # 4. Train RAG
            train_rag_from_pdf(
                file_path=full_path,
                collection_name=collection_name
            )

            # 5. Generate questions
            rag_response = generate_questions_from_rag(
                collection_name=collection_name,
                num_questions=serializer.validated_data["num_questions"],
                difficulty=serializer.validated_data["difficulty"]
            )

        except Exception as e:
            raise ValidationError({
                "error": "Failed to generate questions",
                "details": str(e)
            })

        finally:
            # 6. Cleanup PDF
            default_storage.delete(temp_path)

        # 7. Transform response for frontend
        questions = [
            {
                "question_number": q["question_number"],
                "question": q["question"]
            }
            for q in rag_response.get("questions", [])
        ]

        return Response({
            "difficulty": rag_response.get("difficulty"),
            "total_questions": rag_response.get("total_questions"),
            "questions": questions
        }, status=status.HTTP_200_OK)
    
class GeneratedAssignmentCreateView(generics.GenericAPIView):
    serializer_class = GeneratedAssignmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def post(self, request):
        teacher = request.user.teacher_profile
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        classroom = get_object_or_404(
            Classroom,
            id=data["classroom"],
            teacher=teacher
        )

        with transaction.atomic():
            # 1️⃣ Create assignment in DRAFT
            assignment = Assignment.objects.create(
                classroom=classroom,
                teacher=teacher,
                title=data["title"],
                description=data.get("description"),
                deadline=data["deadline"],
                resource_pdf=data["resource_pdf"],
                questionMethod="generate",
                status="DRAFT",
                questions_ready=False,
                rag_trained=False,
            )

            # 2️⃣ Generate question PDF
            pdf_path = generate_questions_pdf(
                questions=data["questions"],
                title=assignment.title
            )

            assignment.question_pdf.save(
                f"{assignment.id}.pdf",
                File(open(pdf_path, "rb"))
            )

            # 🔥 CLEANUP
            os.remove(pdf_path)


            assignment.questions_ready = True

            # 3️⃣ Train RAG permanently
            collection_name = generate_rag_collection_name(assignment.id)

            try:
                train_rag_from_pdf(
                    file_path=assignment.resource_pdf.path,
                    collection_name=collection_name
                )
            except Exception as e:
                raise ValidationError({
                    "rag": "RAG training failed",
                    "details": str(e)
                })

            # 4️⃣ Finalize assignment
            assignment.rag_collection = collection_name
            assignment.rag_trained = True
            assignment.rag_trained_at = timezone.now()
            assignment.status = "ACTIVE"

            assignment.save()

        return Response(
            {
                "message": "Assignment created successfully",
                "assignment_id": assignment.id
            },
            status=status.HTTP_201_CREATED
        )
    