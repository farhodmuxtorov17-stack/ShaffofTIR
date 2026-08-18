"""Training - Plans, Assignments"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.training import TrainingPlan, TrainingPlanCreate, TrainingAssignment, TrainingDifficulty, AssignmentStatus

router = APIRouter()

PLANS: List[TrainingPlan] = [
    TrainingPlan(id="t001", name="Базовая стрельба", description="Основы стрельбы из пистолета. 10 выстрелов, 25 метров.", difficulty=TrainingDifficulty.BASIC, duration_minutes=60, required_shots=10, target_distance_m=25, weapon_categories=["PISTOL"], passing_score=60, assigned_count=12, completed_count=8, created_at="2024-01-15T00:00:00Z"),
    TrainingPlan(id="t002", name="Тактическая стрельба", description="Тактическая стрельба из автомата. 30 выстрелов, 100 метров.", difficulty=TrainingDifficulty.INTERMEDIATE, duration_minutes=90, required_shots=30, target_distance_m=100, weapon_categories=["RIFLE", "SMG"], passing_score=70, assigned_count=8, completed_count=5, created_at="2024-02-01T00:00:00Z"),
    TrainingPlan(id="t003", name="Снайперская подготовка", description="Снайперская стрельба. 15 выстрелов, 300 метров.", difficulty=TrainingDifficulty.ADVANCED, duration_minutes=120, required_shots=15, target_distance_m=300, weapon_categories=["SNIPER"], passing_score=80, assigned_count=4, completed_count=2, created_at="2024-02-15T00:00:00Z"),
    TrainingPlan(id="t004", name="Ночной бой", description="Стрельба в ночных условиях с приборами ночного видения.", difficulty=TrainingDifficulty.ELITE, duration_minutes=120, required_shots=20, target_distance_m=50, weapon_categories=["RIFLE", "PISTOL"], passing_score=75, assigned_count=6, completed_count=1, created_at="2024-03-01T00:00:00Z"),
    TrainingPlan(id="t005", name="Стрельба в движении", description="Стрельба на ходу по движущимся мишеням.", difficulty=TrainingDifficulty.ADVANCED, duration_minutes=90, required_shots=25, target_distance_m=50, weapon_categories=["SMG", "PISTOL"], passing_score=75, assigned_count=5, completed_count=3, created_at="2024-03-15T00:00:00Z"),
]

ASSIGNMENTS: List[TrainingAssignment] = [
    TrainingAssignment(id="ta001", plan_id="t001", plan_name="Базовая стрельба", employee_id="e004", employee_name="Хасанов О.Р.", status=AssignmentStatus.COMPLETED, assigned_at="2026-06-15T00:00:00Z", due_date="2026-07-15T00:00:00Z", completed_at="2026-07-10T00:00:00Z", score=65, instructor_id="u002", instructor_name="Махмудов С.Б."),
    TrainingAssignment(id="ta002", plan_id="t002", plan_name="Тактическая стрельба", employee_id="e003", employee_name="Юлдашев Д.А.", status=AssignmentStatus.COMPLETED, assigned_at="2026-06-20T00:00:00Z", due_date="2026-07-20T00:00:00Z", completed_at="2026-07-18T00:00:00Z", score=82, instructor_id="u002", instructor_name="Махмудов С.Б."),
    TrainingAssignment(id="ta003", plan_id="t003", plan_name="Снайперская подготовка", employee_id="e006", employee_name="Каримов А.У.", status=AssignmentStatus.IN_PROGRESS, assigned_at="2026-07-01T00:00:00Z", due_date="2026-08-01T00:00:00Z", instructor_id="u002", instructor_name="Махмудов С.Б."),
    TrainingAssignment(id="ta004", plan_id="t005", plan_name="Стрельба в движении", employee_id="e009", employee_name="Норматов Ж.А.", status=AssignmentStatus.ASSIGNED, assigned_at="2026-07-20T00:00:00Z", due_date="2026-08-20T00:00:00Z", instructor_id="u002", instructor_name="Махмудов С.Б."),
    TrainingAssignment(id="ta005", plan_id="t004", plan_name="Ночной бой", employee_id="e005", employee_name="Махмудов С.Б.", status=AssignmentStatus.OVERDUE, assigned_at="2026-05-01T00:00:00Z", due_date="2026-07-01T00:00:00Z", instructor_id="u001", instructor_name="Тошматов Ф.Ш."),
]


@router.get("/plans", response_model=List[TrainingPlan])
async def list_plans(
    difficulty: Optional[str] = Query(None),
):
    if difficulty:
        return [p for p in PLANS if p.difficulty.value == difficulty]
    return PLANS


@router.get("/plans/{plan_id}", response_model=TrainingPlan)
async def get_plan(plan_id: str):
    for p in PLANS:
        if p.id == plan_id:
            return p
    raise HTTPException(status_code=404, detail="План не найден")


@router.post("/plans", response_model=TrainingPlan, status_code=201)
async def create_plan(payload: TrainingPlanCreate):
    new_id = f"t{len(PLANS) + 1:03d}"
    plan = TrainingPlan(id=new_id, **payload.model_dump(), assigned_count=0, completed_count=0, created_at="2026-01-01T00:00:00Z")
    PLANS.append(plan)
    return plan


@router.put("/plans/{plan_id}", response_model=TrainingPlan)
async def update_plan(plan_id: str, payload: TrainingPlanCreate):
    for i, p in enumerate(PLANS):
        if p.id == plan_id:
            updated = p.model_copy(update=payload.model_dump(exclude_unset=True))
            PLANS[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="План не найден")


@router.delete("/plans/{plan_id}")
async def delete_plan(plan_id: str):
    for i, p in enumerate(PLANS):
        if p.id == plan_id:
            PLANS.pop(i)
            return {"message": "План удалён"}
    raise HTTPException(status_code=404, detail="План не найден")


@router.get("/assignments", response_model=List[TrainingAssignment])
async def list_assignments(
    status: Optional[str] = Query(None),
    employee_id: Optional[str] = Query(None),
):
    result = ASSIGNMENTS
    if status:
        result = [a for a in result if a.status.value == status]
    if employee_id:
        result = [a for a in result if a.employee_id == employee_id]
    return result
