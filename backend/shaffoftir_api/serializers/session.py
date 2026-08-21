"""Session serializers with nested soldiers and shots."""
from rest_framework import serializers
from ..models.session import ShootingSession, Soldier, Shot


class ShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shot
        fields = "__all__"
        read_only_fields = ("id", "timestamp")


class SoldierSerializer(serializers.ModelSerializer):
    shots = ShotSerializer(many=True, read_only=True)

    class Meta:
        model = Soldier
        fields = "__all__"
        read_only_fields = ("id", "created_at")


class ShootingSessionSerializer(serializers.ModelSerializer):
    soldiers = SoldierSerializer(many=True, read_only=True)

    class Meta:
        model = ShootingSession
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "completed_at")
