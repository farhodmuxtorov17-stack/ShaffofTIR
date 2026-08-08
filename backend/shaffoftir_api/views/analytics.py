"""
Analytics и экспорт отчётов.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Sum, Q

from shaffoftir_api.models import Session, Employee, Soldier, Shot


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_sessions = Session.objects.count()
        completed = Session.objects.filter(status='APPROVED').count()
        total_shots = Shot.objects.count()
        total_employees = Employee.objects.count()
        qualified = Employee.objects.filter(shooting_qualified=True).count()
        avg_acc = Session.objects.aggregate(a=Avg('accuracy'))['a'] or 0
        pass_rate = round(completed / max(total_sessions, 1) * 100) if total_sessions else 0

        # Топ стрелков
        top = (
            Session.objects.filter(status='APPROVED')
            .order_by('-score')[:5]
            .values('employee_name', 'score', 'accuracy')
        )

        # Сессии за неделю
        from datetime import timedelta
        from django.utils import timezone
        week_ago = timezone.now() - timedelta(days=7)
        week_sessions = Session.objects.filter(created_at__gte=week_ago)
        by_day = {}
        for s in week_sessions:
            key = s.created_at.strftime('%Y-%m-%d')
            by_day[key] = by_day.get(key, 0) + 1

        return Response({
            'total_sessions': total_sessions,
            'completed': completed,
            'total_shots': total_shots,
            'total_employees': total_employees,
            'qualified_employees': qualified,
            'avg_accuracy': round(avg_acc, 1),
            'pass_rate': pass_rate,
            'top_scorers': list(top),
            'week_sessions': by_day,
        })


class ExportReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Экспорт отчёта в Excel (openpyxl)"""
        from openpyxl import Workbook
        from io import BytesIO
        from django.http import HttpResponse

        wb = Workbook()
        ws = wb.active
        ws.title = 'Отчёт по сессиям'

        headers = ['ID', 'Сотрудник', 'Звание', 'Оружие', 'Статус', 'Балл',
                    'Точность %', 'Начало', 'Завершение']
        ws.append(headers)

        sessions = Session.objects.all().order_by('-created_at')
        for s in sessions:
            ws.append([
                str(s.id)[:8], s.employee_name, s.employee_rank,
                s.weapon_name, s.get_status_display(), s.score,
                s.accuracy, str(s.started_at or ''),
                str(s.completed_at or '')
            ])

        buf = BytesIO()
        wb.save(buf)
        buf.seek(0)

        resp = HttpResponse(
            buf.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        resp['Content-Disposition'] = 'attachment; filename="shaffoftir_report.xlsx"'
        return resp


class PerformanceTrendsView(APIView):
    """Динамика результативности по дням."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        from datetime import timedelta
        from django.utils import timezone
        start = timezone.now() - timedelta(days=days)
        sessions = Session.objects.filter(created_at__gte=start).order_by('created_at')
        by_day = {}
        for s in sessions:
            key = s.created_at.strftime('%Y-%m-%d')
            if key not in by_day:
                by_day[key] = {'date': key, 'avg_score': 0, 'accuracy': 0, 'session_count': 0, 'scores': [], 'accs': []}
            by_day[key]['scores'].append(s.score or 0)
            by_day[key]['accs'].append(s.accuracy or 0)
            by_day[key]['session_count'] += 1
        trends = []
        for key in sorted(by_day.keys()):
            d = by_day[key]
            n = max(d['session_count'], 1)
            trends.append({
                'date': d['date'],
                'avg_score': round(sum(d['scores']) / n, 1),
                'accuracy': round(sum(d['accs']) / n, 1),
                'session_count': d['session_count']
            })
        return Response(trends)
