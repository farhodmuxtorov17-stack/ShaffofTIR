"""Range and lane serializers."""
from rest_framework import serializers
from ..models.range import ShootingRange, ShootingLane, RangeRubeg


class ShootingLaneSerializer(serializers.ModelSerializer):
    range_name = serializers.CharField(source="range.name", read_only=True)
    range_type = serializers.CharField(source="range.range_type", read_only=True)
    rubeg_number = serializers.IntegerField(source="rubeg.rubeg_number", read_only=True, default=None)

    class Meta:
        model = ShootingLane
        fields = ["id", "range", "range_name", "range_type",
                  "rubeg", "rubeg_number",
                  "name", "lane_number", "distance_m", "target_type",
                  "status", "camera_status", "camera_ip",
                  "current_employee_name", "weapon_assigned",
                  "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "range_name", "range_type", "rubeg_number"]


class ShootingRangeSerializer(serializers.ModelSerializer):
    lanes = ShootingLaneSerializer(many=True, read_only=True)

    class Meta:
        model = ShootingRange
        fields = "__all__"
        read_only_fields = ("id", "created_at")


class RangeRubegSerializer(serializers.ModelSerializer):
    """Rubeg serializer — includes lanes for OPEN ranges."""
    lanes = ShootingLaneSerializer(many=True, read_only=True)
    lane_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = RangeRubeg
        fields = ["id", "range", "rubeg_number", "distance", "max_lanes",
                  "description", "is_active", "lanes", "lane_count",
                  "created_at"]
        read_only_fields = ["id", "created_at", "lane_count"]
