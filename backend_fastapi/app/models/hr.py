from pydantic import BaseModel
from enum import Enum
from typing import Optional
from datetime import date


class EmployeeStatus(str, Enum):
    ACTIVE = "ACTIVE"
    RESERVE = "RESERVE"
    RETIRED = "RETIRED"
    DISMISSED = "DISMISSED"

from enum import Enum


class QualLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"


class HREmployee(BaseModel):
    id: str
    full_name: str
    rank: str
    position: str
    department: str
    region: Optional[str] = ""
    district: Optional[str] = ""
    battalion: Optional[str] = ""
    unit: str
    personal_number: str
    birth_date: str
    phone: str
    email: Optional[str] = None
    face_id_registered: bool = False
    face_id_image_url: Optional[str] = None
    status: EmployeeStatus = EmployeeStatus.ACTIVE
    hire_date: str
    shooting_qualified: bool = False
    qualification_level: Optional[QualLevel] = None
    total_sessions: int = 0
    total_score: int = 0
    avg_accuracy: float = 0.0
    last_shooting_date: Optional[str] = None
    created_at: str


class HREmployeeCreate(BaseModel):
    full_name: str
    rank: str
    position: str
    department: str
    region: Optional[str] = ""
    district: Optional[str] = ""
    battalion: Optional[str] = ""
    unit: str
    personal_number: str
    birth_date: str
    phone: str
    email: Optional[str] = None


class HRDepartment(BaseModel):
    id: str
    name: str
    code: str
    head: str
    employee_count: int
    description: Optional[str] = None
    created_at: str
