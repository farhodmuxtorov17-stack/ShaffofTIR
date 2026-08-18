from django.urls import path
from ..views.weapon import WeaponListView, WeaponDetailView, WeaponAssignmentListView, WeaponAssignmentDetailView, AssignWeaponToLaneView

urlpatterns = [
    path('', WeaponListView.as_view()),
    path('<uuid:pk>/', WeaponDetailView.as_view()),
    path('assignments/', WeaponAssignmentListView.as_view()),
    path('assignments/<uuid:pk>/', WeaponAssignmentDetailView.as_view()),
    path('assign-to-lane/', AssignWeaponToLaneView.as_view()),
]
