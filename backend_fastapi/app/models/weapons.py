from pydantic import BaseModel
from typing import Optional
from enum import Enum


class WeaponCategory(str, Enum):
    PISTOL = "PISTOL"
    RIFLE = "RIFLE"
    SMG = "SMG"
    SNIPER = "SNIPER"
    SHOTGUN = "SHOTGUN"
    MACHINE_GUN = "MACHINE_GUN"


class WeaponStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    IN_USE = "IN_USE"
    MAINTENANCE = "MAINTENANCE"
    DECOMMISSIONED = "DECOMMISSIONED"


class WeaponCondition(str, Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"


class Weapon(BaseModel):
    id: str
    name: str
    category: WeaponCategory
    serial_number: str
    caliber: str
    manufacturer: str
    status: WeaponStatus = WeaponStatus.AVAILABLE
    condition: WeaponCondition = WeaponCondition.GOOD
    assigned_to: Optional[str] = None
    last_maintenance: Optional[str] = None
    total_shots_fired: int = 0
    image_url: Optional[str] = None
    max_range_m: int = 100
    ammo_type: str = ""
    created_at: str


class WeaponCreate(BaseModel):
    name: str
    category: WeaponCategory
    serial_number: str
    caliber: str
    manufacturer: str
    max_range_m: int = 100
    ammo_type: str = ""


class WeaponAssignment(BaseModel):
    id: str
    weapon_id: str
    weapon_name: str
    employee_id: str
    employee_name: str
    session_id: str
    assigned_at: str
    returned_at: Optional[str] = None
    rounds_fired: int = 0
    status: str = "ASSIGNED"
