from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get the authenticated user's profile with role information
    """
    serializer = UserSerializer(request.user)
    print(serializer.data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """
    Return role-based dashboard data
    """
    user = request.user
    
    # Base data for all users
    data = {
        'user': UserSerializer(user).data,
        'role': user.role,
    }
    
    # Role-specific data
    if user.is_admin:
        data['dashboard_type'] = 'Admin'
        data['message'] = 'Welcome to Admin Dashboard'
        data['permissions'] = ['manage_users', 'view_reports', 'system_settings']
        
    elif user.is_manager:
        data['dashboard_type'] = 'manager'
        data['message'] = 'Welcome to Manager Dashboard'
        data['permissions'] = ['view_reports', 'manage_team']
        
    else:  # Regular user
        data['dashboard_type'] = 'user'
        data['message'] = 'Welcome to User Dashboard'
        data['permissions'] = ['view_profile', 'update_profile']
    
    return Response(data)