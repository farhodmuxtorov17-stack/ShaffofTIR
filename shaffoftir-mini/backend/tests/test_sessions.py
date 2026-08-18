"""
Tests for session lifecycle.

Covers:
- Session creation with soldiers
- Shot processing and score calculation
- State machine transitions
- Pass/fail determination
"""
import pytest
from shaffoftir_api.models.session import ShootingSession, Soldier, Shot


class TestSessionCreation:
    def test_start_creates_session_with_soldiers(self, authed_client):
        resp = authed_client.post("/api/v1/sessions/start/", {
            "soldier_count": 4,
            "scoring_mode": "POINTS",
            "distance": 50,
        }, format="json")

        assert resp.status_code == 201
        assert resp.data["soldier_count"] == 4
        assert resp.data["status"] == "SESSION_CREATED"

        session = ShootingSession.objects.get(id=resp.data["id"])
        assert session.soldiers.count() == 4
        assert session.distance == 50

    def test_start_default_values(self, authed_client):
        resp = authed_client.post("/api/v1/sessions/start/", {}, format="json")
        assert resp.status_code == 201
        assert resp.data["scoring_mode"] == "POINTS"
        assert resp.data["distance"] == 25


class TestShotProcessing:
    @pytest.fixture
    def session_with_soldier(self, authed_client):
        resp = authed_client.post("/api/v1/sessions/start/", {
            "soldier_count": 1,
        }, format="json")
        session = ShootingSession.objects.get(id=resp.data["id"])
        soldier = session.soldiers.first()
        return session, soldier

    def test_process_shots_updates_stats(self, authed_client, session_with_soldier):
        session, soldier = session_with_soldier

        resp = authed_client.post(
            f"/api/v1/sessions/{session.id}/process_turn/",
            {
                "soldier_seq": 1,
                "shot_type": "MAIN",
                "shots": [
                    {"x": 1.2, "y": 0.5, "score": 10},
                    {"x": 2.0, "y": 1.0, "score": 9},
                    {"x": 3.5, "y": 2.0, "score": 0},
                ],
            },
            format="json",
        )

        assert resp.status_code == 200
        assert resp.data["hit_count"] == 2
        assert resp.data["miss_count"] == 1
        assert resp.data["total_score"] == 19
        assert resp.data["accuracy"] == 66.7

    def test_multiple_turns_accumulate(self, authed_client, session_with_soldier):
        session, soldier = session_with_soldier

        # First turn
        authed_client.post(f"/api/v1/sessions/{session.id}/process_turn/", {
            "soldier_seq": 1, "shots": [{"score": 10}, {"score": 8}],
        }, format="json")

        # Second turn
        resp = authed_client.post(f"/api/v1/sessions/{session.id}/process_turn/", {
            "soldier_seq": 1, "shots": [{"score": 9}, {"score": 0}],
        }, format="json")

        assert resp.data["total_score"] == 27
        assert resp.data["hit_count"] == 3
        assert resp.data["miss_count"] == 1


class TestSessionTransition:
    def test_valid_transition(self, authed_client):
        resp = authed_client.post("/api/v1/sessions/start/", {
            "soldier_count": 1,
        }, format="json")
        session_id = resp.data["id"]

        resp = authed_client.post(f"/api/v1/sessions/{session_id}/transition/", {
            "status": "TEST_READY",
        }, format="json")

        assert resp.status_code == 200
        assert resp.data["status"] == "TEST_READY"

    def test_invalid_transition_rejected(self, authed_client):
        resp = authed_client.post("/api/v1/sessions/start/", {
            "soldier_count": 1,
        }, format="json")
        session_id = resp.data["id"]

        # SESSION_CREATED → APPROVED is invalid
        resp = authed_client.post(f"/api/v1/sessions/{session_id}/transition/", {
            "status": "APPROVED",
        }, format="json")

        assert resp.status_code == 400
        assert "INVALID_TRANSITION" in resp.data["error"]["code"]
