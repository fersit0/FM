// Recorre cada ejercicio de A, B y CASA y cada alternativa de cada ejercicio:
// al elegirla, tarjeta y ficha son de la alternativa (nombre, fotos, series y reps, unidad) y no queda texto ni foto
// del original; un toque regresa. Y la serie hecha en una alternativa cuenta para el ejercicio.
import { test, expect } from '@playwright/test'
import { limpiar, menu, pausa, reloj, registrar, contestarNo, terminarAqui, vaEnLaNoche } from './comun.mjs'

const normal = (t) => t.replace(/\s+/g, ' ').trim()

/** Lista de una sesión según la biblioteca real de la app */
async function listaDe(page, sesion) {
  return page.evaluate(({ sesion }) => {
    const { ejercicios, fotos } = window.fmBiblioteca
    const archivos = (clave) => { const f = fotos[clave]; return f ? [f.a, f.b].filter(Boolean) : [] }
    const item = (e) => ({ id: e.id, nombre: e.nombre, series: e.series, repsMin: e.repsMin, repsMax: e.repsMax, modo: e.modo, ilustracion: e.ilustracion, fotos: archivos(e.ilustracion), caso: e.caso })
    const lista = ejercicios.filter((e) => e.sesion === sesion)
    return [...lista].sort((a, b) => a.orden - b.orden).map((e) => ({ ...item(e), sesion: e.sesion, alternativas: e.alternativas.map(item) }))
  }, { sesion })
}
async function fotosDe(loc) {
  return loc.locator('img').evaluateAll((imgs) => imgs.map((i) => ({ archivo: decodeURIComponent(i.getAttribute('src').split('/').pop().replace(/\.jpg$/, '')), alt: i.getAttribute('alt') || '' })))
}
function rango(e) {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope con 2 guardadas'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}

async function revisarEjercicio(page, e) {
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(e.nombre)
  for (const a of e.alternativas) {
    await menu(page, 'Cambiar por alternativa')
    const hoja = page.locator('.hoja-fondo.abierta')
    // oculta si su id ya está en otro ejercicio de la sesión: entonces no debe aparecer y se salta
    const boton = hoja.getByRole('button', { name: a.nombre, exact: true })
    if ((await boton.count()) === 0) { await page.keyboard.press('Escape'); await expect(hoja).toHaveCount(0); continue }
    await boton.click()
    await expect(hoja).toHaveCount(0)
    const problemas = []
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(a.nombre)
    const panel = page.locator('.panel')
    const texto = normal(await panel.locator('.sesion-arriba').evaluate((el) => { const c = el.cloneNode(true); c.querySelector('.sesion-linea')?.remove(); return c.innerText }))
    if (texto.includes(e.nombre) && !a.nombre.includes(e.nombre)) problemas.push(`tarjeta: aparece el nombre del original "${e.nombre}"`)
    if (a.caso && !texto.includes(a.caso)) problemas.push(`tarjeta: no aparece el caso "${a.caso}"`)
    if (!texto.includes('Volver al original')) problemas.push('tarjeta: falta "Volver al original"')
    if (!texto.includes(`de ${a.series}`) && !texto.includes('series hechas')) problemas.push(`tarjeta: no dice "de ${a.series}" series`)
    for (const f of await fotosDe(panel)) {
      if (!f.alt.startsWith(a.nombre)) problemas.push(`tarjeta: foto con alt "${f.alt}"`)
      if (a.fotos.length && !a.fotos.includes(f.archivo)) problemas.push(`tarjeta: foto ${f.archivo} no es de la alternativa`)
      if (!a.fotos.includes(f.archivo) && e.fotos.includes(f.archivo)) problemas.push(`tarjeta: foto del original ${f.archivo}`)
    }
    if (a.modo === 'peso') {
      const esperada = e.sesion === 'CASA' ? 'kg' : 'lb'
      const u = await page.locator('button.kg').innerText()
      if (u !== esperada) problemas.push(`tarjeta: unidad ${u}, se esperaba ${esperada}`)
    }
    await page.getByRole('button', { name: 'Técnica', exact: true }).click()
    const ficha = page.locator('.hoja-fondo.abierta')
    await expect(ficha.locator('h2.t-ejercicio').first()).toHaveText(a.nombre)
    const chips = normal(await ficha.locator('.chips').innerText())
    if (!chips.includes(rango(a))) problemas.push(`ficha: chips "${chips}" sin el rango "${rango(a)}"`)
    const cuerpo = normal(await ficha.locator('.hoja-cuerpo').evaluate((el) => { const c = el.cloneNode(true); c.querySelectorAll('.ficha-seccion:last-of-type, .lista').forEach((x) => x.remove()); return c.innerText }))
    if (cuerpo.includes(e.nombre) && !a.nombre.includes(e.nombre)) problemas.push(`ficha: aparece el nombre del original "${e.nombre}"`)
    for (const f of await fotosDe(ficha.locator('.foto-par, .ficha-foto'))) {
      if (!f.alt.startsWith(a.nombre)) problemas.push(`ficha: foto con alt "${f.alt}"`)
      if (!a.fotos.includes(f.archivo) && e.fotos.includes(f.archivo)) problemas.push(`ficha: foto del original ${f.archivo}`)
    }
    await page.keyboard.press('Escape')
    await expect(ficha).toHaveCount(0)
    expect(problemas, `${e.id} → ${a.id}: ${problemas.join('; ')}`).toEqual([])
    await page.locator('.sesion-alternativa').getByRole('button', { name: 'Volver al original' }).click()
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(e.nombre)
    await expect(page.locator('.sesion-alternativa')).toHaveCount(0)
  }
}

async function revisarSesion(page, lista) {
  for (const e of lista) {
    await revisarEjercicio(page, e)
    await menu(page, 'Saltar ejercicio')
  }
}

test.setTimeout(240_000)
test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  // sin nada registrado: toca A
  await limpiar(page, 'no')
})

test('sesión A: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = await listaDe(page, 'A')
  expect(lista.map((e) => e.id)).toContain('press-inclinado')
  expect(lista).toHaveLength(4)
  await expect(page.locator('h1')).toContainText('A:')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await revisarSesion(page, lista)
})

test('sesión B: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = await listaDe(page, 'B')
  expect(lista).toHaveLength(4)
  // A el miércoles: hoy jueves toca B (una de club por día: la A no puede ser de hoy)
  await registrar(page, '2026-10-07', 'A')
  await expect(page.locator('h1')).toContainText('B:')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await revisarSesion(page, lista)
})

test('CASA: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = await listaDe(page, 'CASA')
  // en la mañana no se ofrece CASA: viernes en la noche con "Voy en la noche" y ya sin tiempo para la corta
  await reloj(page, '2026-10-09T21:05:00')
  await page.goto('')
  await vaEnLaNoche(page)
  await page.goto('')
  await contestarNo(page)
  await page.getByRole('button', { name: /Casa, 12 minutos/ }).click()
  await revisarSesion(page, lista)
})

test('una serie hecha en la alternativa cuenta para el ejercicio y se puede seguir en el original', async ({ page }) => {
  // A el miércoles: toca B, con el remo de segundo
  await registrar(page, '2026-10-07', 'A')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await menu(page, 'Saltar ejercicio')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo sentado en máquina')
  await menu(page, 'Cambiar por alternativa')
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: 'Remo con pecho apoyado en banco reclinable', exact: true }).click()
  await expect(page.getByText(/Serie 1 de 3/)).toBeVisible()
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(pausa(page)).toBeVisible()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 2 de 3/)).toBeVisible()
  // se liberó la máquina: de vuelta al original, sigue en la serie 2
  await page.locator('.sesion-alternativa').getByRole('button', { name: 'Volver al original' }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo sentado en máquina')
  await expect(page.getByText(/Serie 2 de 3/)).toBeVisible()
  await expect(page.locator('.sesion-aviso')).toContainText('remo con pecho apoyado')
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 3 de 3/)).toBeVisible()
})

test('"Ocupado: después" manda el ejercicio al final de su zona y, si sigue ocupado, ofrece la alternativa', async ({ page }) => {
  // A el miércoles: toca B, que abre con el jalón y el remo en poleas y luego va a la terraza
  await registrar(page, '2026-10-07', 'A')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Jalón al pecho, agarre ancho')
  // el botón está en la tarjeta
  await page.locator('.sesion-ocupado').getByRole('button', { name: 'Ocupado: después' }).click()
  await expect(page.getByText('Después, al final de poleas.')).toBeVisible()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo sentado en máquina')
  await expect(page.locator('.sesion-ruta .actual')).toHaveText('Poleas')
  await expect(page.locator('.sesion-cuenta')).toHaveText('1 de 4')
  await menu(page, 'Saltar ejercicio')
  // el jalón vuelve a tocar al final de poleas, antes de pasar a la terraza
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Jalón al pecho, agarre ancho')
  await expect(page.locator('.sesion-ruta .actual')).toHaveText('Poleas')
  await expect(page.locator('.sesion-cuenta')).toHaveText('2 de 4')
  // sigue ocupado: ahora ofrece la alternativa
  await page.locator('.sesion-ocupado').getByRole('button', { name: 'Sigue ocupado: alternativa' }).click()
  const hoja = page.locator('.hoja-fondo.abierta')
  await expect(hoja.getByText('Ya se pospuso una vez. Si sigue ocupado, cambia por la alternativa.')).toBeVisible()
  await hoja.getByRole('button', { name: 'Remo a una mano con mancuerna, jalando hacia la cadera', exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo a una mano con mancuerna, jalando hacia la cadera')
  // en la terraza, la última zona: la goblet ocupada se va al final de la sesión
  await menu(page, 'Saltar ejercicio')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Sentadilla goblet')
  await page.locator('.sesion-ocupado').getByRole('button', { name: 'Ocupado: después' }).click()
  await expect(page.getByText('Después, al final de la sesión.')).toBeVisible()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Elevación de piernas en colchoneta')
  // recargar conserva el orden
  await page.goto('')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Elevación de piernas en colchoneta')
  await expect(page.locator('.sesion-ruta')).toContainText('Terraza')
})

test('recorte en el camino: ya en el segundo ejercicio, si no cabe antes de la última pesa quita de atrás para adelante, nunca el press ni los laterales', async ({ page }) => {
  // A el jueves en la noche: empezar a las 20:10 da completa; ya en los laterales el reloj salta a las 21:05 y ya no cabe
  // todo antes de las 21:15
  await limpiar(page, 'hecha')
  await reloj(page, '2026-10-08T20:10:00')
  await page.goto('')
  await expect(page.getByText(/unos \d+ min(\. Completa si empiezas| · completa)/)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await menu(page, 'Saltar ejercicio')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Elevaciones laterales')
  await reloj(page, '2026-10-08T21:05:00')
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.locator('.deshacer')).toContainText('Para terminar a tiempo se quitó')
  const texto = await page.locator('.deshacer').innerText()
  expect(texto).toContain('tríceps con mancuerna sobre la cabeza')
  expect(texto).not.toMatch(/press inclinado|laterales/)
  // y la línea de la hora del descanso lo dice
  await expect(page.locator('.sesion-linea')).toContainText('se quitó')
  await page.getByRole('button', { name: 'Saltar' }).click()
  await terminarAqui(page)
  await expect(page.getByText('Listo.')).toBeVisible()
})

test('Deshacer el recorte regresa lo quitado sin borrar la alternativa que se eligió mientras estaba el aviso', async ({ page }) => {
  await limpiar(page, 'hecha')
  await reloj(page, '2026-10-08T20:10:00')
  await page.goto('')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  // el recorte se decide ya en el segundo ejercicio
  await menu(page, 'Saltar ejercicio')
  await reloj(page, '2026-10-08T21:05:00')
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.locator('.deshacer')).toContainText('Para terminar a tiempo se quitó')
  // con el aviso todavía a la vista, el ejercicio se cambia por su alternativa
  await menu(page, 'Cambiar por alternativa')
  const hoja = page.locator('.hoja-fondo.abierta')
  const alternativa = (await hoja.locator('button').first().innerText()).split('\n')[0]
  await hoja.locator('button').first().click()
  await expect(hoja).toHaveCount(0)
  await page.locator('.deshacer').getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.locator('.sesion-linea')).not.toContainText('se quitó')
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(alternativa)
})
