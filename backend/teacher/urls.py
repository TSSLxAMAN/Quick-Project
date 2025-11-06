from django.contrib import admin
from django.urls import path
from .views import TeacherVerificationView,TeacherVerificationCheckView, TeacherListView, TeacherApprove, TeacherVerifiedListView, TeacherBlock, TeacherReject
urlpatterns = [
    path('verify/', TeacherVerificationView.as_view(), name='teacher-verify'),
    path('verifyCheck/', TeacherVerificationCheckView.as_view()),
    path('teacherStatus/', TeacherListView.as_view()),
    path('teacherStatusVerified/', TeacherVerifiedListView.as_view()),
    path('teacherApprove/', TeacherApprove.as_view()),
    path('teacherBlocked/', TeacherApprove.as_view()),
    path('teacherReject/', TeacherApprove.as_view()),

]