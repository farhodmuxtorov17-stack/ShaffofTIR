from rest_framework import views
from rest_framework.response import Response
from django.db.models import Avg, Sum, Count, Q
from ..models.session import ShootingSession
from ..models.weapon import Weapon
from ..models.hr import HREmployee
from ..models.training import TrainingAssignment

class AnalyticsSummaryView(views.APIView):
    """GET /api/analytics/summary/ — aggregated analytics"""
    def get(self, request):
        sessions = ShootingSession.objects.all()
        total_sessions = sessions.count()
        total_shots = sessions.aggregate(total=Sum('total_shots'))['total'] or 0
        avg_accuracy = sessions.aggregate(avg=Avg('accuracy'))['avg'] or 0
        avg_score = sessions.aggregate(avg=Avg('total_score'))['avg'] or 0
        pass_rate = sessions.filter(passed=True).count() / total_sessions * 100 if total_sessions > 0 else 0
        total_rounds = sessions.aggregate(total=Sum('hit_count'))['total'] or 0
        
        top_scorer = sessions.order_by('-total_score').first()
        top = None
        if top_scorer:
            top = {'name': top_scorer.employee_name, 'score': top_scorer.total_score}
        
        return Response({
            'total_sessions': total_sessions,
            'total_shots': total_shots,
            'avg_accuracy': round(avg_accuracy, 1),
            'avg_score': round(avg_score, 1),
            'top_scorer': top,
            'improvement_rate': 0,
            'total_employees_trained': HREmployee.objects.filter(total_sessions__gt=0).count(),
            'total_rounds_fired': total_rounds,
            'pass_rate': round(pass_rate, 1),
        })

class AnalyticsPerformanceTrendView(views.APIView):
    """GET /api/analytics/performance-trend/ — performance trend over time"""
    def get(self, request):
        from django.db.models.functions import TruncDate
        trend = ShootingSession.objects.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            avg_score=Avg('total_score'),
            accuracy=Avg('accuracy'),
            session_count=Count('id'),
        ).order_by('date')
        
        return Response(list(trend))

class AnalyticsWeaponUsageView(views.APIView):
    """GET /api/analytics/weapon-usage/ — weapon usage stats"""
    def get(self, request):
        from collections import Counter
        sessions = ShootingSession.objects.exclude(weapon_name__isnull=True).exclude(weapon_name='')
        usage = Counter(s.weapon_name for s in sessions)
        return Response([
            {'weapon_name': k, 'count': v} for k, v in usage.most_common(20)
        ])
