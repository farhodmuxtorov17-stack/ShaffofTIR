"""Weapon views — CRUD for arsenal management."""
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema

from ..models.weapon import Weapon
from ..serializers.weapon import WeaponSerializer
from ..permissions import IsAuthenticated, IsTechSpec


class WeaponViewSet(viewsets.ModelViewSet):
    """ViewSet for weapon management (TechSpec only)."""
    queryset = Weapon.objects.all()
    serializer_class = WeaponSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["status", "category", "caliber"]
    search_fields = ["name", "serial_number"]
    ordering_fields = ["name", "total_shots_fired", "status"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsTechSpec()]
        return [IsAuthenticated()]
