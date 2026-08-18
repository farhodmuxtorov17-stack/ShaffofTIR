from rest_framework import serializers
from ..models.session import ShootingSession, Soldier, Shot

class ShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shot
        fields = '__all__'

class SoldierSerializer(serializers.ModelSerializer):
    shots = ShotSerializer(many=True, read_only=True)
    class Meta:
        model = Soldier
        fields = '__all__'

class ShootingSessionSerializer(serializers.ModelSerializer):
    soldiers = SoldierSerializer(many=True, read_only=True)
    shots = ShotSerializer(many=True, read_only=True)
    class Meta:
        model = ShootingSession
        fields = '__all__'
