/** La anomalía pequeña y juguetona, reservada para momentos contados: un pez con tenis. */
export function PezConTenis() {
  return (
    <svg viewBox="0 0 120 60" className="anomalia" aria-hidden="true">
      <g fill="none" stroke="var(--marco)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M20 30 C 30 12, 62 10, 78 30 C 62 50, 30 48, 20 30 Z" fill="var(--teal)" />
        <path d="M78 30 L 98 18 L 94 30 L 98 42 Z" fill="var(--teal)" />
        <path d="M46 20 C 52 26, 52 34, 46 40" />
        <circle cx="32" cy="27" r="2.5" fill="var(--marco)" stroke="none" />
        <path d="M40 44 l -2 8 h 12 l -2 -8" fill="var(--naranja)" />
        <path d="M60 44 l -2 8 h 12 l -2 -8" fill="var(--naranja)" />
        <path d="M38 52 h 12 M58 52 h 12" stroke="var(--crema)" />
      </g>
    </svg>
  )
}
