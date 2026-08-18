from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from ..models.user import SystemUser

class SystemUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemUser
        fields = ['id', 'email', 'username', 'full_name', 'role', 'avatar_url',
                  'phone', 'rank', 'department', 'is_active', 'locale', 'last_login', 'date_joined']
        read_only_fields = ['id', 'last_login', 'date_joined']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        try:
            user = SystemUser.objects.get(email=email)
        except SystemUser.DoesNotExist:
            raise serializers.ValidationError({'email': 'User not found'})
        if not user.is_active:
            raise serializers.ValidationError({'detail': 'User inactive'})
        if not user.check_password(password):
            raise serializers.ValidationError({'password': 'Invalid password'})
        refresh = RefreshToken.for_user(user)
        return {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'token_type': 'Bearer',
            'user': SystemUserSerializer(user).data,
        }
