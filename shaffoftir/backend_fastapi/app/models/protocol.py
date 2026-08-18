from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class ProtocolStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    SIGNED = "SIGNED"
    REJECTED = "REJECTED"


class Protocol(BaseModel):
    id: str
    session_id: str
    employee_id: str
    employee_name: str
    employee_rank: str
    weapon_name: str
    instructor_id: str
    instructor_name: str
    date: str
    location: str
    shot_type: str
    total_shots: int
    hit_count: int
    miss_count: int
    total_score: int
    max_score: int
    accuracy: float
    qualification: Optional[str] = None
    status: ProtocolStatus = ProtocolStatus.DRAFT
    qr_code: Optional[str] = None
    signed_at: Optional[str] = None
    notes: Optional[str] = None
    created_at: str


class OperatorComment(BaseModel):
    id: str
    session_id: str
    soldier_seq: int
    author: str
    comment: str
    created_at: str


class OperatorCommentCreate(BaseModel):
    session_id: str
    soldier_seq: int
    author: str
    comment: str


class ReviewReason(BaseModel):
    id: str
    session_id: str
    soldier_seq: int
    reviewer: str
    reason: str
    created_at: str


class ReviewReasonCreate(BaseModel):
    session_id: str
    soldier_seq: int
    reviewer: str
    reason: str
