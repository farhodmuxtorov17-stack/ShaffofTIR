from rest_framework import serializers
from shaffoftir_api.models import (
    Notification, AuditAnnotation, SavedFilter, UIPreference
)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class AuditAnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditAnnotation
        fields = '__all__'


class SavedFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedFilter
        fields = '__all__'


class UIPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UIPreference
        fields = '__all__'
