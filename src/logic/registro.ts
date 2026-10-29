// Registro de sesiones a prueba de olvidos (RUTINA-FINAL.md, 2). Puro, sin React.
// Una sola lista de sesiones; todo lo demás se calcula de ahí. Las sesiones se cierran solas, los días de gym sin
// registro se preguntan una sola vez y se puede registrar una sesión hecha sin la app.
import type { Sesion, SetLog, SesionTipo, Settings, FridaTipo, Momento } from '../data/tipos'
import { listaDe } from '../data/ejercicios'
import { claveFecha, desdeClave, inicioSemana, sumarDias, minutosAhora } from './fechas'
import { cuenta, hechas, elegirSesion, diaFridaPlaneado, diaDeFrida, sesionesDeSemana, fridaTipoDe, META, type PlanFrida } from './semana'

/** Fecha y hora de la A del 7 oct 2026 que Fer hizo sin la app (RUTINA-FINAL.md, 2.7) */
export const CARGA_INICIAL = { fecha: '2026-10-07', tipo: 'A' as const }

/** Sesión registrada sin la app (Historial, pregunta de Hoy o carga inicial): a las 7:30 pm, una hora */
export function sesionRegistrada(fecha: string, tipo: SesionTipo, id = `registro-${fecha}-${tipo}`, nota?: string): Sesion {
  const inicio = new Date(fecha + 'T19:30:00').getTime()
  return { id, fecha, tipo, version: 'completa', inicio, fin: inicio + 60 * 60000, terminada: true, cambios: [], como: 'registrada', origen: 'registro', ...(nota ? { nota } : {}) }
}

/** La A del 7 oct 2026, una sola vez: si no hay ninguna sesión ese día */
export function cargaInicial(sesiones: Sesion[]): Sesion | null {
  if (sesiones.some((s) => s.fecha === CARGA_INICIAL.fecha)) return null
  return sesionRegistrada(CARGA_INICIAL.fecha, CARGA_INICIAL.tipo)
}

/** Series planeadas de una sesión (para saber si quedó completa o parcial) */
export function seriesPlaneadas(s: Sesion): number {
  if (s.tipo === 'FRIDA') return 0
  const lista = listaDe(s.tipo, s.version, !!s.sinPierna).filter((e) => !s.recortados?.includes(e.id))
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

/** Cuántas llevaba la semana antes de ese día */
const llevabaAntes = (fecha: string, sesiones: Sesion[], sets: SetLog[]) => sesionesDeSemana(sesiones, desdeClave(fecha), sets).filter((s) => s.fecha < fecha).length
/**
 * Días de gym (RUTINA-FINAL.md v7, 2.2): martes y jueves, el día de Frida, el viernes solo si la semana iba en menos de 3
 * y el domingo si seguía en menos de 3. El lunes en la mañana (cardio), el miércoles (descanso) y el sábado no.
 */
export function esDiaDeGym(fecha: string, sesiones: Sesion[], sets: SetLog[] = [], plan?: PlanFrida): boolean {
  const d = desdeClave(fecha)
  const dow = d.getDay()
  if (dow === 2 || dow === 4) return true
  if (diaDeFrida(sesiones, plan, d, sets) === fecha) return true
  if (dow === 5 || dow === 0) return llevabaAntes(fecha, sesiones, sets) < META
  return false
}
/** Día de pesas en la mañana: martes, jueves y el viernes si la semana va en menos de 3 (sin el día de Frida, que es en la noche) */
export function esDiaDePesas(fecha: string, sesiones: Sesion[], sets: SetLog[] = []): boolean {
  const dow = desdeClave(fecha).getDay()
  return dow === 2 || dow === 4 || (dow === 5 && llevabaAntes(fecha, sesiones, sets) < META)
}
/** Antes de las 12 es mañana (RUTINA-FINAL.md v7, 2.1) */
export function momentoDe(ms: number): Momento {
  return minutosAhora(new Date(ms)) < 12 * 60 ? 'manana' : 'noche'
}
/** Al registrar después: Frida en la noche y las de club en la mañana; sin saber qué fue, noche el día de Frida y mañana los demás */
export function momentoPorDefecto(fecha: string, plan?: PlanFrida, tipo?: SesionTipo): Momento {
  if (tipo) return tipo === 'FRIDA' ? 'noche' : 'manana'
  return diaFridaPlaneado(plan, desdeClave(fecha)) === fecha ? 'noche' : 'manana'
}

/**
 * "¿Vas en la noche?" (RUTINA-FINAL.md v7, 2.4): de martes a sábado, de 8:15 a 21:00, si es día de pesas y no hay
 * sesión ese día, Hoy pone arriba "No fuiste en la mañana". No sale si ya dijo "Voy en la noche" o "Hoy no".
 */
export const NOCHE_DESDE = 8 * 60 + 15
export const NOCHE_HASTA = 21 * 60
export function preguntarNoche(ahora: Date, sesiones: Sesion[], sets: SetLog[], settings: Pick<Settings, 'noFui' | 'vaEnLaNoche'>): boolean {
  const dow = ahora.getDay()
  const min = minutosAhora(ahora)
  const hoy = claveFecha(ahora)
  if (dow < 2 || dow > 6 || min < NOCHE_DESDE || min > NOCHE_HASTA) return false
  if (settings.vaEnLaNoche === hoy || settings.noFui?.includes(hoy)) return false
  if (sesiones.some((s) => s.fecha === hoy && s.tipo !== 'CASA' && (cuenta(s, sets) || !s.terminada))) return false
  return esDiaDePesas(hoy, sesiones, sets)
}

export interface DiaPendiente {
  fecha: string
  /** la que tocaba ese día: FRIDA si era el día planeado, si no la de club que la app habría elegido */
  sugerida: 'A' | 'B' | 'C' | 'FRIDA'
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
    if (!esDiaDeGym(fecha, sesiones, sets, settings.fridaPlan)) continue
    out.push({ fecha, sugerida: sugeridaPara(fecha, sesiones, sets, settings.fridaPlan) })
  }
  return out
}
/** Qué tocaba un día: FRIDA si era el día de Frida de su semana, si no la que la app habría elegido con lo hecho antes de ese día */
export function sugeridaPara(fecha: string, sesiones: Sesion[], sets: SetLog[], plan?: PlanFrida): 'A' | 'B' | 'C' | 'FRIDA' {
  const d = desdeClave(fecha)
  if (diaDeFrida(sesiones, plan, d, sets) === fecha) return 'FRIDA'
  return elegirSesion(sesiones.filter((s) => s.fecha < fecha), plan, d, sets).tipo
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
    const propia = s.find((x) => x.tipo === 'A' || x.tipo === 'B' || x.tipo === 'C') ?? s.find((x) => x.tipo === 'FRIDA') ?? s[0]
    out.push({ fecha, registrado: propia?.tipo ?? null })
  }
  return out
}

const esClub = (t: SesionTipo) => t === 'A' || t === 'B' || t === 'C'
/**
 * Registrar una sesión hecha sin la app. Nunca en el futuro. Máximo una sesión de club (A, B o C) por día: si ese
 * día ya tiene una, se devuelve en `reemplaza` para ofrecer cambiarla en vez de duplicarla. FRIDA es una por día
 * (mismo id) y puede llevar una nota.
 */
export function armarRegistro(sesiones: Sesion[], fecha: string, tipo: SesionTipo, hoy: string, nota?: string, opciones: { fridaTipo?: FridaTipo; momento?: Momento } = {}): { sesion: Sesion; reemplaza: Sesion | null } | { error: string } {
  if (fecha > hoy) return { error: 'Esa fecha todavía no llega.' }
  const { fridaTipo, momento } = opciones
  const conMomento = (s: Sesion): Sesion => (momento ? { ...s, momento } : s)
  // la A sale sin pierna si esa semana ya había FRIDA pierna antes: otro día antes, o el mismo día en la mañana con la A en la noche (RUTINA-FINAL.md v7, 4b)
  const sinPierna = tipo === 'A' && sesionesDeSemana(sesiones, desdeClave(fecha)).some((s) => s.tipo === 'FRIDA' && fridaTipoDe(s) === 'pierna' && (s.fecha < fecha || (s.fecha === fecha && s.momento === 'manana' && momento === 'noche')))
  const conPierna = (s: Sesion): Sesion => (tipo === 'A' ? { ...s, sinPierna } : { ...s, sinPierna: undefined })
  if (esClub(tipo)) {
    const otra = sesiones.find((s) => s.fecha === fecha && esClub(s.tipo))
    if (otra) return { sesion: conPierna(conMomento({ ...otra, tipo, como: otra.origen === 'registro' || !otra.como ? 'registrada' : otra.como })), reemplaza: otra }
  }
  if (tipo === 'FRIDA') {
    const antes = sesiones.find((s) => s.id === `frida-${fecha}`) ?? null
    return { sesion: conMomento({ ...sesionRegistrada(fecha, 'FRIDA', `frida-${fecha}`, nota), fridaTipo: fridaTipo ?? (antes ? fridaTipoDe(antes) : 'torso') }), reemplaza: antes }
  }
  const n = sesiones.filter((s) => s.fecha === fecha && s.tipo === tipo).length
  return { sesion: conPierna(conMomento(sesionRegistrada(fecha, tipo, `registro-${fecha}-${tipo}-${n + 1}`))), reemplaza: null }
}

/** "Frida fue pierna el lunes": la línea de Hoy cuando la semana ya tiene Frida (RUTINA-FINAL.md v7, 2.6) */
export function textoFrida(frida: Sesion, nombresDia: string[]): string {
  return `Frida fue ${fridaTipoDe(frida)} el ${nombresDia[desdeClave(frida.fecha).getDay()]}`
}
/** "Hoy toca B · la última fue A el miércoles 7" */
export function textoUltima(ultima: Sesion | null, nombresDia: string[]): string {
  if (!ultima) return 'sin sesiones todavía'
  const d = desdeClave(ultima.fecha)
  return `la última fue ${ultima.tipo} el ${nombresDia[d.getDay()]} ${d.getDate()}`
}
