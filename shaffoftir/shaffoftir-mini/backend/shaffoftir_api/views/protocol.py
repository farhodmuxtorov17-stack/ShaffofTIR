from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from ..models.protocol import Protocol
from ..serializers.protocol import ProtocolSerializer

PROTOCOL_STATUS = [
    ('DRAFT', 'Черновик'),
    ('PENDING_REVIEW', 'На рассмотрении'),
    ('SIGNED', 'Подписан'),
    ('APPROVED', 'Утверждён'),
    ('REJECTED', 'Отклонён'),
    ('ARCHIVED', 'Архив'),
]

class ProtocolListView(generics.ListCreateAPIView):
    queryset = Protocol.objects.all()
    serializer_class = ProtocolSerializer
    filterset_fields = ['status', 'employee_id', 'session_id_str']
    search_fields = ['employee_name', 'protocol_number', 'weapon_name']
    ordering_fields = ['-created_at', '-total_score']

class ProtocolDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Protocol.objects.all()
    serializer_class = ProtocolSerializer

class SignProtocolView(APIView):
    """POST /api/protocols/{id}/sign/ — sign a protocol"""
    def post(self, request, pk):
        try:
            protocol = Protocol.objects.get(pk=pk)
        except Protocol.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        
        if protocol.status != 'DRAFT':
            return Response({'error': 'Cannot sign: must be in DRAFT status'}, status=400)
        
        protocol.status = 'SIGNED'
        protocol.signed_at = timezone.now()
        protocol.save()
        return Response(ProtocolSerializer(protocol).data)

class ApproveProtocolView(APIView):
    """POST /api/protocols/{id}/approve/ — approve a signed protocol"""
    def post(self, request, pk):
        try:
            protocol = Protocol.objects.get(pk=pk)
        except Protocol.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        
        if protocol.status != 'SIGNED':
            return Response({'error': 'Cannot approve: must be SIGNED'}, status=400)
        
        protocol.status = 'APPROVED'
        protocol.save()
        return Response(ProtocolSerializer(protocol).data)

class ArchiveProtocolView(APIView):
    """POST /api/protocols/{id}/archive/ — archive an approved protocol"""
    def post(self, request, pk):
        try:
            protocol = Protocol.objects.get(pk=pk)
        except Protocol.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        
        if protocol.status != 'APPROVED':
            return Response({'error': 'Cannot archive: must be APPROVED'}, status=400)
        
        protocol.status = 'ARCHIVED'
        protocol.save()
        return Response(ProtocolSerializer(protocol).data)
