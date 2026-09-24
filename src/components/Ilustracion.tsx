/** Marco de ilustración. En la fase 4 se llena con los SVG por ejercicio. */
export function Ilustracion({ id, nombre, chica = false }: { id: string; nombre: string; chica?: boolean }) {
  return (
    <div className={`ilustracion ${chica ? 'chica' : ''}`} data-ilustracion={id} role="img" aria-label={nombre}>
      <svg viewBox="0 0 200 120" className="ilustracion-svg" aria-hidden="true">
        <rect x="20" y="96" width="160" height="6" rx="3" fill="var(--marco)" />
        <circle cx="100" cy="40" r="14" fill="none" stroke="var(--temp)" strokeWidth="6" />
        <path d="M100 54 v34 M100 62 l-26 14 M100 62 l26 14 M100 88 l-16 8 M100 88 l16 8" fill="none" stroke="var(--temp)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
