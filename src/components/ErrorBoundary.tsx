import { Component, type ReactNode } from 'react'

/** Nada deja la app atorada: si algo truena, se registra y hay salida al inicio. La sesión ya está guardada. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: { componentStack?: string }) {
    try {
      const lista = JSON.parse(localStorage.getItem('gym-app:errores') ?? '[]') as unknown[]
      lista.push({ fecha: new Date().toISOString(), mensaje: String(error?.message ?? error), pila: String(error?.stack ?? '').slice(0, 2000), componente: String(info?.componentStack ?? '').slice(0, 1000) })
      localStorage.setItem('gym-app:errores', JSON.stringify(lista.slice(-20)))
    } catch { /* nada */ }
    console.error(error)
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="pantalla" style={{ justifyContent: 'flex-end', background: 'var(--tinta)', color: 'var(--piedra)', minHeight: '100dvh' }}>
        <img className="pez" src={`${import.meta.env.BASE_URL}pez/confundido.png`} alt="" style={{ position: 'static', width: 96, height: 96 }} />
        <h1 className="t-titulo">Algo falló.</h1>
        <p className="t-sub" style={{ color: 'color-mix(in srgb, var(--piedra) 60%, transparent)' }}>Tu sesión está guardada.</p>
        <button className="boton" style={{ background: 'var(--rojo)', color: 'var(--tinta)', marginTop: 24 }} onClick={() => { location.hash = ''; location.reload() }}>Volver al inicio</button>
      </div>
    )
  }
}
