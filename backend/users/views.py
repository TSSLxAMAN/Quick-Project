from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .serializers import UserSerializer
from .serializers import CollegeOptionsSerializer
from .serializers import CourseOptionsSerializer

from django.http import HttpResponseRedirect
from allauth.account.models import EmailConfirmation, EmailConfirmationHMAC
from allauth.account.utils import complete_signup
from .models import College, Course
from .serializers import CollegeSerializer, CourseSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    print(serializer.data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_email(request, key):
    """
    Confirm email and redirect to frontend
    """
    try:
        # Try to get the email confirmation using HMAC
        email_confirmation = EmailConfirmationHMAC.from_key(key)
        if not email_confirmation:
            # Fallback to regular EmailConfirmation model
            email_confirmation = EmailConfirmation.objects.get(key=key.lower())
        
        # Confirm the email
        email_confirmation.confirm(request)
        
        # Redirect to frontend success page
        return HttpResponseRedirect('http://localhost:5173/email-verified')
        
    except Exception as e:
        print(f"Email confirmation error: {str(e)}")  # Debug
        # If confirmation fails, redirect to error page
        return HttpResponseRedirect('http://localhost:5173/login?error=invalid_token')

class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all().order_by('-created_at')
    serializer_class = CollegeSerializer
    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

class CollegeOptions(APIView):
    permission_classes = [AllowAny] 
    def get(self,request):
        queryset = College.objects.all()
        serializer = CollegeOptionsSerializer(queryset,many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CourseOptions(APIView):
    permission_classes = [AllowAny]
    def get(self,request):
        queryset = Course.objects.all()
        serializer = CourseOptionsSerializer(queryset,many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
