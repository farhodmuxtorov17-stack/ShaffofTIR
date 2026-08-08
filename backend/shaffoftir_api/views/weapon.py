from rest_framework import viewsets
from shaffoftir_api.models import Weapon, WeaponAssignment
from shaffoftir_api.serializers import WeaponSerializer, WeaponAssignmentSerializer


class WeaponViewSet(viewsets.ModelViewSet):
    queryset = Weapon.objects.all()
    serializer_class = WeaponSerializer
    filterset_fields = ['category', 'status', 'condition']
    search_fields = ['name', 'serial_number', 'manufacturer']
    ordering_fields = ['name', 'total_shots_fired', 'created_at']


class WeaponAssignmentViewSet(viewsets.ModelViewSet):
    queryset = WeaponAssignment.objects.all()
    serializer_class = WeaponAssignmentSerializer
    filterset_fields = ['status', 'weapon', 'employee']
    ordering_fields = ['assigned_at', 'returned_at']
