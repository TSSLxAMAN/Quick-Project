from allauth.account.adapter import DefaultAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        """
        Override to return backend confirmation URL that will redirect to frontend
        """
        key = emailconfirmation.key
        return f"http://127.0.0.1:8000/api/users/confirm-email/{key}/"
    
    def get_email_confirmation_redirect_url(self, request):
        """
        Return frontend URL for successful confirmation
        """
        return "http://localhost:5173/email-verified"