from django.urls import path
from ..views.session_flow import (
    SessionFlowListView, SessionFlowDetailView,
    AssignToLaneView, SelectWeaponView, StartShootingView, CompleteFlowView,
)

urlpatterns = [
    path('', SessionFlowListView.as_view()),
    path('<uuid:pk>/', SessionFlowDetailView.as_view()),
    path('assign-to-lane/', AssignToLaneView.as_view()),
    path('select-weapon/', SelectWeaponView.as_view()),
    path('start-shooting/', StartShootingView.as_view()),
    path('complete/', CompleteFlowView.as_view()),
]
