# ShaffofTIR Mini

Минимизированная версия системы управления стрелковым полигоном.

## Роли

### Инструктор (4 модуля)
1. **Стрельбы** — создание и управление стрелковыми сессиями
2. **Результаты** — история результатов стрельб
3. **Сотрудники** — реестр личного состава с историей стрельб
4. **Протоколы** — стрелковые протоколы с подписанием/утверждением

### Технический Специалист (4 модуля)
1. **Камеры** — мониторинг камер наблюдения с health check
2. **Дорожки** — статус стрелковых дорожек
3. **Арсенал** — учёт оружия
4. **Система** — мониторинг и журнал аудита

## Структура

```
shaffoftir-mini/
├── frontend/          # Vue 3 + TailwindCSS
│   ├── src/
│   │   ├── pages/      # 8 страниц (4 на роль)
│   │   ├── components/  # AppShell с сайдбаром
│   │   ├── api/        # REST API клиент
│   │   ├── stores/     # Auth store
│   │   └── router/     # Роутинг с guard по ролям
│   └── package.json
├── backend/           # Django 5 + DRF
│   ├── shaffoftir_api/
│   │   ├── models/     # 15+ моделей
│   │   ├── views/      # CRUD + кастомные эндпоинты
│   │   ├── serializers/
│   │   └── urls/
│   ├── manage.py
│   └── requirements.txt
└── README.md
```

## Запуск

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Демо-аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Инструктор | instructor@shaffoftir.uz | inst123 |
| Тех. Специалист | tech@shaffoftir.uz | tech123 |
