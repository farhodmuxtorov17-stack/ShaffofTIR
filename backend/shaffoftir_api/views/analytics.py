"""
Analytics views — aggregated metrics for dashboards.

Provides:
- GET /analytics/summary/ — overall system metrics
- GET /analytics/trends/ — performance trends over time
- GET /reports/export/ — export report data
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count, Sum, Q
from drf_spectacular.utils import extend_schema

from ..models.session import ShootingSession
from ..models.employee import Employee
from ..models.weapon import Weapon
from ..models.protocol import Protocol
from ..permissions import IsAuthenticated
import csv
import io


class AnalyticsSummaryView(APIView):
    """Aggregated system-wide metrics for dashboard widgets."""

    permission_classes = [IsAuthenticated]

    @extend_schema(description="Returns aggregated metrics across the entire system")
    def get(self, request):
        sessions = ShootingSession.objects.all()
        employees = Employee.objects.all()
        weapons = Weapon.objects.all()

        total_shots = sessions.aggregate(t=Sum("total_shots"))["t"] or 0
        total_hits = sessions.aggregate(h=Sum("hit_count"))["h"] or 0

        avg_accuracy = (
            round(total_hits / total_shots * 100, 1) if total_shots > 0 else 0
        )

        return Response({
            "total_sessions": sessions.count(),
            "total_shots": total_shots,
            "avg_accuracy": avg_accuracy,
            "total_employees_trained": employees.filter(shooting_qualified=True).count(),
            "total_weapons": weapons.count(),
            "weapons_available": weapons.filter(status="AVAILABLE").count(),
            "protocols_approved": Protocol.objects.filter(status="APPROVED").count(),
            "pass_rate": round(
                sessions.filter(passed=True).count() / max(sessions.count(), 1) * 100, 1
            ),
        })


class PerformanceTrendsView(APIView):
    """Performance trends over time (monthly breakdown)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models.functions import TruncMonth

        trends = (
            ShootingSession.objects
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(
                session_count=Count("id"),
                avg_score=Avg("total_score"),
                avg_accuracy=Avg("accuracy"),
                pass_rate=Avg("passed", output_field=Sum("passed")),
            )
            .order_by("month")
        )

        return Response([
            {
                "month": t["month"].isoformat() if t["month"] else None,
                "sessions": t["session_count"],
                "avg_score": round(t["avg_score"] or 0, 1),
                "avg_accuracy": round(t["avg_accuracy"] or 0, 1),
                "pass_rate": round(t["pass_rate"] or 0, 1),
            }
            for t in trends
        ])


class ExportReportView(APIView):
    """Export session results as CSV."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ShootingSession.objects.all().order_by("-created_at")

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Session ID", "Employee", "Department", "Weapon",
            "Shots", "Hits", "Misses", "Score", "Accuracy", "Passed", "Date",
        ])

        for s in sessions:
            writer.writerow([
                s.session_id, s.employee_name, s.employee_department,
                s.weapon_name, s.total_shots, s.hit_count, s.miss_count,
                s.total_score, s.accuracy, s.passed, s.created_at.isoformat(),
            ])

        from django.http import HttpResponse
        response = HttpResponse(output.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="shaffoftir_report.csv"'
        return response
