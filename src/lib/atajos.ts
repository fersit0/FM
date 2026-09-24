// Aviso de descanso con Atajos de iOS (9.2): el temporizador nativo suena aunque la app esté cerrada.

export const NOMBRE_ATAJO = 'FM Descanso'

export function urlAtajo(segundos: number): string {
  return `shortcuts://run-shortcut?name=${encodeURIComponent(NOMBRE_ATAJO)}&input=text&text=${Math.max(1, Math.round(segundos))}`
}

/** Abre el atajo con los segundos que faltan. Si no es iOS, no pasa nada. */
export function abrirAtajo(segundos: number): void {
  try {
    window.location.href = urlAtajo(segundos)
  } catch {
    /* nada */
  }
}

export const PASOS_ATAJO = [
  'Abre la app Atajos y toca el botón de más para crear uno nuevo.',
  `Ponle de nombre exactamente "${NOMBRE_ATAJO}".`,
  'Agrega la acción "Iniciar temporizador" (de la app Reloj).',
  'En los segundos del temporizador, elige "Entrada del atajo" en vez de escribir un número.',
  'Guarda. En un descanso, toca "Avísame" y el temporizador de iOS suena aunque estés en otra app o con el cel bloqueado.',
]
