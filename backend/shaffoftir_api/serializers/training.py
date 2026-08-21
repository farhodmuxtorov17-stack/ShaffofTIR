"""Training serializers."""
from rest_framework import serializers
from ..models.training import TrainingPlan, TrainingAssignment


class TrainingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingPlan
        fields = "__all__"
        read_only_fields = ("id", "created_at")


class TrainingAssignmentSerializer(serializers.ModelSerializer):
    plan_title = serializers.CharField(source="plan.title", read_only=True)

    class Meta:
        model = TrainingAssignment
        fields = "__all__"
        read_only_fields = ("id", "assigned_date")
