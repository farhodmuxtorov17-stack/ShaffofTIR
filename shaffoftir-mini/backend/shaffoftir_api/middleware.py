"""
Custom middleware for request logging and audit trail.

This module provides:
- RequestLoggingMiddleware: logs every API request with timing,
  user info, and status code for observability.
"""
import logging
import time
import json

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("shaffoftir_api.request")


class RequestLoggingMiddleware(MiddlewareMixin):
    """Log every HTTP request/response cycle for observability.

    Logs method, path, status, duration, and user (if authenticated).
    Excludes /admin/ and /api/docs/ to reduce noise.
    """

    SKIP_PREFIXES = ("/admin/", "/api/docs/", "/api/schema/", "/api/redoc/")

    def process_request(self, request):
        request._request_start = time.perf_counter()
        return None

    def process_response(self, request, response):
        path = request.path
        if any(path.startswith(p) for p in self.SKIP_PREFIXES):
            return response

        duration_ms = (time.perf_counter() - getattr(request, "_request_start", 0)) * 1000
        user = getattr(request, "user", None)
        username = user.get_username() if user and user.is_authenticated else "anonymous"

        logger.info(
            "%s %s → %d (%.1fms) user=%s",
            request.method,
            path,
            response.status_code,
            duration_ms,
            username,
        )
        return response
