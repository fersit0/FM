// Acomodo de la pantalla de la serie (ACOMODO-FM.md, 1 a 3): la foto del ejercicio siempre entera y en su proporción,
// el círculo del peso de 140 o más, y nada cambia de tamaño a media serie. Puro, sin React, para poder probarlo.

export const D_MIN = 140
export const FOTO_MIN = 80
/** separación entre la foto y el círculo, y aire de arriba y abajo (deben coincidir con .serie-cuerpo en pantalla.css) */
export const ESPACIO = 12
export const AIRE = 16

export type Acomodo = { d: number; foto: { w: number; h: number } | null }

/**
 * Reparte el alto libre entre la foto y el círculo. Primero la foto (a todo lo ancho, y nunca más de la mitad del alto)
 * con el círculo de 140 o más; si no cabe, la foto se hace más chica pero entera; si quedaría de menos de 80 de alto, no
 * sale y el círculo toma todo.
 * `dMax` es el diámetro del diseño ya acotado al ancho; `proporcion` es ancho entre alto de la foto, o null sin foto.
 */
export function repartir(alto: number, ancho: number, dMax: number, proporcion: number | null): Acomodo {
  const libre = Math.max(0, alto - AIRE)
  const soloCirculo: Acomodo = { d: Math.max(88, Math.min(dMax, libre)), foto: null }
  if (proporcion === null || ancho <= 0) return soloCirculo
  // la foto nunca se lleva más de la mitad: el círculo sigue siendo el protagonista
  const fotoIdeal = Math.min(ancho / proporcion, libre * 0.5)
  const d = Math.min(dMax, Math.max(D_MIN, libre - ESPACIO - fotoIdeal))
  const h = Math.min(fotoIdeal, libre - ESPACIO - d)
  if (h < FOTO_MIN) return soloCirculo
  return { d, foto: { w: Math.floor(h * proporcion), h: Math.floor(h) } }
}

/** Alto que ocupa un acomodo */
export const necesita = (a: Acomodo) => AIRE + a.d + (a.foto ? ESPACIO + a.foto.h : 0)

/**
 * Sin brincos: un acomodo ya fijo se queda mientras quepa (aunque luego sobre espacio, por ejemplo al irse el aviso de
 * Deshacer); si ya no cabe, se usa el nuevo, más chico.
 */
export function conservar(fijo: Acomodo, nuevo: Acomodo, alto: number, anchoMax: number): Acomodo {
  return necesita(fijo) <= alto && fijo.d <= anchoMax ? fijo : nuevo
}
