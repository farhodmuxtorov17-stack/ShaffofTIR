from django.urls import path
from ..views.training import TrainingPlanListView, TrainingPlanDetailView, TrainingAssignmentListView, TrainingAssignmentDetailView

urlpatterns = [
    path('plans/', TrainingPlanListView.as_view()),
    path('plans/<uuid:pk>/', TrainingPlanDetailView.as_view()),
    path('assignments/', TrainingAssignmentListView.as_view()),
    path('assignments/<uuid:pk>/', TrainingAssignmentDetailView.as_view()),
]
