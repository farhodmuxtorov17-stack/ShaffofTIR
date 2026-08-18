"""
Protocol views — CRUD + workflow actions (sign, approve, archive).

Zero-edit policy is enforced: APPROVED/ARCHIVED protocols
cannot be modified.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..models.protocol import Protocol, IMMUTABLE_STATUSES
from ..serializers.protocol import ProtocolSerializer
from ..permissions import IsAuthenticated, IsInstructor
from ..services.protocol_service import ProtocolService


class ProtocolViewSet(viewsets.ModelViewSet):
    """
    ViewSet for shooting protocols.

    Provides standard CRUD plus:
    - POST /protocols/{id}/sign/ — sign a draft
    - POST /protocols/{id}/approve/ — approve a signed protocol
    - POST /protocols/{id}/archive/ — archive an approved protocol
    """

    queryset = Protocol.objects.all()
    serializer_class = ProtocolSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["status", "employee_name", "instructor_name"]
    search_fields = ["employee_name", "protocol_number", "weapon_name"]
    ordering_fields = ["created_at", "total_score", "accuracy"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "sign", "approve", "archive"):
            return [IsInstructor()]
        return [IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        """Override to enforce zero-edit policy."""
        instance = self.get_object()
        if instance.status in IMMUTABLE_STATUSES:
            return Response(
                {"error": {"code": "IMMUTABLE", "message":
                    f"Протокол в статусе '{instance.status}' не подлежит изменению"}},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Override to enforce zero-edit policy."""
        instance = self.get_object()
        if instance.status in IMMUTABLE_STATUSES:
            return Response(
                {"error": {"code": "IMMUTABLE", "message":
                    f"Протокол в статусе '{instance.status}' не подлежит удалению"}},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @extend_schema(description="Sign a draft protocol (DRAFT → SIGNED)")
    @action(detail=True, methods=["post"])
    def sign(self, request, pk=None):
        protocol = self.get_object()
        ProtocolService.sign(protocol, request.user)
        return Response(ProtocolSerializer(protocol).data)

    @extend_schema(description="Approve a signed protocol (SIGNED → APPROVED)")
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        protocol = self.get_object()
        ProtocolService.approve(protocol, request.user)
        return Response(ProtocolSerializer(protocol).data)

    @extend_schema(description="Archive an approved protocol (APPROVED → ARCHIVED)")
    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        protocol = self.get_object()
        ProtocolService.archive(protocol, request.user)
        return Response(ProtocolSerializer(protocol).data)
