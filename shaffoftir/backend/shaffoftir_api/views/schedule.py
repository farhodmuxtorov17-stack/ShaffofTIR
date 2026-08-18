from rest_framework import generics
from ..models.schedule import RangeSchedule
from ..serializers.schedule import RangeScheduleSerializer

class RangeScheduleListView(generics.ListCreateAPIView):
    queryset = RangeSchedule.objects.all()
    serializer_class = RangeScheduleSerializer
    filterset_fields = ['status', 'department']
    ordering_fields = ['-date']

class RangeScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RangeSchedule.objects.all()
    serializer_class = RangeScheduleSerializer
