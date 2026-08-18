"""Auth - login, me, logout"""
from fastapi import APIRouter, HTTPException
from app.models.auth import LoginRequest, LoginResponse, SystemUser, UserRole

router = APIRouter()

# Demo users
USERS = {
    "manager@shaffoftir.uz": {
        "password": "manager123",
        "user": SystemUser(
            id="u001", email="manager@shaffoftir.uz", full_name="Тошматов Фирдавс Шерзодович",
            role=UserRole.MANAGER, phone="+998908889900", rank="Старшина",
            department="Огневая подготовка", is_active=True,
            last_login="2026-07-24T08:00:00Z", created_at="2024-01-01T00:00:00Z",
        ),
    },
    "instructor@shaffoftir.uz": {
        "password": "instructor123",
        "user": SystemUser(
            id="u002", email="instructor@shaffoftir.uz", full_name="Махмудов Сардор Бахтиёрович",
            role=UserRole.INSTRUCTOR, phone="+998905556677", rank="Ст. сержант",
            department="1-я рота", is_active=True,
            last_login="2026-07-24T07:30:00Z", created_at="2024-01-01T00:00:00Z",
        ),
    },
    "soldier@shaffoftir.uz": {
        "password": "soldier123",
        "user": SystemUser(
            id="u003", email="soldier@shaffoftir.uz", full_name="Юлдашев Дилшод Абдуллажонович",
            role=UserRole.EMPLOYEE, phone="+998903334455", rank="Сержант",
            department="1-я рота", is_active=True,
            last_login="2026-07-24T09:00:00Z", created_at="2024-01-01T00:00:00Z",
        ),
    },
}

TOKENS = {
    "demo-token-manager": "manager@shaffoftir.uz",
    "demo-token-instructor": "instructor@shaffoftir.uz",
    "demo-token-soldier": "soldier@shaffoftir.uz",
}


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    record = USERS.get(payload.email)
    if not record or record["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    user = record["user"]
    token = f"demo-token-{user.role.value.lower()}"
    return LoginResponse(access_token=token, token_type="bearer", user=user)


@router.get("/me", response_model=SystemUser)
async def me(token: str = ""):
    email = TOKENS.get(token)
    if not email:
        # fallback: return manager
        email = "manager@shaffoftir.uz"
    record = USERS.get(email)
    if not record:
        raise HTTPException(status_code=404, detail="User not found")
    return record["user"]


@router.post("/logout")
async def logout():
    return {"message": "Logged out"}
