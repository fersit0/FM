/** 6.1 Barra de progreso: un segmento por ejercicio; el actual se llena con --estado según series. */
export function Progreso({ total, actual, llenado }: { total: number; actual: number; llenado: number }) {
  return (
    <div className="fm-progreso" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={actual} aria-label="Ejercicios de la sesión">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`fm-segmento ${i < actual ? 'hecho' : i === actual ? 'actual' : ''}`} style={i === actual ? ({ '--llenado': Math.min(1, Math.max(0, llenado)) } as React.CSSProperties) : undefined} />
      ))}
    </div>
  )
}
