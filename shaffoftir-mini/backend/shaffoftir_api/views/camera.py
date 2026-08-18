"""
Camera views — CRUD + health check endpoint.

The health check uses the CameraService to perform
concurrent TCP connectivity checks.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..models.camera import LaneCamera
from ..serializers.camera import LaneCameraSerializer
from ..permissions import IsAuthenticated, IsTechSpec
from ..services.camera_service import CameraService


class CameraViewSet(viewsets.ModelViewSet):
    """ViewSet for camera management (TechSpec only).

    Provides standard CRUD plus:
    - POST /cameras/health/ — check connectivity for all cameras
    """
    queryset = LaneCamera.objects.all()
    serializer_class = LaneCameraSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["status", "lane_number"]
    ordering_fields = ["lane_number", "status"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "health"):
            return [IsTechSpec()]
        return [IsAuthenticated()]

    @extend_schema(
        request={"cameras": list},
        responses=dict,
        description="Check TCP connectivity for all cameras (or a subset)",
    )
    @action(detail=False, methods=["post"])
    def health(self, request):
        """Check camera connectivity.

        Body: {"cameras": [{"camera_ip": "192.168.1.1", "label": "Lane 1"}, ...]}
        If no body is provided, all cameras are checked.
        """
        cameras_data = request.data.get("cameras")

        if not cameras_data:
            cameras_data = [
                {"camera_ip": c.camera_ip, "label": c.name}
                for c in LaneCamera.objects.all()
            ]

        result = CameraService.check_health(cameras_data)
        return Response(result, status=status.HTTP_200_OK)
