from django.urls import path
from ..views.tb_test import (
    TBSafetyTestListView, TBSafetyTestDetailView,
    TBSafetyResultListView, TBSafetyResultDetailView,
    SubmitTBTestView,
)

urlpatterns = [
    path('', TBSafetyTestListView.as_view()),
    path('<uuid:pk>/', TBSafetyTestDetailView.as_view()),
    path('results/', TBSafetyResultListView.as_view()),
    path('results/<uuid:pk>/', TBSafetyResultDetailView.as_view()),
    path('submit/', SubmitTBTestView.as_view()),
]
