// Registro de sesiones a prueba de olvidos (RUTINA-FINAL.md, 2, con MANANAS-30.md, 4). Puro, sin React.
// Una sola lista de sesiones; todo lo demás se calcula de ahí. Las sesiones se cierran solas, los días hábiles sin
// registro se preguntan una sola vez y se puede registrar una sesión hecha sin la app, o una visita de solo regadera.
import type { Sesion, SetLog, SesionTipo, Settings, FridaTipo, Momento, Rota } from '../data/tipos'
import { claveFecha, desdeClave, sumarDias, minutosAhora } from './fechas'
import { cuenta, hechas, tocaSesion, fridaTipoDe, esClub, esHabil } from './semana'
import { listaDeSesion } from './sesion'

/** Fecha y hora de la A del 7 oct 2026 que Fer hizo sin la app (RUTINA-FINAL.md, 2.7) */
export const CARGA_INICIAL = { fecha: '2026-10-07', tipo: 'A' as const }

/** Sesión registrada sin la app (Historial, pregunta de Hoy o carga inicial): a las 7:30 pm, una hora */
export function sesionRegistrada(fecha: string, tipo: SesionTipo, id = `registro-${fecha}-${tipo}`, nota?: string): Sesion {
  const inicio = new Date(fecha + 'T19:30:00').getTime()
  return { id, fecha, tipo, version: 'completa', inicio, fin: inicio + 60 * 60000, terminada: true, cambios: [], como: 'registrada', origen: 'registro', ...(nota ? { nota } : {}) }
}
/** Visita de solo regadera (MANANAS-30.md, 4): una por día, sin ejercicios, en la mañana. `inicio` es la hora real si se marca en el momento. */
export function visita(fecha: string, inicio = new Date(fecha + 'T07:40:00').getTime()): Sesion {
  return { id: `visita-${fecha}`, fecha, tipo: 'VISITA', version: 'completa', inicio, fin: inicio, terminada: true, cambios: [], como: 'registrada', origen: 'registro', momento: 'manana' }
}
/** La visita de un día que ya tiene pesas en el club queda absorbida: no se lista ni se cuenta aparte */
export function absorbida(s: Sesion, sesiones: Sesion[], sets: SetLog[] = []): boolean {
  return s.tipo === 'VISITA' && sesiones.some((x) => x.fecha === s.fecha && esClub(x.tipo) && cuenta(x, sets))
}

/** La A del 7 oct 2026, una sola vez: si no hay ninguna sesión ese día */
export function cargaInicial(sesiones: Sesion[]): Sesion | null {
  if (sesiones.some((s) => s.fecha === CARGA_INICIAL.fecha)) return null
  return sesionRegistrada(CARGA_INICIAL.fecha, CARGA_INICIAL.tipo)
}

/** Series planeadas de una sesión (para saber si quedó completa o parcial) */
export function seriesPlaneadas(s: Sesion): number {
  return listaDeSesion(s).reduce((a, e) => a + (s.ligera ? Math.min(2, e.series) : e.series), 0)
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

/** Día de club (MANANAS-30.md, 4): de lunes a viernes, todos. Sábado y domingo no llevan plan. */
export function esDiaDeGym(fecha: string): boolean {
  return esHabil(desdeClave(fecha))
}
/** Antes de las 12 es mañana (RUTINA-FINAL.md v7, 2.1) */
export function momentoDe(ms: number): Momento {
  return minutosAhora(new Date(ms)) < 12 * 60 ? 'manana' : 'noche'
}
/** Al registrar después: Frida en la noche y lo demás en la mañana */
export function momentoPorDefecto(tipo?: SesionTipo): Momento {
  return tipo === 'FRIDA' ? 'noche' : 'manana'
}

export interface DiaPendiente {
  fecha: string
  /** la que tocaba ese día por la rotación */
  sugerida: Rota
}
export const DIAS_ATRAS_MAX = 7
/**
 * Días hábiles sin registro desde la última sesión (máximo una semana atrás, y nunca de antes de la v8) hasta ayer, que
 * no se hayan contestado "No fui". Se preguntan uno por uno antes de armar la sesión de hoy: "¿Fuiste al club el martes?"
 */
export function diasSinRegistro(sesiones: Sesion[], sets: SetLog[], settings: Pick<Settings, 'noFui' | 'v8Desde'>, hoy: Date): DiaPendiente[] {
  const desde = settings.v8Desde
  if (!desde) return []
  const todas = hechas(sesiones, sets)
  const hoyClave = claveFecha(hoy)
  const ultima = todas.length ? todas[todas.length - 1].fecha : ''
  const out: DiaPendiente[] = []
  for (let i = DIAS_ATRAS_MAX; i >= 1; i--) {
    const fecha = claveFecha(sumarDias(hoy, -i))
    if (fecha < desde || fecha <= ultima || fecha >= hoyClave) continue
    if (settings.noFui?.includes(fecha)) continue
    if (!esDiaDeGym(fecha)) continue
    out.push({ fecha, sugerida: sugeridaPara(fecha, sesiones, sets, desde) })
  }
  return out
}
/** Qué tocaba un día: la de la rotación con lo hecho antes de ese día */
export function sugeridaPara(fecha: string, sesiones: Sesion[], sets: SetLog[], desde?: string): Rota {
  return tocaSesion(sesiones.filter((s) => s.fecha < fecha), desdeClave(fecha), sets, { desde })
}

/**
 * Registrar una sesión hecha sin la app. Nunca en el futuro. Máximo una sesión de club (A, B o C) por día: si ese
 * día ya tiene una, se devuelve en `reemplaza` para ofrecer cambiarla en vez de duplicarla. FRIDA es una por día
 * (mismo id) y puede llevar una nota. La visita es una por día y no se registra sobre un día que ya tiene pesas.
 */
export function armarRegistro(sesiones: Sesion[], fecha: string, tipo: SesionTipo, hoy: string, nota?: string, opciones: { fridaTipo?: FridaTipo; momento?: Momento } = {}): { sesion: Sesion; reemplaza: Sesion | null } | { error: string } {
  if (fecha > hoy) return { error: 'Esa fecha todavía no llega.' }
  const { fridaTipo, momento } = opciones
  const conMomento = (s: Sesion): Sesion => (momento ? { ...s, momento } : s)
  if (tipo === 'VISITA') {
    const club = sesiones.find((s) => s.fecha === fecha && esClub(s.tipo))
    if (club) return { error: `Ese día ya tiene ${club.tipo}: la ida al club ya está contada.` }
    const antes = sesiones.find((s) => s.id === `visita-${fecha}`) ?? null
    return { sesion: visita(fecha), reemplaza: antes }
  }
  if (esClub(tipo)) {
    const otra = sesiones.find((s) => s.fecha === fecha && esClub(s.tipo))
    if (otra) return { sesion: conMomento({ ...otra, tipo, sinPierna: undefined, como: otra.origen === 'registro' || !otra.como ? 'registrada' : otra.como }), reemplaza: otra }
  }
  if (tipo === 'FRIDA') {
    const antes = sesiones.find((s) => s.id === `frida-${fecha}`) ?? null
    return { sesion: conMomento({ ...sesionRegistrada(fecha, 'FRIDA', `frida-${fecha}`, nota), fridaTipo: fridaTipo ?? (antes ? fridaTipoDe(antes) : 'torso') }), reemplaza: antes }
  }
  const n = sesiones.filter((s) => s.fecha === fecha && s.tipo === tipo).length
  return { sesion: conMomento(sesionRegistrada(fecha, tipo, `registro-${fecha}-${tipo}-${n + 1}`)), reemplaza: null }
}

/** "la última fue A el miércoles 7" */
export function textoUltima(ultima: Sesion | null, nombresDia: string[]): string {
  if (!ultima) return 'sin sesiones todavía'
  const d = desdeClave(ultima.fecha)
  return `la última fue ${ultima.tipo} el ${nombresDia[d.getDay()]} ${d.getDate()}`
}

/**
 * Cambiar en Historial qué fue una sesión. Una de club por día: si ese día ya tiene otra, no se puede. Frida lleva su
 * tipo; lo demás no. La "A sin pierna" de la v7 deja de serlo al cambiarla.
 */
export function cambiarTipo(sesiones: Sesion[], s: Sesion, tipo: SesionTipo, fridaTipo?: FridaTipo): Sesion | { error: string } {
  const otra = esClub(tipo) ? sesiones.find((x) => x.id !== s.id && x.fecha === s.fecha && esClub(x.tipo)) : undefined
  if (otra) return { error: `Ese día ya tiene ${otra.tipo}.` }
  return { ...s, tipo, fridaTipo: tipo === 'FRIDA' ? fridaTipo ?? fridaTipoDe(s) : undefined, sinPierna: tipo === 'A' && s.tipo === 'A' ? s.sinPierna : undefined }
}
