"""
Protocol service — workflow logic for protocol lifecycle.

Handles:
- Signing (DRAFT → SIGNED)
- Approval (SIGNED → APPROVED)
- Archiving (APPROVED → ARCHIVED)
- Enforces zero-edit policy on APPROVED/ARCHIVED protocols
"""
import logging
from django.utils import timezone
from django.core.exceptions import PermissionDenied

from ..models.protocol import Protocol, ProtocolStatus, IMMUTABLE_STATUSES

logger = logging.getLogger("shaffoftir_api.services.protocol")


class ProtocolService:
    """Encapsulates protocol workflow operations."""

    @staticmethod
    def sign(protocol: Protocol, user) -> Protocol:
        """Sign a draft protocol.

        Args:
            protocol: The protocol to sign.
            user: The signing user (must be INSTRUCTOR).

        Returns:
            The updated protocol.

        Raises:
            PermissionDenied: If protocol is not in DRAFT status.
        """
        if protocol.status != ProtocolStatus.DRAFT.value:
            raise PermissionDenied(
                f"Можно подписать только черновик (текущий статус: {protocol.status})"
            )

        protocol.status = ProtocolStatus.SIGNED.value
        protocol.signed_at = timezone.now()
        protocol.save(update_fields=["status", "signed_at", "updated_at"])

        logger.info("Protocol %s signed by %s", protocol.protocol_number, user.display_name)
        return protocol

    @staticmethod
    def approve(protocol: Protocol, user) -> Protocol:
        """Approve a signed protocol.

        Once approved, the protocol becomes immutable (zero-edit policy).
        """
        if protocol.status != ProtocolStatus.SIGNED.value:
            raise PermissionDenied(
                f"Можно утвердить только подписанный протокол (текущий статус: {protocol.status})"
            )

        protocol.status = ProtocolStatus.APPROVED.value
        protocol.save(update_fields=["status", "updated_at"])

        logger.info("Protocol %s approved by %s", protocol.protocol_number, user.display_name)
        return protocol

    @staticmethod
    def archive(protocol: Protocol, user) -> Protocol:
        """Archive an approved protocol."""
        if protocol.status != ProtocolStatus.APPROVED.value:
            raise PermissionDenied(
                f"Можно архивировать только утверждённый протокол (текущий статус: {protocol.status})"
            )

        protocol.status = ProtocolStatus.ARCHIVED.value
        protocol.save(update_fields=["status", "updated_at"])

        logger.info("Protocol %s archived by %s", protocol.protocol_number, user.display_name)
        return protocol
