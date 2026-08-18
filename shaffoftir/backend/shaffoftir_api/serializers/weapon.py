from rest_framework import serializers
from ..models.weapon import Weapon, WeaponAssignment

class WeaponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weapon
        fields = '__all__'

class WeaponAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeaponAssignment
        fields = '__all__'
