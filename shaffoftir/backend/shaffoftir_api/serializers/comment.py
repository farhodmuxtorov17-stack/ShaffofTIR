from rest_framework import serializers
from ..models.comment import OperatorComment, ReviewReason

class OperatorCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatorComment
        fields = '__all__'

class ReviewReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReason
        fields = '__all__'
