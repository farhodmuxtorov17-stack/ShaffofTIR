from rest_framework import serializers
from ..models.tb_test import TBSafetyTest, TBSafetyTestResult

class TBSafetyTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TBSafetyTest
        fields = '__all__'

class TBSafetyTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TBSafetyTestResult
        fields = '__all__'
