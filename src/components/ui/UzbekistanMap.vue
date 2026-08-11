<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import geoJsonData from '@/data/uzbekistan_regions.json'
import { republicRegions } from '@/data/republicData'
import { useI18n } from '@/i18n'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const props = defineProps<{
  selectedId?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', regionId: string): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let geoLayer: L.GeoJSON | null = null
let labels: L.Marker[] = []

const palette = {
  high:   { fill: '#22c55e', fillOpacity: 0.35, stroke: '#15803d', weight: 1 },
  medium: { fill: '#f59e0b', fillOpacity: 0.35, stroke: '#b45309', weight: 1 },
  low:    { fill: '#ef4444', fillOpacity: 0.35, stroke: '#991b1b', weight: 1 },
  default:{ fill: '#64748b', fillOpacity: 0.2, stroke: '#475569', weight: 1 },
}

function getStyle(score: number) {
  if (score >= 70) return palette.high
  if (score >= 60) return palette.medium
  return palette.low
}

const scoreMap = computed(() => {
  const m: Record<string, number> = {}
  republicRegions.forEach(r => { m[r.id] = r.avgScore })
  return m
})

function styleForFeature(feature: any) {
  const rid = feature.properties.id
  const score = scoreMap.value[rid] ?? -1
  const isSelected = props.selectedId === rid
  const isDimmed = props.selectedId && props.selectedId !== rid
  const base = score >= 0 ? getStyle(score) : palette.default
  return {
    fillColor: base.fill,
    fillOpacity: isSelected ? 0.6 : (isDimmed ? 0.1 : base.fillOpacity),
    color: isSelected ? '#1e293b' : base.stroke,
    weight: isSelected ? 2.5 : base.weight,
  }
}

function buildPopupHtml(feature: any, region: any): string {
  const name = isUz.value ? feature.properties.name_uz : feature.properties.name_ru
  const score = region.avgScore
  const tier = score >= 70 ? (isUz.value ? 'Yuqori' : 'Высокий') : score >= 60 ? (isUz.value ? "O\u02BBrta" : 'Средний') : (isUz.value ? 'Past' : 'Низкий')
  const tierColor = score >= 70 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
  return `<div style="font-family:system-ui,sans-serif;min-width:150px;">
    <div style="font-weight:700;font-size:13px;color:#1e293b;margin-bottom:4px;">${name}</div>
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="font-size:11px;color:#64748b;">KPI:</span>
      <span style="font-size:18px;font-weight:800;color:${tierColor};">${score}</span>
      <span style="font-size:10px;color:${tierColor};background:${tierColor}1a;padding:1px 6px;border-radius:4px;">${tier}</span>
    </div>
    <div style="font-size:10px;color:#94a3b8;margin-top:3px;">
      ${isUz.value ? 'Xodimlar' : 'Сотрудников'}: ${region.totalEmployees} \u00B7 ${isUz.value ? 'Sessiya' : 'Сессий'}: ${region.sessionsThisMonth}
    </div>
  </div>`
}

function onEachFeature(feature: any, layer: L.Layer) {
  const rid = feature.properties.id
  const region = republicRegions.find(r => r.id === rid)
  if (!region) return
  layer.bindPopup(buildPopupHtml(feature, region), { closeButton: false, className: 'uzmap-popup', maxWidth: 200 })
  layer.on({
    mouseover: (e: any) => {
      const l = e.target
      l.setStyle({ weight: 2, color: '#334155', fillOpacity: 0.5 })
      l.bringToFront()
    },
    mouseout: (e: any) => {
      if (geoLayer) geoLayer.resetStyle(e.target)
    },
    click: () => {
      emit('select', rid)
    },
  })
}

function getRegionCenter(feature: any): [number, number] {
  const rid = feature.properties.id
  const region = republicRegions.find(r => r.id === rid)
  const r = region as any
  if (r?.centerLat && r?.centerLng) {
    return [r.centerLat, r.centerLng]
  }
  const g = feature.geometry
  let latSum = 0, lngSum = 0, count = 0
  const collect = (coords: number[]) => {
    lngSum += coords[0]
    latSum += coords[1]
    count++
  }
  if (g.type === 'Polygon') {
    g.coordinates[0].forEach(collect)
  } else if (g.type === 'MultiPolygon') {
    g.coordinates.forEach((poly: number[][][]) => poly[0].forEach(collect))
  }
  return [latSum / count, lngSum / count]
}

function addLabels() {
  labels.forEach(m => m.remove())
  labels = []
  geoJsonData.features.forEach((feat: any) => {
    const rid = feat.properties.id
    const region = republicRegions.find(r => r.id === rid)
    if (!region) return
    const [lat, lng] = getRegionCenter(feat)
    const name = isUz.value ? feat.properties.name_uz : feat.properties.name_ru
    const score = region.avgScore
    const color = score >= 70 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
    const shortName = name.length > 14 ? name.substring(0, 12) + '\u2026' : name
    const icon = L.divIcon({
      className: 'uzmap-label',
      html: `<div style="background:rgba(255,255,255,0.92);color:#334155;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:600;white-space:nowrap;border:1px solid ${color}44;pointer-events:none;line-height:1.3;">${shortName} <span style="color:${color};font-weight:800;">${score}</span></div>`,
      iconSize: [0, 0],
    })
    const marker = L.marker([lat, lng], { icon, interactive: false, zIndexOffset: 1000 })
    marker.addTo(map!)
    labels.push(marker)
  })
}

function initMap() {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value, {
    center: [41.0, 64.5],
    zoom: props.compact ? 5 : 6,
    minZoom: 4,
    maxZoom: 8,
    zoomControl: !props.compact,
    scrollWheelZoom: false,
    attributionControl: false,
    dragging: true,
    doubleClickZoom: true,
  })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map)
  geoLayer = L.geoJSON(geoJsonData as any, {
    style: styleForFeature,
    onEachFeature: onEachFeature,
  }).addTo(map)
  addLabels()
  const bounds = geoLayer.getBounds()
  map.fitBounds(bounds, { padding: [10, 10] })
}

watch(() => props.selectedId, () => {
  if (geoLayer) {
    geoLayer.eachLayer((layer: any) => {
      geoLayer!.resetStyle(layer)
    })
  }
})

watch(locale, () => {
  if (map) {
    addLabels()
    geoLayer?.eachLayer((layer: any) => {
      const feat = layer.feature
      const rid = feat.properties.id
      const region = republicRegions.find(r => r.id === rid)
      if (!region) return
      layer.setPopupContent(buildPopupHtml(feat, region))
    })
  }
})

onMounted(() => {
  initMap()
  // Fix: invalidate size after mount to ensure correct rendering
  setTimeout(() => {
    if (map) map.invalidateSize()
  }, 100)
})
onUnmounted(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="relative w-full isolate" :style="{ height: compact ? '300px' : '500px' }">
    <div ref="mapContainer" class="w-full h-full rounded-2xl overflow-hidden" />
  </div>
</template>

<style>
.uzmap-popup .leaflet-popup-content-wrapper {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}
.uzmap-popup .leaflet-popup-content {
  margin: 8px 12px;
}
.uzmap-label {
  background: transparent !important;
  border: none !important;
}
</style>
