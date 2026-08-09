import { createApp } from 'vue'
import { createPinia } from './stores/pinia-shim'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

const app = createApp(App)

app.config.errorHandler = (err, _instance, info) => {
  console.error('Vue Error:', err, info)
}

window.addEventListener('error', (e) => {
  console.error('Window Error:', e.message, e.error)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Rejection:', e.reason)
})

app.use(createPinia())
app.use(router)
app.mount('#app')
