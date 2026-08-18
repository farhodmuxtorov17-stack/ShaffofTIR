"""Notifications - list, mark read, settings"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.models.misc import AppNotification, NotificationType

router = APIRouter()

NOTIFICATIONS: List[AppNotification] = [
    AppNotification(id="n001", type=NotificationType.SUCCESS, title="Сессия завершена", message="Каримов А.У. завершил стрельбу: 92/100", is_read=False, created_at="2026-07-24T08:30:00Z", action_url="/results/s002"),
    AppNotification(id="n002", type=NotificationType.WARNING, title="Тренировка просрочена", message="Махмудов С.Б. - 'Ночной бой' просрочен", is_read=False, created_at="2026-07-24T07:00:00Z", action_url="/training"),
    AppNotification(id="n003", type=NotificationType.TRAINING, title="Новое задание", message="Норматов Ж.А. назначен на 'Стрельба в движении'", is_read=True, created_at="2026-07-20T14:00:00Z", action_url="/training"),
    AppNotification(id="n004", type=NotificationType.SYSTEM, title="Обслуживание камеры", message="Камера дорожки 4 требует калибровки", is_read=True, created_at="2026-07-20T10:00:00Z", action_url="/cameras"),
    AppNotification(id="n005", type=NotificationType.INFO, title="Протокол подписан", message="Протокол #P001 подписан QR-кодом", is_read=False, created_at="2026-07-22T11:30:00Z", action_url="/protocols/p001"),
]


@router.get("", response_model=List[AppNotification])
async def list_notifications(unread_only: bool = Query(False)):
    if unread_only:
        return [n for n in NOTIFICATIONS if not n.is_read]
    return NOTIFICATIONS


@router.post("/{notification_id}/read")
async def mark_read(notification_id: str):
    for i, n in enumerate(NOTIFICATIONS):
        if n.id == notification_id:
            NOTIFICATIONS[i] = n.model_copy(update={"is_read": True})
            return {"message": "Прочитано"}
    raise HTTPException(status_code=404, detail="Уведомление не найдено")


@router.post("/read-all")
async def mark_all_read():
    for i, n in enumerate(NOTIFICATIONS):
        NOTIFICATIONS[i] = n.model_copy(update={"is_read": True})
    return {"message": "Все уведомления прочитаны"}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    for i, n in enumerate(NOTIFICATIONS):
        if n.id == notification_id:
            NOTIFICATIONS.pop(i)
            return {"message": "Удалено"}
    raise HTTPException(status_code=404, detail="Уведомление не найдено")
