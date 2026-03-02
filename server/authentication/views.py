from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, CustomerRegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from .permissions import IsAdmin, IsEmployee, IsCustomer
from .auth import JWTCookieAuthentication
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework import status
User = get_user_model()

class GetCurrentUserView(APIView):
    """
    Returns the currently logged-in user's data.
    Uses JWT from httpOnly cookie (automatically sent with credentials: 'include')
    """
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # This is automatically set by JWTAuthentication
        
        # Optional: Add role or custom fields
        serializer = UserSerializer(user)
        return Response({
            "user": serializer.data,
            "message": "User authenticated successfully"
        })

class CustomerRegisterView(APIView):
    def post(self, request):
        serializer = CustomerRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Auto login after register
            refresh = RefreshToken.for_user(user)
            response = Response({
                "message": "Registration successful! Please complete your KYC.",
                "user": UserSerializer(user).data
            })

            response.set_cookie('access', str(refresh.access_token), httponly=True, secure=True, samesite='Lax')
            response.set_cookie('refresh', str(refresh), httponly=True, secure=True, samesite='Lax', max_age=7*24*60*60)
            return response

        return Response(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        role = request.data.get('role')

        if email:
            try:
                user_obj = User.objects.get(email=email)
                if user_obj.role != role:
                    return Response({"error": "Role does not match registered user"}, status=403)
            except User.DoesNotExist:
                return Response({"error": "Invalid credentials1"}, status=400)

        user = authenticate(email=email, password=password, role=role)

        if not user:
            return Response({"error": "Invalid credentials"}, status=400)

        refresh = RefreshToken.for_user(user)

        response = Response({
            "message": "Login successful",
            "user": UserSerializer(user).data
        }, status= status.HTTP_200_OK)

        # Set httpOnly cookies
        response.set_cookie(
            key='access',
            value=str(refresh.access_token),
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=15*60
        )
        response.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=7*24*60*60
        )

        return response

# class MeView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         return Response(UserSerializer(request.user).data)
    
class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"})
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_only(request):
    return Response({"message": "Admin access confirmed!"})

@api_view(["GET"])
@permission_classes([IsEmployee])
def employee_only(request):
    return Response({"message": "Employee access confirmed!"})

@api_view(["GET"])
@permission_classes([IsCustomer])
def customer_only(request):
    return Response({"message": "Customer access confirmed!"})
