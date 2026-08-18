from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from ..models.weapon import Weapon, WeaponAssignment
from ..serializers.weapon import WeaponSerializer, WeaponAssignmentSerializer

class WeaponListView(generics.ListCreateAPIView):
    queryset = Weapon.objects.all()
    serializer_class = WeaponSerializer
    filterset_fields = ['category', 'status', 'condition']
    search_fields = ['name', 'serial_number', 'manufacturer']
    ordering_fields = ['name', 'total_shots_fired', 'created_at']

class WeaponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Weapon.objects.all()
    serializer_class = WeaponSerializer

class WeaponAssignmentListView(generics.ListCreateAPIView):
    queryset = WeaponAssignment.objects.all()
    serializer_class = WeaponAssignmentSerializer
    filterset_fields = ['status', 'weapon', 'employee_id']
    ordering_fields = ['-assigned_at']

class WeaponAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WeaponAssignment.objects.all()
    serializer_class = WeaponAssignmentSerializer

class AssignWeaponToLaneView(APIView):
    """POST /api/weapons/assign-to-lane/ — assign weapon to lane for session"""
    def post(self, request):
        weapon_id = request.data.get('weapon_id')
        lane_id = request.data.get('lane_id')
        employee_id = request.data.get('employee_id')
        employee_name = request.data.get('employee_name')
        session_id = request.data.get('session_id', '')
        
        try:
            weapon = Weapon.objects.get(id=weapon_id)
        except Weapon.DoesNotExist:
            return Response({'error': 'Weapon not found'}, status=404)
        
        weapon.status = 'IN_USE'
        weapon.assigned_to = employee_name
        weapon.save()
        
        assignment = WeaponAssignment.objects.create(
            weapon=weapon,
            weapon_name=weapon.name,
            employee_id=employee_id,
            employee_name=employee_name,
            session_id=session_id,
            status='ASSIGNED',
        )
        
        return Response(WeaponAssignmentSerializer(assignment).data, status=201)
