# Модель данных ShaffofTIR

## ER-схема

```
User (1) ---> (N) Session
Employee (1) ---> (N) Session
Session (1) ---> (N) Soldier
Soldier (1) ---> (N) Shot
Session (1) ---> (N) Protocol
Protocol (1) ---> (N) OperatorComment
Protocol (1) ---> (N) ReviewReason
Weapon (1) ---> (N) WeaponAssignment
Employee (1) ---> (N) WeaponAssignment
Session (1) ---> (N) ShootingLane
ShootingLane (1) ---> (1) Camera
Employee (1) ---> (N) TrainingAssignment
TrainingPlan (1) ---> (N) TrainingAssignment
```

## Описание таблиц

### users
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Уникальный идентификатор |
| email | Email unique | Логин |
| full_name | CharField | ФИО |
| role | CharField | Роль (INSTRUCTOR, MANAGER, EMPLOYEE, TECHSPEC, SUPER_ADMIN) |
| rank | CharField | Звание |
| department | CharField | Подразделение |
| is_active_user | Boolean | Активен |

### employees
| Поле | Тип | Описание |
|------|-----|----------|
| full_name | CharField | ФИО |
| rank | CharField | Звание |
| department | CharField | Подразделение |
| region | CharField | Регион |
| district | CharField | Район |
| personal_number | CharField unique | Личный номер |
| status | CharField | ACTIVE, RESERVE, RETIRED, DISMISSED |
| qual_level | CharField | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT |
| hire_date | DateField | Дата приёма |
| face_id_registered | Boolean | FaceID зарегистрирован |

### sessions
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Уникальный идентификатор |
| employee | FK Employee | Стрелок |
| weapon | FK Weapon | Назначенное оружие |
| lane | FK ShootingLane | Дорожка |
| status | CharField | PLANNED, ACTIVE, COMPLETED, CANCELLED |
| scoring_mode | CharField | POINTS, HIT_MISS |
| score | Integer | Итоговый балл |
| accuracy | Float | Точность % |
| started_at | DateTime | Время начала |
| completed_at | DateTime | Время завершения |

### soldiers
| Поле | Тип | Описание |
|------|-----|----------|
| session | FK Session | Сессия |
| sequence_number | Integer | Порядковый номер в сессии |
| total_shots | Integer | Всего выстрелов |
| hit_count | Integer | Попаданий |
| score | Integer | Балл |
| status | CharField | WAITING, SHOOTING, COMPLETED |

### shots
| Поле | Тип | Описание |
|------|-----|----------|
| soldier | FK Soldier | Стрелок |
| shot_type | CharField | TEST, MAIN |
| x_coord | Float | Координата X (мм) |
| y_coord | Float | Координата Y (мм) |
| score_value | Integer | Балл выстрела |
| is_hit | Boolean | Попадание |
| timestamp | DateTime | Время выстрела |

### protocols
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Уникальный идентификатор |
| session | FK Session | Сессия |
| employee_name | CharField | ФИО сотрудника |
| test_score | Integer | Пробный балл |
| main_score | Integer | Зачётный балл |
| total_score | Integer | Итоговый балл |
| accuracy | Float | Точность % |
| passed | Boolean | Сдано |
| status | CharField | DRAFT, SIGNED, ARCHIVED |
| qr_code_url | URL | QR-код протокола |
| signed_at | DateTime | Дата подписания |

### weapons
| Поле | Тип | Описание |
|------|-----|----------|
| name | CharField | Название |
| category | CharField | PISTOL, RIFLE, SMG, SNIPER, SHOTGUN, MACHINE_GUN |
| serial_number | CharField unique | Серийный номер |
| caliber | CharField | Калибр |
| status | CharField | AVAILABLE, IN_USE, MAINTENANCE, DECOMMISSIONED |
| condition | CharField | EXCELLENT, GOOD, FAIR, POOR |

### shooting_lanes
| Поле | Тип | Описание |
|------|-----|----------|
| lane_number | Integer unique | Номер дорожки |
| status | CharField | AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED |
| camera | FK Camera | Камера дорожки |
| target_type | CharField | STANDARD, SILHOUETTE, CIRCLE, CUSTOM |
| distance_m | Integer | Дистанция (м) |

### cameras
| Поле | Тип | Описание |
|------|-----|----------|
| ip_address | CharField | Статический IP (88.x.x.x) |
| lane | FK ShootingLane | Дорожка |
| status | CharField | ONLINE, OFFLINE, ERROR |
| last_frame_url | URL | URL последнего кадра |
