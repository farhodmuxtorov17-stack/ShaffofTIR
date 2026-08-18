from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from ..models.session import ShootingSession, Soldier, Shot
from ..serializers.session import ShootingSessionSerializer, SoldierSerializer, ShotSerializer

class ShootingSessionListView(generics.ListCreateAPIView):
    queryset = ShootingSession.objects.all()
    serializer_class = ShootingSessionSerializer
    filterset_fields = ['status', 'scoring_mode', 'employee_id', 'instructor_id', 'range_name']
    search_fields = ['employee_name', 'weapon_name', 'session_id']
    ordering_fields = ['created_at', 'total_score', 'accuracy']

    def perform_create(self, serializer):
        instance = serializer.save()
        if not instance.session_id:
            instance.session_id = f"sh-{instance.id}"
            instance.save()

class ShootingSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ShootingSession.objects.all()
    serializer_class = ShootingSessionSerializer

class SoldierListView(generics.ListCreateAPIView):
    queryset = Soldier.objects.all()
    serializer_class = SoldierSerializer
    filterset_fields = ['session', 'status']

class SoldierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Soldier.objects.all()
    serializer_class = SoldierSerializer

class ShotListView(generics.ListCreateAPIView):
    queryset = Shot.objects.all()
    serializer_class = ShotSerializer
    filterset_fields = ['session', 'soldier', 'shot_type', 'is_hit']

class ShotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Shot.objects.all()
    serializer_class = ShotSerializer

class StartSessionView(APIView):
    """POST /api/sessions/start/ — create session with soldiers"""
    def post(self, request):
        soldier_count = request.data.get('soldier_count', 1)
        scoring_mode = request.data.get('scoring_mode', 'POINTS')
        range_type = request.data.get('range_type', 'CLOSED')
        distance = request.data.get('distance', 25)
        
        session = ShootingSession.objects.create(
            status='SESSION_CREATED',
            scoring_mode=scoring_mode,
            range_type=range_type,
            distance=distance,
            soldier_count=soldier_count,
        )
        
        # Create soldiers
        for i in range(1, soldier_count + 1):
            Soldier.objects.create(
                session=session,
                sequence_number=i,
                status='WAITING',
            )
        
        session.session_id = f"sh-{session.id}"
        session.save()
        
        return Response(ShootingSessionSerializer(session).data, status=201)

class ProcessTurnView(APIView):
    """POST /api/sessions/process-turn/ — process shooting turn for a soldier"""
    def post(self, request):
        session_id = request.data.get('session_id')
        soldier_seq = request.data.get('soldier_seq')
        shot_type = request.data.get('shot_type', 'MAIN')
        shots_data = request.data.get('shots', [])
        
        try:
            session = ShootingSession.objects.get(session_id=session_id)
        except ShootingSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)
        
        try:
            soldier = Soldier.objects.get(session=session, sequence_number=soldier_seq)
        except Soldier.DoesNotExist:
            return Response({'error': 'Soldier not found'}, status=404)
        
        new_shots = []
        for i, s in enumerate(shots_data):
            shot = Shot.objects.create(
                session=session,
                soldier=soldier,
                shot_type=shot_type,
                x=s.get('x', 0),
                y=s.get('y', 0),
                score=s.get('score', 0),
                is_hit=s.get('score', 0) > 0,
                soldier_seq=soldier_seq,
                shot_number=i + 1,
            )
            new_shots.append(shot)
        
        # Update soldier stats
        soldier.total_score = sum(s.score for s in new_shots) + soldier.total_score
        soldier.hit_count = sum(1 for s in new_shots if s.is_hit) + soldier.hit_count
        soldier.miss_count = sum(1 for s in new_shots if not s.is_hit) + soldier.miss_count
        total = soldier.hit_count + soldier.miss_count
        soldier.accuracy = round(soldier.hit_count / total * 100, 1) if total > 0 else 0
        soldier.save()
        
        # Update session stats
        session.total_shots = Shot.objects.filter(session=session).count()
        session.hit_count = Shot.objects.filter(session=session, is_hit=True).count()
        session.miss_count = session.total_shots - session.hit_count
        session.total_score = sum(s.score for s in Shot.objects.filter(session=session))
        session.accuracy = round(session.hit_count / session.total_shots * 100, 1) if session.total_shots > 0 else 0
        session.passed = session.accuracy >= 60
        session.save()
        
        return Response({
            'session_id': session.session_id,
            'soldier_sequence': soldier_seq,
            'new_shots': ShotSerializer(new_shots, many=True).data,
            'total_score': soldier.total_score,
            'hit_count': soldier.hit_count,
            'miss_count': soldier.miss_count,
            'accuracy': soldier.accuracy,
        }, status=200)
