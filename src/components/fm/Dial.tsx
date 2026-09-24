import { useEffect, useRef, useState } from 'react'
import { haptico } from '../../lib/haptics'

const PX = 21 // ventana de 40 kg en 0.86 W ≈ 21 px por marca de 2.5

/** 5. Dial de peso: regla que se desliza bajo una aguja fija. Tick háptico por marca. */
export function Dial({ valor, onChange, paso = 2.5, min = 0, max = 200 }: { valor: number; onChange: (v: number) => void; paso?: number; min?: number; max?: number }) {
  const pista = useRef<HTMLDivElement>(null)
  const emitido = useRef(valor)
  const programatico = useRef(0)
  const n = Math.round((max - min) / paso)
  const indiceDe = (v: number) => Math.round((v - min) / paso)
  const colocar = (p: HTMLDivElement, v: number) => {
    programatico.current = performance.now()
    p.scrollLeft = indiceDe(v) * PX
  }
  useEffect(() => {
    const p = pista.current
    if (!p || emitido.current === valor) return
    emitido.current = valor
    colocar(p, valor)
  }, [valor])
  useEffect(() => {
    const p = pista.current
    if (p) colocar(p, valor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  function alScroll() {
    const p = pista.current
    if (!p || performance.now() - programatico.current < 200) return
    const idx = Math.max(0, Math.min(n, Math.round(p.scrollLeft / PX)))
    const v = Math.round((min + idx * paso) * 100) / 100
    if (v !== emitido.current) {
      emitido.current = v
      haptico.marcaDial()
      onChange(v)
    }
  }
  return (
    <div className="dial" aria-hidden="true">
      <div className="dial-pista" ref={pista} onScroll={alScroll}>
        <span className="dial-relleno" />
        {Array.from({ length: n + 1 }, (_, i) => {
          const v = Math.round((min + i * paso) * 100) / 100
          const diez = v % 10 === 0
          return (
            <span key={i} className={`dial-marca ${diez ? 'diez' : ''}`}>
              {diez && <span className="dial-num">{v}</span>}
            </span>
          )
        })}
        <span className="dial-relleno" />
      </div>
      <span className="dial-aguja" />
    </div>
  )
}

/** Cifra del círculo: tocarla abre el teclado decimal */
export function CifraPeso({ valor, onChange, tamano }: { valor: number; onChange: (v: number) => void; tamano: number }) {
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
    return <input ref={input} className="cifra-input" style={{ fontSize: tamano, fontWeight: 700, letterSpacing: '-0.05em' }} inputMode="decimal" value={texto} onChange={(e) => setTexto(e.target.value)} onBlur={confirmar} onKeyDown={(e) => e.key === 'Enter' && confirmar()} aria-label="Peso en kilos" />
  }
  return (
    <button className="circulo-cifra" style={{ fontSize: tamano }} onClick={() => { setTexto(String(valor)); setEditando(true) }} aria-label={`Peso ${valor} kilos, tocar para escribir`}>
      <span>{valor}</span>
      <span className="kg" style={{ fontSize: Math.max(20, Math.round(tamano * 0.3)) }}>kg</span>
    </button>
  )
}
