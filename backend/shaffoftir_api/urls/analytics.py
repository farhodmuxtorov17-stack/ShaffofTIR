from django.urls import path
from ..views.analytics import AnalyticsSummaryView, AnalyticsPerformanceTrendView, AnalyticsWeaponUsageView

urlpatterns = [
    path('summary/', AnalyticsSummaryView.as_view()),
    path('performance-trend/', AnalyticsPerformanceTrendView.as_view()),
    path('weapon-usage/', AnalyticsWeaponUsageView.as_view()),
]
