<script setup lang="ts">
import { computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { Crosshair, User, ArrowRight, Check } from 'lucide-vue-next'
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const uiStore = useUiStore()

const assignments = computed(() => {
  return masterStore.weapons.filter(w => w.status === 'IN_USE' || w.assigned_to).map(w => ({
    weapon: w,
    employee: masterStore.employees.find(e => e.id === w.assigned_to),
  }))
})

const availableWeapons = computed(() => masterStore.weapons.filter(w => w.status === 'AVAILABLE'))
const availableEmployees = computed(() => masterStore.employees.filter(e => e.status === 'ACTIVE'))

const selectedWeapon = ref<string | null>(null)
const selectedEmployee = ref<string | null>(null)

function assign() {
  if (!selectedWeapon.value || !selectedEmployee.value) return
  const weapon = masterStore.weapons.find(w => w.id === selectedWeapon.value)
  const emp = masterStore.employees.find(e => e.id === selectedEmployee.value)
  if (weapon && emp) {
    weapon.status = 'IN_USE'
    weapon.assigned_to = emp.id
    uiStore.showToast('success', 'Назначено', `${weapon.name} → ${emp.full_name.split(' ').slice(0,2).join(' ')}`)
    selectedWeapon.value = null
    selectedEmployee.value = null
  }
}
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">Назначение оружия</h1>
      <p class="text-sm text-gray-500 mt-1">Выдача оружия сотрудникам</p>
    </div>
    <div class="card space-y-4">
      <h2 class="text-sm font-bold text-gray-700">Новое назначение</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Оружие</label>
          <select v-model="selectedWeapon" class="input text-sm">
            <option value="">Выберите...</option>
            <option v-for="w in availableWeapons" :key="w.id" :value="w.id">{{ w.name }} ({{ w.serial_number }})</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Сотрудник</label>
          <select v-model="selectedEmployee" class="input text-sm">
            <option value="">Выберите...</option>
            <option v-for="e in availableEmployees" :key="e.id" :value="e.id">{{ e.full_name }} ({{ e.rank }})</option>
          </select>
        </div>
      </div>
      <button class="btn-primary text-xs" :disabled="!selectedWeapon || !selectedEmployee" @click="assign"><Check class="w-3.5 h-3.5" /> Назначить</button>
    </div>
    <div class="card">
      <h2 class="text-sm font-bold text-gray-700 mb-3">Текущие назначения</h2>
      <div v-if="assignments.length === 0" class="text-sm text-gray-400 py-4 text-center">Нет активных назначений</div>
      <div class="space-y-2">
        <div v-for="a in assignments" :key="a.weapon.id" class="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><Crosshair class="w-4 h-4 text-gray-500" /></div>
            <div><p class="text-sm font-semibold text-gray-800">{{ a.weapon.name }}</p><p class="text-xs text-gray-400">{{ a.weapon.serial_number }}</p></div>
          </div>
          <div class="flex items-center gap-2"><ArrowRight class="w-4 h-4 text-gray-300" /><span class="text-sm text-gray-700">{{ a.employee?.full_name.split(' ').slice(0,2).join(' ') || '-' }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
