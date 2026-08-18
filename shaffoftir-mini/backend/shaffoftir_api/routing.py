"""
WebSocket URL routing for real-time features.
"""
from django.urls import re_path
from .consumers import QueueConsumer

websocket_urlpatterns = [
    re_path(r'ws/queue/(?P<queue_id>[0-9a-f-]+)/$', QueueConsumer.as_asgi()),
]
