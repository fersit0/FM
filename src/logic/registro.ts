// Registro de sesiones a prueba de olvidos (RUTINA-FINAL.md, 2). Puro, sin React.
// Una sola lista de sesiones; todo lo demás se calcula de ahí. Las sesiones se cierran solas, los días de gym sin
// registro se preguntan una sola vez y se puede registrar una sesión hecha sin la app.
import type { Sesion, SetLog, SesionTipo, Settings } from '../data/tipos'
import { listaDe } from '../data/ejercicios'
import { claveFecha, desdeClave, inicioSemana, sumarDias } from './fechas'
import { cuenta, hechas, siguienteSesion, diaFridaPlaneado, sesionesDeSemana, META, type PlanFrida } from './semana'

/** Fecha y hora de la A del 7 oct 2026 que Fer hizo sin la app (RUTINA-FINAL.md, 2.8) */
export const CARGA_INICIAL = { fecha: '2026-10-07', tipo: 'A' as const }

/** Sesión registrada sin la app (Historial, pregunta de Hoy o carga inicial): a las 7:30 pm, una hora */
export function sesionRegistrada(fecha: string, tipo: SesionTipo, id = `registro-${fecha}-${tipo}`): Sesion {
  const inicio = new Date(fecha + 'T19:30:00').getTime()
  return { id, fecha, tipo, version: 'completa', inicio, fin: inicio + 60 * 60000, terminada: true, cambios: [], como: 'registrada', origen: 'registro' }
}

/** La A del 7 oct 2026, una sola vez: si no hay ninguna sesión ese día */
export function cargaInicial(sesiones: Sesion[]): Sesion | null {
  if (sesiones.some((s) => s.fecha === CARGA_INICIAL.fecha)) return null
  return sesionRegistrada(CARGA_INICIAL.fecha, CARGA_INICIAL.tipo)
}

/** Series planeadas de una sesión (para saber si quedó completa o parcial) */
export function seriesPlaneadas(s: Sesion): number {
  if (s.tipo === 'FRIDA') return 0
  const lista = listaDe(s.tipo, s.version, !!s.pierna).filter((e) => !s.recortados?.includes(e.id))
  return lista.reduce((a, e) => a + (s.ligera ? Math.min(2, e.series) : e.series), 0)
}
/** Cómo quedó una sesión hecha con la app: completa si se hizo la mayoría de las series (corta si era corta), si no parcial */
export function comoQuedo(s: Sesion, sets: SetLog[]): Sesion['como'] {
  const n = sets.filter((x) => x.sessionId === s.id).length
  const planeadas = seriesPlaneadas(s)
  if (planeadas > 0 && n < planeadas / 2) return 'parcial'
  return s.version === 'corta' ? 'corta' : 'completa'
}

/**
 * Cierre automático: las sesiones abiertas de días anteriores (o todas, al empezar otra) se cierran con una serie o más;
 * sin series se descartan, porque no son datos. Devuelve qué guardar y qué borrar.
 */
export function cierresPendientes(sesiones: Sesion[], sets: SetLog[], hoy: string, todas = false): { guardar: Sesion[]; borrar: string[] } {
  const guardar: Sesion[] = []
  const borrar: string[] = []
  for (const s of sesiones) {
    if (s.terminada) continue
    if (!todas && s.fecha >= hoy) continue
    if (sets.some((x) => x.sessionId === s.id)) {
      const ultima = Math.max(...sets.filter((x) => x.sessionId === s.id).map((x) => x.hora))
      guardar.push({ ...s, terminada: true, fin: s.fin ?? ultima, como: comoQuedo(s, sets), origen: s.origen ?? 'app' })
    } else borrar.push(s.id)
  }
  return { guardar, borrar }
}

/** Lunes a jueves son días de gym; el domingo solo de rescate (si la semana va en menos de 3) */
export function esDiaDeGym(fecha: string, sesiones: Sesion[], sets: SetLog[] = []): boolean {
  const d = desdeClave(fecha)
  const dow = d.getDay()
  if (dow >= 1 && dow <= 4) return true
  if (dow === 0) return sesionesDeSemana(sesiones, d, sets).filter((s) => s.fecha < fecha).length < META
  return false
}

export interface DiaPendiente {
  fecha: string
  /** la que tocaba ese día: FRIDA si era el día planeado, si no la A o B que seguía */
  sugerida: 'A' | 'B' | 'FRIDA'
}
export const DIAS_ATRAS_MAX = 7
/**
 * Días de gym sin registro desde la última sesión (máximo una semana atrás) hasta ayer, que no se hayan contestado "No fui".
 * Se preguntan uno por uno antes de armar la sesión de hoy.
 */
export function diasSinRegistro(sesiones: Sesion[], sets: SetLog[], settings: Pick<Settings, 'noFui' | 'fridaPlan'>, hoy: Date): DiaPendiente[] {
  const todas = hechas(sesiones, sets)
  if (todas.length === 0) return []
  const hoyClave = claveFecha(hoy)
  const ultima = todas[todas.length - 1].fecha
  const tope = claveFecha(sumarDias(hoy, -DIAS_ATRAS_MAX))
  const out: DiaPendiente[] = []
  for (let i = DIAS_ATRAS_MAX; i >= 1; i--) {
    const fecha = claveFecha(sumarDias(hoy, -i))
    if (fecha <= ultima || fecha < tope || fecha >= hoyClave) continue
    if (settings.noFui?.includes(fecha)) continue
    if (sesiones.some((s) => s.fecha === fecha && cuenta(s, sets))) continue
    if (!esDiaDeGym(fecha, sesiones, sets)) continue
    out.push({ fecha, sugerida: sugeridaPara(fecha, sesiones, sets, settings.fridaPlan) })
  }
  return out
}
/** Qué tocaba un día: FRIDA si era el planeado de su semana, si no la que seguía según el historial anterior a ese día */
export function sugeridaPara(fecha: string, sesiones: Sesion[], sets: SetLog[], plan?: PlanFrida): 'A' | 'B' | 'FRIDA' {
  if (diaFridaPlaneado(plan, desdeClave(fecha)) === fecha) return 'FRIDA'
  return siguienteSesion(sesiones, sets, fecha)
}

/** Días de esta semana hasta hoy (para "Pon al día tu semana"), con lo que ya tienen registrado */
export function diasDeSemanaHastaHoy(sesiones: Sesion[], sets: SetLog[], hoy: Date): { fecha: string; registrado: SesionTipo | null }[] {
  const ini = inicioSemana(hoy)
  const hoyClave = claveFecha(hoy)
  const out: { fecha: string; registrado: SesionTipo | null }[] = []
  for (let i = 0; i < 7; i++) {
    const fecha = claveFecha(sumarDias(ini, i))
    if (fecha > hoyClave) break
    const s = hechas(sesiones, sets).filter((x) => x.fecha === fecha)
    const propia = s.find((x) => x.tipo === 'A' || x.tipo === 'B') ?? s.find((x) => x.tipo === 'FRIDA') ?? s[0]
    out.push({ fecha, registrado: propia?.tipo ?? null })
  }
  return out
}

/**
 * Registrar una sesión hecha sin la app. Nunca en el futuro. Máximo una A o B por día: si ese día ya tiene una,
 * se devuelve en `reemplaza` para ofrecer cambiarla en vez de duplicarla. FRIDA es una por día (mismo id).
 */
export function armarRegistro(sesiones: Sesion[], fecha: string, tipo: SesionTipo, hoy: string): { sesion: Sesion; reemplaza: Sesion | null } | { error: string } {
  if (fecha > hoy) return { error: 'Esa fecha todavía no llega.' }
  if (tipo === 'A' || tipo === 'B') {
    const otra = sesiones.find((s) => s.fecha === fecha && (s.tipo === 'A' || s.tipo === 'B'))
    if (otra) return { sesion: { ...otra, tipo, como: otra.origen === 'registro' || !otra.como ? 'registrada' : otra.como }, reemplaza: otra }
  }
  if (tipo === 'FRIDA') return { sesion: sesionRegistrada(fecha, 'FRIDA', `frida-${fecha}`), reemplaza: sesiones.find((s) => s.id === `frida-${fecha}`) ?? null }
  const n = sesiones.filter((s) => s.fecha === fecha && s.tipo === tipo).length
  return { sesion: sesionRegistrada(fecha, tipo, `registro-${fecha}-${tipo}-${n + 1}`), reemplaza: null }
}

/** "Hoy toca B · la última fue A el miércoles 7" */
export function textoUltima(ultima: Sesion | null, nombresDia: string[]): string {
  if (!ultima) return 'sin sesiones todavía'
  const d = desdeClave(ultima.fecha)
  return `la última fue ${ultima.tipo} el ${nombresDia[d.getDay()]} ${d.getDate()}`
}
