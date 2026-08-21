"""
WebSocket consumer for real-time queue updates.
Instructors subscribe to queue state changes and receive push notifications
when: soldier completes, next soldier is called, queue status changes.
"""
import json
import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async


class QueueConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket consumer for real-time shooting queue updates."""

    async def connect(self):
        self.queue_id = self.scope['url_route']['kwargs']['queue_id']
        self.group_name = f'queue_{self.queue_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({
            'type': 'connected',
            'queue_id': self.queue_id,
            'message': 'WebSocket connected for queue updates',
        })

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content):
        action = content.get('action')

        if action == 'get_state':
            state = await self._get_queue_state()
            await self.send_json({'type': 'state', 'data': state})

    async def queue_update(self, event):
        """Handler for queue_update events from group broadcast."""
        await self.send_json({
            'type': 'queue_update',
            'data': event['data'],
        })

    async def soldier_completed(self, event):
        """Handler for soldier completed events."""
        await self.send_json({
            'type': 'soldier_completed',
            'data': event['data'],
        })

    async def next_soldier(self, event):
        """Handler for next soldier called events."""
        await self.send_json({
            'type': 'next_soldier',
            'data': event['data'],
        })

    async def queue_completed(self, event):
        """Handler for queue completion events."""
        await self.send_json({
            'type': 'queue_completed',
            'data': event['data'],
        })

    async def analysis_ready(self, event):
        """Handler for AI analysis results."""
        await self.send_json({
            'type': 'analysis_ready',
            'data': event['data'],
        })

    @database_sync_to_async
    def _get_queue_state(self):
        from ..models.queue import ShootingQueue
        from ..serializers.queue import ShootingQueueSerializer

        try:
            queue = ShootingQueue.objects.prefetch_related('entries').get(id=self.queue_id)
            return ShootingQueueSerializer(queue).data
        except ShootingQueue.DoesNotExist:
            return {'error': 'Queue not found'}
