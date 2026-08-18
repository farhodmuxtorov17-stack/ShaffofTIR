"""Operator comment and review reason views."""
from rest_framework import viewsets
from ..models.comment import OperatorComment, ReviewReason
from ..serializers.comment import OperatorCommentSerializer, ReviewReasonSerializer
from ..permissions import IsAuthenticated, IsInstructor


class OperatorCommentViewSet(viewsets.ModelViewSet):
    queryset = OperatorComment.objects.all()
    serializer_class = OperatorCommentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["session_id", "soldier_seq", "author"]
    ordering_fields = ["created_at"]


class ReviewReasonViewSet(viewsets.ModelViewSet):
    queryset = ReviewReason.objects.all()
    serializer_class = ReviewReasonSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["session_id", "soldier_seq", "reviewer"]
    ordering_fields = ["created_at"]
