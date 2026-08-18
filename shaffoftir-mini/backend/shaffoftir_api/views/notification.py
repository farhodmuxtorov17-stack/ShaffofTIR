"""Notification views."""
from rest_framework import viewsets
from ..models.notification import AppNotification
from ..serializers.notification import AppNotificationSerializer
from ..permissions import IsAuthenticated


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = AppNotification.objects.all()
    serializer_class = AppNotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["is_read", "notification_type", "user_id"]
    ordering_fields = ["created_at"]
