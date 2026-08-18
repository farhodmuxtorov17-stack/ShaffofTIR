"""Audit log views."""
from rest_framework import viewsets
from ..models.audit import AuditLog
from ..serializers.audit import AuditLogSerializer
from ..permissions import IsAuthenticated, IsTechSpec


class AuditAnnotationViewSet(viewsets.ModelViewSet):
    """Audit log is read-only for all; write for TechSpec."""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["actor_role", "module", "action"]
    search_fields = ["actor_name", "details"]
    ordering_fields = ["timestamp"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsTechSpec()]
        return [IsAuthenticated()]
