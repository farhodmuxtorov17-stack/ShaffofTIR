"""
Tests for authentication flow.

Covers:
- Login with valid credentials
- Login with invalid credentials
- GET /auth/me/ with and without auth
- Role-based access control
"""
import pytest
from shaffoftir_api.models.user import SystemUser

pytestmark = pytest.mark.django_db


class TestLogin:
    def test_login_success(self, api_client, instructor):
        """Valid credentials return JWT tokens and user data."""
        resp = api_client.post("/api/v1/auth/login/", {
            "email": "instructor@test.uz",
            "password": "TestPass123",
        }, format="json")

        assert resp.status_code == 200
        data = resp.data
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "instructor@test.uz"
        assert data["user"]["role"] == "INSTRUCTOR"

    def test_login_wrong_password(self, api_client, instructor):
        resp = api_client.post("/api/v1/auth/login/", {
            "email": "instructor@test.uz",
            "password": "wrong",
        }, format="json")

        assert resp.status_code == 400

    def test_login_nonexistent_user(self, api_client):
        resp = api_client.post("/api/v1/auth/login/", {
            "email": "nobody@test.uz",
            "password": "whatever",
        }, format="json")

        assert resp.status_code == 400


class TestMe:
    def test_me_authenticated(self, authed_client):
        resp = authed_client.get("/api/v1/auth/me/")
        assert resp.status_code == 200
        assert resp.data["email"] == "instructor@test.uz"

    def test_me_unauthenticated(self, api_client):
        resp = api_client.get("/api/v1/auth/me/")
        assert resp.status_code == 401


class TestRoleAccess:
    def test_instructor_can_create_session(self, authed_client):
        """Instructor can create sessions."""
        resp = authed_client.post("/api/v1/sessions/start/", {
            "soldier_count": 3,
            "scoring_mode": "POINTS",
            "distance": 25,
        }, format="json")
        assert resp.status_code == 201

    def test_techspec_cannot_create_session(self, techspec_client):
        """TechSpec cannot create sessions."""
        resp = techspec_client.post("/api/v1/sessions/start/", {
            "soldier_count": 1,
        }, format="json")
        assert resp.status_code == 403

    def test_techspec_can_access_cameras(self, techspec_client):
        """TechSpec can access camera endpoints."""
        resp = techspec_client.get("/api/v1/cameras/")
        assert resp.status_code == 200

    def test_instructor_can_read_cameras(self, authed_client):
        """Instructor can read cameras (read-only)."""
        resp = authed_client.get("/api/v1/cameras/")
        assert resp.status_code == 200
