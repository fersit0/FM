// Hápticos (DISENO.md, sección 9). Android: navigator.vibrate. iOS 18+: truco del <input type="checkbox" switch>.
// Falla en silencio. Se puede apagar desde ajustes.

const CLAVE = 'gym-app:hapticos'

export function hapticosActivos(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== 'off'
  } catch {
    return true
  }
}

export function setHapticosActivos(v: boolean): void {
  try {
    localStorage.setItem(CLAVE, v ? 'on' : 'off')
  } catch {
    /* nada */
  }
}

let etiqueta: HTMLLabelElement | null = null

function switchOculto(): HTMLLabelElement | null {
  if (etiqueta) return etiqueta
  try {
    const l = document.createElement('label')
    l.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px;top:0'
    l.setAttribute('aria-hidden', 'true')
    const i = document.createElement('input')
    i.type = 'checkbox'
    i.setAttribute('switch', '')
    i.tabIndex = -1
    l.appendChild(i)
    document.body.appendChild(l)
    etiqueta = l
    return l
  } catch {
    return null
  }
}

let ultimoTick = 0

/** Un tap. Con `minIntervalo` se limita la frecuencia (dial: uno cada 40 ms). */
export function tap(minIntervalo = 0): void {
  if (!hapticosActivos()) return
  const ahora = performance.now()
  if (minIntervalo && ahora - ultimoTick < minIntervalo) return
  ultimoTick = ahora
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(10)
      return
    }
    switchOculto()?.click()
  } catch {
    /* sin soporte */
  }
}

/** Varios taps con separación en ms */
export function taps(cuantos: number, separacion: number): void {
  if (!hapticosActivos()) return
  if (typeof navigator.vibrate === 'function') {
    const patron: number[] = []
    for (let i = 0; i < cuantos; i++) {
      patron.push(12)
      if (i < cuantos - 1) patron.push(Math.max(0, separacion - 12))
    }
    try {
      navigator.vibrate(patron)
    } catch {
      /* nada */
    }
    return
  }
  for (let i = 0; i < cuantos; i++) setTimeout(() => switchOculto()?.click(), i * separacion)
}

// Patrones de la tabla de la sección 9
export const haptico = {
  marcaDial: () => tap(40),
  serieHecha: () => tap(),
  finEjercicio: () => taps(2, 110),
  finDescanso: () => taps(2, 110),
  finSesion: () => taps(3, 160),
}
