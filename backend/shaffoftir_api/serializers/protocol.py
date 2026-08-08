from rest_framework import serializers
from shaffoftir_api.models import Protocol, OperatorComment, ReviewReason


class ProtocolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Protocol
        fields = '__all__'


class OperatorCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatorComment
        fields = '__all__'


class ReviewReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReason
        fields = '__all__'
