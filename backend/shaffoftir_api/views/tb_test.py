"""TB safety test views."""
from rest_framework import viewsets
from ..models.tb_test import TBSafetyTest
from ..serializers.tb_test import TBSafetyTestSerializer
from ..permissions import IsAuthenticated, IsInstructor


class TBSafetyTestViewSet(viewsets.ModelViewSet):
    """ViewSet for TB safety tests.

    A test passes only when all questions are answered correctly (100%).
    The pass/fail logic is in the model's save() method.
    """
    queryset = TBSafetyTest.objects.all()
    serializer_class = TBSafetyTestSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["passed", "employee_name"]
    search_fields = ["employee_name", "instructor_name"]
    ordering_fields = ["test_date"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsInstructor()]
        return [IsAuthenticated()]
