"""Protocol serializer with status validation."""
from rest_framework import serializers
from ..models.protocol import Protocol, IMMUTABLE_STATUSES


class ProtocolSerializer(serializers.ModelSerializer):
    is_editable = serializers.ReadOnlyField()

    class Meta:
        model = Protocol
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "protocol_number", "signed_at")

    def validate_status(self, value):
        """Prevent status change on immutable protocols (zero-edit policy)."""
        if self.instance and self.instance.status in IMMUTABLE_STATUSES:
            raise serializers.ValidationError(
                f"Протокол в статусе '{self.instance.status}' не подлежит изменению."
            )
        return value
