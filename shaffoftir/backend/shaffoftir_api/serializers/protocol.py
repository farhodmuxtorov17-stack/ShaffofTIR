from rest_framework import serializers
from ..models.protocol import Protocol

class ProtocolSerializer(serializers.ModelSerializer):
    session_id = serializers.CharField(source='session_id_str', required=False)
    class Meta:
        model = Protocol
        fields = '__all__'
