from rest_framework import generics
from ..models.audit import AuditLog
from ..serializers.audit import AuditLogSerializer

class AuditLogListView(generics.ListCreateAPIView):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    filterset_fields = ['actor_role', 'module', 'action']
    ordering_fields = ['-timestamp']

class AuditLogDetailView(generics.RetrieveDestroyAPIView):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
