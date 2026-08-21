from rest_framework import serializers
from ..models.queue import ShootingQueue, QueueEntry


class QueueEntrySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(read_only=False, required=False, allow_blank=True)

    class Meta:
        model = QueueEntry
        fields = [
            'id', 'queue', 'employee', 'employee_name', 'employee_rank',
            'employee_department', 'sequence_number', 'status',
            'pre_shoot_photo', 'post_shoot_photo',
            'started_at', 'completed_at',
            'total_shots', 'hit_count', 'miss_count',
            'total_score', 'accuracy', 'passed',
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']


class ShootingQueueSerializer(serializers.ModelSerializer):
    entries = QueueEntrySerializer(many=True, read_only=True)
    instructor_name = serializers.CharField(source='instructor.full_name', read_only=True)
    range_name = serializers.CharField(source='range.name', read_only=True)
    lane_name = serializers.CharField(source='lane.name', read_only=True)
    remaining_count = serializers.IntegerField(read_only=True)
    is_last = serializers.BooleanField(read_only=True)

    class Meta:
        model = ShootingQueue
        fields = [
            'id', 'queue_id', 'check_in', 'session', 'instructor', 'instructor_name',
            'range', 'range_name', 'lane', 'lane_name',
            'status', 'total_soldiers', 'current_position', 'completed_count',
            'auto_advance', 'remaining_count', 'is_last', 'entries',
            'created_at', 'activated_at', 'completed_at',
        ]
        read_only_fields = [
            'id', 'queue_id', 'current_position', 'completed_count',
            'remaining_count', 'is_last', 'created_at', 'activated_at', 'completed_at',
        ]
