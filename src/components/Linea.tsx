/** Línea fina para tendencias (peso por ejercicio, peso corporal). Sin librerías. */
export interface Serie {
  nombre: string
  puntos: { etiqueta: string; valor: number | null }[]
  alterna?: boolean
}

export function Linea({ series, alto = 140 }: { series: Serie[]; alto?: number }) {
  const ancho = 350
  const izq = 34
  const der = 6
  const arriba = 10
  const abajo = 22
  const valores = series.flatMap((s) => s.puntos.map((p) => p.valor)).filter((v): v is number => v !== null)
  if (valores.length === 0) return null
  let min = Math.min(...valores)
  let max = Math.max(...valores)
  if (max - min < 4) {
    const c = (max + min) / 2
    min = c - 2
    max = c + 2
  }
  const n = Math.max(...series.map((s) => s.puntos.length))
  const px = (i: number) => (n <= 1 ? izq : izq + (i / (n - 1)) * (ancho - izq - der))
  const py = (v: number) => arriba + (1 - (v - min) / (max - min)) * (alto - arriba - abajo)
  const etiquetas = series[0].puntos
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="fm-linea" role="img" aria-label="Tendencia">
      {[min, max].map((v) => (
        <g key={v}>
          <line x1={izq} x2={ancho - der} y1={py(v)} y2={py(v)} className="fm-linea-guia" />
          <text x={izq - 6} y={py(v) + 3.5} textAnchor="end" className="fm-linea-eje">{Math.round(v * 10) / 10}</text>
        </g>
      ))}
      {etiquetas.map((p, i) => (n <= 6 || i % Math.ceil(n / 6) === 0 || i === n - 1) && (
        <text key={i} x={px(i)} y={alto - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="fm-linea-eje">{p.etiqueta}</text>
      ))}
      {series.map((s) => {
        const d = s.puntos.reduce<string>((acc, p, i, arr) => {
          if (p.valor === null) return acc
          const prev = i > 0 ? arr[i - 1].valor : null
          return acc + `${acc === '' || prev === null ? ' M' : ' L'}${px(i).toFixed(1)},${py(p.valor).toFixed(1)}`
        }, '')
        return (
          <g key={s.nombre}>
            <path d={d.trim()} className={`fm-linea-trazo ${s.alterna ? 'alterna' : ''}`} />
            {s.puntos.map((p, i) => p.valor !== null && <circle key={i} cx={px(i)} cy={py(p.valor)} r={2.5} className={`fm-linea-punto ${s.alterna ? 'alterna' : ''}`} />)}
          </g>
        )
      })}
    </svg>
  )
}
