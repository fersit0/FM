import { useEffect, useState } from 'react'
import { Horizonte, Progreso, Peso, Stepper, BotonPrincipal, BotonSecundario, Grupo, Fila, Temporizador, Barra, Hoja, type Destino } from '../components/fm'

export type Temp = 'reposo' | 'calentamiento' | 'trabajo' | 'fuerte' | 'ultima' | 'descanso' | 'listo'
export const TEMPS: Temp[] = ['reposo', 'calentamiento', 'trabajo', 'fuerte', 'ultima', 'descanso', 'listo']

/** #diseno: banco de componentes en todos sus estados y temperaturas. Solo desarrollo. */
export function Diseno() {
  const [temp, setTemp] = useState<Temp>(() => (new URLSearchParams(location.search).get('temp') as Temp) || 'trabajo')
  const [hechas, setHechas] = useState(1)
  const [peso, setPeso] = useState(18)
  const [reps, setReps] = useState(10)
  const [fin, setFin] = useState(() => Date.now() + 90_000)
  const [hoja, setHoja] = useState(false)
  const [destino, setDestino] = useState<Destino>('hoy')
  useEffect(() => {
    document.body.dataset.temp = temp
  }, [temp])
  return (
    <div className="fm-pantalla fm-con-barra" style={{ gap: 24 }}>
      <Horizonte />
      <p className="subtexto">Banco de componentes</p>
      <div className="fm-chips">
        {TEMPS.map((t) => <button key={t} className={`fm-chip ${t === temp ? 'activo' : ''}`} onClick={() => setTemp(t)}>{t}</button>)}
      </div>
      <Progreso total={7} actual={2} llenado={hechas / 3} />
      <div className="fm-secundarios">
        <BotonSecundario onClick={() => setHechas((h) => (h + 1) % 4)}>Serie hecha</BotonSecundario>
      </div>
      <Peso valor={peso} onChange={setPeso} />
      <Stepper valor={reps} onChange={setReps} />
      <Temporizador fin={fin} total={90} onFin={() => {}} onMas={() => setFin((f) => f + 15_000)} onMenos={() => setFin((f) => f - 15_000)} onAvisar={() => {}} onSaltar={() => setFin(Date.now())} />
      <BotonSecundario onClick={() => setFin(Date.now() + 90_000)}>Reiniciar descanso</BotonSecundario>
      <div className="fm-columna">
        <p className="titulo-grande">Cuerpo completo A</p>
        <p className="titulo">Sentadilla goblet</p>
        <p className="cuerpo">Tienes 18 minutos. Alcanza para algo bueno.</p>
        <p className="subtexto">Serie 2 de 4, 10 a 12 reps</p>
        <p className="nota">La vez pasada</p>
        <div><span className="cifra-media">48</span><span className="unidad">min</span></div>
      </div>
      <Grupo titulo="Lista agrupada">
        <Fila num={1} texto="Press de banca plano con mancuernas" dato="16 kg" />
        <Fila num={2} texto="Jalón al pecho en polea" dato="42 kg" onClick={() => setHoja(true)} />
        <Fila texto="Sonido" detalle="Dos notas al terminar el descanso" dato="Apagado" />
      </Grupo>
      <BotonPrincipal>Serie hecha</BotonPrincipal>
      <BotonPrincipal disabled>Siguiente serie</BotonPrincipal>
      <div className="fm-secundarios">
        <BotonSecundario>Anterior</BotonSecundario>
        <BotonSecundario onClick={() => setHoja(true)}>Técnica</BotonSecundario>
        <BotonSecundario>Saltar</BotonSecundario>
      </div>
      <Hoja abierta={hoja} titulo="Sentadilla goblet" altura="completa" onCerrar={() => setHoja(false)}>
        <Grupo titulo="Qué debes sentir">
          <Fila texto="Glúteos y muslos al subir. Si arde la espalda baja, te encorvaste." />
        </Grupo>
      </Hoja>
      <Barra destino={destino} onCambiar={setDestino} />
    </div>
  )
}
