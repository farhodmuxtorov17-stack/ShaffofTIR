// Unit types and sample employee data for drill-down in Command Center

export interface EmployeeDetail {
  id: string
  name: string
  rank: string
  unitType: string
  sessionsTotal: number
  avgScore: number
  lastSessionDate: string
  qualified: boolean
}

export const UNIT_TYPES = [
  { id: 'patrol', name_ru: 'Патрульная служба', name_uz: 'Patrul xizmati' },
  { id: 'traffic', name_ru: 'ГАИ/Дорожная полиция', name_uz: 'Yo\'l harakati xavfsizligi' },
  { id: 'guard', name_ru: 'Охрана', name_uz: 'Qorovul' },
  { id: 'criminal', name_ru: 'Уголовный розыск', name_uz: 'Jinoyat qidiruvi' },
  { id: 'security', name_ru: 'Служба безопасности', name_uz: 'Xavfsizlik xizmati' },
]

const FIRST_NAMES = ['Ахмедов', 'Каримов', 'Рахимов', 'Юлдашев', 'Тошматов', 'Эргашев', 'Назаров', 'Хасанов', 'Махмудов', 'Исламов', 'Юсупов', 'Камилов', 'Шарипов', 'Фазилов', 'Нурматов', 'Алимов']
const LAST_NAMES_RU = ['Дилшод', 'Сардор', 'Жасур', 'Бахтиёр', 'Шерзод', 'Азиз', 'Фирдавс', 'Бекзод', 'Улугбек', 'Отабек']
const RANKS = ['Сержант', 'Ст. сержант', 'Старшина', 'Лейтенант', 'Ст. лейтенант', 'Капитан']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// Generate employees for a district/unit combination
export function getUnitsForDistrict(districtId: string, isUz: boolean): Array<{
  unitType: string
  unitTypeLabel: string
  employees: EmployeeDetail[]
  avgScore: number
  qualified: number
  total: number
}> {
  const rng = seededRandom(districtId.split('').reduce((s, c) => s + c.charCodeAt(0), 0))
  const numUnits = Math.floor(rng() * 4) + 2
  const units: Array<any> = []

  for (let i = 0; i < numUnits; i++) {
    const unitType = UNIT_TYPES[Math.floor(rng() * UNIT_TYPES.length)]
    const numEmployees = Math.floor(rng() * 12) + 5
    const employees: EmployeeDetail[] = []

    for (let j = 0; j < numEmployees; j++) {
      const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]
      const ln = LAST_NAMES_RU[Math.floor(rng() * LAST_NAMES_RU.length)]
      const rank = RANKS[Math.floor(rng() * RANKS.length)]
      const avgScore = Math.round((45 + rng() * 50) * 10) / 10
      const sessionsTotal = Math.floor(rng() * 30) + 1
      const qualified = avgScore >= 60

      employees.push({
        id: `${districtId}_${i}_${j}`,
        name: `${fn} ${ln}`,
        rank,
        unitType: unitType.id,
        sessionsTotal,
        avgScore,
        lastSessionDate: `2026-0${Math.floor(rng() * 6) + 1}-${String(Math.floor(rng() * 28) + 1).padStart(2, '0')}`,
        qualified,
      })
    }

    const unitAvg = Math.round((employees.reduce((s, e) => s + e.avgScore, 0) / employees.length) * 10) / 10
    units.push({
      unitType: unitType.id,
      unitTypeLabel: isUz ? unitType.name_uz : unitType.name_ru,
      employees,
      avgScore: unitAvg,
      qualified: employees.filter(e => e.qualified).length,
      total: employees.length,
    })
  }

  return units.sort((a, b) => a.avgScore - b.avgScore) // worst-performing first - helps identify the problem
}
