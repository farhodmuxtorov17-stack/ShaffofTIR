"""
Shooting session models with state machine semantics.

The session lifecycle follows a strict state machine:
    IDLE → CREATED → TEST_READY → TEST_ACTIVE → TEST_COMPLETED
         → MAIN_READY → MAIN_ACTIVE → MAIN_COMPLETED → REVIEW → APPROVED → ARCHIVED

Scoring supports two modes (bifurcation):
    POINTS: numeric scores per shot (0-10)
    HIT_MISS: binary hit/miss per shot
"""
from django.db import models
from django.utils import timezone
import uuid
from enum import Enum


class SessionStatus(str, Enum):
    IDLE = "IDLE"
    CREATED = "SESSION_CREATED"
    TEST_READY = "TEST_READY"
    TEST_ACTIVE = "TEST_ACTIVE"
    TEST_PROCESSING = "TEST_PROCESSING"
    TEST_COMPLETED = "TEST_COMPLETED"
    MAIN_READY = "MAIN_READY"
    MAIN_ACTIVE = "MAIN_ACTIVE"
    MAIN_PROCESSING = "MAIN_PROCESSING"
    MAIN_COMPLETED = "MAIN_COMPLETED"
    REVIEW = "REVIEW"
    APPROVED = "APPROVED"
    ARCHIVED = "ARCHIVED"

    @classmethod
    def choices(cls):
        return [(s.value, s.value) for s in cls]


class ScoringMode(str, Enum):
    POINTS = "POINTS"
    HIT_MISS = "HIT_MISS"

    @classmethod
    def choices(cls):
        return [(m.value, m.value) for m in cls]


class ShotType(str, Enum):
    TEST = "TEST"
    MAIN = "MAIN"

    @classmethod
    def choices(cls):
        return [(t.value, t.value) for t in cls]


# Valid state transitions for the session FSM
VALID_TRANSITIONS: dict[str, set[str]] = {
    SessionStatus.IDLE.value: {SessionStatus.CREATED.value},
    SessionStatus.CREATED.value: {SessionStatus.TEST_READY.value},
    SessionStatus.TEST_READY.value: {SessionStatus.TEST_ACTIVE.value},
    SessionStatus.TEST_ACTIVE.value: {SessionStatus.TEST_PROCESSING.value, SessionStatus.TEST_COMPLETED.value},
    SessionStatus.TEST_PROCESSING.value: {SessionStatus.TEST_COMPLETED.value},
    SessionStatus.TEST_COMPLETED.value: {SessionStatus.MAIN_READY.value},
    SessionStatus.MAIN_READY.value: {SessionStatus.MAIN_ACTIVE.value},
    SessionStatus.MAIN_ACTIVE.value: {SessionStatus.MAIN_PROCESSING.value, SessionStatus.MAIN_COMPLETED.value},
    SessionStatus.MAIN_PROCESSING.value: {SessionStatus.MAIN_COMPLETED.value},
    SessionStatus.MAIN_COMPLETED.value: {SessionStatus.REVIEW.value},
    SessionStatus.REVIEW.value: {SessionStatus.APPROVED.value},
    SessionStatus.APPROVED.value: {SessionStatus.ARCHIVED.value},
    SessionStatus.ARCHIVED.value: set(),
}


class ShootingSession(models.Model):
    """A single shooting session on a lane."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=100, unique=True, blank=True, db_index=True)

    # Range
    range = models.CharField(max_length=255, blank=True, null=True)
    range_name = models.CharField(max_length=255, blank=True, null=True)
    range_type = models.CharField(
        max_length=10,
        choices=[("OPEN", "Open"), ("CLOSED", "Closed")],
        default="CLOSED",
    )

    # Lane
    lane_number = models.IntegerField(blank=True, null=True)
    lane_id = models.CharField(max_length=255, blank=True, null=True)

    # Rubeg (only for OPEN ranges)
    rubeg_number = models.IntegerField(blank=True, null=True)
    rubeg_id = models.CharField(max_length=255, blank=True, null=True)

    # State
    status = models.CharField(
        max_length=25,
        choices=SessionStatus.choices(),
        default=SessionStatus.CREATED.value,
        db_index=True,
    )
    scoring_mode = models.CharField(
        max_length=10,
        choices=ScoringMode.choices(),
        default=ScoringMode.POINTS.value,
    )

    # Config
    distance = models.IntegerField(default=25)
    soldier_count = models.IntegerField(default=0)

    # Instructor
    instructor_id = models.CharField(max_length=255, blank=True, null=True)
    instructor_name = models.CharField(max_length=255, blank=True, null=True)

    # Employee (denormalised for query performance)
    employee_id = models.CharField(max_length=255, blank=True, null=True)
    employee_name = models.CharField(max_length=255, blank=True, null=True)
    employee_rank = models.CharField(max_length=100, blank=True, null=True)
    employee_department = models.CharField(max_length=255, blank=True, null=True)
    employee_unit = models.CharField(max_length=255, blank=True, null=True)

    # Weapon
    weapon_id = models.CharField(max_length=255, blank=True, null=True)
    weapon_name = models.CharField(max_length=255, blank=True, null=True)
    weapon_category = models.CharField(max_length=50, blank=True, null=True)

    # Scoring (computed from Shot records)
    total_score = models.IntegerField(default=0)
    total_shots = models.IntegerField(default=0)
    hit_count = models.IntegerField(default=0)
    miss_count = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)

    # Baseline for improvement tracking
    baseline_score = models.IntegerField(default=0)

    # Metadata
    session_type = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "shooting_sessions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["employee_id", "created_at"]),
            models.Index(fields=["instructor_id", "created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.session_id:
            # Generate a human-readable ID after first save (has PK)
            super().save(*args, **kwargs)
            self.session_id = f"sh-{str(self.id)[:8]}"
            super().save(update_fields=["session_id"])
            return
        super().save(*args, **kwargs)

    def transition_to(self, new_status: str) -> None:
        """Validate and apply a state transition.

        Raises ValueError if the transition is not allowed.
        """
        if new_status not in VALID_TRANSITIONS.get(self.status, set()):
            raise ValueError(
                f"Invalid transition: {self.status} → {new_status}"
            )
        self.status = new_status
        if new_status == SessionStatus.APPROVED.value:
            self.completed_at = timezone.now()
        self.save(update_fields=["status", "completed_at", "updated_at"])

    def __str__(self) -> str:
        return f"{self.session_id} — {self.employee_name or 'N/A'}"


class Soldier(models.Model):
    """A shooter within a session (one session can have N soldiers)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ShootingSession,
        on_delete=models.CASCADE,
        related_name="soldiers",
    )
    sequence_number = models.IntegerField()
    employee_id = models.CharField(max_length=255, blank=True, null=True)
    employee_name = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=50, default="WAITING")
    test_image_url = models.URLField(blank=True, null=True)
    main_image_url = models.URLField(blank=True, null=True)

    # Scoring
    total_score = models.IntegerField(default=0)
    hit_count = models.IntegerField(default=0)
    miss_count = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "soldiers"
        ordering = ["sequence_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["session", "sequence_number"],
                name="unique_soldier_sequence_per_session",
            ),
        ]


class Shot(models.Model):
    """An individual shot within a session/soldier."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ShootingSession,
        on_delete=models.CASCADE,
        related_name="shots",
        blank=True,
        null=True,
    )
    soldier = models.ForeignKey(
        Soldier,
        on_delete=models.CASCADE,
        related_name="shots",
        blank=True,
        null=True,
    )
    shot_type = models.CharField(
        max_length=10,
        choices=ShotType.choices(),
        default=ShotType.MAIN.value,
    )
    x = models.FloatField(default=0.0)
    y = models.FloatField(default=0.0)
    score = models.IntegerField(default=0)
    is_hit = models.BooleanField(default=False)
    soldier_seq = models.IntegerField(blank=True, null=True)
    shot_number = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "shots"
        ordering = ["timestamp"]
        indexes = [
            models.Index(fields=["session", "shot_type"]),
            models.Index(fields=["soldier", "shot_type"]),
        ]
