"""Employee views — CRUD for personnel registry."""
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema

from ..models.employee import Employee
from ..serializers.employee import EmployeeSerializer
from ..permissions import IsAuthenticated, IsInstructor


class EmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet for employee management.

    Read access for all authenticated users; write for instructors.
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["region", "department", "shooting_qualified", "tb_test_passed"]
    search_fields = ["full_name", "personal_number", "rank"]
    ordering_fields = ["full_name", "total_sessions", "avg_accuracy", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsInstructor()]
        return [IsAuthenticated()]
