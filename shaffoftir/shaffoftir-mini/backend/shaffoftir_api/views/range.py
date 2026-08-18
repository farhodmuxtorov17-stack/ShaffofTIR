from rest_framework import generics
from ..models.range import ShootingRange, RangeRubeg, ShootingLane
from ..serializers.range import ShootingRangeSerializer, RangeRubegSerializer, ShootingLaneSerializer

class ShootingRangeListView(generics.ListCreateAPIView):
    queryset = ShootingRange.objects.all()
    serializer_class = ShootingRangeSerializer
    search_fields = ['name', 'location']
    filterset_fields = ['range_type', 'is_active']

class ShootingRangeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ShootingRange.objects.all()
    serializer_class = ShootingRangeSerializer

class RangeRubegListView(generics.ListCreateAPIView):
    queryset = RangeRubeg.objects.all()
    serializer_class = RangeRubegSerializer
    filterset_fields = ['range', 'weapon_type', 'is_active']
    search_fields = ['name']

class RangeRubegDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RangeRubeg.objects.all()
    serializer_class = RangeRubegSerializer

class ShootingLaneListView(generics.ListCreateAPIView):
    queryset = ShootingLane.objects.all()
    serializer_class = ShootingLaneSerializer
    filterset_fields = ['status', 'range', 'rubeg', 'camera_status']
    ordering_fields = ['lane_number']

class ShootingLaneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ShootingLane.objects.all()
    serializer_class = ShootingLaneSerializer
