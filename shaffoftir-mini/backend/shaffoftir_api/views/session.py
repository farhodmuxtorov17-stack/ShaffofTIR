"""
Session views — CRUD + custom action endpoints.

All endpoints require authentication. Session creation and
processing is restricted to INSTRUCTOR role.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..models.session import ShootingSession, Soldier, Shot
from ..serializers.session import ShootingSessionSerializer, SoldierSerializer, ShotSerializer
from ..permissions import IsAuthenticated, IsInstructor
from ..services.session_service import SessionService


class SessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for shooting sessions.

    Provides standard CRUD plus:
    - POST /sessions/{id}/start/ — start session with soldiers
    - POST /sessions/{id}/process-turn/ — process shots for a soldier
    - POST /sessions/{id}/transition/ — change session status
    """
    queryset = ShootingSession.objects.all()
    serializer_class = ShootingSessionSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["status", "scoring_mode", "employee_id", "instructor_id", "range_name"]
    search_fields = ["employee_name", "weapon_name", "session_id"]
    ordering_fields = ["created_at", "total_score", "accuracy"]

    def get_permissions(self):
        """Only instructors can create, update, or delete sessions."""
        if self.action in ("create", "update", "partial_update", "destroy", "start", "process_turn", "transition"):
            return [IsInstructor()]
        return [IsAuthenticated()]

    @extend_schema(
        request={"soldier_count": int, "scoring_mode": str, "range_type": str, "distance": int},
        responses=ShootingSessionSerializer,
        description="Create a new session with pre-populated soldiers",
    )
    @action(detail=False, methods=["post"])
    def start(self, request):
        """Create a new session with soldiers."""
        session = SessionService.create_session(
            soldier_count=request.data.get("soldier_count", 1),
            scoring_mode=request.data.get("scoring_mode", "POINTS"),
            range_type=request.data.get("range_type", "CLOSED"),
            distance=request.data.get("distance", 25),
            instructor_id=request.user.id,
            instructor_name=request.user.display_name,
        )
        return Response(
            ShootingSessionSerializer(session).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        request={"soldier_seq": int, "shot_type": str, "shots": list},
        responses=dict,
        description="Process a batch of shots for a soldier",
    )
    @action(detail=True, methods=["post"])
    def process_turn(self, request, pk=None):
        """Process shots for a soldier within a session."""
        session = self.get_object()
        soldier_seq = request.data.get("soldier_seq")
        shot_type = request.data.get("shot_type", "MAIN")
        shots_data = request.data.get("shots", [])

        try:
            soldier = Soldier.objects.get(session=session, sequence_number=soldier_seq)
        except Soldier.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": f"Стрелок {soldier_seq} не найден"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = SessionService.process_shots(
            session=session,
            soldier=soldier,
            shot_type=shot_type,
            shots_data=shots_data,
        )
        return Response(result, status=status.HTTP_200_OK)

    @extend_schema(
        request={"status": str},
        responses=ShootingSessionSerializer,
        description="Transition session to a new status",
    )
    @action(detail=True, methods=["post"])
    def transition(self, request, pk=None):
        """Transition the session to a new state."""
        session = self.get_object()
        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "message": "Поле 'status' обязательно"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            session = SessionService.transition_status(session, new_status)
        except ValueError as e:
            return Response(
                {"error": {"code": "INVALID_TRANSITION", "message": str(e)}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(ShootingSessionSerializer(session).data, status=status.HTTP_200_OK)
