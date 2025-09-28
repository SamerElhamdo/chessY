from __future__ import annotations

from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import ProfileUpdateSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


def _tokens_for_user(user: User) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request: Request, *args, **kwargs) -> Response:  # type: ignore[override]
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        data = UserSerializer(user, context={"request": request}).data
        data["tokens"] = _tokens_for_user(user)
        headers = self.get_success_headers(data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)


class ShamChessTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    def validate(self, attrs: dict) -> dict:
        username_or_email = attrs.get("username")
        password = attrs.get("password")
        user = authenticate(
            self.context["request"],
            username=username_or_email,
            password=password,
        )
        if user is None and username_or_email:
            # attempt login using email field
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
            except User.DoesNotExist:
                user_obj = None
            if user_obj:
                user = authenticate(
                    self.context["request"],
                    username=user_obj.username,
                    password=password,
                )
        if user is None:
            raise self.invalid_credentials()
        refresh = RefreshToken.for_user(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user, context=self.context).data,
        }
        return data

    def invalid_credentials(self) -> Exception:
        from rest_framework_simplejwt.exceptions import AuthenticationFailed

        raise AuthenticationFailed(self.error_messages["no_active_account"])  # type: ignore[no-any-return]


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ShamChessTokenObtainPairSerializer


class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self) -> User:
        return self.request.user  # type: ignore[return-value]

    def get_serializer_class(self):  # type: ignore[override]
        if self.request.method in ("PUT", "PATCH"):
            return ProfileUpdateSerializer
        return super().get_serializer_class()
