"""Schedule serializer."""
from rest_framework import serializers
from ..models.schedule import RangeSchedule


class RangeScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RangeSchedule
        fields = "__all__"
        read_only_fields = ("id", "created_at")
