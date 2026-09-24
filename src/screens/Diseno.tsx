import { useEffect, useState } from 'react'
import { Modulo, Escala, Dial, CifraPeso, Stepper, BotonPrincipal, BotonSecundario, Temporizador, Barra, Hoja, type Destino } from '../components/fm'

export type Temp = 'reposo' | 'calentamiento' | 'trabajo' | 'fuerte' | 'ultima' | 'descanso' | 'listo'
export const TEMPS: Temp[] = ['reposo', 'calentamiento', 'trabajo', 'fuerte', 'ultima', 'descanso', 'listo']

/** Ruta /diseno: banco de componentes en todos sus estados y temperaturas. Solo desarrollo. */
export function Diseno() {
  const [temp, setTemp] = useState<Temp>(() => (new URLSearchParams(location.search).get('temp') as Temp) || 'trabajo')
  const [hechas, setHechas] = useState(5)
  const [peso, setPeso] = useState(32.5)
  const [reps, setReps] = useState(10)
  const [fin, setFin] = useState(() => Date.now() + 90_000)
  const [hoja, setHoja] = useState(false)
  const [destino, setDestino] = useState<Destino>('hoy')
  const grupos = [3, 3, 4, 3, 2, 3]

  useEffect(() => {
    document.body.dataset.temp = temp
  }, [temp])

  return (
    <div className="fm-pantalla" style={{ paddingBottom: 120 }}>
      <p className="etiqueta-fm">Banco de componentes</p>
      <div className="fm-chips">
        {TEMPS.map((t) => (
          <button key={t} className={`fm-chip ${t === temp ? 'activo' : ''}`} onClick={() => setTemp(t)}>{t}</button>
        ))}
      </div>

      <p className="secundario">Escala de sintonía</p>
      <Escala grupos={grupos} hechas={hechas} />
      <div className="fm-fila">
        <BotonSecundario capsula onClick={() => setHechas((h) => Math.min(18, h + 1))}>Serie hecha</BotonSecundario>
        <BotonSecundario onClick={() => setHechas(0)}>Reiniciar</BotonSecundario>
      </div>

      <p className="secundario">Módulo encendido con dial y stepper</p>
      <Modulo>
        <CifraPeso valor={peso} onChange={setPeso} />
        <Dial valor={peso} onChange={setPeso} />
        <Stepper valor={reps} onChange={setReps} />
      </Modulo>

      <p className="secundario">Módulo con temporizador de descanso</p>
      <Modulo>
        <Temporizador fin={fin} total={90} onFin={() => {}} onMas={() => setFin((f) => f + 15_000)} onSaltar={() => setFin(Date.now())} />
      </Modulo>
      <BotonSecundario onClick={() => setFin(Date.now() + 90_000)}>Reiniciar descanso</BotonSecundario>

      <p className="secundario">Tipografía</p>
      <div className="fm-columna">
        <div><span className="cifra-heroe">B</span></div>
        <div><span className="cifra-grande">52</span><span className="unidad">min</span></div>
        <p className="titulo-fm">Press militar sentado</p>
        <p className="cuerpo">Tienes 18 minutos. Alcanza para algo bueno.</p>
        <p className="secundario">Serie 2 de 4</p>
        <p className="etiqueta-fm">La vez pasada</p>
        <span className="tiempo" style={{ fontSize: 32 }}>1:29</span>
      </div>

      <p className="secundario">Botones</p>
      <BotonPrincipal>Serie hecha</BotonPrincipal>
      <BotonPrincipal disabled>Serie hecha</BotonPrincipal>
      <div className="fm-fila">
        <BotonSecundario>Saltar</BotonSecundario>
        <BotonSecundario capsula>Técnica</BotonSecundario>
        <BotonSecundario capsula onClick={() => setHoja(true)}>Abrir hoja</BotonSecundario>
      </div>

      <p className="secundario">Superficies</p>
      <div className="fm-superficie">
        <p className="cuerpo">Capa 1, sin borde ni sombra.</p>
        <div className="fm-superficie-2"><p className="cuerpo">Capa 2 encima.</p></div>
      </div>

      <Hoja abierta={hoja} titulo="Press militar sentado" onCerrar={() => setHoja(false)}>
        <p className="etiqueta-fm">Técnica</p>
        <p className="cuerpo">Empujar hacia arriba hasta estirar sin trabar los codos. Bajar controlado a la altura de las orejas.</p>
        <p className="etiqueta-fm">Errores</p>
        <p className="cuerpo">Arquear la espalda. Bajar de más. Impulso con las piernas.</p>
      </Hoja>

      <Barra destino={destino} onCambiar={setDestino} />
    </div>
  )
}
