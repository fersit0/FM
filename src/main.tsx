import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './design/tokens.css'
import './design/pantalla.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { pedirPersistencia } from './data/db'
import { sembrarSiToca } from './dev/seed'

pedirPersistencia()

// Versión nueva: se avisa en Inicio y se actualiza al tocar, sin perder datos (todo vive en IndexedDB y localStorage)
declare global {
  interface Window { fmActualizar?: () => Promise<void> }
}
const actualizar = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.fmActualizar = () => actualizar(true)
    window.dispatchEvent(new Event('fm:version-nueva'))
  },
})
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    sessionStorage.setItem('gym-app:actualizada', '1')
  })
}

document.body.dataset.pantalla = 'inicio'

sembrarSiToca().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
})
