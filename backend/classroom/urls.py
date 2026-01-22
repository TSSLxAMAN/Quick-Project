from django.urls import path
from .views import *
from classroom.views import (
    QuizGenerateQuestionsAPIView,
    QuizCreateAPIView,
    QuizListAPIView,
    QuizDetailAPIView,
    QuizSubmitAPIView,
    ClassroomQuizSubmissionsAPIView,
)

urlpatterns = [
    path('classrooms/', ClassroomListCreateView.as_view()),
    path('classrooms/<uuid:pk>/delete/', ClassroomDeleteView.as_view()),
    path('classrooms/<uuid:pk>/update/', ClassroomUpdateView.as_view()),
    path('joinRequest/<uuid:pk>/update/', JoinRequestUpdateView.as_view()),
    path('university/', TeachersByUniversityView.as_view()),
    path('<uuid:teacher_id>/classrooms/', TeacherClassroomsView.as_view()),
    path('joinRequest/', JoinRequestCreateView.as_view()),
    path('teacher/joinRequests/', TeacherJoinRequestListView.as_view()),
    path('joinRequest/<uuid:pk>/update/', JoinRequestUpdateView.as_view()),
    path('enrolledClasses/', EnrolledClassesView.as_view()),
    path('myJoinRequests/', StudentJoinRequestListView.as_view()),
    path('assignments/', AssignmentListCreateView.as_view()),
    path('assignments/<uuid:pk>/delete', AssignmentDeleteView.as_view()),
    path('studentAssignments/', StudentAssignmentListView.as_view()),
    path('studentAssignmentsStatus/', StudentAssignmentsStatusView.as_view()),
    path('submitAssignment/', StudentAssignmentSubmitView.as_view()),
    path('class/<uuid:classroom_id>/submissions/', ClassroomSubmissionStatusView.as_view()),
    path("assignments/generate-questions/",GenerateAssignmentQuestionsView.as_view()),
    path("assignments/generated/create/",GeneratedAssignmentCreateView.as_view()),
        # Quiz module
    path("quizzes/", QuizListAPIView.as_view(), name="quiz-list"),
    path("quizzes/generate-questions/", QuizGenerateQuestionsAPIView.as_view(), name="quiz-generate-questions"),
    path("quizzes/create/", QuizCreateAPIView.as_view(), name="quiz-create"),
    path("quizzes/<uuid:quiz_id>/", QuizDetailAPIView.as_view(), name="quiz-detail"),
    path("quizzes/<uuid:quiz_id>/submit/", QuizSubmitAPIView.as_view(), name="quiz-submit"),
    path("class/<uuid:classroom_id>/quiz-submissions/", ClassroomQuizSubmissionsAPIView.as_view(), name="quiz-submissions"),

]