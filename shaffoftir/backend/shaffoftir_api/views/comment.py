from rest_framework import generics
from ..models.comment import OperatorComment, ReviewReason
from ..serializers.comment import OperatorCommentSerializer, ReviewReasonSerializer

class OperatorCommentListView(generics.ListCreateAPIView):
    queryset = OperatorComment.objects.all()
    serializer_class = OperatorCommentSerializer
    filterset_fields = ['session_id', 'soldier_seq']

class OperatorCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OperatorComment.objects.all()
    serializer_class = OperatorCommentSerializer

class ReviewReasonListView(generics.ListCreateAPIView):
    queryset = ReviewReason.objects.all()
    serializer_class = ReviewReasonSerializer
    filterset_fields = ['session_id', 'soldier_seq']

class ReviewReasonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ReviewReason.objects.all()
    serializer_class = ReviewReasonSerializer
