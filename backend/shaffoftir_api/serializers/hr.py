"""HR department serializer."""
from rest_framework import serializers
from ..models.hr import HRDepartment


class HRDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HRDepartment
        fields = "__all__"
        read_only_fields = ("id", "created_at")
