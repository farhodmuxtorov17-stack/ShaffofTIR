from django.urls import path
from ..views.range import ShootingRangeListView, ShootingRangeDetailView, RangeRubegListView, RangeRubegDetailView

urlpatterns = [
    path('', ShootingRangeListView.as_view()),
    path('<uuid:pk>/', ShootingRangeDetailView.as_view()),
    path('rubegs/', RangeRubegListView.as_view()),
    path('rubegs/<uuid:pk>/', RangeRubegDetailView.as_view()),
]
