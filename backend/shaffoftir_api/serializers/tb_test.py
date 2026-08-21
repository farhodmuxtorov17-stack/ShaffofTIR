"""TB safety test serializer."""
from rest_framework import serializers
from ..models.tb_test import TBSafetyTest


class TBSafetyTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TBSafetyTest
        fields = "__all__"
        read_only_fields = ("id", "test_date", "passed", "score")
