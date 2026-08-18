from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from ..models.session_flow import ShootingSessionFlow
from ..models.range import ShootingLane
from ..models.weapon import Weapon
from ..serializers.session_flow import ShootingSessionFlowSerializer

class SessionFlowListView(generics.ListCreateAPIView):
    queryset = ShootingSessionFlow.objects.all()
    serializer_class = ShootingSessionFlowSerializer
    filterset_fields = ['status', 'lane_number', 'employee_id']
    ordering_fields = ['-created_at', '-started_at']

class SessionFlowDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ShootingSessionFlow.objects.all()
    serializer_class = ShootingSessionFlowSerializer

class AssignToLaneView(APIView):
    """POST /api/session-flows/assign-to-lane/ — assign employee to a lane"""
    def post(self, request):
        lane_id = request.data.get('lane_id')
        employee_id = request.data.get('employee_id')
        employee_name = request.data.get('employee_name')
        employee_rank = request.data.get('employee_rank', '')
        instructor_id = request.data.get('instructor_id', '')
        instructor_name = request.data.get('instructor_name', '')
        
        try:
            lane = ShootingLane.objects.get(id=lane_id)
        except ShootingLane.DoesNotExist:
            return Response({'error': 'Lane not found'}, status=404)
        
        # Update lane
        lane.status = 'OCCUPIED'
        lane.current_employee_id = employee_id
        lane.current_employee_name = employee_name
        lane.session_start_time = timezone.now()
        lane.save()
        
        # Create flow
        flow = ShootingSessionFlow.objects.create(
            lane=lane,
            lane_number=lane.lane_number,
            employee_id=employee_id,
            employee_name=employee_name,
            employee_rank=employee_rank,
            instructor_id=instructor_id,
            instructor_name=instructor_name,
            status='ASSIGNED',
            started_at=timezone.now(),
        )
        
        return Response(ShootingSessionFlowSerializer(flow).data, status=201)

class SelectWeaponView(APIView):
    """POST /api/session-flows/select-weapon/ — select weapon for a flow"""
    def post(self, request):
        flow_id = request.data.get('flow_id')
        weapon_id = request.data.get('weapon_id')
        
        try:
            flow = ShootingSessionFlow.objects.get(id=flow_id)
        except ShootingSessionFlow.DoesNotExist:
            return Response({'error': 'Flow not found'}, status=404)
        
        try:
            weapon = Weapon.objects.get(id=weapon_id)
        except Weapon.DoesNotExist:
            return Response({'error': 'Weapon not found'}, status=404)
        
        flow.weapon = weapon
        flow.weapon_id_str = str(weapon.id)
        flow.weapon_name = weapon.name
        flow.weapon_category = weapon.category
        flow.status = 'WEAPON_SELECTED'
        flow.save()
        
        # Update lane
        if flow.lane:
            flow.lane.weapon_assigned = weapon.name
            flow.lane.save()
        
        # Mark weapon in use
        weapon.status = 'IN_USE'
        weapon.assigned_to = flow.employee_name
        weapon.save()
        
        return Response(ShootingSessionFlowSerializer(flow).data, status=200)

class StartShootingView(APIView):
    """POST /api/session-flows/start-shooting/ — start shooting on a flow"""
    def post(self, request):
        flow_id = request.data.get('flow_id')
        shot_type = request.data.get('shot_type', 'TEST')
        expected_shots = request.data.get('expected_shots', 3)
        
        try:
            flow = ShootingSessionFlow.objects.get(id=flow_id)
        except ShootingSessionFlow.DoesNotExist:
            return Response({'error': 'Flow not found'}, status=404)
        
        flow.status = 'SHOOTING'
        flow.shot_type = shot_type
        flow.expected_shots = expected_shots
        flow.started_at = timezone.now()
        flow.save()
        
        return Response(ShootingSessionFlowSerializer(flow).data, status=200)

class CompleteFlowView(APIView):
    """POST /api/session-flows/complete/ — complete a shooting flow"""
    def post(self, request):
        flow_id = request.data.get('flow_id')
        
        try:
            flow = ShootingSessionFlow.objects.get(id=flow_id)
        except ShootingSessionFlow.DoesNotExist:
            return Response({'error': 'Flow not found'}, status=404)
        
        flow.status = 'COMPLETED'
        flow.completed_at = timezone.now()
        flow.save()
        
        # Free the lane
        if flow.lane:
            flow.lane.status = 'AVAILABLE'
            flow.lane.current_employee_id = None
            flow.lane.current_employee_name = None
            flow.lane.weapon_assigned = None
            flow.lane.session_start_time = None
            flow.lane.save()
        
        # Free the weapon
        if flow.weapon:
            flow.weapon.status = 'AVAILABLE'
            flow.weapon.assigned_to = None
            flow.weapon.save()
        
        return Response(ShootingSessionFlowSerializer(flow).data, status=200)
