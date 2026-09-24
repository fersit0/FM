/** Superficie que se calienta: una franja por serie, se enciende al guardarla. Sin anillos. */
export function Calor({ total, hechas, etiqueta }: { total: number; hechas: number; etiqueta?: string }) {
  return (
    <div className="calor" aria-label={etiqueta ?? `${hechas} de ${total} series`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`calor-franja ${i < hechas ? 'encendida' : ''} ${i === hechas ? 'siguiente' : ''}`} />
      ))}
    </div>
  )
}
