import { httpClient } from './httpClient';
import type { CameraHealthRequest, CameraHealthResponse } from '@/types';

// Camera stream URL builders
// Most IP cameras (Hikvision, Dahua, etc.) support HTTP snapshot & MJPEG streams
// For RTSP-only cameras, use go2rtc or MediaMTX as a relay to convert RTSP→HLS/WebRTC

export interface CameraConfig {
  id: string
  name: string
  ip: string
  port: number
  username: string
  password: string
  streamType: 'MJPEG' | 'HLS' | 'SNAPSHOT' | 'RTSP'
  rtspPath: string
  hlsPath: string
  mjpegPath: string
  snapshotPath: string
  enabled: boolean
  zone: string
  laneNumber?: number
}

// Build MJPEG stream URL for Hikvision/Dahua cameras
export function buildMjpegUrl(cam: CameraConfig): string {
  const proto = 'http'
  const auth = cam.username && cam.password
    ? `${encodeURIComponent(cam.username)}:${encodeURIComponent(cam.password)}@`
    : ''
  return `${proto}://${auth}${cam.ip}:${cam.port}${cam.mjpegPath}`
}

// Build snapshot URL
export function buildSnapshotUrl(cam: CameraConfig): string {
  const proto = 'http'
  const auth = cam.username && cam.password
    ? `${encodeURIComponent(cam.username)}:${encodeURIComponent(cam.password)}@`
    : ''
  return `${proto}://${auth}${cam.ip}:${cam.port}${cam.snapshotPath}`
}

// Build HLS stream URL (requires go2rtc/MediaMTX relay)
export function buildHlsUrl(cam: CameraConfig): string {
  return `http://${cam.ip}:${cam.port}${cam.hlsPath}`
}

// Build RTSP URL
export function buildRtspUrl(cam: CameraConfig): string {
  const auth = cam.username && cam.password
    ? `${cam.username}:${cam.password}@`
    : ''
  return `rtsp://${auth}${cam.ip}:${cam.port}${cam.rtspPath}`
}

// Default camera configs for common brands
export const CAMERA_PRESETS: Record<string, Partial<CameraConfig>> = {
  hikvision: {
    port: 80,
    rtspPath: '/Streaming/Channels/101',
    mjpegPath: '/Streaming/Channels/101/preview',
    snapshotPath: '/ISAPI/Streaming/channels/101/picture',
    streamType: 'SNAPSHOT',
  },
  dahua: {
    port: 80,
    rtspPath: '/cam/realmonitor?channel=1&subtype=0',
    mjpegPath: '/cgi-bin/mjpg/video.cgi?channel=1',
    snapshotPath: '/cgi-bin/snapshot.cgi?channel=1',
    streamType: 'SNAPSHOT',
  },
  generic: {
    port: 80,
    rtspPath: '/stream1',
    mjpegPath: '/mjpeg/1',
    snapshotPath: '/snap/1',
    streamType: 'SNAPSHOT',
  },
}

export const cameraApi = {
  checkHealth: (data: CameraHealthRequest) =>
    httpClient.post<CameraHealthResponse>('/api/camera-health', data),
}
