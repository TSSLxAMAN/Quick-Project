from django.urls import path
from .views import (
    ClassroomListCreateView,
    JoinRequestCreateView,
    TeacherJoinRequestListView,
    JoinRequestUpdateView,
)

urlpatterns = [
    path('classrooms/', ClassroomListCreateView.as_view()),
    path('joinRequest/', JoinRequestCreateView.as_view()),
    path('teacher/requests/', TeacherJoinRequestListView.as_view()),
    path('joinRequest/<uuid:pk>/update/', JoinRequestUpdateView.as_view()),
]
