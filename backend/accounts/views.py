from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import IntegrityError

from .models import User, UserRole
from .permissions import IsAdmin
from .serializers import UserSerializer, UserCreateSerializer


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({"refresh": str(refresh), "access": str(refresh.access_token), "user": UserSerializer(user).data})


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserManagementView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response(UserSerializer(User.objects.all().order_by("username"), many=True).data)

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class CashierRegisterView(APIView):
    permission_classes = []

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        email = (request.data.get("email") or "").strip()
        first_name = (request.data.get("first_name") or "").strip()
        last_name = (request.data.get("last_name") or "").strip()

        if not username or not password:
            return Response(
                {"detail": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=UserRole.CASHIER,
                must_change_password=True,
            )
        except IntegrityError:
            return Response(
                {"detail": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_password = request.data.get("new_password") or ""
        confirm_password = request.data.get("confirm_password") or ""

        if not new_password:
            return Response({"detail": "New password is required"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"detail": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.set_password(new_password)
        user.must_change_password = False
        user.save(update_fields=["password", "must_change_password"])
        return Response({"detail": "Password changed successfully"})
