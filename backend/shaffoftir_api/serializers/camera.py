"""Camera serializer."""
from rest_framework import serializers
from ..models.camera import LaneCamera


class LaneCameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaneCamera
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
