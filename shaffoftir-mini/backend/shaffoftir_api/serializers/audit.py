"""Audit log serializer."""
from rest_framework import serializers
from ..models.audit import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"
        read_only_fields = ("id", "timestamp")
