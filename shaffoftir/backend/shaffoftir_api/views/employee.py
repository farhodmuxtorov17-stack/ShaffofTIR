from rest_framework import viewsets
from shaffoftir_api.models import Employee, Department
from shaffoftir_api.serializers import EmployeeSerializer, DepartmentSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filterset_fields = ['department', 'region', 'district', 'status', 'shooting_qualified']
    search_fields = ['full_name', 'personal_number', 'rank']
    ordering_fields = ['full_name', 'total_sessions', 'avg_accuracy', 'created_at']


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    search_fields = ['name', 'code', 'head']
    ordering_fields = ['name', 'created_at']
