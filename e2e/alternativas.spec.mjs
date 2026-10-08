// Recorre cada ejercicio de A, B (con pierna, para cubrir goblet) y CASA y cada alternativa de cada ejercicio:
// al elegirla, tarjeta y ficha son de la alternativa (nombre, fotos, series y reps, unidad) y no queda texto ni foto
// del original; un toque regresa. Y la serie hecha en una alternativa cuenta para el ejercicio.
import { test, expect } from '@playwright/test'
import { limpiar, menu, pausa, reloj, registrar, contestarNo } from './comun.mjs'

const normal = (t) => t.replace(/\s+/g, ' ').trim()

/** Lista de una sesión según la biblioteca real de la app (con goblet si `pierna`) */
async function listaDe(page, sesion, pierna = true) {
  return page.evaluate(({ sesion, pierna }) => {
    const { ejercicios, fotos } = window.fmBiblioteca
    const archivos = (clave) => { const f = fotos[clave]; return f ? [f.a, f.b].filter(Boolean) : [] }
    const item = (e) => ({ id: e.id, nombre: e.nombre, series: e.series, repsMin: e.repsMin, repsMax: e.repsMax, modo: e.modo, ilustracion: e.ilustracion, fotos: archivos(e.ilustracion), caso: e.caso })
    return ejercicios.filter((e) => e.sesion === sesion && (!e.pierna || pierna)).sort((a, b) => a.orden - b.orden).map((e) => ({ ...item(e), sesion: e.sesion, alternativas: e.alternativas.map(item) }))
  }, { sesion, pierna })
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
  await limpiar(page, 'no')
})

test('sesión A con pierna: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = await listaDe(page, 'A')
  expect(lista.some((e) => e.id === 'goblet')).toBe(true)
  expect(lista).toHaveLength(9)
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await revisarSesion(page, lista)
})

test('sesión B con pierna: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = await listaDe(page, 'B')
  await registrar(page, null, 'A')
  await expect(page.locator('h1')).toContainText('B:')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await revisarSesion(page, lista)
})

test('CASA: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = await listaDe(page, 'CASA')
  await reloj(page, '2026-10-09T10:00:00')
  await page.goto('')
  await contestarNo(page)
  await page.getByRole('button', { name: /Casa, 12 minutos/ }).click()
  await revisarSesion(page, lista)
})

test('una serie hecha en la alternativa cuenta para el ejercicio y se puede seguir en el original', async ({ page }) => {
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
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Jalón al pecho, agarre ancho')
  await menu(page, 'Ocupado: después')
  await expect(page.getByText('Después, al final de poleas.')).toBeVisible()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo sentado en máquina')
  await expect(page.locator('.sesion-zona')).toHaveText('Poleas · 1 de 9')
  await menu(page, 'Saltar ejercicio')
  // el jalón vuelve a tocar al final de poleas, antes de pasar a bancos
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Jalón al pecho, agarre ancho')
  await expect(page.locator('.sesion-zona')).toHaveText('Poleas · 2 de 9')
  // sigue ocupado: ahora ofrece la alternativa
  await menu(page, 'Ocupado: después')
  const hoja = page.locator('.hoja-fondo.abierta')
  await expect(hoja.getByText('Ya se pospuso una vez. Si sigue ocupado, cambia por la alternativa.')).toBeVisible()
  await hoja.getByRole('button', { name: 'Remo a una mano con mancuerna, jalando hacia la cadera', exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo a una mano con mancuerna, jalando hacia la cadera')
  // el último de su zona se va al final de la sesión
  await menu(page, 'Saltar ejercicio')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press inclinado con mancuernas')
  await menu(page, 'Saltar ejercicio')
  await menu(page, 'Saltar ejercicio')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Tríceps con mancuerna sobre la cabeza, sentado')
  await menu(page, 'Ocupado: después')
  await expect(page.getByText('Después, al final de la sesión.')).toBeVisible()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Sentadilla goblet')
  // recargar conserva el orden
  await page.goto('')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Sentadilla goblet')
  await expect(page.locator('.sesion-ruta')).toContainText('Bancos')
})

test('recorte en el camino: con la proyección pasada de la última pesa quita abdomen y brazos, nunca el press, el jalón, el remo ni los laterales', async ({ page }) => {
  // sin pierna: empezar a las 20:10 da completa; a media sesión el reloj salta a las 20:50 y ya no cabe todo
  await limpiar(page, 'hecha')
  await reloj(page, '2026-10-07T20:10:00')
  await page.goto('')
  await expect(page.getByText(/unos 63 min · completa/)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await reloj(page, '2026-10-07T20:50:00')
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.locator('.deshacer')).toContainText('Para terminar a tiempo se quitó')
  const texto = await page.locator('.deshacer').innerText()
  expect(texto).toContain('crunch')
  expect(texto).toContain('curl con mancuernas')
  expect(texto).not.toMatch(/press inclinado|jalón|remo sentado|laterales/)
  await page.getByRole('button', { name: 'Saltar' }).click()
  // y la línea de arriba lo dice
  await expect(page.locator('.sesion-linea')).toContainText('se quitó crunch')
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Terminar sesión', { exact: true }).click()
  await expect(page.getByText('Listo.')).toBeVisible()
})
