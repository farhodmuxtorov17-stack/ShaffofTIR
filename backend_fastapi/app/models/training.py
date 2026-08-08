from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

from app.models.weapons import WeaponCategory


class TrainingDifficulty(str, Enum):
    BASIC = "BASIC"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    ELITE = "ELITE"


class TrainingPlan(BaseModel):
    id: str
    name: str
    description: str
    difficulty: TrainingDifficulty
    duration_minutes: int
    required_shots: int
    target_distance_m: int
    weapon_categories: List[WeaponCategory] = []
    passing_score: int
    assigned_count: int = 0
    completed_count: int = 0
    created_at: str


class TrainingPlanCreate(BaseModel):
    name: str
    description: str
    difficulty: TrainingDifficulty
    duration_minutes: int = 60
    required_shots: int = 10
    target_distance_m: int = 25
    weapon_categories: List[WeaponCategory] = []
    passing_score: int = 70


class AssignmentStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    OVERDUE = "OVERDUE"


class TrainingAssignment(BaseModel):
    id: str
    plan_id: str
    plan_name: str
    employee_id: str
    employee_name: str
    status: AssignmentStatus = AssignmentStatus.ASSIGNED
    assigned_at: str
    due_date: str
    completed_at: Optional[str] = None
    score: Optional[int] = None
    instructor_id: str
    instructor_name: str
