"""HR department views."""
from rest_framework import viewsets
from ..models.hr import HRDepartment
from ..serializers.hr import HRDepartmentSerializer
from ..permissions import IsAuthenticated, IsInstructor


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = HRDepartment.objects.all()
    serializer_class = HRDepartmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["region"]
    search_fields = ["name", "head_name"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsInstructor()]
        return [IsAuthenticated()]
