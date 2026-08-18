"""Comment serializers."""
from rest_framework import serializers
from ..models.comment import OperatorComment, ReviewReason


class OperatorCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatorComment
        fields = "__all__"
        read_only_fields = ("id", "created_at")


class ReviewReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReason
        fields = "__all__"
        read_only_fields = ("id", "created_at")
