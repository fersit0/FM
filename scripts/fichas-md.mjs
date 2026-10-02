// Parser de FICHAS.md (fuente de verdad de las fichas). Lo usan el generador y la prueba.
const CAMPOS = [['Para qué', 'paraQue'], ['Lo sientes', 'sientes'], ['Prepárate', 'preparate'], ['Movimiento', 'movimiento'], ['Imagina', 'imagina'], ['Errores', 'errores'], ['Cuidado', 'cuidado']]

const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const conPunto = (t) => (/[.!?]$/.test(t) ? t : `${t}.`)

/** "error, corrección. Error, corrección." → [{ error, correccion }] */
export function parsearErrores(texto) {
  return texto.split(/\.\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/).map((f) => f.trim()).filter(Boolean).map((frase) => {
    const limpia = frase.replace(/\.$/, '')
    const i = limpia.indexOf(', ')
    if (i < 0) throw new Error(`Error sin corrección (falta la coma): "${frase}"`)
    return { error: conPunto(mayuscula(limpia.slice(0, i).trim())), correccion: conPunto(mayuscula(limpia.slice(i + 2).trim())) }
  })
}

/** Devuelve { id: { nombre, paraQue, sientes, preparate, movimiento, imagina, errores, cuidado } } */
export function parsearFichas(md) {
  const fichas = {}
  // lo que va antes del primer '---' es la explicación del formato
  const cuerpo = md.includes('\n---\n') ? md.slice(md.indexOf('\n---\n') + 5) : md
  const bloques = cuerpo.split(/^## /m).slice(1)
  for (const b of bloques) {
    const lineas = b.split('\n').map((l) => l.trim()).filter(Boolean)
    const m = lineas[0].match(/^([a-z0-9-]+)\s+—\s+(.+)$/)
    if (!m) throw new Error(`Encabezado inválido: "${lineas[0]}"`)
    const [, id, nombre] = m
    const ficha = { nombre }
    for (const l of lineas.slice(1)) {
      const campo = CAMPOS.find(([etiqueta]) => l.startsWith(`${etiqueta}:`))
      if (!campo) throw new Error(`${id}: línea sin campo conocido: "${l}"`)
      const valor = l.slice(campo[0].length + 1).trim()
      // en la app la etiqueta va como título aparte, así que el texto empieza con mayúscula
      ficha[campo[1]] = campo[1] === 'errores' ? parsearErrores(valor) : mayuscula(valor)
    }
    for (const [etiqueta, clave] of CAMPOS) if (ficha[clave] === undefined || ficha[clave].length === 0) throw new Error(`${id}: falta "${etiqueta}"`)
    fichas[id] = ficha
  }
  return fichas
}

/** Palabras del cuerpo de una ficha (sin etiquetas ni nombre) */
export function palabrasDe(f) {
  const texto = [f.paraQue, f.sientes, f.preparate, f.movimiento, f.imagina, ...f.errores.map((e) => `${e.error} ${e.correccion}`), f.cuidado].join(' ')
  return texto.split(/\s+/).filter(Boolean).length
}
