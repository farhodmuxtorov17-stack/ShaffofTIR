"""
Tests for FaceID, Queue, and AI Analysis modules.
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from shaffoftir_api.models.user import SystemUser
from shaffoftir_api.models.employee import Employee
from shaffoftir_api.models.faceid import FaceRegistration, FaceCheckIn
from shaffoftir_api.models.queue import ShootingQueue, QueueEntry
from shaffoftir_api.models.ai_analysis import ShotAnalysis
from shaffoftir_api.services.queue_service import QueueService
from shaffoftir_api.services.faceid_service import FaceIDService
from shaffoftir_api.services.ai_analysis_service import AIAnalysisService

pytestmark = pytest.mark.django_db


class TestFaceIDService(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            'test@shaffoftir.uz', 'test123',
            username='tester', role='INSTRUCTOR',
        )
        self.emp = Employee.objects.create(
            personal_number='TEST-001',
            full_name='Test User',
            rank='Sergeant',
            position='Shooter',
            department='Test Dept',
        )

    def test_register_face(self):
        reg = FaceIDService.register_face(self.emp.id, 'base64_encoding_here')
        assert reg.employee == self.emp
        assert reg.is_active is True
        assert reg.face_encoding == 'base64_encoding_here'

    def test_identify_face_found(self):
        FaceIDService.register_face(self.emp.id, 'encoding_1')
        employee, confidence = FaceIDService.identify_face('encoding_2')
        assert employee is not None
        assert confidence > 0

    def test_identify_face_not_found(self):
        employee, confidence = FaceIDService.identify_face('no_match', confidence_threshold=0.99)
        assert employee is None

    def test_create_check_in(self):
        check_in = FaceIDService.create_check_in(
            instructor_id=self.user.id,
            range_id=None,
            employee_ids=[str(self.emp.id)],
        )
        assert check_in.total_identified == 1
        assert check_in.status == 'COMPLETED'
        assert check_in.entries.count() == 1


class TestQueueService(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            'test@shaffoftir.uz', 'test123',
            username='tester', role='INSTRUCTOR',
        )
        self.emps = []
        for i in range(5):
            self.emps.append(Employee.objects.create(
                personal_number=f'TEST-{i:03d}',
                full_name=f'Test User {i}',
                rank='Sergeant',
                position='Shooter',
                department='Test Dept',
            ))

    def test_create_manual_queue(self):
        soldiers = [
            {'employee_id': str(e.id), 'employee_name': e.full_name, 'employee_rank': e.rank}
            for e in self.emps
        ]
        queue = QueueService.create_queue_manual(
            instructor_id=self.user.id,
            range_id=None,
            soldiers_data=soldiers,
        )
        assert queue.total_soldiers == 5
        assert queue.entries.count() == 5
        assert queue.status == 'WAITING'

    def test_activate_queue(self):
        soldiers = [{'employee_name': f'Soldier {i}'} for i in range(3)]
        queue = QueueService.create_queue_manual(
            instructor_id=self.user.id, range_id=None, soldiers_data=soldiers,
        )
        activated = QueueService.activate_queue(queue.id)
        assert activated.status == 'ACTIVE'
        current = activated.entries.filter(status='CURRENT').first()
        assert current is not None
        assert current.sequence_number == 1

    def test_complete_current_auto_advances(self):
        soldiers = [{'employee_name': f'Soldier {i}'} for i in range(3)]
        queue = QueueService.create_queue_manual(
            instructor_id=self.user.id, range_id=None, soldiers_data=soldiers,
        )
        QueueService.activate_queue(queue.id)
        next_entry = QueueService.complete_current(queue.id, {
            'total_shots': 10, 'hit_count': 8, 'miss_count': 2,
            'total_score': 78, 'accuracy': 80.0, 'passed': True,
        })
        assert next_entry is not None
        assert next_entry.sequence_number == 2
        assert next_entry.status == 'CURRENT'
        queue.refresh_from_db()
        assert queue.completed_count == 1

    def test_complete_last_entry_completes_queue(self):
        soldiers = [{'employee_name': f'Soldier {i}'} for i in range(2)]
        queue = QueueService.create_queue_manual(
            instructor_id=self.user.id, range_id=None, soldiers_data=soldiers,
        )
        QueueService.activate_queue(queue.id)
        QueueService.complete_current(queue.id)
        next_entry = QueueService.complete_current(queue.id)
        assert next_entry is None
        queue.refresh_from_db()
        assert queue.status == 'COMPLETED'

    def test_skip_current(self):
        soldiers = [{'employee_name': f'Soldier {i}'} for i in range(3)]
        queue = QueueService.create_queue_manual(
            instructor_id=self.user.id, range_id=None, soldiers_data=soldiers,
        )
        QueueService.activate_queue(queue.id)
        next_entry = QueueService.skip_current(queue.id)
        assert next_entry is not None
        skipped = queue.entries.filter(status='SKIPPED').first()
        assert skipped is not None

    def test_pause_and_resume(self):
        soldiers = [{'employee_name': 'Soldier 0'}]
        queue = QueueService.create_queue_manual(
            instructor_id=self.user.id, range_id=None, soldiers_data=soldiers,
        )
        QueueService.activate_queue(queue.id)
        QueueService.pause_queue(queue.id)
        queue.refresh_from_db()
        assert queue.status == 'PAUSED'
        QueueService.resume_queue(queue.id)
        queue.refresh_from_db()
        assert queue.status == 'ACTIVE'

    def test_get_queue_state(self):
        soldiers = [{'employee_name': f'Soldier {i}'} for i in range(4)]
        queue = QueueService.create_queue_manual(
            instructor_id=self.user.id, range_id=None, soldiers_data=soldiers,
        )
        QueueService.activate_queue(queue.id)
        state = QueueService.get_queue_state(queue.id)
        assert state['current'] is not None
        assert len(state['waiting']) == 3
        assert state['progress']['total'] == 4


class TestAIAnalysisService(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            'test@shaffoftir.uz', 'test123',
            username='tester', role='INSTRUCTOR',
        )

    def test_create_and_run_analysis(self):
        analysis = AIAnalysisService.create_analysis(
            before_photo_url='http://example.com/before.jpg',
            after_photo_url='http://example.com/after.jpg',
        )
        result = AIAnalysisService.run_analysis(analysis.id)
        assert result.status == 'COMPLETED'
        assert result.total_shots_detected > 0
        assert result.hit_count + result.miss_count == result.total_shots_detected
        assert 0 <= result.accuracy <= 100
        assert 0.5 <= result.confidence <= 1.0
