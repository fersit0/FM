import { useEffect, useRef, useState } from 'react'
import { haptico } from '../../lib/haptics'

const PX = 14 // píxeles por marca

/**
 * 7.3 Dial de peso: regla que se arrastra bajo una aguja fija. Scroll con snap.
 * Cada marca cruzada actualiza la cifra y da un tick.
 */
export function Dial({ valor, onChange, paso = 2.5, min = 0, max = 200 }: { valor: number; onChange: (v: number) => void; paso?: number; min?: number; max?: number }) {
  const pista = useRef<HTMLDivElement>(null)
  const emitido = useRef(valor)
  // scroll programático: no se emite ni se hace tick
  const programatico = useRef(0)
  const colocar = (p: HTMLDivElement, v: number) => {
    programatico.current = performance.now()
    p.scrollLeft = indiceDe(v) * PX
  }
  const n = Math.round((max - min) / paso)
  const indiceDe = (v: number) => Math.round((v - min) / paso)

  // Coloca la regla cuando el valor viene de fuera (teclado, precarga)
  useEffect(() => {
    const p = pista.current
    if (!p) return
    if (emitido.current === valor) return
    emitido.current = valor
    colocar(p, valor)
  }, [valor])

  useEffect(() => {
    const p = pista.current
    if (p) colocar(p, valor)
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function alScroll() {
    const p = pista.current
    if (!p) return
    if (performance.now() - programatico.current < 200) return
    const idx = Math.max(0, Math.min(n, Math.round(p.scrollLeft / PX)))
    const v = Math.round((min + idx * paso) * 100) / 100
    if (v !== emitido.current) {
      emitido.current = v
      haptico.marcaDial()
      onChange(v)
    }
  }

  return (
    <div className="fm-dial" aria-hidden="true">
      <div className="fm-dial-pista" ref={pista} onScroll={alScroll}>
        <span className="fm-dial-relleno" />
        {Array.from({ length: n + 1 }, (_, i) => {
          const v = min + i * paso
          const diez = v % 10 === 0
          const cinco = !diez && v % 5 === 0
          return (
            <span key={i} className={`fm-dial-marca ${diez ? 'diez' : cinco ? 'cinco' : ''}`}>
              {diez && <span className="fm-dial-num">{v}</span>}
            </span>
          )
        })}
        <span className="fm-dial-relleno" />
      </div>
      <span className="fm-dial-aguja" />
    </div>
  )
}

/** Cifra héroe del peso: tocar abre el teclado numérico como alternativa al dial */
export function CifraPeso({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editando) input.current?.focus()
  }, [editando])

  function confirmar() {
    const v = parseFloat(texto.replace(',', '.'))
    if (!Number.isNaN(v) && v >= 0) onChange(Math.round(v * 100) / 100)
    setEditando(false)
  }

  if (editando) {
    return (
      <input
        ref={input}
        className="fm-cifra-input cifra-heroe"
        inputMode="decimal"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => e.key === 'Enter' && confirmar()}
        aria-label="Peso en kilos"
      />
    )
  }
  return (
    <button className="fm-cifra-boton" onClick={() => { setTexto(String(valor)); setEditando(true) }} aria-label={`Peso ${valor} kilos, tocar para escribir`}>
      <span className="cifra-heroe">{valor}</span>
      <span className="unidad">kg</span>
    </button>
  )
}
