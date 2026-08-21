from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from ..views import (
    LoginView, UserViewSet, MeView,
    EmployeeViewSet, WeaponViewSet,
    ShootingRangeViewSet, ShootingLaneViewSet, RangeRubegViewSet,
    CameraViewSet, SessionViewSet, ProtocolViewSet,
    TrainingPlanViewSet, TrainingAssignmentViewSet,
    TBSafetyTestViewSet, RangeScheduleViewSet,
    NotificationViewSet, AuditAnnotationViewSet,
    AnalyticsSummaryView, PerformanceTrendsView, ExportReportView,
    FaceRegistrationViewSet, FaceCheckInViewSet,
    ShootingQueueViewSet, QueueEntryViewSet,
    ShotAnalysisViewSet,
)

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('employees', EmployeeViewSet, basename='employee')
router.register('weapons', WeaponViewSet, basename='weapon')
router.register('ranges', ShootingRangeViewSet, basename='range')
router.register('lanes', ShootingLaneViewSet, basename='lane')
router.register('rubegs', RangeRubegViewSet, basename='rubeg')
router.register('cameras', CameraViewSet, basename='camera')
router.register('sessions', SessionViewSet, basename='session')
router.register('protocols', ProtocolViewSet, basename='protocol')
router.register('training-plans', TrainingPlanViewSet, basename='training-plan')
router.register('training-assignments', TrainingAssignmentViewSet, basename='training-assignment')
router.register('tb-tests', TBSafetyTestViewSet, basename='tb-test')
router.register('schedules', RangeScheduleViewSet, basename='schedule')
router.register('notifications', NotificationViewSet, basename='notification')
router.register('audit-logs', AuditAnnotationViewSet, basename='audit-log')

# FaceID + Queue + Analysis
router.register('face-registrations', FaceRegistrationViewSet, basename='face-registration')
router.register('face-checkins', FaceCheckInViewSet, basename='face-checkin')
router.register('queues', ShootingQueueViewSet, basename='queue')
router.register('queue-entries', QueueEntryViewSet, basename='queue-entry')
router.register('shot-analyses', ShotAnalysisViewSet, basename='shot-analysis')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('analytics/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    path('analytics/trends/', PerformanceTrendsView.as_view(), name='analytics-trends'),
    path('reports/export/', ExportReportView.as_view(), name='report-export'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('', include(router.urls)),
]
