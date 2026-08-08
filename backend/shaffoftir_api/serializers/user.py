from rest_framework import serializers
from shaffoftir_api.models import User, Permission


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'avatar_url',
            'phone', 'rank', 'department', 'is_active_user',
            'is_staff', 'last_login', 'date_joined'
        ]
        read_only_fields = ['id', 'last_login', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'phone', 'rank',
                   'department', 'password', 'username']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password')
        username = validated_data.pop('username', validated_data['email'])
        user = User(username=username, **validated_data)
        user.set_password(password)
        user.save()
        return user


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'
