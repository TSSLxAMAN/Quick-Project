from django.urls import path
from .views import *

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
    path('studentAssignments/', StudentAssignmentListView.as_view()),
    path('studentAssignmentsStatus/', StudentAssignmentsStatusView.as_view()),
    path('submitAssignment/', StudentAssignmentSubmitView.as_view()),
    path('class/<uuid:classroom_id>/submissions/', ClassroomSubmissionStatusView.as_view()),

]