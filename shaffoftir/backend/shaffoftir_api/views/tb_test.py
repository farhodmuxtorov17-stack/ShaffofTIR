from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models.tb_test import TBSafetyTest, TBSafetyTestResult
from ..serializers.tb_test import TBSafetyTestSerializer, TBSafetyTestResultSerializer

class TBSafetyTestListView(generics.ListCreateAPIView):
    queryset = TBSafetyTest.objects.all()
    serializer_class = TBSafetyTestSerializer

class TBSafetyTestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TBSafetyTest.objects.all()
    serializer_class = TBSafetyTestSerializer

class TBSafetyResultListView(generics.ListCreateAPIView):
    queryset = TBSafetyTestResult.objects.all()
    serializer_class = TBSafetyTestResultSerializer
    filterset_fields = ['employee_id', 'passed']

class TBSafetyResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TBSafetyTestResult.objects.all()
    serializer_class = TBSafetyTestResultSerializer

class SubmitTBTestView(APIView):
    """POST /api/tb-tests/submit/ — submit TB safety test answers"""
    def post(self, request):
        test_id = request.data.get('test_id')
        employee_id = request.data.get('employee_id')
        employee_name = request.data.get('employee_name')
        answers = request.data.get('answers', [])
        
        try:
            test = TBSafetyTest.objects.get(id=test_id)
        except TBSafetyTest.DoesNotExist:
            return Response({'error': 'Test not found'}, status=404)
        
        # Calculate score
        correct = 0
        total = len(test.questions)
        answer_details = []
        for ans in answers:
            q_id = ans.get('question_id')
            selected = ans.get('selected_index')
            for q in test.questions:
                if q.get('id') == q_id:
                    is_correct = q.get('correct_index') == selected
                    if is_correct:
                        correct += 1
                    answer_details.append({
                        'question_id': q_id,
                        'selected_index': selected,
                        'correct': is_correct,
                    })
        
        score = round(correct / total * 100) if total > 0 else 0
        passed = score >= test.passing_score
        
        result = TBSafetyTestResult.objects.create(
            employee_id=employee_id,
            employee_name=employee_name,
            test=test,
            score=score,
            passed=passed,
            answers=answer_details,
        )
        
        return Response(TBSafetyTestResultSerializer(result).data, status=201)
