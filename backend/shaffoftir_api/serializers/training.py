from rest_framework import serializers
from shaffoftir_api.models import TrainingPlan, TrainingAssignment


class TrainingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingPlan
        fields = '__all__'


class TrainingAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingAssignment
        fields = '__all__'
