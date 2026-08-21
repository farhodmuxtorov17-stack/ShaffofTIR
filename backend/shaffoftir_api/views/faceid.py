"""
FaceID ViewSet — face registration, identification, and batch check-in.
"""
import rest_framework.viewsets as viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from ..permissions import IsInstructor
from ..models.faceid import FaceRegistration, FaceCheckIn
from ..serializers.faceid import (
    FaceRegistrationSerializer,
    FaceCheckInSerializer,
    FaceCheckInEntrySerializer,
)
from ..services.faceid_service import FaceIDService


@extend_schema(tags=['FaceID'])
class FaceRegistrationViewSet(viewsets.ModelViewSet):
    queryset = FaceRegistration.objects.select_related('employee').all()
    serializer_class = FaceRegistrationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['employee', 'is_active']
    ordering_fields = ['created_at']

    @action(detail=False, methods=['post'])
    def identify(self, request):
        """Identify a face from a captured encoding."""
        face_encoding = request.data.get('face_encoding', '')
        if not face_encoding:
            return Response({'error': {'code': 'MISSING_ENCODING', 'message': 'face_encoding is required'}}, status=400)

        employee, confidence = FaceIDService.identify_face(face_encoding)
        if employee:
            return Response({
                'identified': True,
                'employee_id': str(employee.id),
                'employee_name': employee.full_name,
                'confidence': round(confidence, 3),
            })
        return Response({'identified': False, 'message': 'No match found'}, status=404)


@extend_schema(tags=['FaceID'])
class FaceCheckInViewSet(viewsets.ModelViewSet):
    queryset = FaceCheckIn.objects.select_related('instructor', 'range').prefetch_related('entries').all()
    serializer_class = FaceCheckInSerializer
    permission_classes = [IsAuthenticated, IsInstructor]
    ordering_fields = ['-created_at']

    @action(detail=False, methods=['post'])
    def create_group(self, request):
        """Create a FaceID check-in event for a group.
        Body: { range_id, employee_ids: [], manual_names: [] }
        """
        check_in = FaceIDService.create_check_in(
            instructor_id=request.user.id,
            range_id=request.data.get('range_id'),
            employee_ids=request.data.get('employee_ids', []),
            manual_names=request.data.get('manual_names', []),
        )
        return Response(FaceCheckInSerializer(check_in).get(check_in), status=201)
