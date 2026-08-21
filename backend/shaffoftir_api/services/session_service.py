"""
Session service — business logic for shooting sessions.

Handles:
- Session creation with soldier pre-population
- Shot processing and score recalculation
- State machine transitions
- Pass/fail determination based on scoring mode
"""
import logging
from typing import Any
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from ..models.session import (
    ShootingSession, Soldier, Shot,
    SessionStatus, ScoringMode, ShotType, VALID_TRANSITIONS,
)
from ..serializers.session import ShootingSessionSerializer, ShotSerializer

logger = logging.getLogger("shaffoftir_api.services.session")


class SessionService:
    """Encapsulates session lifecycle operations."""

    # Minimum accuracy to pass (configurable per session in future)
    PASS_THRESHOLD = 60.0

    @staticmethod
    @transaction.atomic
    def create_session(
        *,
        soldier_count: int = 1,
        scoring_mode: str = ScoringMode.POINTS.value,
        range_type: str = "CLOSED",
        distance: int = 25,
        **extra_fields: Any,
    ) -> ShootingSession:
        """Create a new session with the given number of soldiers.

        Args:
            soldier_count: Number of soldiers (1-10).
            scoring_mode: POINTS or HIT_MISS.
            range_type: OPEN or CLOSED.
            distance: Shooting distance in meters.
            **extra_fields: Additional session fields (employee_name, weapon_name, etc.)

        Returns:
            The created ShootingSession instance.

        Raises:
            ValidationError: If soldier_count is out of range.
        """
        if not 1 <= soldier_count <= 10:
            raise ValidationError("Количество стрелков должно быть от 1 до 10.")

        session = ShootingSession.objects.create(
            status=SessionStatus.CREATED.value,
            scoring_mode=scoring_mode,
            range_type=range_type,
            distance=distance,
            soldier_count=soldier_count,
            **extra_fields,
        )

        soldiers = [
            Soldier(session=session, sequence_number=i, status="WAITING")
            for i in range(1, soldier_count + 1)
        ]
        Soldier.objects.bulk_create(soldiers)

        logger.info("Session %s created with %d soldiers", session.session_id, soldier_count)
        return session

    @staticmethod
    @transaction.atomic
    def process_shots(
        *,
        session: ShootingSession,
        soldier: Soldier,
        shot_type: str = ShotType.MAIN.value,
        shots_data: list[dict] | None = None,
    ) -> dict:
        """Process a batch of shots for a soldier and update all stats.

        Args:
            session: The shooting session.
            soldier: The soldier who fired the shots.
            shot_type: TEST or MAIN.
            shots_data: List of shot dicts with x, y, score, is_hit.

        Returns:
            Dict with updated session and soldier statistics.
        """
        if shots_data is None:
            shots_data = []

        new_shots = []
        for i, shot_data in enumerate(shots_data):
            # In HIT_MISS mode, is_hit comes directly; in POINTS mode, derive from score
            if session.scoring_mode == ScoringMode.HIT_MISS.value:
                is_hit = shot_data.get("is_hit", False)
                score_val = 1 if is_hit else 0
            else:
                score_val = shot_data.get("score", 0)
                is_hit = score_val > 0
            shot = Shot.objects.create(
                session=session,
                soldier=soldier,
                shot_type=shot_type,
                x=shot_data.get("x", 0),
                y=shot_data.get("y", 0),
                score=score_val,
                is_hit=is_hit,
                soldier_seq=soldier.sequence_number,
                shot_number=i + 1,
            )
            new_shots.append(shot)

        # Recalculate soldier stats from all shots
        all_shots = Shot.objects.filter(soldier=soldier)
        soldier.total_score = sum(s.score for s in all_shots)
        soldier.hit_count = all_shots.filter(is_hit=True).count()
        soldier.miss_count = all_shots.filter(is_hit=False).count()
        total = soldier.hit_count + soldier.miss_count
        soldier.accuracy = round(soldier.hit_count / total * 100, 1) if total > 0 else 0
        if session.scoring_mode == ScoringMode.HIT_MISS.value:
            # HIT_MISS: pass if hit_rate >= threshold (simpler, binary)
            soldier.passed = soldier.accuracy >= SessionService.PASS_THRESHOLD
        else:
            # POINTS: pass based on total score relative to max possible
            max_possible = total * 10  # max 10 points per shot
            soldier.passed = (soldier.total_score / max_possible * 100) >= SessionService.PASS_THRESHOLD if max_possible > 0 else False
        soldier.save()

        # Recalculate session stats from all shots
        all_session_shots = Shot.objects.filter(session=session)
        session.total_shots = all_session_shots.count()
        session.hit_count = all_session_shots.filter(is_hit=True).count()
        session.miss_count = session.total_shots - session.hit_count
        session.total_score = sum(s.score for s in all_session_shots)
        session.accuracy = (
            round(session.hit_count / session.total_shots * 100, 1)
            if session.total_shots > 0 else 0
        )
        if session.scoring_mode == ScoringMode.HIT_MISS.value:
            session.passed = session.accuracy >= SessionService.PASS_THRESHOLD
        else:
            max_possible = session.total_shots * 10
            session.passed = (session.total_score / max_possible * 100) >= SessionService.PASS_THRESHOLD if max_possible > 0 else False
        session.save()

        logger.info(
            "Processed %d shots for soldier %d in session %s (accuracy: %.1f%%)",
            len(new_shots), soldier.sequence_number, session.session_id, soldier.accuracy,
        )

        return {
            "session_id": session.session_id,
            "soldier_sequence": soldier.sequence_number,
            "new_shots": ShotSerializer(new_shots, many=True).data,
            "total_score": soldier.total_score,
            "hit_count": soldier.hit_count,
            "miss_count": soldier.miss_count,
            "accuracy": soldier.accuracy,
            "passed": soldier.passed,
        }

    @staticmethod
    def transition_status(session: ShootingSession, new_status: str) -> ShootingSession:
        """Transition a session to a new status via the FSM.

        Args:
            session: The session to transition.
            new_status: Target status.

        Returns:
            The updated session.

        Raises:
            ValueError: If the transition is invalid.
        """
        if new_status not in VALID_TRANSITIONS.get(session.status, set()):
            raise ValueError(
                f"Недопустимый переход: {session.status} → {new_status}"
            )

        session.status = new_status
        if new_status == SessionStatus.APPROVED.value:
            session.completed_at = timezone.now()
        session.save(update_fields=["status", "completed_at", "updated_at"])

        logger.info("Session %s transitioned: %s → %s", session.session_id, session.status, new_status)
        return session
