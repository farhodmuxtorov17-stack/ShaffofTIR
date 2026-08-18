from django.urls import path
from ..views.auth import UserListView, UserDetailView

urlpatterns = [
    path('', UserListView.as_view()),
    path('<uuid:pk>/', UserDetailView.as_view()),
]
