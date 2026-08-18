# Data Model

## Entity Relationship Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────►│  Employee│────►│Department│
│          │     │          │     │          │
│ id (PK)  │     │ id (PK)  │     │ id (PK)  │
│ email    │     │ user_id  │     │ name     │
│ role     │     │ rank     │     │ parent_id│
│ full_name│     │ qual     │     └──────────┘
└──────────┘     │ dept_id  │
                 └────┬─────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
    ┌─────▼─────┐ ┌───▼────┐ ┌───▼────────┐
    │  Session  │ │ Shot   │ │  Protocol   │
    │           │ │        │ │            │
    │ id (PK)   │ │ id(PK) │ │ id (PK)    │
    │ title     │ │ sess_id│ │ session_id │
    │ date      │ │ emp_id │ │ number     │
    │ status    │ │ x,y    │ │ status     │
    │ range_id  │ │ score  │ │ approved_by│
    │ weapon    │ │ penal  │ │ comments[] │
    └─────┬─────┘ └────────┘ └─────┬──────┘
          │                         │
    ┌─────▼─────┐             ┌────▼──────────┐
    │ShootingLane│             │OperatorComment│
    │ id (PK)    │             │ id (PK)       │
    │ session_id │             │ protocol_id   │
    │ lane_num   │             │ author        │
    │ camera_id  │             │ soldier_seq   │
    └───────────┘             │ comment       │
                               └───────────────┘

    ┌──────────┐     ┌──────────────┐
    │  Weapon  │────►│WeaponAssign  │
    │ id (PK)  │     │ id (PK)      │
    │ name     │     │ weapon_id    │
    │ type     │     │ employee_id  │
    │ status   │     │ session_id   │
    │ serial   │     │ assigned_at  │
    └──────────┘     │ returned_at  │
                     └──────────────┘

    ┌──────────┐
    │  Camera  │
    │ id (PK)  │
    │ name     │
    │ ip       │
    │ lane_id  │
    │ status   │
    └──────────┘
```

## Frontend Types

### Core Types (`src/types/index.ts`)

```typescript
interface SystemUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  rank?: string
  department?: string
  phone?: string
  is_active: boolean
  created_at: string
  last_login?: string
  locale: 'ru' | 'uz'
}

type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'INSTRUCTOR' | 'EMPLOYEE' | 'TECHSPEC'

interface Session {
  id: string
  title: string
  date: string
  status: 'pending' | 'active' | 'completed'
  range_id: string
  weapon_type: string
  soldiers: Soldier[]
  shots: Shot[]
}

interface Soldier {
  id: string
  name: string
  rank: string
  qualification: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  department: string
}

interface Shot {
  id: string
  session_id: string
  soldier_id: string
  x: number
  y: number
  score: number
  penalty: number
  timestamp: string
}

interface Protocol {
  id: string
  session_id: string
  protocol_number: string
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED'
  participants: string[]
  approved_by?: string
  created_at: string
  updated_at: string
}

interface Weapon {
  id: string
  name: string
  type: string
  status: 'active' | 'maintenance' | 'retired'
  serial_number: string
}
```

### Extended Types (`src/types/extended.ts`)

```typescript
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: SystemUser
}
```

## KPI Data Structure

### Republic Hierarchy (`src/data/republicData.ts`)

```typescript
interface RegionData {
  id: string
  name: string
  name_uz: string
  kpi: number              // 0-100 readiness score
  districts: DistrictData[]
}

interface DistrictData {
  id: string
  name: string
  name_uz: string
  kpi: number
  units: UnitData[]
}
```

### Traffic-Light Logic

| KPI Score | Color | Status |
|-----------|-------|--------|
| ≥ 70 | 🟢 Green | Ready |
| ≥ 60 | 🟡 Yellow | Warning |
| < 60 | 🔴 Red | Critical |

```typescript
function getKpiStatus(kpi: number): 'green' | 'yellow' | 'red' {
  if (kpi >= 70) return 'green'
  if (kpi >= 60) return 'yellow'
  return 'red'
}
```

## Backend Models (Django)

### User Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | Unique, not null |
| full_name | VARCHAR(255) | Not null |
| role | VARCHAR(20) | Choices: 5 roles |
| rank | VARCHAR(50) | Optional |
| department | VARCHAR(100) | Optional |
| phone | VARCHAR(20) | Optional |
| is_active | BOOLEAN | Default: true |
| created_at | TIMESTAMP | Auto |
| last_login | TIMESTAMP | Nullable |
| locale | VARCHAR(2) | Default: 'ru' |

### Session Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(200) | Not null |
| date | DATE | Not null |
| status | VARCHAR(20) | pending/active/completed |
| range_id | FK → Range | Not null |
| weapon_type | VARCHAR(50) | Not null |
| created_by | FK → User | Auto |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### Shot Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| session_id | FK → Session | Not null |
| soldier_id | FK → Employee | Not null |
| x | FLOAT | 0-300 |
| y | FLOAT | 0-300 |
| score | INT | 0-10 |
| penalty | INT | Default: 0 |
| timestamp | TIMESTAMP | Auto |

### Protocol Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| session_id | FK → Session | Not null |
| protocol_number | VARCHAR(50) | Unique |
| status | VARCHAR(20) | DRAFT/REVIEW/APPROVED/ARCHIVED |
| approved_by | FK → User | Nullable |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |
| signed_at | TIMESTAMP | Nullable |
