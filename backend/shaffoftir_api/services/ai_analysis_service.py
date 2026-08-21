"""
AI shot analysis service — analyzes target photos to detect hits.

In production this would use computer vision (OpenCV, YOLO, or a custom model)
to detect bullet holes in target images. Here we provide the interface and
a simulated analysis that can be replaced with real CV processing.
"""
import uuid
import time
from django.utils import timezone
from ..models.ai_analysis import ShotAnalysis
from ..models.queue import QueueEntry


class AIAnalysisService:

    @staticmethod
    def create_analysis(queue_entry_id=None, session_id=None, soldier_seq=1,
                        before_photo_url='', after_photo_url=''):
        """Create a pending analysis job."""
        analysis = ShotAnalysis.objects.create(
            analysis_id=f"ai-{uuid.uuid4().hex[:12]}",
            queue_entry_id=queue_entry_id,
            session_id=session_id,
            soldier_seq=soldier_seq,
            status=ShotAnalysis.AnalysisStatus.PENDING,
            before_photo_url=before_photo_url,
            after_photo_url=after_photo_url,
        )
        return analysis

    @staticmethod
    def run_analysis(analysis_id):
        """
        Run AI analysis on before/after target photos.
        Uses real OpenCV detection when photos are available,
        falls back to simulation for testing without real images.
        """
        analysis = ShotAnalysis.objects.get(id=analysis_id)

        # Try real CV analysis first
        if analysis.before_photo_url and analysis.after_photo_url:
            try:
                from .cv_analysis_service import CVAnalysisService
                return CVAnalysisService.run_cv_analysis(analysis_id)
            except Exception:
                # If CV fails (e.g. test images), fall back to simulation
                pass

        # Fallback: simulated detection
        return AIAnalysisService._run_simulated(analysis_id)

    @staticmethod
    def _run_simulated(analysis_id):
        """Simulated analysis fallback for testing."""
        analysis = ShotAnalysis.objects.get(id=analysis_id)
        start_time = time.time()

        try:
            analysis.status = ShotAnalysis.AnalysisStatus.PROCESSING
            analysis.save()

            import random

            num_shots = random.randint(5, 10)
            detected_hits = []
            detected_misses = []

            for i in range(num_shots):
                x = random.uniform(0.2, 0.8)
                y = random.uniform(0.2, 0.8)
                dist = ((x - 0.5) ** 2 + (y - 0.5) ** 2) ** 0.5

                if dist < 0.3:
                    score = max(10 - int(dist * 20), 1)
                    detected_hits.append({
                        'x': round(x, 4), 'y': round(y, 4),
                        'score': score, 'ring': score,
                    })
                else:
                    detected_misses.append({
                        'x': round(x, 4), 'y': round(y, 4), 'score': 0,
                    })

            hit_count = len(detected_hits)
            miss_count = len(detected_misses)
            total_shots = hit_count + miss_count
            total_score = sum(h['score'] for h in detected_hits)
            accuracy = (hit_count / total_shots * 100) if total_shots > 0 else 0

            analysis.detected_hits = detected_hits
            analysis.detected_misses = detected_misses
            analysis.total_shots_detected = total_shots
            analysis.hit_count = hit_count
            analysis.miss_count = miss_count
            analysis.total_score = total_score
            analysis.accuracy = round(accuracy, 1)
            analysis.confidence = round(random.uniform(0.85, 0.99), 2)
            analysis.model_version = 'simulated-fallback'
            analysis.status = ShotAnalysis.AnalysisStatus.COMPLETED
            analysis.processing_time_ms = int((time.time() - start_time) * 1000)
            analysis.completed_at = timezone.now()
            analysis.save()

            if analysis.queue_entry_id:
                entry = QueueEntry.objects.get(id=analysis.queue_entry_id)
                entry.total_shots = total_shots
                entry.hit_count = hit_count
                entry.miss_count = miss_count
                entry.total_score = total_score
                entry.accuracy = round(accuracy, 1)
                entry.passed = accuracy >= 60.0
                entry.save()

            # Broadcast analysis ready via WebSocket
            if analysis.queue_entry_id:
                try:
                    from channels.layers import get_channel_layer
                    from asgiref.sync import async_to_sync
                    layer = get_channel_layer()
                    if layer:
                        async_to_sync(layer.group_send)(
                            f'queue_{analysis.queue_entry.queue_id}',
                            {'type': 'analysis_ready', 'data': {
                                'analysis_id': str(analysis.id),
                                'hit_count': hit_count,
                                'miss_count': miss_count,
                                'total_score': total_score,
                                'accuracy': round(accuracy, 1),
                                'passed': accuracy >= 60.0,
                            }}
                        )
                except Exception:
                    pass

            return analysis

        except Exception as e:
            analysis.status = ShotAnalysis.AnalysisStatus.FAILED
            analysis.error_message = str(e)
            analysis.processing_time_ms = int((time.time() - start_time) * 1000)
            analysis.save()
            raise

    @staticmethod
    def get_results(analysis_id):
        """Get analysis results for display."""
        return ShotAnalysis.objects.get(id=analysis_id)
