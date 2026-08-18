"""Session flow serializer."""
from rest_framework import serializers
from ..models.session_flow import ShootingSessionFlow


class ShootingSessionFlowSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShootingSessionFlow
        fields = "__all__"
        read_only_fields = ("id", "timestamp")
