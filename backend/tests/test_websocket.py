"""
Tests for WebSocket queue consumer and CV analysis service.
"""
import pytest
import numpy as np
import cv2
import base64
from django.test import TestCase
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from shaffoftir_api.models.user import SystemUser
from shaffoftir_api.models.employee import Employee
from shaffoftir_api.models.queue import ShootingQueue, QueueEntry
from shaffoftir_api.services.queue_service import QueueService
from shaffoftir_api.services.ai_analysis_service import AIAnalysisService
from config.asgi import application

pytestmark = pytest.mark.django_db


class TestWebSocketQueue(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            'ws@shaffoftir.uz', 'test123',
            username='wstester', role='INSTRUCTOR',
        )
        soldiers = [{'employee_name': f'Soldier {i}'} for i in range(3)]
        self.queue = QueueService.create_queue_manual(
            instructor_id=self.user.id,
            range_id=None,
            soldiers_data=soldiers,
        )

    @pytest.mark.asyncio
    async def test_websocket_connect(self):
        communicator = WebsocketCommunicator(application, f'/ws/queue/{self.queue.id}/')
        connected, _ = await communicator.connect()
        assert connected
        response = await communicator.receive_json_from()
        assert response['type'] == 'connected'
        await communicator.disconnect()


class TestCVAnalysis(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            'cv@shaffoftir.uz', 'test123',
            username='cvtester', role='INSTRUCTOR',
        )

    def _create_test_target_images(self):
        """Create synthetic before/after target images with fake bullet holes."""
        w, h = 400, 400
        center = (w // 2, h // 2)

        # Before: clean target
        before = np.ones((h, w, 3), dtype=np.uint8) * 240
        cv2.circle(before, center, 150, (0, 0, 0), 2)
        cv2.circle(before, center, 120, (0, 0, 0), 2)
        cv2.circle(before, center, 90, (0, 0, 0), 2)
        cv2.circle(before, center, 60, (0, 0, 0), 2)
        cv2.circle(before, center, 30, (0, 0, 0), 2)

        # After: target with bullet holes
        after = before.copy()
        # Add 5 "bullet holes" near center
        hole_positions = [
            (center[0] + 10, center[1] + 5),
            (center[0] - 15, center[1] + 20),
            (center[0] + 25, center[1] - 10),
            (center[0] - 5, center[1] - 30),
            (center[0] + 40, center[1] + 35),
        ]
        for pos in hole_positions:
            cv2.circle(after, pos, 5, (20, 20, 20), -1)

        # Encode to base64
        _, before_buf = cv2.imencode('.jpg', before)
        _, after_buf = cv2.imencode('.jpg', after)
        before_b64 = f'data:image/jpeg;base64,{base64.b64encode(before_buf).decode()}'
        after_b64 = f'data:image/jpeg;base64,{base64.b64encode(after_buf).decode()}'
        return before_b64, after_b64

    def test_cv_analysis_detects_hits(self):
        before_b64, after_b64 = self._create_test_target_images()
        analysis = AIAnalysisService.create_analysis(
            before_photo_url=before_b64,
            after_photo_url=after_b64,
        )
        result = AIAnalysisService.run_analysis(analysis.id)
        assert result.status == 'COMPLETED'
        assert result.total_shots_detected > 0
        assert result.hit_count > 0
        assert result.total_score > 0
        assert 0 <= result.accuracy <= 100
        assert result.model_version == 'opencv-v2.0'
        assert result.annotated_photo_url.startswith('data:image/jpeg;base64,')
