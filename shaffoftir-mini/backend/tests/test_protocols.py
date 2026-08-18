"""
Tests for protocol workflow.

Covers:
- Protocol creation
- Sign → Approve → Archive workflow
- Zero-edit policy on APPROVED/ARCHIVED
"""
import pytest
from shaffoftir_api.models.protocol import Protocol


class TestProtocolWorkflow:
    @pytest.fixture
    def protocol(self, authed_client):
        resp = authed_client.post("/api/v1/protocols/", {
            "employee_id": "emp-1",
            "employee_name": "Test Employee",
            "weapon_name": "AK-74",
            "total_shots": 10,
            "hit_count": 8,
            "miss_count": 2,
            "total_score": 80,
            "accuracy": 80.0,
            "passed": True,
        }, format="json")
        return Protocol.objects.get(id=resp.data["id"])

    def test_protocol_starts_as_draft(self, protocol):
        assert protocol.status == "DRAFT"

    def test_sign_protocol(self, authed_client, protocol):
        resp = authed_client.post(f"/api/v1/protocols/{protocol.id}/sign/")
        assert resp.status_code == 200
        assert resp.data["status"] == "SIGNED"
        assert resp.data["signed_at"] is not None

    def test_approve_protocol(self, authed_client, protocol):
        # Sign first
        authed_client.post(f"/api/v1/protocols/{protocol.id}/sign/")
        # Then approve
        resp = authed_client.post(f"/api/v1/protocols/{protocol.id}/approve/")
        assert resp.status_code == 200
        assert resp.data["status"] == "APPROVED"

    def test_archive_protocol(self, authed_client, protocol):
        authed_client.post(f"/api/v1/protocols/{protocol.id}/sign/")
        authed_client.post(f"/api/v1/protocols/{protocol.id}/approve/")
        resp = authed_client.post(f"/api/v1/protocols/{protocol.id}/archive/")
        assert resp.status_code == 200
        assert resp.data["status"] == "ARCHIVED"

    def test_zero_edit_on_approved(self, authed_client, protocol):
        """Approved protocols cannot be edited."""
        authed_client.post(f"/api/v1/protocols/{protocol.id}/sign/")
        authed_client.post(f"/api/v1/protocols/{protocol.id}/approve/")

        resp = authed_client.patch(f"/api/v1/protocols/{protocol.id}/", {
            "notes": "should fail",
        }, format="json")

        assert resp.status_code == 403
        assert resp.data["error"]["code"] == "IMMUTABLE"

    def test_zero_delete_on_archived(self, authed_client, protocol):
        """Archived protocols cannot be deleted."""
        authed_client.post(f"/api/v1/protocols/{protocol.id}/sign/")
        authed_client.post(f"/api/v1/protocols/{protocol.id}/approve/")
        authed_client.post(f"/api/v1/protocols/{protocol.id}/archive/")

        resp = authed_client.delete(f"/api/v1/protocols/{protocol.id}/")
        assert resp.status_code == 403
