from rest_framework import generics
from ..models.training import TrainingPlan, TrainingAssignment
from ..serializers.training import TrainingPlanSerializer, TrainingAssignmentSerializer

class TrainingPlanListView(generics.ListCreateAPIView):
    queryset = TrainingPlan.objects.all()
    serializer_class = TrainingPlanSerializer
    filterset_fields = ['difficulty']
    search_fields = ['name', 'description']

class TrainingPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrainingPlan.objects.all()
    serializer_class = TrainingPlanSerializer

class TrainingAssignmentListView(generics.ListCreateAPIView):
    queryset = TrainingAssignment.objects.all()
    serializer_class = TrainingAssignmentSerializer
    filterset_fields = ['status', 'plan', 'employee_id']
    ordering_fields = ['-assigned_at']

class TrainingAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrainingAssignment.objects.all()
    serializer_class = TrainingAssignmentSerializer
