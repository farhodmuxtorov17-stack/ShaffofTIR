"""HR - Employees & Departments"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.hr import HREmployee, HREmployeeCreate, HRDepartment, EmployeeStatus, QualLevel

router = APIRouter()

EMPLOYEES: List[HREmployee] = [
    HREmployee(id="e001", full_name="Алиев Бахтиёр Убайдуллаевич", rank="Капитан", position="Командир взвода", department="1-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Юкоркорганский район", battalion="1-я рота", personal_number="AZ-2024-001", birth_date="1990-05-15", phone="+998901112233", email="aliev@mil.uz", face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2015-06-01", shooting_qualified=True, qualification_level=QualLevel.ADVANCED, total_sessions=24, total_score=1850, avg_accuracy=78, last_shooting_date="2026-07-22", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e002", full_name="Рахимов Жасур Тошпулатович", rank="Лейтенант", position="Командир отделения", department="1-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Юкоркорганский район", battalion="1-я рота", personal_number="AZ-2024-002", birth_date="1992-08-20", phone="+998902223344", email="rahimov@mil.uz", face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2017-03-15", shooting_qualified=True, qualification_level=QualLevel.INTERMEDIATE, total_sessions=18, total_score=1320, avg_accuracy=71, last_shooting_date="2026-07-20", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e003", full_name="Юлдашев Дилшод Абдуллажонович", rank="Сержант", position="Стрелок", department="1-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Юкоркорганский район", battalion="1-я рота", personal_number="AZ-2024-003", birth_date="1995-01-10", phone="+998903334455", email=None, face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2019-09-01", shooting_qualified=True, qualification_level=QualLevel.EXPERT, total_sessions=32, total_score=2400, avg_accuracy=85, last_shooting_date="2026-07-22", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e004", full_name="Хасанов Отабек Рустамович", rank="Рядовой", position="Стрелок", department="1-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Юкоркорганский район", battalion="1-я рота", personal_number="AZ-2024-004", birth_date="2000-03-25", phone="+998904445566", email=None, face_id_registered=False, status=EmployeeStatus.ACTIVE, hire_date="2023-01-15", shooting_qualified=True, qualification_level=QualLevel.BEGINNER, total_sessions=4, total_score=220, avg_accuracy=48, last_shooting_date="2026-07-15", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e005", full_name="Махмудов Сардор Бахтиёрович", rank="Ст. сержант", position="Зам. командира взвода", department="1-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Юкоркорганский район", battalion="1-я рота", personal_number="AZ-2024-005", birth_date="1988-11-30", phone="+998905556677", email="mahmudov@mil.uz", face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2012-05-20", shooting_qualified=True, qualification_level=QualLevel.EXPERT, total_sessions=45, total_score=3200, avg_accuracy=91, last_shooting_date="2026-07-22", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e006", full_name="Каримов Азиз Улугбекович", rank="Ефрейтор", position="Стрелок-снайпер", department="2-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Кибрайский район", battalion="2-я рота", personal_number="AZ-2024-006", birth_date="1993-07-12", phone="+998906667788", email="karimov@mil.uz", face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2016-11-01", shooting_qualified=True, qualification_level=QualLevel.EXPERT, total_sessions=38, total_score=2800, avg_accuracy=88, last_shooting_date="2026-07-22", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e007", full_name="Эргашев Бекзод Турсунович", rank="Рядовой", position="Стрелок", department="2-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Кибрайский район", battalion="2-я рота", personal_number="AZ-2024-007", birth_date="2001-02-14", phone="+998907778899", email=None, face_id_registered=False, status=EmployeeStatus.RESERVE, hire_date="2024-01-10", shooting_qualified=False, qualification_level=QualLevel.BEGINNER, total_sessions=1, total_score=60, avg_accuracy=38, last_shooting_date="2026-05-15", created_at="2024-01-10T00:00:00Z"),
    HREmployee(id="e008", full_name="Тошматов Фирдавс Шерзодович", rank="Старшина", position="Старший инструктор", department="Огневая подготовка", unit="Штаб", region="Ташкентская область", district="Мирабадский район", battalion="Огневая подготовка", personal_number="AZ-2024-008", birth_date="1985-09-05", phone="+998908889900", email="toshmatov@mil.uz", face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2008-04-15", shooting_qualified=True, qualification_level=QualLevel.EXPERT, total_sessions=120, total_score=9800, avg_accuracy=95, last_shooting_date="2026-07-21", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e009", full_name="Норматов Жамшид Анварович", rank="Сержант", position="Стрелок", department="2-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Кибрайский район", battalion="2-я рота", personal_number="AZ-2024-009", birth_date="1994-04-18", phone="+998911223344", email=None, face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2018-07-01", shooting_qualified=True, qualification_level=QualLevel.INTERMEDIATE, total_sessions=16, total_score=1180, avg_accuracy=68, last_shooting_date="2026-07-18", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e010", full_name="Умаров Шерзод Бахтиёрович", rank="Рядовый", position="Стрелок", department="2-я рота", unit="Батальон \"Ширин\"", region="Ташкентская область", district="Кибрайский район", battalion="2-я рота", personal_number="AZ-2024-010", birth_date="1999-12-03", phone="+998912233455", email=None, face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2022-06-15", shooting_qualified=True, qualification_level=QualLevel.BEGINNER, total_sessions=6, total_score=340, avg_accuracy=52, last_shooting_date="2026-07-14", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e011", full_name="Кадыров Улугбек Тошпулатович", rank="Ст. лейтенант", position="Командир взвода", department="3-я рота", unit="Батальон \"Ширин\"", region="Самаркандская область", district="Самаркандский район", battalion="3-я рота", personal_number="AZ-2024-011", birth_date="1989-06-22", phone="+998913344566", email="kadyrov@mil.uz", face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2014-02-10", shooting_qualified=True, qualification_level=QualLevel.ADVANCED, total_sessions=28, total_score=2100, avg_accuracy=80, last_shooting_date="2026-07-19", created_at="2024-01-01T00:00:00Z"),
    HREmployee(id="e012", full_name="Собиров Бахром Исломович", rank="Сержант", position="Стрелок", department="3-я рота", unit="Батальон \"Ширин\"", region="Самаркандская область", district="Самаркандский район", battalion="3-я рота", personal_number="AZ-2024-012", birth_date="1996-10-08", phone="+998914455678", email=None, face_id_registered=True, status=EmployeeStatus.ACTIVE, hire_date="2020-03-01", shooting_qualified=True, qualification_level=QualLevel.INTERMEDIATE, total_sessions=14, total_score=980, avg_accuracy=65, last_shooting_date="2026-07-16", created_at="2024-01-01T00:00:00Z"),
]

DEPARTMENTS = [
    HRDepartment(id="d001", name="1-я рота", code="1R", head="Алиев Б.У.", employee_count=5, created_at="2024-01-01T00:00:00Z"),
    HRDepartment(id="d002", name="2-я рота", code="2R", head="Каримов А.У.", employee_count=5, created_at="2024-01-01T00:00:00Z"),
    HRDepartment(id="d003", name="3-я рота", code="3R", head="Кадыров У.Т.", employee_count=4, created_at="2024-01-01T00:00:00Z"),
    HRDepartment(id="d004", name="Огневая подготовка", code="OP", head="Тошматов Ф.Ш.", employee_count=3, created_at="2024-01-01T00:00:00Z"),
    HRDepartment(id="d005", name="Разведвзвод", code="RV", head="Назаров Б.Х.", employee_count=4, created_at="2024-01-01T00:00:00Z"),
]


@router.get("/employees", response_model=List[HREmployee])
async def list_employees(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=500),
    offset: int = Query(0),
):
    result = EMPLOYEES
    if search:
        s = search.lower()
        result = [e for e in result if s in e.full_name.lower() or s in e.personal_number.lower()]
    if department:
        result = [e for e in result if e.department == department]
    if status:
        result = [e for e in result if e.status.value == status]
    return result[offset:offset + limit]


@router.get("/employees/{employee_id}", response_model=HREmployee)
async def get_employee(employee_id: str):
    for e in EMPLOYEES:
        if e.id == employee_id:
            return e
    raise HTTPException(status_code=404, detail="Сотрудник не найден")


@router.post("/employees", response_model=HREmployee, status_code=201)
async def create_employee(payload: HREmployeeCreate):
    new_id = f"e{len(EMPLOYEES) + 1:03d}"
    emp = HREmployee(
        id=new_id, **payload.model_dump(),
        face_id_registered=False, status=EmployeeStatus.ACTIVE,
        hire_date="2026-01-01", shooting_qualified=False,
        total_sessions=0, total_score=0, avg_accuracy=0.0,
        created_at="2026-01-01T00:00:00Z",
    )
    EMPLOYEES.append(emp)
    return emp


@router.put("/employees/{employee_id}", response_model=HREmployee)
async def update_employee(employee_id: str, payload: HREmployeeCreate):
    for i, e in enumerate(EMPLOYEES):
        if e.id == employee_id:
            updated = e.model_copy(update=payload.model_dump(exclude_unset=True))
            EMPLOYEES[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Сотрудник не найден")


@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str):
    for i, e in enumerate(EMPLOYEES):
        if e.id == employee_id:
            EMPLOYEES.pop(i)
            return {"message": "Сотрудник удалён"}
    raise HTTPException(status_code=404, detail="Сотрудник не найден")


@router.get("/departments", response_model=List[HRDepartment])
async def list_departments():
    return DEPARTMENTS


@router.get("/departments/{dept_id}", response_model=HRDepartment)
async def get_department(dept_id: str):
    for d in DEPARTMENTS:
        if d.id == dept_id:
            return d
    raise HTTPException(status_code=404, detail="Подразделение не найдено")
