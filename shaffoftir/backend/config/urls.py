from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from shaffoftir_api.views.auth import LoginView, MeView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='me'),
    path('api/users/', include('shaffoftir_api.urls.users')),
    path('api/employees/', include('shaffoftir_api.urls.employees')),
    path('api/departments/', include('shaffoftir_api.urls.departments')),
    path('api/weapons/', include('shaffoftir_api.urls.weapons')),
    path('api/ranges/', include('shaffoftir_api.urls.ranges')),
    path('api/lanes/', include('shaffoftir_api.urls.lanes')),
    path('api/sessions/', include('shaffoftir_api.urls.sessions')),
    path('api/session-flows/', include('shaffoftir_api.urls.session_flows')),
    path('api/training/', include('shaffoftir_api.urls.training')),
    path('api/tb-tests/', include('shaffoftir_api.urls.tb_tests')),
    path('api/protocols/', include('shaffoftir_api.urls.protocols')),
    path('api/cameras/', include('shaffoftir_api.urls.cameras')),
    path('api/schedules/', include('shaffoftir_api.urls.schedules')),
    path('api/notifications/', include('shaffoftir_api.urls.notifications')),
    path('api/analytics/', include('shaffoftir_api.urls.analytics')),
    path('api/audit/', include('shaffoftir_api.urls.audit')),
]
