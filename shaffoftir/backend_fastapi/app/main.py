"""
ShaffofTIR - Extended Backend (FastAPI)
 дополняет существующий Nishon AI Target Scoring System (soldier.mrdev.uz)
 эндпоинтами для HR, оружия, тренировок, протоколов, аналитики и уведомлений.

Стиль: Pydantic v2 + FastAPI, идентичный основному API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, employees, weapons, training, protocols, analytics, notifications, schedule

app = FastAPI(
    title="ShaffofTIR Extended API",
    version="1.0.0",
    description="Дополнительные эндпоинты для системы ShaffofTIR - HR, оружие, тренировки, протоколы, аналитика.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(employees.router, prefix="/api/hr", tags=["HR - Сотрудники"])
app.include_router(weapons.router, prefix="/api/weapons", tags=["Оружие"])
app.include_router(training.router, prefix="/api/training", tags=["Тренировки"])
app.include_router(protocols.router, prefix="/api/protocols", tags=["Протоколы"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Аналитика"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Уведомления"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["Расписание тиры"])
