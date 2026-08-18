"""
Camera health check service.

Performs TCP connectivity checks to camera IP endpoints
without blocking the event loop.
"""
import logging
import socket
from typing import Any
from concurrent.futures import ThreadPoolExecutor, as_completed

logger = logging.getLogger("shaffoftir_api.services.camera")


class CameraService:
    """Handles camera health checks."""

    @staticmethod
    def check_health(cameras: list[dict[str, Any]], timeout: float = 3.0) -> dict:
        """Check connectivity for a list of cameras.

        Args:
            cameras: List of dicts with 'camera_ip' and 'label' keys.
            timeout: Connection timeout in seconds.

        Returns:
            Dict with 'camera_results' list and 'summary'.
        """
        results = []

        def _check(cam: dict) -> dict:
            ip = cam.get("camera_ip")
            label = cam.get("label", "")
            if not ip:
                return {"camera_ip": ip, "label": label, "status": "ERROR", "error": "No IP"}

            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(timeout)
                sock.connect((ip, 80))
                sock.close()
                return {"camera_ip": ip, "label": label, "status": "ONLINE"}
            except (socket.timeout, ConnectionRefusedError, OSError):
                return {"camera_ip": ip, "label": label, "status": "OFFLINE"}

        with ThreadPoolExecutor(max_workers=10) as pool:
            futures = {pool.submit(_check, cam): cam for cam in cameras}
            for future in as_completed(futures):
                results.append(future.result())

        online = sum(1 for r in results if r["status"] == "ONLINE")
        offline = sum(1 for r in results if r["status"] == "OFFLINE")
        errors = sum(1 for r in results if r["status"] == "ERROR")

        logger.info("Camera health check: %d online, %d offline, %d errors", online, offline, errors)

        return {
            "camera_results": results,
            "summary": {
                "total": len(results),
                "online": online,
                "offline": offline,
                "errors": errors,
            },
        }
