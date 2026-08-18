from rest_framework import serializers
from shaffoftir_api.models import Employee, Department


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class EmployeeListSerializer(serializers.ModelSerializer):
    """Сокращённый сериализатор для списков"""
    class Meta:
        model = Employee
        fields = ['id', 'full_name', 'rank', 'department', 'region',
                   'personal_number', 'shooting_qualified', 'avg_accuracy',
                   'total_sessions', 'status']


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_employee_count(self, obj):
        return obj.employee_count
