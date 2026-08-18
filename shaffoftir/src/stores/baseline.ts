import { defineStore } from './pinia-shim';
import { ref } from 'vue';
import type { BaselineEntry, ShotType } from '@/types';
import { useAuditStore } from './audit';

export const useBaselineStore = defineStore('baseline', () => {
  const auditStore = useAuditStore();

  // --- State ---
  const baselines = ref<Map<number, BaselineEntry>>(new Map());
  const currentBaseline = ref<string | null>(null);
  const overrideDialog = ref<boolean>(false);
  const overrideReason = ref<string>('');

  // --- Actions ---
  function addBaseline(soldierSeq: number, imageUrl: string | null, shotType: ShotType) {
    const entry: BaselineEntry = {
      soldierSeq,
      imageUrl,
      timestamp: new Date().toISOString(),
      shotType,
    };
    baselines.value.set(soldierSeq, entry);
    // Trigger reactivity for Map by reassigning
    baselines.value = new Map(baselines.value);

    // Update currentBaseline to the latest added image URL
    currentBaseline.value = imageUrl;

    auditStore.logAudit('ADD_BASELINE', { soldierSeq, imageUrl, shotType });
  }

  function getBaselineForSoldier(seq: number): BaselineEntry | null {
    // If there is an explicit baseline for this soldier, use it
    if (baselines.value.has(seq)) {
      return baselines.value.get(seq) || null;
    }
    // Clean target is the initial baseline for soldier 1.
    // After each successful scoring, the current final result image becomes the next soldier's baseline.
    // Therefore, if soldier seq > 1 and we don't have an explicit baseline, we fallback to the scoring result of soldier seq - 1.
    if (seq > 1 && baselines.value.has(seq - 1)) {
      return baselines.value.get(seq - 1) || null;
    }
    return null;
  }

  function setOverride(reason: string) {
    overrideReason.value = reason;
    // Log override for audit
    auditStore.logAudit('BASELINE_OVERRIDE', {
      reason,
      message: 'Baseline image overridden by operator',
    });
  }

  function showOverrideDialog() {
    overrideDialog.value = true;
  }

  function hideOverrideDialog() {
    overrideDialog.value = false;
  }

  return {
    baselines,
    currentBaseline,
    overrideDialog,
    overrideReason,
    addBaseline,
    getBaselineForSoldier,
    setOverride,
    showOverrideDialog,
    hideOverrideDialog,
  };
});
