"""
Custom DRF exception handler.

Provides a consistent JSON error envelope across all API responses:

    {
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Human-readable message",
            "details": { ... }  # optional field-level errors
        }
    }

This replaces DRF's default flat structure with a nested envelope
that's easier for frontend consumers to parse consistently.
"""
import logging

from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import (
    ValidationError as DRFValidationError,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
)
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger("shaffoftir_api.exceptions")


def _error_envelope(code: str, message: str, details=None) -> dict:
    payload: dict = {"code": code, "message": message}
    if details is not None:
        payload["details"] = details
    return {"error": payload}


def custom_exception_handler(exc, context):
    """
    Wrap DRF's default handler and normalise the response shape.

    Handles:
    - ValidationError → 400 with field-level details
    - NotAuthenticated → 401
    - PermissionDenied → 403
    - NotFound → 404
    - Everything else falls through to DRF's default handler,
      then gets re-wrapped.
    """
    response = drf_exception_handler(exc, context)

    if response is None:
        # Unhandled exception — let Django's default 500 kick in
        logger.exception("Unhandled exception: %s", exc)
        return Response(
            _error_envelope("INTERNAL_ERROR", "Внутренняя ошибка сервера"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if isinstance(exc, DRFValidationError):
        return Response(
            _error_envelope("VALIDATION_ERROR", "Ошибка валидации данных", response.data),
            status=response.status_code,
        )

    if isinstance(exc, NotAuthenticated):
        return Response(
            _error_envelope("NOT_AUTHENTICATED", "Требуется аутентификация"),
            status=response.status_code,
        )

    if isinstance(exc, PermissionDenied):
        return Response(
            _error_envelope("FORBIDDEN", "Недостаточно прав"),
            status=response.status_code,
        )

    if isinstance(exc, NotFound):
        return Response(
            _error_envelope("NOT_FOUND", "Объект не найден"),
            status=response.status_code,
        )

    # Generic fallback — wrap whatever DRF gave us
    data = response.data if isinstance(response.data, dict) else {"detail": str(response.data)}
    return Response(
        _error_envelope("ERROR", str(data.get("detail", "Ошибка")), data),
        status=response.status_code,
    )
