from rest_framework import serializers
from ..models.range import ShootingRange, RangeRubeg, ShootingLane

class RangeRubegSerializer(serializers.ModelSerializer):
    class Meta:
        model = RangeRubeg
        fields = '__all__'

class ShootingLaneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShootingLane
        fields = '__all__'

class ShootingRangeSerializer(serializers.ModelSerializer):
    rubegs = RangeRubegSerializer(many=True, read_only=True)
    class Meta:
        model = ShootingRange
        fields = '__all__'
