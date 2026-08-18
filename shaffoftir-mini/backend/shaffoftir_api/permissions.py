"""
Role-based permission classes for ShaffofTIR API.

Architecture:
    The system has two roles:
    - INSTRUCTOR: manages sessions, results, protocols, employees
    - TECHSPEC: manages cameras, lanes, arsenal, system health

    Permission classes are composable and self-documenting.
    Apply them at the view level or per-action via get_permissions().

Example:
    class SessionViewSet(ViewSet):
        permission_classes = [IsInstructor]

    class CameraViewSet(ViewSet):
        permission_classes = [IsTechSpec]

    class ProtocolViewSet(ViewSet):
        def get_permissions(self):
            if self.action in ('sign', 'approve'):
                return [IsInstructor]
            return [IsAuthenticated]
"""
from rest_framework.permissions import BasePermission, IsAuthenticated as _IsAuthenticated


class IsAuthenticated(_IsAuthenticated):
    """Ensure the request is authenticated.

    Overridden to return a Russian message via the error detail.
    """
    message = "Требуется аутентификация."


class IsInstructor(BasePermission):
    """Allow access only to users with the INSTRUCTOR role."""
    message = "Доступ разрешён только инструкторам."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "INSTRUCTOR"
        )


class IsTechSpec(BasePermission):
    """Allow access only to users with the TECHSPEC role."""
    message = "Доступ разрешён только техническим специалистам."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "TECHSPEC"
        )


class IsOwnerOrReadOnly(BasePermission):
    """Object-level permission: only the creator may modify.

    Checks ``created_by`` field on the model instance.  Falls back
    to allowing read access for any authenticated user.
    """
    message = "Вы можете редактировать только свои объекты."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS if (SAFE_METHODS := ("GET", "HEAD", "OPTIONS")) else False:
            return True
        return getattr(obj, "created_by_id", None) == request.user.id
