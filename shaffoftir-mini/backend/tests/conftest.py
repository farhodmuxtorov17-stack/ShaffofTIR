"""
Pytest fixtures for ShaffofTIR API tests.

Provides:
- ``api_client``: DRF APIClient with JWT auth
- ``instructor``: a SystemUser with INSTRUCTOR role
- ``techspec``: a SystemUser with TECHSPEC role
- ``api_client_as(user)``: helper to create authenticated client
"""
import pytest
from rest_framework.test import APIClient
from shaffoftir_api.models.user import SystemUser


@pytest.fixture
def instructor(db):
    return SystemUser.objects.create_user(
        email="instructor@test.uz",
        password="TestPass123",
        username="instructor_test",
        full_name="Test Instructor",
        role="INSTRUCTOR",
        rank="Captain",
        department="Test Dept",
    )


@pytest.fixture
def techspec(db):
    return SystemUser.objects.create_user(
        email="tech@test.uz",
        password="TestPass123",
        username="tech_test",
        full_name="Test TechSpec",
        role="TECHSPEC",
    )


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authed_client(instructor):
    """Return an APIClient authenticated as instructor."""
    from rest_framework_simplejwt.tokens import RefreshToken
    client = APIClient()
    refresh = RefreshToken.for_user(instructor)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


@pytest.fixture
def techspec_client(techspec):
    """Return an APIClient authenticated as techspec."""
    from rest_framework_simplejwt.tokens import RefreshToken
    client = APIClient()
    refresh = RefreshToken.for_user(techspec)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client
