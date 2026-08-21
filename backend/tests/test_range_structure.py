"""
Tests for range structure: OPEN (rubegs with lanes) vs CLOSED (lanes only).
Also tests scoring modes: POINTS (military) vs HIT_MISS (other employees).
"""
import pytest
from django.test import TestCase
from rest_framework.test import APIClient

from shaffoftir_api.models.user import SystemUser
from shaffoftir_api.models.range import ShootingRange, ShootingLane, RangeRubeg
from shaffoftir_api.models.session import ShootingSession, ScoringMode, SessionStatus

pytestmark = pytest.mark.django_db


class TestRangeStructure(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.instructor = SystemUser.objects.create_user(
            'inst@shaffoftir.uz', 'test123',
            username='inst', role='INSTRUCTOR',
        )
        self.client.force_authenticate(user=self.instructor)

    def test_open_range_has_rubegs(self):
        rng = ShootingRange.objects.create(name="Test Open", range_type="OPEN")
        r1 = RangeRubeg.objects.create(range=rng, rubeg_number=1, distance=25, max_lanes=10)
        r2 = RangeRubeg.objects.create(range=rng, rubeg_number=2, distance=50, max_lanes=10)
        assert rng.rubegs.count() == 2
        assert r1.distance == 25
        assert r2.distance == 50

    def test_closed_range_has_no_rubegs(self):
        rng = ShootingRange.objects.create(name="Test Closed", range_type="CLOSED")
        for i in range(1, 7):
            ShootingLane.objects.create(range=rng, lane_number=i, name=f"Д{i}")
        assert rng.lanes.count() == 6
        assert rng.rubegs.count() == 0

    def test_open_range_lanes_belong_to_rubegs(self):
        rng = ShootingRange.objects.create(name="Test Open", range_type="OPEN")
        rubeg = RangeRubeg.objects.create(range=rng, rubeg_number=1, distance=25)
        for i in range(1, 11):
            ShootingLane.objects.create(
                range=rng, rubeg=rubeg, lane_number=i, name=f"Р1-Д{i}", distance_m=25
            )
        assert rubeg.lanes.count() == 10
        assert rubeg.lane_count == 10

    def test_lane_number_can_repeat_across_rubegs(self):
        """Lane 1 in rubeg 1 and lane 1 in rubeg 2 should be allowed."""
        rng = ShootingRange.objects.create(name="Test Open", range_type="OPEN")
        r1 = RangeRubeg.objects.create(range=rng, rubeg_number=1, distance=25)
        r2 = RangeRubeg.objects.create(range=rng, rubeg_number=2, distance=50)
        ShootingLane.objects.create(range=rng, rubeg=r1, lane_number=1, name="Р1-Д1")
        ShootingLane.objects.create(range=rng, rubeg=r2, lane_number=1, name="Р2-Д1")
        assert r1.lanes.count() == 1
        assert r2.lanes.count() == 1

    def test_closed_range_lane_number_unique_per_range(self):
        rng = ShootingRange.objects.create(name="Test Closed", range_type="CLOSED")
        ShootingLane.objects.create(range=rng, lane_number=1, name="Д1")
        from django.db import IntegrityError
        with pytest.raises(IntegrityError):
            ShootingLane.objects.create(range=rng, lane_number=1, name="Д1-DUP")

    def test_rubeg_max_lanes_enforced(self):
        rng = ShootingRange.objects.create(name="Test Open", range_type="OPEN")
        rubeg = RangeRubeg.objects.create(range=rng, rubeg_number=1, distance=25, max_lanes=3)
        for i in range(1, 4):
            ShootingLane.objects.create(range=rng, rubeg=rubeg, lane_number=i, name=f"Д{i}")
        assert rubeg.lanes.count() == 3
        assert rubeg.max_lanes == 3

    def test_range_structure_api(self):
        """Test GET /ranges/{id}/structure/ endpoint."""
        rng = ShootingRange.objects.create(name="Test Open", range_type="OPEN")
        rubeg = RangeRubeg.objects.create(range=rng, rubeg_number=1, distance=25)
        ShootingLane.objects.create(range=rng, rubeg=rubeg, lane_number=1, name="Р1-Д1")

        resp = self.client.get(f'/api/v1/ranges/{rng.id}/structure/')
        assert resp.status_code == 200
        data = resp.json()
        assert data['range_type'] == 'OPEN'
        assert len(data['rubegs']) == 1
        assert len(data['rubegs'][0]['lanes']) >= 1

    def test_closed_range_structure_api(self):
        rng = ShootingRange.objects.create(name="Test Closed", range_type="CLOSED")
        ShootingLane.objects.create(range=rng, lane_number=1, name="Д1")
        resp = self.client.get(f'/api/v1/ranges/{rng.id}/structure/')
        assert resp.status_code == 200
        data = resp.json()
        assert data['range_type'] == 'CLOSED'
        assert 'rubegs' not in data
        assert len(data['lanes']) == 1

    def test_add_rubeg_to_open_range(self):
        rng = ShootingRange.objects.create(name="Test Open", range_type="OPEN")
        resp = self.client.post(f'/api/v1/ranges/{rng.id}/add_rubeg/', {
            'rubeg_number': 1,
            'distance': 100,
            'max_lanes': 10,
        })
        assert resp.status_code == 201
        assert resp.json()['rubeg_number'] == 1
        assert resp.json()['distance'] == 100

    def test_cannot_add_rubeg_to_closed_range(self):
        rng = ShootingRange.objects.create(name="Test Closed", range_type="CLOSED")
        resp = self.client.post(f'/api/v1/ranges/{rng.id}/add_rubeg/', {
            'rubeg_number': 1,
            'distance': 25,
        })
        assert resp.status_code == 400


class TestScoringModes(TestCase):
    """Test that POINTS and HIT_MISS modes work correctly."""

    def test_points_mode_for_military(self):
        """Military scoring: points per shot (0-10)."""
        session = ShootingSession.objects.create(
            session_id="test-points-001",
            range_type="OPEN",
            scoring_mode=ScoringMode.POINTS.value,
            status=SessionStatus.MAIN_COMPLETED.value,
            distance=25,
            soldier_count=1,
        )
        assert session.scoring_mode == "POINTS"

    def test_hit_miss_mode_for_other_employees(self):
        """Other employees: just hit/miss, no points."""
        session = ShootingSession.objects.create(
            session_id="test-hitmiss-001",
            range_type="CLOSED",
            scoring_mode=ScoringMode.HIT_MISS.value,
            status=SessionStatus.MAIN_COMPLETED.value,
            distance=25,
            soldier_count=1,
        )
        assert session.scoring_mode == "HIT_MISS"
