from django.urls import path
from ..views.session import (
    ShootingSessionListView, ShootingSessionDetailView,
    SoldierListView, SoldierDetailView,
    ShotListView, ShotDetailView,
    StartSessionView, ProcessTurnView,
)

urlpatterns = [
    path('', ShootingSessionListView.as_view()),
    path('<uuid:pk>/', ShootingSessionDetailView.as_view()),
    path('start/', StartSessionView.as_view()),
    path('process-turn/', ProcessTurnView.as_view()),
    path('soldiers/', SoldierListView.as_view()),
    path('soldiers/<uuid:pk>/', SoldierDetailView.as_view()),
    path('shots/', ShotListView.as_view()),
    path('shots/<uuid:pk>/', ShotDetailView.as_view()),
]
