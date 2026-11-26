// Tu semana en Hoy (MANANAS-30.md, 5): una tira de lunes a domingo con lo hecho y lo que falta. Puro, sin React.
// Hecho: las pesas con su letra (o Frida con su tipo) y la visita de solo regadera. Planeado: en los días hábiles que
// faltan, la letra que tocaría siguiendo la rotación A, B, A, B. Sábado y domingo no llevan plan. Hoy lleva letra solo
// mientras el día todavía da para pesas en el club: en la mañana hasta la salida del club, o hasta las 21:00 si se dijo
// "Voy en la noche" (el lunes en la tarde el club no abre). Un día de "Hoy descanso" no lleva plan. Se recalcula sola
// con cada registro.
import type { Sesion, SetLog, Club, Rota, FridaTipo, Settings } from '../data/tipos'
import { claveFecha, inicioSemana, sumarDias, desdeClave, minutosAhora, minutosDe } from './fechas'
import { hechas, tocaSesion, fridaTipoDe, esClub, esPesas, NOCHE_MIN } from './semana'

export interface HechoDia {
  tipo: Club | 'FRIDA' | 'VISITA'
  /** solo FRIDA */
  fridaTipo?: FridaTipo
  noche: boolean
  /** solo VISITA: fue a hacer cardio (se ve igual, el mismo punto lleno: es ida al club) */
  cardio?: boolean
}
export interface DiaTuSemana {
  fecha: string
  /** L M M J V S D */
  letra: string
  hoy: boolean
  pasado: boolean
  /** lo hecho ese día: pesas primero; la visita solo si no hubo pesas en el club */
  hecho: HechoDia[]
  /** la sesión planeada, o null en los días sin plan */
  plan: Rota | null
}
const LETRAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** Una sesión de mentiras, ya hecha, para seguir la rotación en los días que faltan */
const virtual = (fecha: string, tipo: Rota): Sesion => ({ id: `plan-${fecha}-${tipo}`, fecha, tipo, version: 'completa', inicio: new Date(`${fecha}T07:40:00`).getTime(), terminada: true })

export function tuSemana(sesiones: Sesion[], sets: SetLog[], settings: Pick<Settings, 'sesionElegida' | 'v8Desde' | 'vaEnLaNoche' | 'salidaManana' | 'descansos'>, ahora: Date): DiaTuSemana[] {
  const ini = inicioSemana(ahora)
  const hoy = claveFecha(ahora)
  const min = minutosAhora(ahora)
  const fechas = LETRAS.map((_, i) => claveFecha(sumarDias(ini, i)))
  const listas = hechas(sesiones, sets).filter((s) => s.fecha >= fechas[0] && s.fecha <= fechas[6])
  const dias: DiaTuSemana[] = fechas.map((fecha, i) => {
    const delDia = listas.filter((s) => s.fecha === fecha)
    const pesas = delDia.filter((s) => esPesas(s.tipo))
    const club = pesas.some((s) => esClub(s.tipo))
    const visita = delDia.find((s) => s.tipo === 'VISITA')
    const hecho: HechoDia[] = pesas.map((s) => ({ tipo: s.tipo as Club | 'FRIDA', ...(s.tipo === 'FRIDA' ? { fridaTipo: fridaTipoDe(s) } : {}), noche: s.momento === 'noche' }))
    if (visita && !club) hecho.push({ tipo: 'VISITA', noche: false, ...(visita.cardio ? { cardio: true } : {}) })
    return { fecha, letra: LETRAS[i], hoy: fecha === hoy, pasado: fecha < hoy, hecho, plan: null }
  })
  const supuestas: Sesion[] = [...sesiones]
  // lunes a viernes; sábado y domingo sin plan
  for (let i = 0; i < 5; i++) {
    const fecha = fechas[i]
    if (fecha < hoy || settings.descansos?.includes(fecha)) continue
    const d = desdeClave(fecha)
    if (fecha === hoy) {
      // ya hubo pesas en el club: nada que planear. Con visita, o pasada la salida de la mañana, solo si va en la noche
      if (dias[i].hecho.some((h) => h.tipo !== 'FRIDA' && h.tipo !== 'VISITA')) continue
      const visitaHoy = dias[i].hecho.some((h) => h.tipo === 'VISITA')
      const enLaNoche = settings.vaEnLaNoche === hoy && i !== 0 && min < NOCHE_MIN
      if (!enLaNoche && (visitaHoy || min >= minutosDe(settings.salidaManana))) continue
    }
    const tipo = tocaSesion(supuestas, d, sets, { desde: settings.v8Desde, elegida: settings.sesionElegida })
    dias[i].plan = tipo
    supuestas.push(virtual(fecha, tipo))
  }
  return dias
}
