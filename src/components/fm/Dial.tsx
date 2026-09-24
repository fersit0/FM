import { useEffect, useRef, useState } from 'react'
import { haptico } from '../../lib/haptics'

const PX = 14

/**
 * 6.2 Dial de peso: cifra héroe centrada y una regla que se arrastra bajo una aguja fija.
 * Sin caja. Incremento por ejercicio. Tick háptico por marca. Tocar la cifra abre el teclado.
 */
export function Peso({ valor, onChange, paso = 2.5, min = 0, max = 200 }: { valor: number; onChange: (v: number) => void; paso?: number; min?: number; max?: number }) {
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

  const cada5 = paso >= 2.5 ? 5 : 5

  return (
    <div className="fm-peso">
      <Cifra valor={valor} onChange={onChange} />
      <div className="fm-dial" aria-hidden="true">
        <div className="fm-dial-pista" ref={pista} onScroll={alScroll}>
          <span className="fm-dial-relleno" />
          {Array.from({ length: n + 1 }, (_, i) => {
            const v = Math.round((min + i * paso) * 100) / 100
            const grande = v % cada5 === 0
            return (
              <span key={i} className={`fm-dial-marca ${grande ? 'cinco' : ''}`}>
                {grande && <span className="fm-dial-num">{v}</span>}
              </span>
            )
          })}
          <span className="fm-dial-relleno" />
        </div>
        <span className="fm-dial-aguja" />
      </div>
    </div>
  )
}

function Cifra({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
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
      <input ref={input} className="fm-peso-input cifra-heroe" inputMode="decimal" value={texto} onChange={(e) => setTexto(e.target.value)} onBlur={confirmar} onKeyDown={(e) => e.key === 'Enter' && confirmar()} aria-label="Peso en kilos" />
    )
  }
  return (
    <button className="fm-peso-cifra" onClick={() => { setTexto(String(valor)); setEditando(true) }} aria-label={`Peso ${valor} kilos, tocar para escribir`}>
      <span key={valor} className="cifra-heroe cifra-cambio">{valor}</span>
      <span className="unidad">kg</span>
    </button>
  )
}
