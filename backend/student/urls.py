from django.contrib import admin
from django.urls import path
from .views import StudentVerificationView, StudentVerificationCheckView, StudentListView, StudentVerifiedListView, StudentApprove, StudentReject, StudentBlock

urlpatterns = [
    path('verify/', StudentVerificationView.as_view(), name='student-verify'),
    path('verifyCheck/', StudentVerificationCheckView.as_view()),
    path('studentStatus/', StudentListView.as_view()),
    path('studentStatusVerified/', StudentVerifiedListView.as_view()),
    path('studentApprove/', StudentApprove.as_view()),
    path('studentReject/', StudentReject.as_view()),
    path('studentBlock/', StudentBlock.as_view()),
]