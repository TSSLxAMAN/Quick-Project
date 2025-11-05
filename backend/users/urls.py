from django.urls import path, re_path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import CollegeViewSet, CourseViewSet, CourseOptions, CollegeOptions

router = DefaultRouter()
router.register(r'colleges', CollegeViewSet, basename='college')
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
    re_path(
        r'^confirm-email/(?P<key>[-:\w]+)/$',
        views.confirm_email,
        name='account_confirm_email'
    ),
    path('profile/', views.user_profile, name='user-profile'),
    path('coursesO/', CourseOptions.as_view()),
    path('collegesO/', CollegeOptions.as_view()),
]