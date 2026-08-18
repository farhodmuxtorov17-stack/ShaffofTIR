"""
Shooting queue service — manages sequential soldier queue with auto-advance.
"""
import uuid
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from ..models.queue import ShootingQueue, QueueEntry
from ..models.faceid import FaceCheckIn


def _broadcast_queue_event(queue_id, event_type, data):
    """Broadcast a queue event via WebSocket channel layer."""
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    try:
        layer = get_channel_layer()
        if layer:
            async_to_sync(layer.group_send)(
                f'queue_{queue_id}',
                {'type': event_type, 'data': data}
            )
    except Exception:
        pass  # No channel layer (e.g. in tests)

class QueueService:

    @staticmethod
    @transaction.atomic
    def create_queue_from_check_in(check_in_id, instructor_id, range_id, lane_id=None, auto_advance=True):
        """Create a shooting queue from a completed FaceID check-in."""
        check_in = FaceCheckIn.objects.get(id=check_in_id)
        entries = FaceIDService.get_check_in_entries(check_in_id) if False else \
            __import__('shaffoftir_api.services.faceid_service', fromlist=['FaceIDService']).FaceIDService.get_check_in_entries(check_in_id)

        queue = ShootingQueue.objects.create(
            queue_id=f"sq-{uuid.uuid4().hex[:12]}",
            check_in_id=check_in_id,
            instructor_id=instructor_id,
            range_id=range_id,
            lane_id=lane_id,
            status=ShootingQueue.QueueStatus.WAITING,
            total_soldiers=entries.count(),
            auto_advance=auto_advance,
        )

        for entry in entries:
            QueueEntry.objects.create(
                queue=queue,
                employee=entry.employee,
                employee_name=entry.employee.full_name if entry.employee else 'Unknown',
                employee_rank=entry.employee.rank if entry.employee else '',
                employee_department=entry.employee.department if entry.employee else '',
                sequence_number=entry.sequence_number,
                status=QueueEntry.EntryStatus.WAITING,
            )

        return queue

    @staticmethod
    @transaction.atomic
    def create_queue_manual(instructor_id, range_id, soldiers_data, lane_id=None, auto_advance=True):
        """
        Create a queue manually without FaceID.
        soldiers_data: [{'employee_id': ..., 'employee_name': ..., 'employee_rank': ..., 'employee_department': ...}, ...]
        """
        from ..models.employee import Employee

        queue = ShootingQueue.objects.create(
            queue_id=f"sq-{uuid.uuid4().hex[:12]}",
            instructor_id=instructor_id,
            range_id=range_id,
            lane_id=lane_id,
            status=ShootingQueue.QueueStatus.WAITING,
            total_soldiers=len(soldiers_data),
            auto_advance=auto_advance,
        )

        for i, sd in enumerate(soldiers_data, 1):
            emp = None
            if sd.get('employee_id'):
                emp = Employee.objects.get(id=sd['employee_id'])
            QueueEntry.objects.create(
                queue=queue,
                employee=emp,
                employee_name=sd.get('employee_name', 'Unknown'),
                employee_rank=sd.get('employee_rank', ''),
                employee_department=sd.get('employee_department', ''),
                sequence_number=i,
                status=QueueEntry.EntryStatus.WAITING,
            )

        return queue

    @staticmethod
    @transaction.atomic
    def activate_queue(queue_id):
        """Activate a queue — sets first soldier as CURRENT."""
        queue = ShootingQueue.objects.get(id=queue_id)
        if queue.status != ShootingQueue.QueueStatus.WAITING:
            raise ValidationError(f'Cannot activate queue in {queue.status} status')

        first_entry = queue.entries.order_by('sequence_number').first()
        if not first_entry:
            raise ValidationError('Queue is empty')

        first_entry.status = QueueEntry.EntryStatus.CURRENT
        first_entry.started_at = timezone.now()
        first_entry.save()

        queue.status = ShootingQueue.QueueStatus.ACTIVE
        queue.activated_at = timezone.now()
        queue.current_position = 0
        queue.save()
        return queue

    @staticmethod
    @transaction.atomic
    def complete_current(queue_id, results=None):
        """
        Complete the current shooter and auto-advance to next.
        results: {'total_shots': N, 'hit_count': N, 'miss_count': N, 'total_score': N, 'accuracy': F, 'passed': B}
        Returns the next QueueEntry or None if queue is done.
        """
        queue = ShootingQueue.objects.get(id=queue_id)
        if queue.status != ShootingQueue.QueueStatus.ACTIVE:
            raise ValidationError(f'Queue is not active (status={queue.status})')

        current = queue.entries.filter(status=QueueEntry.EntryStatus.CURRENT).first()
        if not current:
            current = queue.entries.filter(status=QueueEntry.EntryStatus.SHOOTING).first()
        if not current:
            raise ValidationError('No current shooter found')

        # Update current entry with results
        if results:
            current.total_shots = results.get('total_shots', 0)
            current.hit_count = results.get('hit_count', 0)
            current.miss_count = results.get('miss_count', 0)
            current.total_score = results.get('total_score', 0)
            current.accuracy = results.get('accuracy', 0.0)
            current.passed = results.get('passed', False)

        current.status = QueueEntry.EntryStatus.COMPLETED
        current.completed_at = timezone.now()
        current.save()

        queue.completed_count += 1
        queue.current_position += 1

        # Find next entry
        next_entry = queue.entries.filter(
            status=QueueEntry.EntryStatus.WAITING,
            sequence_number__gt=current.sequence_number,
        ).order_by('sequence_number').first()

        if next_entry and queue.auto_advance:
            next_entry.status = QueueEntry.EntryStatus.CURRENT
            next_entry.started_at = timezone.now()
            next_entry.save()
            _broadcast_queue_event(str(queue.id), 'next_soldier', {
                'queue_id': str(queue.id),
                'soldier': {
                    'sequence_number': next_entry.sequence_number,
                    'employee_name': next_entry.employee_name,
                    'employee_rank': next_entry.employee_rank,
                    'employee_department': next_entry.employee_department,
                },
            })
        elif not next_entry:
            # Queue complete
            queue.status = ShootingQueue.QueueStatus.COMPLETED
            queue.completed_at = timezone.now()
            _broadcast_queue_event(str(queue.id), 'queue_completed', {
                'queue_id': str(queue.id),
                'total_soldiers': queue.total_soldiers,
                'completed': queue.completed_count,
            })

        # Broadcast soldier completed
        _broadcast_queue_event(str(queue.id), 'soldier_completed', {
            'queue_id': str(queue.id),
            'completed_entry': {
                'sequence_number': current.sequence_number,
                'employee_name': current.employee_name,
                'hit_count': current.hit_count,
                'total_shots': current.total_shots,
                'accuracy': current.accuracy,
                'passed': current.passed,
            },
            'progress': {
                'completed': queue.completed_count,
                'total': queue.total_soldiers,
                'remaining': queue.total_soldiers - queue.completed_count,
            },
        })

        queue.save()
        return next_entry

    @staticmethod
    @transaction.atomic
    def skip_current(queue_id):
        """Skip the current shooter — mark as SKIPPED and advance."""
        queue = ShootingQueue.objects.get(id=queue_id)
        current = queue.entries.filter(status=QueueEntry.EntryStatus.CURRENT).first()
        if not current:
            raise ValidationError('No current shooter to skip')

        current.status = QueueEntry.EntryStatus.SKIPPED
        current.completed_at = timezone.now()
        current.save()

        queue.completed_count += 1
        queue.current_position += 1

        next_entry = queue.entries.filter(
            status=QueueEntry.EntryStatus.WAITING,
            sequence_number__gt=current.sequence_number,
        ).order_by('sequence_number').first()

        if next_entry and queue.auto_advance:
            next_entry.status = QueueEntry.EntryStatus.CURRENT
            next_entry.started_at = timezone.now()
            next_entry.save()
            _broadcast_queue_event(str(queue.id), 'next_soldier', {
                'queue_id': str(queue.id),
                'soldier': {
                    'sequence_number': next_entry.sequence_number,
                    'employee_name': next_entry.employee_name,
                },
            })
        elif not next_entry:
            queue.status = ShootingQueue.QueueStatus.COMPLETED
            queue.completed_at = timezone.now()
            _broadcast_queue_event(str(queue.id), 'queue_completed', {
                'queue_id': str(queue.id),
            })

        queue.save()
        return next_entry

    @staticmethod
    @transaction.atomic
    def pause_queue(queue_id):
        queue = ShootingQueue.objects.get(id=queue_id)
        if queue.status != ShootingQueue.QueueStatus.ACTIVE:
            raise ValidationError('Only active queue can be paused')
        queue.status = ShootingQueue.QueueStatus.PAUSED
        queue.save()
        return queue

    @staticmethod
    @transaction.atomic
    def resume_queue(queue_id):
        queue = ShootingQueue.objects.get(id=queue_id)
        if queue.status != ShootingQueue.QueueStatus.PAUSED:
            raise ValidationError('Only paused queue can be resumed')
        queue.status = ShootingQueue.QueueStatus.ACTIVE
        queue.save()
        return queue

    @staticmethod
    def get_queue_state(queue_id):
        """Get full queue state for frontend rendering."""
        queue = ShootingQueue.objects.select_related('range', 'lane', 'instructor').get(id=queue_id)
        entries = queue.entries.select_related('employee').order_by('sequence_number')

        current = entries.filter(status__in=['CURRENT', 'SHOOTING']).first()
        waiting = entries.filter(status='WAITING')
        completed = entries.filter(status__in=['COMPLETED', 'SKIPPED'])

        return {
            'queue': queue,
            'current': current,
            'waiting': list(waiting),
            'completed': list(completed),
            'progress': {
                'total': queue.total_soldiers,
                'completed': queue.completed_count,
                'remaining': queue.remaining_count,
                'current_position': queue.current_position + 1 if current else queue.completed_count + 1,
            },
        }
