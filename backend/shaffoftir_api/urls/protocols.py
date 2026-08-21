from django.urls import path
from ..views.protocol import (
    ProtocolListView, ProtocolDetailView,
    SignProtocolView, ApproveProtocolView, ArchiveProtocolView,
)

urlpatterns = [
    path('', ProtocolListView.as_view()),
    path('<uuid:pk>/', ProtocolDetailView.as_view()),
    path('<uuid:pk>/sign/', SignProtocolView.as_view()),
    path('<uuid:pk>/approve/', ApproveProtocolView.as_view()),
    path('<uuid:pk>/archive/', ArchiveProtocolView.as_view()),
]
