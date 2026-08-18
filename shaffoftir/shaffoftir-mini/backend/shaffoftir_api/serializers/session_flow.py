from rest_framework import serializers
from ..models.session_flow import ShootingSessionFlow

class ShootingSessionFlowSerializer(serializers.ModelSerializer):
    weapon_id = serializers.CharField(source='weapon_id_str', required=False)
    class Meta:
        model = ShootingSessionFlow
        fields = '__all__'
