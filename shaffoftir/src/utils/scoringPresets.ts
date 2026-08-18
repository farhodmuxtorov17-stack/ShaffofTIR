// Scoring preset types and helpers for the bifurcated scoring engine

export type ScoringMode = 'POINTS' | 'HITMISS';

export interface ScoringPresetConfig {
  id: string;
  mode: ScoringMode;
  label: string;
  labelUz: string;
  testRounds: number;
  combatRounds: number;
  maxScore: number;
  description: string;
  descriptionUz: string;
}

export const SCORING_PRESETS: Record<string, ScoringPresetConfig> = {
  POINTS: {
    id: 'military-standard',
    mode: 'POINTS',
    label: 'Военный стандарт (10 очков)',
    labelUz: 'Harbiy standart (10 ball)',
    testRounds: 3,
    combatRounds: 7,
    maxScore: 10,
    description: 'Кольцевая система оценки',
    descriptionUz: 'Ring tizimida baholash',
  },
  POINTS_EXTENDED: {
    id: 'special-forces',
    mode: 'POINTS',
    label: 'Спецназ (100 очков)',
    labelUz: 'Maxsus kuchlar (100 ball)',
    testRounds: 5,
    combatRounds: 15,
    maxScore: 100,
    description: 'Расширенная точность',
    descriptionUz: 'Kengaytirilgan aniqlik',
  },
  HITMISS: {
    id: 'general-hitmiss',
    mode: 'HITMISS',
    label: 'Попал/Промах',
    labelUz: 'Aniq/Adashdi',
    testRounds: 3,
    combatRounds: 7,
    maxScore: 1,
    description: 'Бинарная оценка',
    descriptionUz: 'Ikkilik baholash',
  },
};

export function getPresetById(id: string): ScoringPresetConfig | undefined {
  return Object.values(SCORING_PRESETS).find((p) => p.id === id);
}

export function isHitMissMode(presetId: string): boolean {
  const preset = getPresetById(presetId);
  return preset?.mode === 'HITMISS';
}

export const SCORING_MODES = Object.keys(SCORING_PRESETS);

export const SCORING_MODE_LABELS: Record<string, Record<string, string>> = {
  POINTS: { uz: 'Ball tizimi', ru: 'Очковая система', desc_uz: '10 balli baholash', desc_ru: '10-балльная оценка' },
  HIT_MISS: { uz: 'Aniq/Adashdi', ru: 'Попал/Промах', desc_uz: 'Ikkilik baholash', desc_ru: 'Бинарная оценка' },
};
