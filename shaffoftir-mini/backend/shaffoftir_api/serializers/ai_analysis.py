from rest_framework import serializers
from ..models.ai_analysis import ShotAnalysis


class ShotAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShotAnalysis
        fields = [
            'id', 'analysis_id', 'queue_entry', 'session', 'soldier_seq',
            'status', 'before_photo_url', 'after_photo_url', 'annotated_photo_url',
            'detected_hits', 'detected_misses',
            'total_shots_detected', 'hit_count', 'miss_count',
            'total_score', 'accuracy', 'confidence',
            'model_version', 'processing_time_ms', 'error_message',
            'created_at', 'completed_at',
        ]
        read_only_fields = [
            'id', 'analysis_id', 'status', 'detected_hits', 'detected_misses',
            'total_shots_detected', 'hit_count', 'miss_count', 'total_score',
            'accuracy', 'confidence', 'processing_time_ms', 'error_message',
            'created_at', 'completed_at',
        ]
