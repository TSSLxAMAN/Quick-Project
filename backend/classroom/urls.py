from django.urls import path
from .views import *

urlpatterns = [
    path('classrooms/', ClassroomListCreateView.as_view()),
    path('classrooms/<uuid:pk>/delete/', ClassroomDeleteView.as_view()),
    path('classrooms/<uuid:pk>/update/', ClassroomUpdateView.as_view()),
    path('joinRequest/', JoinRequestCreateView.as_view()),
    path('teacher/requests/', TeacherJoinRequestListView.as_view()),
    path('joinRequest/<uuid:pk>/update/', JoinRequestUpdateView.as_view()),
]
