# auth/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework import exceptions

class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access")
        if access_token:
            validated = self.get_validated_token(access_token)
            user = self.get_user(validated)
            return (user, validated)
        return None