// Sonido sintetizado con Web Audio (DISENO-FM.md, sección 9). Apagado por defecto.

const CLAVE = 'gym-app:sonido'

export function sonidoActivo(): boolean {
  try {
    return localStorage.getItem(CLAVE) === 'on'
  } catch {
    return false
  }
}
export function setSonidoActivo(v: boolean): void {
  try {
    localStorage.setItem(CLAVE, v ? 'on' : 'off')
  } catch {
    /* nada */
  }
}

let ctx: AudioContext | null = null

/** Llamar desde un toque para que iOS permita sonar después */
export function prepararAudio(): void {
  if (!sonidoActivo()) return
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
  } catch {
    /* sin soporte */
  }
}

function nota(freq: number, inicio: number, dur: number, tipo: OscillatorType, vol: number) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = tipo
  osc.frequency.setValueAtTime(freq, inicio)
  gain.gain.setValueAtTime(0.0001, inicio)
  gain.gain.exponentialRampToValueAtTime(vol, inicio + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, inicio + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(inicio)
  osc.stop(inicio + dur + 0.02)
}

/** Fin de descanso: dos notas cortas y cálidas, senoidal con ataque suave */
export function sonarFinDescanso(): void {
  if (!sonidoActivo()) return
  try {
    prepararAudio()
    if (!ctx) return
    const t = ctx.currentTime
    nota(523, t, 0.22, 'sine', 0.3)
    nota(659, t + 0.18, 0.28, 'sine', 0.3)
  } catch {
    /* nada */
  }
}

/** Serie hecha: un clic mecánico corto */
export function sonarClic(): void {
  if (!sonidoActivo()) return
  try {
    prepararAudio()
    if (!ctx) return
    const t = ctx.currentTime
    nota(1800, t, 0.03, 'square', 0.08)
  } catch {
    /* nada */
  }
}
