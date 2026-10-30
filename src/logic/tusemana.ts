// Tu semana en Hoy (RUTINA-FINAL.md v7, 2): una tira de lunes a domingo con lo hecho y lo que falta. Puro, sin React.
// El plan acomoda las sesiones base que faltan en los días que quedan, con esta preferencia: martes, jueves, viernes y
// domingo; Frida en su día planeado; respetando la regla de espalda (la de elegirSesion). Un martes o jueves con Frida
// también lleva su sesión de club (una de club por día, más Frida). Hoy lleva letra solo mientras el día todavía da
// para una sesión de club: hasta las 21:00, y el domingo hasta las 19:00; después, lo que falta pasa a los días que
// siguen. Se recalcula sola con cada registro, con cada cambio de tipo de Frida y con "Hoy no".
import type { Sesion, SetLog, Club, FridaTipo, Settings } from '../data/tipos'
import { claveFecha, inicioSemana, sumarDias, desdeClave, minutosAhora } from './fechas'
import { hechas, elegirSesion, faltantes, estadoFrida, fridaTipoDe, NOCHE_MIN, DOMINGO_CIERRE } from './semana'

export interface HechoDia {
  tipo: Club | 'FRIDA'
  /** solo FRIDA */
  fridaTipo?: FridaTipo
  noche: boolean
}
export interface DiaTuSemana {
  fecha: string
  /** L M M J V S D */
  letra: string
  hoy: boolean
  pasado: boolean
  hecho: HechoDia[]
  /** lo planeado: la letra de la sesión de club, o F si solo es Frida; null en los días sin plan */
  plan: Club | 'F' | null
  /** también va Frida ese día (con la de club en `plan`) */
  conFrida?: boolean
}
const LETRAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
/** martes, jueves, viernes y domingo, en ese orden (son también el orden de la semana) */
const DIAS_DE_PESAS = [1, 3, 4, 6]

/** Una sesión de mentiras, ya hecha, para acomodar el resto de la semana */
const virtual = (fecha: string, tipo: Sesion['tipo']): Sesion => ({ id: `plan-${fecha}-${tipo}`, fecha, tipo, version: 'completa', inicio: new Date(`${fecha}T07:00:00`).getTime(), terminada: true })

export function tuSemana(sesiones: Sesion[], sets: SetLog[], settings: Pick<Settings, 'fridaPlan' | 'noFui' | 'sesionElegida'>, ahora: Date): DiaTuSemana[] {
  const ini = inicioSemana(ahora)
  const hoy = claveFecha(ahora)
  const plan = settings.fridaPlan
  const fechas = LETRAS.map((_, i) => claveFecha(sumarDias(ini, i)))
  const listas = hechas(sesiones, sets).filter((s) => s.tipo !== 'CASA' && s.fecha >= fechas[0] && s.fecha <= fechas[6])
  const dias: DiaTuSemana[] = fechas.map((fecha, i) => ({
    fecha, letra: LETRAS[i], hoy: fecha === hoy, pasado: fecha < hoy,
    hecho: listas.filter((s) => s.fecha === fecha).map((s) => ({ tipo: s.tipo as Club | 'FRIDA', ...(s.tipo === 'FRIDA' ? { fridaTipo: fridaTipoDe(s) } : {}), noche: s.momento === 'noche' })),
    plan: null,
  }))

  // Frida en su día planeado, si todavía no se registra y ese día no ha pasado
  const frida = estadoFrida(sesiones, plan, ahora, sets)
  const supuestas: Sesion[] = [...sesiones]
  if (!frida.hecha && frida.planeada && frida.planeada >= hoy) {
    dias[fechas.indexOf(frida.planeada)].plan = 'F'
    supuestas.push(virtual(frida.planeada, 'FRIDA'))
  }
  /** La de club planeada ese día; si ya llevaba Frida, se queda con las dos */
  const ponClub = (i: number, tipo: Club) => {
    if (dias[i].plan === 'F') dias[i].conFrida = true
    dias[i].plan = tipo
    supuestas.push(virtual(fechas[i], tipo))
  }
  // hoy: si no hay sesión de club, lo que toca (si es día de pesas, o eligió una a mano, y no dijo "Hoy no"), mientras
  // el día todavía dé para una de club
  const iHoy = fechas.indexOf(hoy)
  const clubHoy = dias[iHoy].hecho.some((h) => h.tipo !== 'FRIDA')
  const eligioHoy = settings.sesionElegida?.fecha === hoy
  const diaAbierto = minutosAhora(ahora) < (iHoy === 6 ? DOMINGO_CIERRE : NOCHE_MIN)
  if (!clubHoy && !settings.noFui?.includes(hoy) && (DIAS_DE_PESAS.includes(iHoy) || eligioHoy) && diaAbierto) {
    const e = elegirSesion(supuestas, plan, ahora, sets, settings.sesionElegida)
    if (!e.extra) ponClub(iHoy, e.tipo)
  }
  // lo que falta, en los días de pesas que quedan después de hoy
  for (const i of DIAS_DE_PESAS) {
    if (fechas[i] <= hoy || (dias[i].plan !== null && dias[i].plan !== 'F')) continue
    const d = desdeClave(fechas[i])
    if (faltantes(supuestas, plan, d, sets).length === 0) break
    ponClub(i, elegirSesion(supuestas, plan, d, sets).tipo)
  }
  return dias
}
