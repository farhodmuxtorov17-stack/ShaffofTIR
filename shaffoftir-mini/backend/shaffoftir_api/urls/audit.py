from django.urls import path
from ..views.audit import AuditLogListView, AuditLogDetailView

urlpatterns = [
    path('', AuditLogListView.as_view()),
    path('<uuid:pk>/', AuditLogDetailView.as_view()),
]
