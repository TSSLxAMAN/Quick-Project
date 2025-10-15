from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.user_profile, name='user-profile'),
    path('dashboard/', views.dashboard_data, name='dashboard-data'),
]