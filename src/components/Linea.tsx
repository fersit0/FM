/** Gráfica de línea de 3 pt en piedra del peso en el tiempo; último punto como círculo rojo de 12 pt. */
export function Linea({ puntos, alto = 140, unidad = 'kg' }: { puntos: { etiqueta: string; valor: number }[]; alto?: number; unidad?: string }) {
  const ancho = 342
  const izq = 8, der = 8, arriba = 24, abajo = 24
  if (puntos.length === 0) return null
  const valores = puntos.map((p) => p.valor)
  let min = Math.min(...valores), max = Math.max(...valores)
  if (max - min < 4) { const c = (max + min) / 2; min = c - 2; max = c + 2 }
  const n = puntos.length
  const px = (i: number) => (n <= 1 ? ancho / 2 : izq + (i / (n - 1)) * (ancho - izq - der))
  const py = (v: number) => arriba + (1 - (v - min) / (max - min)) * (alto - arriba - abajo)
  const d = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(p.valor).toFixed(1)}`).join(' ')
  const u = puntos[n - 1]
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="linea" role="img" aria-label="Peso en el tiempo">
      <path d={d} fill="none" stroke="var(--piedra)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={px(n - 1)} cy={py(u.valor)} r="6" fill="var(--rojo)" />
      <text x={px(0)} y={alto - 4} textAnchor="start" className="linea-eje">{puntos[0].etiqueta}</text>
      {n > 1 && <text x={px(n - 1)} y={alto - 4} textAnchor="end" className="linea-eje">{u.etiqueta}</text>}
      <text x={px(n - 1)} y={py(u.valor) - 12} textAnchor={n > 1 ? 'end' : 'middle'} className="linea-eje" style={{ fill: 'var(--piedra)' }}>{u.valor} {unidad}</text>
    </svg>
  )
}
