/**
 * WebSocket composable for real-time queue updates.
 * Connects to the backend channel layer and receives push events:
 * - soldier_completed → when current shooter finishes
 * - next_soldier → when next shooter is called
 * - queue_completed → when entire queue is done
 * - analysis_ready → when AI analysis results are available
 */
import { ref, onUnmounted } from 'vue'

export interface QueueSocketEvent {
  type: 'soldier_completed' | 'next_soldier' | 'queue_completed' | 'analysis_ready' | 'queue_update' | 'state' | 'connected'
  data: any
}

export function useQueueSocket(queueId: string, onEvent?: (event: QueueSocketEvent) => void) {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const lastEvent = ref<QueueSocketEvent | null>(null)

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws/queue/${queueId}/`

    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      connected.value = true
    }

    ws.value.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as QueueSocketEvent
        lastEvent.value = msg
        onEvent?.(msg)
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }

    ws.value.onclose = () => {
      connected.value = false
    }

    ws.value.onerror = () => {
      connected.value = false
    }
  }

  function send(action: string, payload?: any) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ action, ...payload }))
    }
  }

  function disconnect() {
    ws.value?.close()
    ws.value = null
    connected.value = false
  }

  onUnmounted(disconnect)

  return { connected, lastEvent, connect, disconnect, send }
}
