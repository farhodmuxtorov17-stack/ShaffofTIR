from rest_framework import viewsets
from shaffoftir_api.models import TrainingPlan, TrainingAssignment
from shaffoftir_api.serializers import TrainingPlanSerializer, TrainingAssignmentSerializer


class TrainingPlanViewSet(viewsets.ModelViewSet):
    queryset = TrainingPlan.objects.all()
    serializer_class = TrainingPlanSerializer
    filterset_fields = ['difficulty']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class TrainingAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TrainingAssignment.objects.all()
    serializer_class = TrainingAssignmentSerializer
    filterset_fields = ['status', 'plan', 'employee']
    search_fields = ['employee_name', 'plan_name', 'instructor_name']
    ordering_fields = ['assigned_at', 'due_date']
