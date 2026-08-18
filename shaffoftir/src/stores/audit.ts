import { defineStore } from './pinia-shim';
import { ref } from 'vue';

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: any;
  sessionId?: string;
  soldierSeq?: number;
}

export const useAuditStore = defineStore('audit', () => {
  const entries = ref<AuditEntry[]>([]);

  function logAudit(
    action: string,
    details: any,
    sessionId?: string,
    soldierSeq?: number,
    actor = 'operator'
  ) {
    const id = Math.random().toString(36).substring(2, 9);
    entries.value.unshift({
      id,
      action,
      actor,
      timestamp: new Date().toISOString(),
      details,
      sessionId,
      soldierSeq,
    });
  }

  function getAuditForSession(sessionId: string) {
    return entries.value.filter((e) => e.sessionId === sessionId);
  }

  function getAuditForSoldier(sessionId: string, soldierSeq: number) {
    return entries.value.filter(
      (e) => e.sessionId === sessionId && e.soldierSeq === soldierSeq
    );
  }

  return {
    entries,
    logAudit,
    getAuditForSession,
    getAuditForSoldier,
  };
});
