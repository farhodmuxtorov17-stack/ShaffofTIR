"""Protocols - shooting result documents, operator comments, review reasons"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.protocol import Protocol, ProtocolStatus, OperatorComment, OperatorCommentCreate, ReviewReason, ReviewReasonCreate

router = APIRouter()

PROTOCOLS: List[Protocol] = [
    Protocol(id="p001", session_id="s001", employee_id="e003", employee_name="Юлдашев Дилшод Абдуллажонович", employee_rank="Сержант", weapon_name="AK-74", instructor_id="u002", instructor_name="Махмудов С.Б.", date="2026-07-22", location="ТИР-1, дорожка 3", shot_type="MAIN", total_shots=10, hit_count=8, miss_count=2, total_score=85, max_score=100, accuracy=80, qualification="ADVANCED", status=ProtocolStatus.SIGNED, qr_code="QR-P001-2026-07-22", signed_at="2026-07-22T11:30:00Z", created_at="2026-07-22T11:00:00Z"),
    Protocol(id="p002", session_id="s002", employee_id="e006", employee_name="Каримов Азиз Улугбекович", employee_rank="Ефрейтор", weapon_name="AK-74M", instructor_id="u002", instructor_name="Махмудов С.Б.", date="2026-07-22", location="ТИР-1, дорожка 6", shot_type="MAIN", total_shots=10, hit_count=9, miss_count=1, total_score=92, max_score=100, accuracy=90, qualification="EXPERT", status=ProtocolStatus.APPROVED, qr_code="QR-P002-2026-07-22", created_at="2026-07-22T10:00:00Z"),
    Protocol(id="p003", session_id="s003", employee_id="e004", employee_name="Хасанов Отабек Рустамович", employee_rank="Рядовой", weapon_name="Makarov PM", instructor_id="u002", instructor_name="Махмудов С.Б.", date="2026-07-20", location="ТИР-1, дорожка 2", shot_type="MAIN", total_shots=10, hit_count=5, miss_count=5, total_score=48, max_score=100, accuracy=50, qualification="BEGINNER", status=ProtocolStatus.PENDING_REVIEW, created_at="2026-07-20T14:00:00Z"),
    Protocol(id="p004", session_id="s004", employee_id="e001", employee_name="Алиев Бахтиёр Убайдуллаевич", employee_rank="Капитан", weapon_name="Glock 17", instructor_id="u001", instructor_name="Тошматов Ф.Ш.", date="2026-07-19", location="ТИР-1, дорожка 1", shot_type="MAIN", total_shots=10, hit_count=7, miss_count=3, total_score=72, max_score=100, accuracy=70, qualification="ADVANCED", status=ProtocolStatus.SIGNED, qr_code="QR-P004-2026-07-19", signed_at="2026-07-19T16:00:00Z", created_at="2026-07-19T15:00:00Z"),
]

COMMENTS: List[OperatorComment] = []
REASONS: List[ReviewReason] = []


@router.get("", response_model=List[Protocol])
async def list_protocols(
    status: Optional[str] = Query(None),
    employee_id: Optional[str] = Query(None),
    session_id: Optional[str] = Query(None),
):
    result = PROTOCOLS
    if status:
        result = [p for p in result if p.status.value == status]
    if employee_id:
        result = [p for p in result if p.employee_id == employee_id]
    if session_id:
        result = [p for p in result if p.session_id == session_id]
    return result


@router.get("/{protocol_id}", response_model=Protocol)
async def get_protocol(protocol_id: str):
    for p in PROTOCOLS:
        if p.id == protocol_id:
            return p
    raise HTTPException(status_code=404, detail="Протокол не найден")


@router.post("", response_model=Protocol, status_code=201)
async def create_protocol(
    session_id: str, employee_id: str, employee_name: str, employee_rank: str,
    weapon_name: str, instructor_id: str, instructor_name: str,
    shot_type: str = "MAIN", total_shots: int = 10, hit_count: int = 0,
    miss_count: int = 0, total_score: int = 0, max_score: int = 100,
    accuracy: float = 0.0, qualification: Optional[str] = None,
    location: str = "ТИР-1",
):
    new_id = f"p{len(PROTOCOLS) + 1:03d}"
    from datetime import datetime
    now = datetime.now().isoformat()
    protocol = Protocol(
        id=new_id, session_id=session_id, employee_id=employee_id,
        employee_name=employee_name, employee_rank=employee_rank,
        weapon_name=weapon_name, instructor_id=instructor_id,
        instructor_name=instructor_name, date=now[:10], location=location,
        shot_type=shot_type, total_shots=total_shots, hit_count=hit_count,
        miss_count=miss_count, total_score=total_score, max_score=max_score,
        accuracy=accuracy, qualification=qualification,
        status=ProtocolStatus.DRAFT, created_at=now,
    )
    PROTOCOLS.append(protocol)
    return protocol


@router.post("/{protocol_id}/sign", response_model=Protocol)
async def sign_protocol(protocol_id: str):
    for i, p in enumerate(PROTOCOLS):
        if p.id == protocol_id:
            from datetime import datetime
            now = datetime.now().isoformat()
            updated = p.model_copy(update={"status": ProtocolStatus.SIGNED, "signed_at": now, "qr_code": f"QR-{p.id}-{now[:10]}"})
            PROTOCOLS[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Протокол не найден")


@router.post("/{protocol_id}/approve", response_model=Protocol)
async def approve_protocol(protocol_id: str):
    for i, p in enumerate(PROTOCOLS):
        if p.id == protocol_id:
            updated = p.model_copy(update={"status": ProtocolStatus.APPROVED})
            PROTOCOLS[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Протокол не найден")


@router.post("/{protocol_id}/reject", response_model=Protocol)
async def reject_protocol(protocol_id: str, reason: str = ""):
    for i, p in enumerate(PROTOCOLS):
        if p.id == protocol_id:
            updated = p.model_copy(update={"status": ProtocolStatus.REJECTED, "notes": reason})
            PROTOCOLS[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Протокол не найден")


@router.get("/comments/all", response_model=List[OperatorComment])
async def list_comments(session_id: Optional[str] = Query(None)):
    if session_id:
        return [c for c in COMMENTS if c.session_id == session_id]
    return COMMENTS


@router.post("/comments", response_model=OperatorComment, status_code=201)
async def create_comment(payload: OperatorCommentCreate):
    from datetime import datetime
    new_id = f"c{len(COMMENTS) + 1:03d}"
    comment = OperatorComment(id=new_id, **payload.model_dump(), created_at=datetime.now().isoformat())
    COMMENTS.append(comment)
    return comment


@router.get("/reasons/all", response_model=List[ReviewReason])
async def list_reasons(session_id: Optional[str] = Query(None)):
    if session_id:
        return [r for r in REASONS if r.session_id == session_id]
    return REASONS


@router.post("/reasons", response_model=ReviewReason, status_code=201)
async def create_reason(payload: ReviewReasonCreate):
    from datetime import datetime
    new_id = f"r{len(REASONS) + 1:03d}"
    reason = ReviewReason(id=new_id, **payload.model_dump(), created_at=datetime.now().isoformat())
    REASONS.append(reason)
    return reason
