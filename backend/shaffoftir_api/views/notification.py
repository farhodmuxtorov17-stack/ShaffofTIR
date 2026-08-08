from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from shaffoftir_api.models import (
    Notification, AuditAnnotation, SavedFilter, UIPreference
)
from shaffoftir_api.serializers import (
    NotificationSerializer, AuditAnnotationSerializer,
    SavedFilterSerializer, UIPreferenceSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filterset_fields = ['type', 'is_read', 'user_id']
    ordering_fields = ['created_at']

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'ok'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response(NotificationSerializer(notif).data)


class AuditAnnotationViewSet(viewsets.ModelViewSet):
    queryset = AuditAnnotation.objects.all()
    serializer_class = AuditAnnotationSerializer
    filterset_fields = ['session', 'soldier_seq', 'actor']
    ordering_fields = ['created_at']


class SavedFilterViewSet(viewsets.ModelViewSet):
    queryset = SavedFilter.objects.all()
    serializer_class = SavedFilterSerializer
    filterset_fields = ['user_id']


class UIPreferenceViewSet(viewsets.ModelViewSet):
    queryset = UIPreference.objects.all()
    serializer_class = UIPreferenceSerializer
    filterset_fields = ['user_id']
