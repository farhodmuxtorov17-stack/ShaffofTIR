"""Schedule views."""
from rest_framework import viewsets
from ..models.schedule import RangeSchedule
from ..serializers.schedule import RangeScheduleSerializer
from ..permissions import IsAuthenticated


class RangeScheduleViewSet(viewsets.ModelViewSet):
    queryset = RangeSchedule.objects.all()
    serializer_class = RangeScheduleSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "range_name", "date"]
    ordering_fields = ["date", "start_time"]
