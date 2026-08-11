import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { CameraConfig } from '@/api/camera.api'

const STORAGE_KEY = 'shaffoftir_cameras'

function loadCameras(): CameraConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  // Default cameras from existing lane data
  return [
    { id: 'cam-1', name: 'Yoʻlak 1 kamerasi', ip: '192.168.1.64', port: 80, username: 'admin', password: '', streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101', hlsPath: '/stream/1/hls', mjpegPath: '/Streaming/Channels/101/preview', snapshotPath: '/ISAPI/Streaming/channels/101/picture', enabled: true, zone: 'lane', laneNumber: 1 },
    { id: 'cam-2', name: 'Yoʻlak 2 kamerasi', ip: '192.168.1.65', port: 80, username: 'admin', password: '', streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101', hlsPath: '/stream/2/hls', mjpegPath: '/Streaming/Channels/101/preview', snapshotPath: '/ISAPI/Streaming/channels/101/picture', enabled: true, zone: 'lane', laneNumber: 2 },
    { id: 'cam-3', name: 'Yoʻlak 3 kamerasi', ip: '192.168.1.66', port: 80, username: 'admin', password: '', streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101', hlsPath: '/stream/3/hls', mjpegPath: '/Streaming/Channels/101/preview', snapshotPath: '/ISAPI/Streaming/channels/101/picture', enabled: true, zone: 'lane', laneNumber: 3 },
    { id: 'cam-4', name: 'Yoʻlak 4 kamerasi', ip: '192.168.1.67', port: 80, username: 'admin', password: '', streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101', hlsPath: '/stream/4/hls', mjpegPath: '/Streaming/Channels/101/preview', snapshotPath: '/ISAPI/Streaming/channels/101/picture', enabled: false, zone: 'lane', laneNumber: 4 },
    { id: 'cam-5', name: 'Yoʻlak 5 kamerasi', ip: '192.168.1.68', port: 80, username: 'admin', password: '', streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101', hlsPath: '/stream/5/hls', mjpegPath: '/Streaming/Channels/101/preview', snapshotPath: '/ISAPI/Streaming/channels/101/picture', enabled: true, zone: 'lane', laneNumber: 5 },
    { id: 'cam-6', name: 'Yoʻlak 6 kamerasi', ip: '192.168.1.69', port: 80, username: 'admin', password: '', streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101', hlsPath: '/stream/6/hls', mjpegPath: '/Streaming/Channels/101/preview', snapshotPath: '/ISAPI/Streaming/channels/101/picture', enabled: false, zone: 'lane', laneNumber: 6 },
    { id: 'cam-entrance', name: 'Kirish kamerasi', ip: '192.168.1.70', port: 80, username: 'admin', password: '', streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101', hlsPath: '/stream/entrance/hls', mjpegPath: '/Streaming/Channels/101/preview', snapshotPath: '/ISAPI/Streaming/channels/101/picture', enabled: true, zone: 'entrance' },
    { id: 'cam-armory', name: 'Qurol ombori kamerasi', ip: '192.168.1.71', port: 80, username: 'admin', password: '', streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101', hlsPath: '/stream/armory/hls', mjpegPath: '/Streaming/Channels/101/preview', snapshotPath: '/ISAPI/Streaming/channels/101/picture', enabled: true, zone: 'armory' },
  ]
}

export const useCameraStore = defineStore('camera', () => {
  const cameras = ref<CameraConfig[]>(loadCameras())
  const connectionStatus = ref<Record<string, 'ONLINE' | 'OFFLINE' | 'CONNECTING'>>({})

  const enabledCameras = computed(() => cameras.value.filter(c => c.enabled))
  const onlineCameras = computed(() => enabledCameras.value.filter(c => connectionStatus.value[c.id] === 'ONLINE'))

  function saveCameras() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras.value))
  }

  function addCamera(cam: Omit<CameraConfig, 'id'>) {
    const id = `cam-${Date.now()}`
    cameras.value.push({ ...cam, id })
    saveCameras()
    return id
  }

  function updateCamera(id: string, patch: Partial<CameraConfig>) {
    const idx = cameras.value.findIndex(c => c.id === id)
    if (idx >= 0) {
      cameras.value[idx] = { ...cameras.value[idx], ...patch }
      saveCameras()
    }
  }

  function removeCamera(id: string) {
    cameras.value = cameras.value.filter(c => c.id !== id)
    delete connectionStatus.value[id]
    saveCameras()
  }

  function setStatus(id: string, status: 'ONLINE' | 'OFFLINE' | 'CONNECTING') {
    connectionStatus.value[id] = status
  }

  function getCameraByLane(laneNumber: number): CameraConfig | undefined {
    return cameras.value.find(c => c.laneNumber === laneNumber && c.enabled)
  }

  function getCamerasByZone(zone: string): CameraConfig[] {
    return cameras.value.filter(c => c.zone === zone && c.enabled)
  }

  // Test connection to a camera by loading a snapshot
  async function testConnection(cam: CameraConfig): Promise<boolean> {
    setStatus(cam.id, 'CONNECTING')
    try {
      const url = cam.streamType === 'SNAPSHOT'
        ? buildSnapshotUrl(cam)
        : cam.streamType === 'MJPEG'
        ? buildMjpegUrl(cam)
        : buildHlsUrl(cam)

      // Use Image object to test snapshot
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const timeout = setTimeout(() => {
          setStatus(cam.id, 'OFFLINE')
          resolve(false)
        }, 5000)

        img.onload = () => {
          clearTimeout(timeout)
          setStatus(cam.id, 'ONLINE')
          resolve(true)
        }
        img.onerror = () => {
          clearTimeout(timeout)
          setStatus(cam.id, 'OFFLINE')
          resolve(false)
        }
        img.src = url
      })
    } catch {
      setStatus(cam.id, 'OFFLINE')
      return false
    }
  }

  return {
    cameras,
    connectionStatus,
    enabledCameras,
    onlineCameras,
    addCamera,
    updateCamera,
    removeCamera,
    setStatus,
    testConnection,
    getCameraByLane,
    getCamerasByZone,
    saveCameras,
  }
})

// Import URL builders
import { buildSnapshotUrl, buildMjpegUrl, buildHlsUrl } from '@/api/camera.api'
