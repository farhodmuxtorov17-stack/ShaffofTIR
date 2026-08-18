from rest_framework import generics
from ..models.hr import HREmployee, HRDepartment
from ..serializers.hr import HREmployeeSerializer, HRDepartmentSerializer

class HREmployeeListView(generics.ListCreateAPIView):
    queryset = HREmployee.objects.all()
    serializer_class = HREmployeeSerializer
    filterset_fields = ['department', 'status', 'region', 'rank', 'shooting_qualified', 'tb_test_passed']
    search_fields = ['full_name', 'personal_number', 'phone']
    ordering_fields = ['full_name', 'total_score', 'avg_accuracy', 'hire_date']

class HREmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HREmployee.objects.all()
    serializer_class = HREmployeeSerializer

class HRDepartmentListView(generics.ListCreateAPIView):
    queryset = HRDepartment.objects.all()
    serializer_class = HRDepartmentSerializer
    search_fields = ['name', 'code']

class HRDepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HRDepartment.objects.all()
    serializer_class = HRDepartmentSerializer
