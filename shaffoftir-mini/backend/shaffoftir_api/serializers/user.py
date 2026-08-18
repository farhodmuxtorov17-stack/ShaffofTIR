"""User serializers with login response."""
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from ..models.user import SystemUser


class SystemUserSerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()

    class Meta:
        model = SystemUser
        fields = (
            "id", "email", "username", "role", "full_name",
            "display_name", "avatar_url", "phone", "rank",
            "department", "locale", "is_active",
        )
        read_only_fields = ("id",)


class LoginSerializer(serializers.Serializer):
    """Custom login serializer that returns JWT tokens + user data."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email и пароль обязательны.")

        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError("Неверный email или пароль.")

        if not user.is_active:
            raise serializers.ValidationError("Учётная запись отключена.")

        refresh = RefreshToken.for_user(user)
        return {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": SystemUserSerializer(user).data,
        }
