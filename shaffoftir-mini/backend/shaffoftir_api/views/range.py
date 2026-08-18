"""Range and lane views."""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..models.range import ShootingRange, ShootingLane, RangeRubeg
from ..serializers.range import ShootingRangeSerializer, ShootingLaneSerializer, RangeRubegSerializer
from ..permissions import IsAuthenticated, IsTechSpec


@extend_schema(tags=["Range"])
class ShootingRangeViewSet(viewsets.ModelViewSet):
    queryset = ShootingRange.objects.prefetch_related("lanes", "rubegs").all()
    serializer_class = ShootingRangeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["range_type", "is_active", "region"]
    ordering_fields = ["name", "created_at"]

    @action(detail=True, methods=["get"])
    def structure(self, request, pk=None):
        """Get full range structure.
        OPEN: rubegs with their lanes.
        CLOSED: lanes directly (no rubegs).
        """
        rng = self.get_object()
        if rng.range_type == "OPEN":
            rubegs = rng.rubegs.prefetch_related("lanes").all()
            return Response({
                "range_type": "OPEN",
                "range": ShootingRangeSerializer(rng).data,
                "rubegs": RangeRubegSerializer(rubegs, many=True).data,
            })
        else:
            lanes = rng.lanes.all()
            return Response({
                "range_type": "CLOSED",
                "range": ShootingRangeSerializer(rng).data,
                "lanes": ShootingLaneSerializer(lanes, many=True).data,
            })

    @action(detail=True, methods=["post"])
    def add_rubeg(self, request, pk=None):
        """Add a rubeg (firing line) to an OPEN range.
        Body: { rubeg_number, distance, max_lanes?, description? }
        """
        rng = self.get_object()
        if rng.range_type != "OPEN":
            return Response(
                {"error": "Rubegs can only be added to OPEN ranges"},
                status=400,
            )
        rubeg = RangeRubeg.objects.create(
            range=rng,
            rubeg_number=request.data["rubeg_number"],
            distance=request.data.get("distance", 25),
            max_lanes=request.data.get("max_lanes", 10),
            description=request.data.get("description", ""),
        )
        return Response(RangeRubegSerializer(rubeg).data, status=201)

    @action(detail=True, methods=["post"], url_path="rubegs/(?P<rubeg_pk>[^/.]+)/add_lane")
    def add_lane_to_rubeg(self, request, pk=None, rubeg_pk=None):
        """Add a lane to a specific rubeg in an OPEN range.
        Body: { lane_number, name?, distance_m?, target_type? }
        """
        rng = self.get_object()
        rubeg = rng.rubegs.get(id=rubeg_pk)
        if rubeg.lanes.count() >= rubeg.max_lanes:
            return Response(
                {"error": f"Rubeg already has maximum {rubeg.max_lanes} lanes"},
                status=400,
            )
        lane = ShootingLane.objects.create(
            range=rng,
            rubeg=rubeg,
            lane_number=request.data["lane_number"],
            name=request.data.get("name", f"Lane {request.data['lane_number']}"),
            distance_m=request.data.get("distance_m", rubeg.distance),
            target_type=request.data.get("target_type", "Круглая"),
        )
        return Response(ShootingLaneSerializer(lane).data, status=201)


@extend_schema(tags=["Range"])
class ShootingLaneViewSet(viewsets.ModelViewSet):
    queryset = ShootingLane.objects.select_related("range", "rubeg").all()
    serializer_class = ShootingLaneSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "camera_status", "range", "rubeg"]
    ordering_fields = ["lane_number", "status"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsTechSpec()]
        return [IsAuthenticated()]


@extend_schema(tags=["Range"])
class RangeRubegViewSet(viewsets.ModelViewSet):
    queryset = RangeRubeg.objects.prefetch_related("lanes").all()
    serializer_class = RangeRubegSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["range", "is_active"]
    ordering_fields = ["rubeg_number"]
