from django.urls import path
from ..views.hr import HREmployeeListView, HREmployeeDetailView

urlpatterns = [
    path('', HREmployeeListView.as_view()),
    path('<uuid:pk>/', HREmployeeDetailView.as_view()),
    path('by-department/<str:dept>/', HREmployeeListView.as_view()),
]
