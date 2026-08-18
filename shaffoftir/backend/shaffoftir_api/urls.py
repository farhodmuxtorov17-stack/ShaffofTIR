"""
URL routing for ShaffofTIR API v1.
"""
from rest_framework.routers import DefaultRouter
from django.urls import path, include

from shaffoftir_api.views import (
    UserViewSet, LoginView, MeView,
    EmployeeViewSet, DepartmentViewSet,
    WeaponViewSet, WeaponAssignmentViewSet,
    SessionViewSet, ShootingLaneViewSet, CameraViewSet,
    RangeScheduleViewSet, CameraHealthView,
    TrainingPlanViewSet, TrainingAssignmentViewSet,
    ProtocolViewSet, OperatorCommentViewSet, ReviewReasonViewSet,
    NotificationViewSet, AuditAnnotationViewSet,
    SavedFilterViewSet, UIPreferenceViewSet,
    AnalyticsSummaryView, ExportReportView, PerformanceTrendsView,
)

router = DefaultRouter()

# Auth
router.register(r'users', UserViewSet, basename='user')

# HR
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')

# Weapons
router.register(r'weapons', WeaponViewSet, basename='weapon')
router.register(r'weapon-assignments', WeaponAssignmentViewSet, basename='weapon-assignment')

# Shooting
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'lanes', ShootingLaneViewSet, basename='lane')
router.register(r'cameras', CameraViewSet, basename='camera')
router.register(r'range-schedules', RangeScheduleViewSet, basename='range-schedule')

# Training
router.register(r'training-plans', TrainingPlanViewSet, basename='training-plan')
router.register(r'training-assignments', TrainingAssignmentViewSet, basename='training-assignment')

# Protocols
router.register(r'protocols', ProtocolViewSet, basename='protocol')
router.register(r'operator-comments', OperatorCommentViewSet, basename='operator-comment')
router.register(r'review-reasons', ReviewReasonViewSet, basename='review-reason')

# System
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'audit-annotations', AuditAnnotationViewSet, basename='audit-annotation')
router.register(r'saved-filters', SavedFilterViewSet, basename='saved-filter')
router.register(r'ui-preferences', UIPreferenceViewSet, basename='ui-preference')

urlpatterns = [
    # Auth
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', MeView.as_view(), name='me'),
    # Camera health
    path('cameras/health/', CameraHealthView.as_view(), name='camera-health'),
    # Analytics
    path('analytics/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    path('reports/export/', ExportReportView.as_view(), name='export-report'),
    path('analytics/trends/', PerformanceTrendsView.as_view(), name='analytics-trends'),
    # Router
    path('', include(router.urls)),
]
