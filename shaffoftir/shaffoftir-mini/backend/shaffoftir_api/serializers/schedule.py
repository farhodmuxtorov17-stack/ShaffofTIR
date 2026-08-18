from rest_framework import serializers
from ..models.schedule import RangeSchedule

class RangeScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RangeSchedule
        fields = '__all__'
