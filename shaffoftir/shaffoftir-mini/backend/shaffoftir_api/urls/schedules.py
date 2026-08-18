from django.urls import path
from ..views.schedule import RangeScheduleListView, RangeScheduleDetailView

urlpatterns = [
    path('', RangeScheduleListView.as_view()),
    path('<uuid:pk>/', RangeScheduleDetailView.as_view()),
]
