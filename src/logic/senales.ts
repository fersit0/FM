// Vibración y beep corto para acciones importantes. Nada de fanfarrias.

export function vibrar(patron: number | number[] = 40): void {
  try {
    navigator.vibrate?.(patron)
  } catch {
    /* sin soporte */
  }
}

let ctx: AudioContext | null = null

/** Hay que llamarlo desde un toque del usuario para que iOS permita sonido después */
export function prepararAudio(): void {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
  } catch {
    /* sin soporte */
  }
}

/** Golpe sintético cálido, corto */
export function beep(): void {
  try {
    if (!ctx) prepararAudio()
    if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(660, t)
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.18)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.25)
  } catch {
    /* sin soporte */
  }
}
