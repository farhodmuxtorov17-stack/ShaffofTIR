from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class NotificationType(str, Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    ERROR = "ERROR"
    TRAINING = "TRAINING"
    SYSTEM = "SYSTEM"


class AppNotification(BaseModel):
    id: str
    type: NotificationType = NotificationType.INFO
    title: str
    message: str
    is_read: bool = False
    created_at: str
    action_url: Optional[str] = None


class AnalyticsSummary(BaseModel):
    total_sessions: int
    total_shots: int
    avg_accuracy: float
    avg_score: float
    top_scorer: Optional[dict] = None
    improvement_rate: float
    total_employees_trained: int
    total_rounds_fired: int
    pass_rate: float


class PerformanceTrend(BaseModel):
    date: str
    avg_score: float
    accuracy: float
    session_count: int


class ScheduleStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class RangeSchedule(BaseModel):
    id: str
    date: str
    time_slot: str
    lane_numbers: List[int] = []
    department: str
    instructor_name: str
    employee_count: int
    status: ScheduleStatus = ScheduleStatus.SCHEDULED
    weapon_categories: List[str] = []
    notes: Optional[str] = None
