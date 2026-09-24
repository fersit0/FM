/** Línea fina de 1.5 px en crema del peso en el tiempo; último punto en brasa-2. Nada más. */
export function Linea({ puntos, alto = 120 }: { puntos: { etiqueta: string; valor: number }[]; alto?: number }) {
  const ancho = 350
  const izq = 8
  const der = 8
  const arriba = 14
  const abajo = 22
  if (puntos.length === 0) return null
  const valores = puntos.map((p) => p.valor)
  let min = Math.min(...valores)
  let max = Math.max(...valores)
  if (max - min < 4) {
    const c = (max + min) / 2
    min = c - 2
    max = c + 2
  }
  const n = puntos.length
  const px = (i: number) => (n <= 1 ? ancho / 2 : izq + (i / (n - 1)) * (ancho - izq - der))
  const py = (v: number) => arriba + (1 - (v - min) / (max - min)) * (alto - arriba - abajo)
  const d = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(p.valor).toFixed(1)}`).join(' ')
  const ultimo = puntos[n - 1]
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="fm-linea" role="img" aria-label="Peso en el tiempo">
      <path d={d} fill="none" stroke="var(--crema)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={px(n - 1)} cy={py(ultimo.valor)} r="3.5" fill="var(--brasa-2)" />
      <text x={px(0)} y={alto - 6} textAnchor="start" className="fm-linea-eje">{puntos[0].etiqueta}</text>
      {n > 1 && <text x={px(n - 1)} y={alto - 6} textAnchor="end" className="fm-linea-eje">{ultimo.etiqueta}</text>}
      <text x={px(n - 1)} y={py(ultimo.valor) - 8} textAnchor={n > 1 ? 'end' : 'middle'} className="fm-linea-eje" style={{ fill: 'var(--crema)' }}>{ultimo.valor} kg</text>
    </svg>
  )
}
