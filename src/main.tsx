import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './design/tokens.css'
import './design/base.css'
import './design/pantalla.css'
import App from './App'
import { pedirPersistencia } from './data/db'
import { sembrarSiToca } from './dev/seed'

pedirPersistencia()

// Aviso discreto de "actualizada": cuando el service worker nuevo toma control, la página recarga.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    sessionStorage.setItem('gym-app:actualizada', '1')
  })
}
registerSW({ immediate: true })

// Grano fijo sobre el fondo, detrás de todo
const grano = document.createElement('div')
grano.className = 'grano'
grano.setAttribute('aria-hidden', 'true')
document.body.prepend(grano)
document.body.dataset.temp = 'reposo'

sembrarSiToca().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
