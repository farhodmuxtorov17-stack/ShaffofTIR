"""
AI Analysis ViewSet — shot analysis from target photos.
"""
import rest_framework.viewsets as viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from ..permissions import IsInstructor
from ..models.ai_analysis import ShotAnalysis
from ..serializers.ai_analysis import ShotAnalysisSerializer
from ..services.ai_analysis_service import AIAnalysisService


@extend_schema(tags=['AI Analysis'])
class ShotAnalysisViewSet(viewsets.ModelViewSet):
    queryset = ShotAnalysis.objects.select_related('queue_entry', 'session').all()
    serializer_class = ShotAnalysisSerializer
    permission_classes = [IsAuthenticated, IsInstructor]
    filterset_fields = ['status', 'session', 'queue_entry']
    ordering_fields = ['-created_at']

    @action(detail=False, methods=['post'])
    def create_and_run(self, request):
        """Create analysis and run it immediately.
        Body: { queue_entry_id?, session_id?, soldier_seq?, before_photo_url, after_photo_url }
        """
        analysis = AIAnalysisService.create_analysis(
            queue_entry_id=request.data.get('queue_entry_id'),
            session_id=request.data.get('session_id'),
            soldier_seq=request.data.get('soldier_seq', 1),
            before_photo_url=request.data.get('before_photo_url', ''),
            after_photo_url=request.data.get('after_photo_url', ''),
        )
        result = AIAnalysisService.run_analysis(analysis.id)
        return Response(ShotAnalysisSerializer(result).data, status=201)

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """Run a pending analysis."""
        result = AIAnalysisService.run_analysis(pk)
        return Response(ShotAnalysisSerializer(result).data)
