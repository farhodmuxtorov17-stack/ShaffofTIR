"""Range Schedule - booking shooting lanes"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.misc import RangeSchedule, ScheduleStatus

router = APIRouter()

SCHEDULES: List[RangeSchedule] = [
    RangeSchedule(id="sch001", date="2026-07-25", time_slot="08:00-10:00", lane_numbers=[1,2,3], department="1-я рота", instructor_name="Махмудов С.Б.", employee_count=12, status=ScheduleStatus.SCHEDULED, weapon_categories=["PISTOL","RIFLE"]),
    RangeSchedule(id="sch002", date="2026-07-25", time_slot="10:00-12:00", lane_numbers=[4,5,6], department="2-я рота", instructor_name="Тошматов Ф.Ш.", employee_count=10, status=ScheduleStatus.SCHEDULED, weapon_categories=["RIFLE"]),
    RangeSchedule(id="sch003", date="2026-07-26", time_slot="08:00-10:00", lane_numbers=[1,2], department="3-я рота", instructor_name="Кадыров У.Т.", employee_count=8, status=ScheduleStatus.SCHEDULED, weapon_categories=["SMG"]),
    RangeSchedule(id="sch004", date="2026-07-22", time_slot="08:00-12:00", lane_numbers=[1,2,3,4,5,6,7], department="Огневая подготовка", instructor_name="Тошматов Ф.Ш.", employee_count=20, status=ScheduleStatus.COMPLETED, weapon_categories=["PISTOL","RIFLE","SNIPER"]),
    RangeSchedule(id="sch005", date="2026-07-27", time_slot="14:00-16:00", lane_numbers=[3,4,5], department="Разведвзвод", instructor_name="Махмудов С.Б.", employee_count=6, status=ScheduleStatus.SCHEDULED, weapon_categories=["SNIPER","RIFLE"]),
]


@router.get("", response_model=List[RangeSchedule])
async def list_schedules(
    date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    result = SCHEDULES
    if date:
        result = [s for s in result if s.date == date]
    if status:
        result = [s for s in result if s.status.value == status]
    return result


@router.post("", response_model=RangeSchedule, status_code=201)
async def create_schedule(
    date: str, time_slot: str, lane_numbers: List[int],
    department: str, instructor_name: str, employee_count: int = 10,
    weapon_categories: List[str] = [], notes: Optional[str] = None,
):
    new_id = f"sch{len(SCHEDULES) + 1:03d}"
    sched = RangeSchedule(
        id=new_id, date=date, time_slot=time_slot, lane_numbers=lane_numbers,
        department=department, instructor_name=instructor_name,
        employee_count=employee_count, status=ScheduleStatus.SCHEDULED,
        weapon_categories=weapon_categories, notes=notes,
    )
    SCHEDULES.append(sched)
    return sched


@router.put("/{schedule_id}/status", response_model=RangeSchedule)
async def update_status(schedule_id: str, status: str):
    for i, s in enumerate(SCHEDULES):
        if s.id == schedule_id:
            updated = s.model_copy(update={"status": ScheduleStatus(status)})
            SCHEDULES[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Расписание не найдено")


@router.delete("/{schedule_id}")
async def delete_schedule(schedule_id: str):
    for i, s in enumerate(SCHEDULES):
        if s.id == schedule_id:
            SCHEDULES.pop(i)
            return {"message": "Расписание удалено"}
    raise HTTPException(status_code=404, detail="Расписание не найдено")
