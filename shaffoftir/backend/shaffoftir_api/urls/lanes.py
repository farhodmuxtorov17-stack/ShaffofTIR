from django.urls import path
from ..views.range import ShootingLaneListView, ShootingLaneDetailView

urlpatterns = [
    path('', ShootingLaneListView.as_view()),
    path('<uuid:pk>/', ShootingLaneDetailView.as_view()),
]
