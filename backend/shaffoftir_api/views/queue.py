"""
Shooting Queue ViewSet — sequential queue management with auto-advance.
"""
import rest_framework.viewsets as viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from ..permissions import IsInstructor
from ..models.queue import ShootingQueue, QueueEntry
from ..serializers.queue import ShootingQueueSerializer, QueueEntrySerializer
from ..services.queue_service import QueueService


@extend_schema(tags=['Queue'])
class ShootingQueueViewSet(viewsets.ModelViewSet):
    queryset = ShootingQueue.objects.select_related('instructor', 'range', 'lane').prefetch_related('entries').all()
    serializer_class = ShootingQueueSerializer
    permission_classes = [IsAuthenticated, IsInstructor]
    ordering_fields = ['-created_at']

    @action(detail=True, methods=['post'])
    def create_from_checkin(self, request, pk=None):
        """Create queue from a FaceID check-in event.
        Body: { range_id, lane_id?, auto_advance? }
        """
        queue = QueueService.create_queue_from_check_in(
            check_in_id=pk,
            instructor_id=request.user.id,
            range_id=request.data.get('range_id'),
            lane_id=request.data.get('lane_id'),
            auto_advance=request.data.get('auto_advance', True),
        )
        return Response(ShootingQueueSerializer(queue).data, status=201)

    @action(detail=False, methods=['post'])
    def create_manual(self, request):
        """Create queue manually without FaceID.
        Body: { range_id, lane_id?, auto_advance?, soldiers: [{employee_id?, employee_name, employee_rank?, employee_department?}] }
        """
        queue = QueueService.create_queue_manual(
            instructor_id=request.user.id,
            range_id=request.data.get('range_id'),
            soldiers_data=request.data.get('soldiers', []),
            lane_id=request.data.get('lane_id'),
            auto_advance=request.data.get('auto_advance', True),
        )
        return Response(ShootingQueueSerializer(queue).data, status=201)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate the queue — starts with first soldier."""
        queue = QueueService.activate_queue(pk)
        return Response(ShootingQueueSerializer(queue).data)

    @action(detail=True, methods=['post'])
    def complete_current(self, request, pk=None):
        """Complete the current shooter and auto-advance to next.
        Body: { total_shots?, hit_count?, miss_count?, total_score?, accuracy?, passed? }
        """
        next_entry = QueueService.complete_current(pk, request.data)
        state = QueueService.get_queue_state(pk)
        return Response({
            'queue': ShootingQueueSerializer(state['queue']).data,
            'next_entry': QueueEntrySerializer(next_entry).data if next_entry else None,
            'queue_complete': next_entry is None,
        })

    @action(detail=True, methods=['post'])
    def skip_current(self, request, pk=None):
        """Skip the current shooter."""
        next_entry = QueueService.skip_current(pk)
        return Response({
            'next_entry': QueueEntrySerializer(next_entry).data if next_entry else None,
            'queue_complete': next_entry is None,
        })

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        queue = QueueService.pause_queue(pk)
        return Response(ShootingQueueSerializer(queue).data)

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        queue = QueueService.resume_queue(pk)
        return Response(ShootingQueueSerializer(queue).data)

    @action(detail=True, methods=['get'])
    def state(self, request, pk=None):
        """Get full queue state for rendering."""
        state = QueueService.get_queue_state(pk)
        return Response({
            'queue': ShootingQueueSerializer(state['queue']).data,
            'current': QueueEntrySerializer(state['current']).data if state['current'] else None,
            'waiting': QueueEntrySerializer(state['waiting'], many=True).data,
            'completed': QueueEntrySerializer(state['completed'], many=True).data,
            'progress': state['progress'],
        })


@extend_schema(tags=['Queue'])
class QueueEntryViewSet(viewsets.ModelViewSet):
    queryset = QueueEntry.objects.select_related('employee', 'queue').all()
    serializer_class = QueueEntrySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['queue', 'status']
    ordering_fields = ['sequence_number']
