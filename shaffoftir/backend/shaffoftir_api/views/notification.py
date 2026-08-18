from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models.notification import AppNotification
from ..serializers.notification import AppNotificationSerializer

class AppNotificationListView(generics.ListCreateAPIView):
    queryset = AppNotification.objects.all()
    serializer_class = AppNotificationSerializer
    filterset_fields = ['type', 'is_read', 'user_id']

class AppNotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AppNotification.objects.all()
    serializer_class = AppNotificationSerializer

class MarkAllReadView(APIView):
    """POST /api/notifications/mark-all-read/ — mark all notifications as read"""
    def post(self, request):
        AppNotification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'ok'})
