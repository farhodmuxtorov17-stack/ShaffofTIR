"""Weapons - CRUD, assignments"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.weapons import Weapon, WeaponCreate, WeaponAssignment, WeaponCategory, WeaponStatus, WeaponCondition

router = APIRouter()

WEAPONS: List[Weapon] = [
    Weapon(id="w001", name="Makarov PM", category=WeaponCategory.PISTOL, serial_number="PM-2024-001", caliber="9mm", manufacturer="Ижмаш", status=WeaponStatus.AVAILABLE, condition=WeaponCondition.EXCELLENT, total_shots_fired=1200, max_range_m=50, ammo_type="9x18mm", created_at="2024-01-01T00:00:00Z"),
    Weapon(id="w002", name="AK-74", category=WeaponCategory.RIFLE, serial_number="AK-2024-002", caliber="5.45x39", manufacturer="Ижмаш", status=WeaponStatus.IN_USE, condition=WeaponCondition.GOOD, assigned_to="e003", total_shots_fired=5500, max_range_m=500, ammo_type="5.45x39mm", created_at="2024-01-01T00:00:00Z"),
    Weapon(id="w003", name="SVD Dragunov", category=WeaponCategory.SNIPER, serial_number="SVD-2024-003", caliber="7.62x54R", manufacturer="Ижмаш", status=WeaponStatus.AVAILABLE, condition=WeaponCondition.EXCELLENT, total_shots_fired=800, max_range_m=1300, ammo_type="7.62x54R", created_at="2024-01-01T00:00:00Z"),
    Weapon(id="w004", name="PKM", category=WeaponCategory.MACHINE_GUN, serial_number="PKM-2024-004", caliber="7.62x54R", manufacturer="Ижмаш", status=WeaponStatus.MAINTENANCE, condition=WeaponCondition.FAIR, total_shots_fired=12000, last_maintenance="2026-07-10", max_range_m=1500, ammo_type="7.62x54R", created_at="2024-01-01T00:00:00Z"),
    Weapon(id="w005", name="Glock 17", category=WeaponCategory.PISTOL, serial_number="GL-2024-005", caliber="9mm", manufacturer="Glock", status=WeaponStatus.AVAILABLE, condition=WeaponCondition.GOOD, total_shots_fired=3400, max_range_m=50, ammo_type="9x19mm", created_at="2024-01-01T00:00:00Z"),
    Weapon(id="w006", name="AK-74M", category=WeaponCategory.RIFLE, serial_number="AK-2024-006", caliber="5.45x39", manufacturer="Ижмаш", status=WeaponStatus.IN_USE, condition=WeaponCondition.GOOD, assigned_to="e006", total_shots_fired=3200, max_range_m=500, ammo_type="5.45x39mm", created_at="2024-01-01T00:00:00Z"),
    Weapon(id="w007", name="M4A1", category=WeaponCategory.RIFLE, serial_number="M4-2024-007", caliber="5.56x45", manufacturer="Colt", status=WeaponStatus.AVAILABLE, condition=WeaponCondition.EXCELLENT, total_shots_fired=900, max_range_m=500, ammo_type="5.56x45mm", created_at="2024-01-01T00:00:00Z"),
    Weapon(id="w008", name="MP-5", category=WeaponCategory.SMG, serial_number="MP5-2024-008", caliber="9mm", manufacturer="H&K", status=WeaponStatus.AVAILABLE, condition=WeaponCondition.GOOD, total_shots_fired=2100, max_range_m=200, ammo_type="9x19mm", created_at="2024-01-01T00:00:00Z"),
]

ASSIGNMENTS: List[WeaponAssignment] = [
    WeaponAssignment(id="a001", weapon_id="w002", weapon_name="AK-74", employee_id="e003", employee_name="Юлдашев Д.А.", session_id="s001", assigned_at="2026-07-22T08:00:00Z", rounds_fired=30, status="RETURNED"),
    WeaponAssignment(id="a002", weapon_id="w006", weapon_name="AK-74M", employee_id="e006", employee_name="Каримов А.У.", session_id="s002", assigned_at="2026-07-22T10:00:00Z", status="ASSIGNED"),
]


@router.get("", response_model=List[Weapon])
async def list_weapons(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    result = WEAPONS
    if category:
        result = [w for w in result if w.category.value == category]
    if status:
        result = [w for w in result if w.status.value == status]
    if search:
        s = search.lower()
        result = [w for w in result if s in w.name.lower() or s in w.serial_number.lower()]
    return result


@router.get("/{weapon_id}", response_model=Weapon)
async def get_weapon(weapon_id: str):
    for w in WEAPONS:
        if w.id == weapon_id:
            return w
    raise HTTPException(status_code=404, detail="Оружие не найдено")


@router.post("", response_model=Weapon, status_code=201)
async def create_weapon(payload: WeaponCreate):
    new_id = f"w{len(WEAPONS) + 1:03d}"
    weapon = Weapon(id=new_id, **payload.model_dump(), created_at="2026-01-01T00:00:00Z")
    WEAPONS.append(weapon)
    return weapon


@router.put("/{weapon_id}", response_model=Weapon)
async def update_weapon(weapon_id: str, payload: WeaponCreate):
    for i, w in enumerate(WEAPONS):
        if w.id == weapon_id:
            updated = w.model_copy(update=payload.model_dump(exclude_unset=True))
            WEAPONS[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Оружие не найдено")


@router.delete("/{weapon_id}")
async def delete_weapon(weapon_id: str):
    for i, w in enumerate(WEAPONS):
        if w.id == weapon_id:
            WEAPONS.pop(i)
            return {"message": "Оружие удалено"}
    raise HTTPException(status_code=404, detail="Оружие не найдено")


@router.get("/assignments/all", response_model=List[WeaponAssignment])
async def list_assignments():
    return ASSIGNMENTS
