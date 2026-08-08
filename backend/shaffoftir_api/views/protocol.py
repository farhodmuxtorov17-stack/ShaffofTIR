from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from shaffoftir_api.models import Protocol, OperatorComment, ReviewReason
from shaffoftir_api.serializers import (
    ProtocolSerializer, OperatorCommentSerializer, ReviewReasonSerializer
)


class ProtocolViewSet(viewsets.ModelViewSet):
    queryset = Protocol.objects.select_related('session', 'soldier').all()
    serializer_class = ProtocolSerializer
    filterset_fields = ['status', 'session', 'passed']
    search_fields = ['employee_name', 'instructor_name', 'department']
    ordering_fields = ['created_at', 'total_score']

    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        """Подписание протокола (QR-код)"""
        protocol = self.get_object()
        protocol.status = 'SIGNED'
        protocol.signed_at = protocol.signed_at or timezone.now()
        protocol.save()
        return Response(ProtocolSerializer(protocol).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Утверждение протокола"""
        protocol = self.get_object()
        protocol.status = 'APPROVED'
        protocol.save()
        return Response(ProtocolSerializer(protocol).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Отклонение протокола с указанием причины"""
        protocol = self.get_object()
        reason = request.data.get('reason', '')
        protocol.status = 'REJECTED'
        protocol.notes = f"Отклонено: {reason}"
        protocol.save()
        ReviewReason.objects.create(
            protocol=protocol,
            reviewer=request.user.username if hasattr(request, 'user') else 'system',
            reason=reason
        )
        return Response(ProtocolSerializer(protocol).data)


class OperatorCommentViewSet(viewsets.ModelViewSet):
    queryset = OperatorComment.objects.all()
    serializer_class = OperatorCommentSerializer
    filterset_fields = ['session', 'soldier_seq', 'author']
    ordering_fields = ['created_at']


class ReviewReasonViewSet(viewsets.ModelViewSet):
    queryset = ReviewReason.objects.all()
    serializer_class = ReviewReasonSerializer
    filterset_fields = ['session', 'reviewer']
    ordering_fields = ['created_at']
