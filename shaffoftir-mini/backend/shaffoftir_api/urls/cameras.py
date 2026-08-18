from django.urls import path
from ..views.camera import LaneCameraListView, LaneCameraDetailView, CameraHealthCheckView

urlpatterns = [
    path('', LaneCameraListView.as_view()),
    path('<uuid:pk>/', LaneCameraDetailView.as_view()),
    path('health/', CameraHealthCheckView.as_view()),
]
