"""
Tests for camera endpoints.

Covers:
- Camera list access by role
- Health check endpoint
- Write permission for TechSpec only
"""
import pytest
from shaffoftir_api.models.camera import LaneCamera


class TestCameraAccess:
    def test_techspec_can_list_cameras(self, techspec_client):
        resp = techspec_client.get("/api/v1/cameras/")
        assert resp.status_code == 200

    def test_instructor_can_list_cameras(self, authed_client):
        resp = authed_client.get("/api/v1/cameras/")
        assert resp.status_code == 200

    def test_techspec_can_create_camera(self, techspec_client):
        resp = techspec_client.post("/api/v1/cameras/", {
            "name": "Cam Lane 1",
            "lane_number": 1,
            "camera_ip": "192.168.1.100",
            "status": "ONLINE",
        }, format="json")
        assert resp.status_code == 201

    def test_instructor_cannot_create_camera(self, authed_client):
        resp = authed_client.post("/api/v1/cameras/", {
            "name": "Cam Lane 2",
            "lane_number": 2,
            "camera_ip": "192.168.1.101",
        }, format="json")
        assert resp.status_code == 403


class TestCameraHealth:
    def test_health_check_returns_results(self, techspec_client):
        """Health check returns a result for each camera."""
        resp = techspec_client.post("/api/v1/cameras/health/", {
            "cameras": [
                {"camera_ip": "192.168.1.100", "label": "Lane 1"},
                {"camera_ip": "10.0.0.1", "label": "Lane 2"},
            ],
        }, format="json")

        assert resp.status_code == 200
        assert "camera_results" in resp.data
        assert len(resp.data["camera_results"]) == 2
        assert "summary" in resp.data
