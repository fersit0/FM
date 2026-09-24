/** Línea simple en SVG para pesos por ejercicio y peso corporal. Sin librerías. */
export interface Serie {
  nombre: string
  puntos: { etiqueta: string; valor: number | null }[]
  clase?: string
}

export function GraficaLineas({ series, unidad = 'kg', alto = 160 }: { series: Serie[]; unidad?: string; alto?: number }) {
  const ancho = 320
  const izq = 40
  const der = 8
  const arriba = 12
  const abajo = 26
  const valores = series.flatMap((s) => s.puntos.map((p) => p.valor)).filter((v): v is number => v !== null)
  if (valores.length === 0) {
    return <p className="texto-3">Todavía nada aquí.</p>
  }
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
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="grafica" role="img" aria-label="Gráfica">
      {[min, (min + max) / 2, max].map((v) => (
        <g key={v}>
          <line x1={izq} x2={ancho - der} y1={py(v)} y2={py(v)} className="grafica-guia" />
          <text x={izq - 6} y={py(v) + 4} textAnchor="end" className="grafica-eje">{Math.round(v * 10) / 10}</text>
        </g>
      ))}
      {etiquetas.map((p, i) => (
        (n <= 6 || i % Math.ceil(n / 6) === 0 || i === n - 1) && (
          <text key={i} x={px(i)} y={alto - 8} textAnchor="middle" className="grafica-eje">{p.etiqueta}</text>
        )
      ))}
      {series.map((s, si) => {
        const d = s.puntos
          .map((p, i) => (p.valor === null ? null : `${px(i).toFixed(1)},${py(p.valor).toFixed(1)}`))
          .reduce<string>((acc, pt, i, arr) => {
            if (pt === null) return acc
            const prev = i > 0 ? arr[i - 1] : null
            return acc + (acc === '' || prev === null ? ` M${pt}` : ` L${pt}`)
          }, '')
        return (
          <g key={s.nombre} className={`grafica-serie ${s.clase ?? (si === 0 ? 'principal' : 'alterna')}`}>
            <path d={d.trim()} fill="none" />
            {s.puntos.map((p, i) => p.valor !== null && <circle key={i} cx={px(i)} cy={py(p.valor)} r={4} />)}
          </g>
        )
      })}
      <text x={ancho - der} y={arriba} textAnchor="end" className="grafica-eje">{unidad}</text>
    </svg>
  )
}
