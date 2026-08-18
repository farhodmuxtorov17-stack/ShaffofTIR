from rest_framework import serializers
from ..models.camera import LaneCamera

class LaneCameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaneCamera
        fields = '__all__'
