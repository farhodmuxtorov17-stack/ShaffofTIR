from rest_framework import serializers
from shaffoftir_api.models import (
    Session, Soldier, Shot, ShootingLane, Camera, RangeSchedule
)


class ShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shot
        fields = '__all__'


class SoldierSerializer(serializers.ModelSerializer):
    shots = ShotSerializer(many=True, read_only=True)

    class Meta:
        model = Soldier
        fields = '__all__'


class SessionSerializer(serializers.ModelSerializer):
    soldiers = SoldierSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = '__all__'


class SessionListSerializer(serializers.ModelSerializer):
    """Сокращённый сериализатор для списков"""
    class Meta:
        model = Session
        fields = ['id', 'employee_name', 'employee_rank', 'weapon_name',
                   'status', 'score', 'accuracy', 'started_at', 'completed_at',
                   'lane', 'instructor_name', 'created_at']


class ShootingLaneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShootingLane
        fields = '__all__'


class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = '__all__'


class RangeScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RangeSchedule
        fields = '__all__'
