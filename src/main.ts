import { createApp } from 'vue'
import { createPinia } from './stores/pinia-shim'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

const app = createApp(App)

app.config.errorHandler = (err, _instance, info) => {
  console.error('Vue Error:', err, info)
  // Always show error at top of page
  const banner = document.createElement('div')
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:16px;font-family:monospace;font-size:12px;color:#dc2626;background:#fef2f2;border-bottom:2px solid red;max-height:50vh;overflow:auto'
  banner.innerHTML = `<b>Vue Error:</b> ${String(err)}<br><b>Info:</b> ${info}<br><b>Stack:</b> ${(err as any)?.stack || ''}`
  document.body.appendChild(banner)
}

window.addEventListener('error', (e) => {
  console.error('Window Error:', e.error)
  const banner = document.createElement('div')
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:16px;font-family:monospace;font-size:12px;color:#dc2626;background:#fef2f2;border-bottom:2px solid red;max-height:50vh;overflow:auto'
  banner.innerHTML = `<b>JS Error:</b> ${e.message}<br><b>Stack:</b> ${e.error?.stack || ''}`
  document.body.appendChild(banner)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Rejection:', e.reason)
  const banner = document.createElement('div')
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:16px;font-family:monospace;font-size:12px;color:#dc2626;background:#fef2f2;border-bottom:2px solid red;max-height:50vh;overflow:auto'
  banner.innerHTML = `<b>Unhandled Rejection:</b> ${String(e.reason)}<br><b>Stack:</b> ${e.reason?.stack || ''}`
  document.body.appendChild(banner)
})

app.use(createPinia())
app.use(router)
app.mount('#app')
