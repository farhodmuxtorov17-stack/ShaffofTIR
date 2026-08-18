// Republic of Uzbekistan - 14 regions (viloyatlar) with districts and performance data

export interface DistrictData {
  id: string
  name_ru: string
  name_uz: string
  units: number
  employees: number
  qualified: number
  avgScore: number
  sessionsThisMonth: number
}

export interface RegionData {
  id: string
  name_ru: string
  name_uz: string
  short_ru: string
  short_uz: string
  districts: DistrictData[]
  totalEmployees: number
  qualifiedEmployees: number
  avgScore: number
  sessionsThisMonth: number
}

export const republicRegions: RegionData[] = [
  {
    id: 'tashkent_city',
    name_ru: 'город Ташкент',
    name_uz: 'Toshkent shahri',
    short_ru: 'Ташкент',
    short_uz: 'Toshkent',
    totalEmployees: 340, qualifiedEmployees: 298, avgScore: 78.5, sessionsThisMonth: 42,
    districts: [
      { id: 'tash_mirzo', name_ru: 'Мирзо-Улугбекский', name_uz: "Mirzo Ulug'bek", units: 4, employees: 85, qualified: 76, avgScore: 82.1, sessionsThisMonth: 12 },
      { id: 'tash_yakkasaray', name_ru: 'Яккасарайский', name_uz: 'Yakkasaroy', units: 3, employees: 62, qualified: 54, avgScore: 76.3, sessionsThisMonth: 8 },
      { id: 'tash_sergeli', name_ru: 'Сергелийский', name_uz: 'Sergeli', units: 5, employees: 110, qualified: 96, avgScore: 79.8, sessionsThisMonth: 14 },
      { id: 'tash_chilanzar', name_ru: 'Чиланзарский', name_uz: 'Chilonzor', units: 4, employees: 83, qualified: 72, avgScore: 74.5, sessionsThisMonth: 8 },
    ],
  },
  {
    id: 'tashkent_region',
    name_ru: 'Ташкентская область',
    name_uz: 'Toshkent viloyati',
    short_ru: 'Ташкент. обл.',
    short_uz: 'Toshkent vil.',
    totalEmployees: 520, qualifiedEmployees: 441, avgScore: 72.1, sessionsThisMonth: 38,
    districts: [
      { id: 'tr_angren', name_ru: 'Ангренский', name_uz: 'Angren', units: 4, employees: 92, qualified: 78, avgScore: 68.5, sessionsThisMonth: 7 },
      { id: 'tr_olmaliq', name_ru: 'Алмалыкский', name_uz: 'Olmaliq', units: 3, employees: 71, qualified: 62, avgScore: 75.3, sessionsThisMonth: 8 },
      { id: 'tr_chirchik', name_ru: 'Чирчикский', name_uz: 'Chirchiq', units: 5, employees: 120, qualified: 105, avgScore: 76.8, sessionsThisMonth: 10 },
      { id: 'tr_yangiyol', name_ru: 'Янгиёльский', name_uz: 'Yangiyo\'l', units: 3, employees: 65, qualified: 53, avgScore: 64.2, sessionsThisMonth: 4 },
      { id: 'tr_bekobod', name_ru: 'Бекабадский', name_uz: 'Bekobod', units: 3, employees: 104, qualified: 85, avgScore: 70.1, sessionsThisMonth: 3 },
    ],
  },
  {
    id: 'samarkand',
    name_ru: 'Самаркандская область',
    name_uz: 'Samarqand viloyati',
    short_ru: 'Самарканд',
    short_uz: 'Samarqand',
    totalEmployees: 410, qualifiedEmployees: 332, avgScore: 68.4, sessionsThisMonth: 29,
    districts: [
      { id: 'sm_samarkand', name_ru: 'Самаркандский', name_uz: 'Samarqand', units: 4, employees: 95, qualified: 80, avgScore: 72.1, sessionsThisMonth: 9 },
      { id: 'sm_bulungur', name_ru: 'Булунгурский', name_uz: 'Bulung\'ur', units: 2, employees: 48, qualified: 38, avgScore: 63.5, sessionsThisMonth: 4 },
      { id: 'sm_kattakurgan', name_ru: 'Каттакурганский', name_uz: 'Kattaqo\'rg\'on', units: 3, employees: 72, qualified: 58, avgScore: 66.8, sessionsThisMonth: 5 },
      { id: 'sm_urgut', name_ru: 'Ургутский', name_uz: 'Urgut', units: 3, employees: 68, qualified: 54, avgScore: 69.2, sessionsThisMonth: 6 },
      { id: 'sm_paxtachi', name_ru: 'Пахтачийский', name_uz: 'Paxtachi', units: 2, employees: 52, qualified: 42, avgScore: 65.0, sessionsThisMonth: 3 },
      { id: 'sm_ishtikhan', name_ru: 'Иштыханский', name_uz: 'Ishtixon', units: 2, employees: 75, qualified: 60, avgScore: 71.3, sessionsThisMonth: 2 },
    ],
  },
  {
    id: 'ferghana',
    name_ru: 'Ферганская область',
    name_uz: 'Farg\'ona viloyati',
    short_ru: 'Фергана',
    short_uz: 'Farg\'ona',
    totalEmployees: 380, qualifiedEmployees: 309, avgScore: 70.2, sessionsThisMonth: 25,
    districts: [
      { id: 'fr_fergana', name_ru: 'Ферганский', name_uz: 'Farg\'ona', units: 3, employees: 82, qualified: 68, avgScore: 73.5, sessionsThisMonth: 7 },
      { id: 'fr_margilan', name_ru: 'Маргиланский', name_uz: 'Marg\'ilon', units: 2, employees: 54, qualified: 44, avgScore: 68.1, sessionsThisMonth: 4 },
      { id: 'fr_kokand', name_ru: 'Кокандский', name_uz: 'Qo\'qon', units: 4, employees: 98, qualified: 80, avgScore: 71.8, sessionsThisMonth: 8 },
      { id: 'fr_rishtan', name_ru: 'Риштанский', name_uz: 'Rishton', units: 2, employees: 48, qualified: 38, avgScore: 64.5, sessionsThisMonth: 3 },
      { id: 'fr_quva', name_ru: 'Кувинский', name_uz: 'Quva', units: 2, employees: 55, qualified: 44, avgScore: 67.2, sessionsThisMonth: 3 },
    ],
  },
  {
    id: 'andijan',
    name_ru: 'Андижанская область',
    name_uz: 'Andijon viloyati',
    short_ru: 'Андижан',
    short_uz: 'Andijon',
    totalEmployees: 350, qualifiedEmployees: 281, avgScore: 67.5, sessionsThisMonth: 22,
    districts: [
      { id: 'an_andijan', name_ru: 'Андижанский', name_uz: 'Andijon', units: 3, employees: 78, qualified: 64, avgScore: 70.1, sessionsThisMonth: 6 },
      { id: 'an_asaka', name_ru: 'Асакинский', name_uz: 'Asaka', units: 3, employees: 72, qualified: 58, avgScore: 66.8, sessionsThisMonth: 5 },
      { id: 'an_marhamat', name_ru: 'Мархаматский', name_uz: 'Marhamat', units: 2, employees: 50, qualified: 40, avgScore: 65.2, sessionsThisMonth: 4 },
      { id: 'an_baliqchi', name_ru: 'Баликчинский', name_uz: 'Baliqchi', units: 2, employees: 48, qualified: 38, avgScore: 63.8, sessionsThisMonth: 3 },
      { id: 'an_kurgantepa', name_ru: 'Кургантепинский', name_uz: 'Qo\'rg\'ontepa', units: 3, employees: 65, qualified: 51, avgScore: 69.5, sessionsThisMonth: 4 },
    ],
  },
  {
    id: 'namangan',
    name_ru: 'Наманганская область',
    name_uz: 'Namangan viloyati',
    short_ru: 'Наманган',
    short_uz: 'Namangan',
    totalEmployees: 310, qualifiedEmployees: 248, avgScore: 65.8, sessionsThisMonth: 19,
    districts: [
      { id: 'nm_namangan', name_ru: 'Наманганский', name_uz: 'Namangan', units: 3, employees: 72, qualified: 58, avgScore: 68.5, sessionsThisMonth: 5 },
      { id: 'nm_chust', name_ru: 'Чустский', name_uz: 'Chust', units: 2, employees: 48, qualified: 38, avgScore: 62.1, sessionsThisMonth: 3 },
      { id: 'nm_uychi', name_ru: 'Уйчинский', name_uz: 'Uychi', units: 2, employees: 45, qualified: 36, avgScore: 64.0, sessionsThisMonth: 4 },
      { id: 'nm_pop', name_ru: 'Попский', name_uz: 'Pop', units: 2, employees: 52, qualified: 41, avgScore: 63.5, sessionsThisMonth: 3 },
      { id: 'nm_mingbuloq', name_ru: 'Мингбулакский', name_uz: 'Mingbuloq', units: 2, employees: 48, qualified: 37, avgScore: 61.8, sessionsThisMonth: 2 },
      { id: 'nm_turakurgan', name_ru: 'Туракурганский', name_uz: 'To\'raqo\'rg\'on', units: 2, employees: 45, qualified: 38, avgScore: 66.2, sessionsThisMonth: 2 },
    ],
  },
  {
    id: 'bukhara',
    name_ru: 'Бухарская область',
    name_uz: 'Buxoro viloyati',
    short_ru: 'Бухара',
    short_uz: 'Buxoro',
    totalEmployees: 260, qualifiedEmployees: 208, avgScore: 71.0, sessionsThisMonth: 18,
    districts: [
      { id: 'bh_bukhara', name_ru: 'Бухарский', name_uz: 'Buxoro', units: 3, employees: 65, qualified: 53, avgScore: 74.2, sessionsThisMonth: 5 },
      { id: 'bh_kogon', name_ru: 'Каганский', name_uz: 'Kogon', units: 2, employees: 42, qualified: 34, avgScore: 68.5, sessionsThisMonth: 3 },
      { id: 'bh_gijduvan', name_ru: 'Гиждуванский', name_uz: 'G\'ijduvon', units: 2, employees: 48, qualified: 38, avgScore: 69.8, sessionsThisMonth: 4 },
      { id: 'bh_olot', name_ru: 'Алатский', name_uz: 'Olot', units: 2, employees: 38, qualified: 30, avgScore: 67.0, sessionsThisMonth: 3 },
      { id: 'bh_shafirkan', name_ru: 'Шафирканский', name_uz: 'Shofirkon', units: 2, employees: 44, qualified: 36, avgScore: 72.1, sessionsThisMonth: 3 },
    ],
  },
  {
    id: 'khorezm',
    name_ru: 'Хорезмская область',
    name_uz: 'Xorazm viloyati',
    short_ru: 'Хорезм',
    short_uz: 'Xorazm',
    totalEmployees: 220, qualifiedEmployees: 176, avgScore: 66.5, sessionsThisMonth: 14,
    districts: [
      { id: 'kh_urganch', name_ru: 'Ургенчский', name_uz: 'Urganch', units: 3, employees: 55, qualified: 44, avgScore: 68.5, sessionsThisMonth: 4 },
      { id: 'kh_khanka', name_ru: 'Ханкинский', name_uz: 'Xonqa', units: 2, employees: 38, qualified: 30, avgScore: 63.2, sessionsThisMonth: 3 },
      { id: 'kh_shavat', name_ru: 'Шаватский', name_uz: 'Shovot', units: 2, employees: 42, qualified: 33, avgScore: 65.0, sessionsThisMonth: 3 },
      { id: 'kh_hazarasp', name_ru: 'Хазараспский', name_uz: 'Xazorasp', units: 2, employees: 40, qualified: 32, avgScore: 67.1, sessionsThisMonth: 2 },
      { id: 'kh_yangiariq', name_ru: 'Янгиарыкский', name_uz: 'Yangiariq', units: 2, employees: 45, qualified: 37, avgScore: 64.8, sessionsThisMonth: 2 },
    ],
  },
  {
    id: 'navoi',
    name_ru: 'Навоийская область',
    name_uz: 'Navoiy viloyati',
    short_ru: 'Навои',
    short_uz: 'Navoiy',
    totalEmployees: 180, qualifiedEmployees: 144, avgScore: 69.2, sessionsThisMonth: 12,
    districts: [
      { id: 'nv_navoi', name_ru: 'Навоийский', name_uz: 'Navoiy', units: 2, employees: 48, qualified: 39, avgScore: 72.5, sessionsThisMonth: 4 },
      { id: 'nv_zarafshan', name_ru: 'Заравшанский', name_uz: 'Zarafshon', units: 2, employees: 38, qualified: 30, avgScore: 66.8, sessionsThisMonth: 3 },
      { id: 'nv_uchquduq', name_ru: 'Учкудукский', name_uz: 'Uchquduq', units: 1, employees: 25, qualified: 20, avgScore: 64.5, sessionsThisMonth: 2 },
      { id: 'nv_kyzyltepe', name_ru: 'Кызылтепинский', name_uz: 'Qiziltepa', units: 2, employees: 42, qualified: 34, avgScore: 70.1, sessionsThisMonth: 3 },
    ],
  },
  {
    id: 'kashkadarya',
    name_ru: 'Кашкадарьинская область',
    name_uz: 'Qashqadaryo viloyati',
    short_ru: 'Кашкадарья',
    short_uz: 'Qashqadaryo',
    totalEmployees: 290, qualifiedEmployees: 232, avgScore: 68.0, sessionsThisMonth: 20,
    districts: [
      { id: 'ks_karshi', name_ru: 'Каршинский', name_uz: 'Qarshi', units: 3, employees: 68, qualified: 55, avgScore: 71.2, sessionsThisMonth: 5 },
      { id: 'ks_shahrisabz', name_ru: 'Шахрисабзский', name_uz: 'Shahrisabz', units: 2, employees: 48, qualified: 38, avgScore: 66.5, sessionsThisMonth: 4 },
      { id: 'ks_yakkabag', name_ru: 'Яккабагский', name_uz: 'Yakkabog\'', units: 2, employees: 40, qualified: 32, avgScore: 64.8, sessionsThisMonth: 3 },
      { id: 'ks_kasbi', name_ru: 'Касбийский', name_uz: 'Kasbi', units: 2, employees: 42, qualified: 34, avgScore: 67.5, sessionsThisMonth: 4 },
      { id: 'ks_guzar', name_ru: 'Гузарский', name_uz: 'G\'uzor', units: 2, employees: 45, qualified: 36, avgScore: 69.0, sessionsThisMonth: 4 },
    ],
  },
  {
    id: 'surkhandarya',
    name_ru: 'Сурхандарьинская область',
    name_uz: 'Surxondaryo viloyati',
    short_ru: 'Сурхандарья',
    short_uz: 'Surxondaryo',
    totalEmployees: 250, qualifiedEmployees: 168, avgScore: 58.0, sessionsThisMonth: 16,
    districts: [
      { id: 'sr_termez', name_ru: 'Термезский', name_uz: 'Termiz', units: 3, employees: 58, qualified: 46, avgScore: 68.5, sessionsThisMonth: 4 },
      { id: 'sr_denau', name_ru: 'Денауский', name_uz: 'Denov', units: 2, employees: 42, qualified: 33, avgScore: 63.2, sessionsThisMonth: 3 },
      { id: 'sr_sherabad', name_ru: 'Шерабадский', name_uz: 'Sherobod', units: 2, employees: 38, qualified: 30, avgScore: 62.1, sessionsThisMonth: 3 },
      { id: 'sr_uzun', name_ru: 'Узунский', name_uz: 'Uzun', units: 2, employees: 40, qualified: 32, avgScore: 64.5, sessionsThisMonth: 3 },
      { id: 'sr_baysun', name_ru: 'Байсунский', name_uz: 'Boysun', units: 2, employees: 35, qualified: 28, avgScore: 61.8, sessionsThisMonth: 3 },
      { id: 'sr_kumkurgan', name_ru: 'Кумкурганский', name_uz: 'Qumqo\'rg\'on', units: 2, employees: 37, qualified: 29, avgScore: 63.0, sessionsThisMonth: 0 },
    ],
  },
  {
    id: 'syrdarya',
    name_ru: 'Сырдарьинская область',
    name_uz: 'Sirdaryo viloyati',
    short_ru: 'Сырдарья',
    short_uz: 'Sirdaryo',
    totalEmployees: 160, qualifiedEmployees: 128, avgScore: 67.0, sessionsThisMonth: 10,
    districts: [
      { id: 'sy_gulistan', name_ru: 'Гулистанский', name_uz: 'Guliston', units: 2, employees: 42, qualified: 34, avgScore: 70.5, sessionsThisMonth: 3 },
      { id: 'sy_syrdarya', name_ru: 'Сырдарьинский', name_uz: 'Sirdaryo', units: 2, employees: 38, qualified: 30, avgScore: 65.2, sessionsThisMonth: 3 },
      { id: 'sy_shirin', name_ru: 'Ширинский', name_uz: 'Shirin', units: 1, employees: 25, qualified: 20, avgScore: 63.8, sessionsThisMonth: 2 },
      { id: 'sy_bakhor', name_ru: 'Бахорский', name_uz: 'Bo\'ston', units: 2, employees: 40, qualified: 32, avgScore: 68.1, sessionsThisMonth: 2 },
    ],
  },
  {
    id: 'jizzakh',
    name_ru: 'Джизакская область',
    name_uz: 'Jizzax viloyati',
    short_ru: 'Джизак',
    short_uz: 'Jizzax',
    totalEmployees: 170, qualifiedEmployees: 136, avgScore: 66.8, sessionsThisMonth: 11,
    districts: [
      { id: 'jz_jizzakh', name_ru: 'Джизакский', name_uz: 'Jizzax', units: 2, employees: 45, qualified: 36, avgScore: 69.5, sessionsThisMonth: 3 },
      { id: 'jz_zafar', name_ru: 'Зафарабадский', name_uz: 'Zafarobod', units: 1, employees: 25, qualified: 20, avgScore: 63.2, sessionsThisMonth: 2 },
      { id: 'jz_dostlik', name_ru: 'Дустликский', name_uz: 'Do\'stlik', units: 2, employees: 38, qualified: 30, avgScore: 65.8, sessionsThisMonth: 3 },
      { id: 'jz_mirzachol', name_ru: 'Мирзачольский', name_uz: 'Mirzacho\'l', units: 2, employees: 40, qualified: 32, avgScore: 67.2, sessionsThisMonth: 3 },
    ],
  },
  {
    id: 'karakalpakstan',
    name_ru: 'Республика Каракалпакстан',
    name_uz: 'Qoraqalpog\'iston Respublikasi',
    short_ru: 'Каракалпакстан',
    short_uz: 'Qoraqalpog\'iston',
    totalEmployees: 280, qualifiedEmployees: 198, avgScore: 57.5, sessionsThisMonth: 15,
    districts: [
      { id: 'kp_nukus', name_ru: 'Нукусский', name_uz: 'Nukus', units: 3, employees: 62, qualified: 48, avgScore: 66.2, sessionsThisMonth: 4 },
      { id: 'kp_chimboy', name_ru: 'Чимбайский', name_uz: 'Chimboy', units: 2, employees: 38, qualified: 29, avgScore: 54.2, sessionsThisMonth: 3 },
      { id: 'kp_kungrad', name_ru: 'Кунградский', name_uz: 'Qo\'ng\'irot', units: 2, employees: 40, qualified: 31, avgScore: 55.8, sessionsThisMonth: 2 },
      { id: 'kp_beruniy', name_ru: 'Берунийский', name_uz: 'Beruniy', units: 2, employees: 42, qualified: 33, avgScore: 64.8, sessionsThisMonth: 3 },
      { id: 'kp_turtkul', name_ru: 'Турткульский', name_uz: 'To\'rtko\'l', units: 2, employees: 38, qualified: 30, avgScore: 56.3, sessionsThisMonth: 2 },
      { id: 'kp_ellikqala', name_ru: 'Элликкалинский', name_uz: 'Ellikqal\'a', units: 2, employees: 35, qualified: 27, avgScore: 52.1, sessionsThisMonth: 1 },
    ],
  },
]

// Traffic light classification
export function getPerformanceLevel(avgScore: number): 'green' | 'yellow' | 'red' {
  if (avgScore >= 70) return 'green'
  if (avgScore >= 60) return 'yellow'
  return 'red'
}

export function getPerformanceLabel(level: 'green' | 'yellow' | 'red', isUz: boolean): string {
  if (isUz) {
    return level === 'green' ? 'Yaxshi' : level === 'yellow' ? "Oʻrtacha" : 'Past'
  }
  return level === 'green' ? 'Хорошо' : level === 'yellow' ? 'Средне' : 'Низкий'
}

// Aggregate totals for the republic
export function getRepublicTotals() {
  const totalEmployees = republicRegions.reduce((s, r) => s + r.totalEmployees, 0)
  const qualifiedEmployees = republicRegions.reduce((s, r) => s + r.qualifiedEmployees, 0)
  const sessionsThisMonth = republicRegions.reduce((s, r) => s + r.sessionsThisMonth, 0)
  const avgScore = Math.round((republicRegions.reduce((s, r) => s + r.avgScore * r.totalEmployees, 0) / totalEmployees) * 10) / 10
  return { totalEmployees, qualifiedEmployees, sessionsThisMonth, avgScore }
}
