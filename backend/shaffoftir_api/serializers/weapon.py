"""Weapon serializer."""
from rest_framework import serializers
from ..models.weapon import Weapon


class WeaponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weapon
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
