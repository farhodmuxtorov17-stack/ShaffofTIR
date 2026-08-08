"""Analytics - summary, trends, top performers"""
from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.misc import AnalyticsSummary, PerformanceTrend

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary():
    return AnalyticsSummary(
        total_sessions=147,
        total_shots=1850,
        avg_accuracy=76.5,
        avg_score=72.3,
        top_scorer={"name": "Тошматов Фирдавс Шерзодович", "score": 9800},
        improvement_rate=12.5,
        total_employees_trained=24,
        total_rounds_fired=1850,
        pass_rate=78.0,
    )


@router.get("/trends", response_model=List[PerformanceTrend])
async def get_trends(days: int = Query(30, le=365)):
    base = [
        PerformanceTrend(date="2026-07-01", avg_score=68.5, accuracy=65.2, session_count=5),
        PerformanceTrend(date="2026-07-05", avg_score=71.0, accuracy=68.0, session_count=8),
        PerformanceTrend(date="2026-07-10", avg_score=73.5, accuracy=72.1, session_count=6),
        PerformanceTrend(date="2026-07-15", avg_score=72.0, accuracy=70.5, session_count=10),
        PerformanceTrend(date="2026-07-20", avg_score=75.8, accuracy=74.3, session_count=7),
        PerformanceTrend(date="2026-07-24", avg_score=76.5, accuracy=76.5, session_count=4),
    ]
    return base[:days // 5 + 1] if days <= 30 else base
