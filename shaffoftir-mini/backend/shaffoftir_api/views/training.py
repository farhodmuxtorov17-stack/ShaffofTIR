"""Training views."""
from rest_framework import viewsets
from ..models.training import TrainingPlan, TrainingAssignment
from ..serializers.training import TrainingPlanSerializer, TrainingAssignmentSerializer
from ..permissions import IsAuthenticated, IsInstructor


class TrainingPlanViewSet(viewsets.ModelViewSet):
    queryset = TrainingPlan.objects.all()
    serializer_class = TrainingPlanSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["is_active", "difficulty"]
    search_fields = ["title", "description"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsInstructor()]
        return [IsAuthenticated()]


class TrainingAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TrainingAssignment.objects.all()
    serializer_class = TrainingAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "plan"]
    search_fields = ["employee_name"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsInstructor()]
        return [IsAuthenticated()]
