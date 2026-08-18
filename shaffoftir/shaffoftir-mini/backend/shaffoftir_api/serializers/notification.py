from rest_framework import serializers
from ..models.notification import AppNotification

class AppNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppNotification
        fields = '__all__'
