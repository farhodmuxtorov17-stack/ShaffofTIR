from django.urls import path
from ..views.notification import AppNotificationListView, AppNotificationDetailView, MarkAllReadView

urlpatterns = [
    path('', AppNotificationListView.as_view()),
    path('<uuid:pk>/', AppNotificationDetailView.as_view()),
    path('mark-all-read/', MarkAllReadView.as_view()),
]
