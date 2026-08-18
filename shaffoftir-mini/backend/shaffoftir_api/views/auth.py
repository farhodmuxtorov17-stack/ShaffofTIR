"""Authentication views — login and current user."""
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from ..models.user import SystemUser
from ..serializers.user import SystemUserSerializer, LoginSerializer
from ..permissions import IsAuthenticated


class LoginView(APIView):
    """Authenticate a user and return JWT tokens.

    POST /api/v1/auth/login/
    Body: {"email": "...", "password": "..."}
    Returns: {"access_token", "refresh_token", "user": {...}}
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(
        request=LoginSerializer,
        responses={200: SystemUserSerializer},
        description="Login with email + password, returns JWT tokens",
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class MeView(APIView):
    """Get the currently authenticated user's profile.

    GET /api/v1/auth/me/
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=SystemUserSerializer)
    def get(self, request):
        return Response(SystemUserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    """List, create, update, and delete users."""
    queryset = SystemUser.objects.all()
    serializer_class = SystemUserSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["role", "department", "is_active"]
    search_fields = ["email", "username", "full_name"]
    ordering_fields = ["date_joined", "full_name"]
