from django.urls import path
from ..views.hr import HRDepartmentListView, HRDepartmentDetailView

urlpatterns = [
    path('', HRDepartmentListView.as_view()),
    path('<uuid:pk>/', HRDepartmentDetailView.as_view()),
]
