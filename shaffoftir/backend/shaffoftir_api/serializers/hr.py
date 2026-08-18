from rest_framework import serializers
from ..models.hr import HREmployee, HRDepartment

class HRDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HRDepartment
        fields = '__all__'

class HREmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HREmployee
        fields = '__all__'
