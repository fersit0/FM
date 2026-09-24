// Preferencias en localStorage
import { SETTINGS_DEFAULT, type Settings } from './tipos'

const CLAVE = 'gym-app:settings'

export function leerSettings(): Settings {
  try {
    const raw = localStorage.getItem(CLAVE)
    if (!raw) return { ...SETTINGS_DEFAULT }
    return { ...SETTINGS_DEFAULT, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return { ...SETTINGS_DEFAULT }
  }
}

export function escribirSettings(s: Settings): void {
  localStorage.setItem(CLAVE, JSON.stringify(s))
}
