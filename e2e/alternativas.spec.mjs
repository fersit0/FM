// Recorre cada bloque de A, B y CASA (con pierna, para cubrir goblet y prensa) y cada alternativa de cada ejercicio:
// al elegirla, tarjeta y ficha son de la alternativa (nombre, fotos, series y reps, unidad) y no queda texto ni foto
// del original; un toque regresa. En los pares se prueba el segundo ejercicio tras una serie del primero.
import { test, expect } from '@playwright/test'
import { limpiar, menu, pausa } from './comun.mjs'

const normal = (t) => t.replace(/\s+/g, ' ').trim()

/** Bloques de una sesión según la biblioteca real de la app (con los de pierna) */
async function bloquesDe(page, sesion) {
  return page.evaluate((sesion) => {
    const { ejercicios, fotos } = window.fmBiblioteca
    const archivos = (clave) => { const f = fotos[clave]; return f ? [f.a, f.b].filter(Boolean) : [] }
    const item = (e) => ({ id: e.id, nombre: e.nombre, series: e.series, repsMin: e.repsMin, repsMax: e.repsMax, modo: e.modo, ilustracion: e.ilustracion, fotos: archivos(e.ilustracion), caso: e.caso })
    const lista = ejercicios.filter((e) => e.sesion === sesion).sort((a, b) => a.orden - b.orden)
    const mapa = new Map()
    for (const e of lista) mapa.set(e.bloque, [...(mapa.get(e.bloque) ?? []), { ...item(e), sesion: e.sesion, alternativas: e.alternativas.map(item) }])
    return [...mapa.values()]
  }, sesion)
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
    // oculta si su id ya está en otro bloque de la sesión: entonces no debe aparecer y se salta
    const boton = hoja.getByRole('button', { name: a.nombre, exact: true })
    if ((await boton.count()) === 0) { await page.keyboard.press('Escape'); await expect(hoja).toHaveCount(0); continue }
    await boton.click()
    await expect(hoja).toHaveCount(0)
    const problemas = []
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(a.nombre)
    const panel = page.locator('.panel')
    const texto = normal(await panel.locator('.sesion-arriba').evaluate((el) => { const c = el.cloneNode(true); c.querySelector('.sesion-par')?.remove(); return c.innerText }))
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

async function revisarSesion(page, bloques) {
  for (const b of bloques) {
    await revisarEjercicio(page, b[0])
    if (b.length > 1) {
      // una serie del primero, 15 s de cambio, y entonces toca el segundo
      await page.getByRole('button', { name: 'Serie hecha' }).click()
      await expect(page.locator('h1', { hasText: 'Cambio' })).toBeVisible()
      await page.getByRole('button', { name: 'Saltar' }).click()
      await expect(pausa(page)).toHaveCount(0)
      await revisarEjercicio(page, b[1])
    }
    await menu(page, /^Saltar (ejercicio|el par)$/)
  }
}

test.setTimeout(240_000)
test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page, 'no')
})

test('sesión A con pierna: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const bloques = await bloquesDe(page, 'A')
  expect(bloques.flat().some((e) => e.id === 'goblet')).toBe(true)
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await revisarSesion(page, bloques)
})

test('sesión B con pierna: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const bloques = await bloquesDe(page, 'B')
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.getByRole('button', { name: /Fui este día/ }).click()
  await page.getByLabel('Qué hice').selectOption('A')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.locator('.hoja-fondo.abierta')).toHaveCount(0)
  await page.getByRole('button', { name: 'Hoy' }).click()
  await expect(page.locator('h1')).toContainText('B:')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await revisarSesion(page, bloques)
})

test('CASA: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const bloques = await bloquesDe(page, 'CASA')
  await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'))
  await page.goto('')
  await page.getByRole('button', { name: /Casa, 12 minutos/ }).click()
  await revisarSesion(page, bloques)
})

test('una serie hecha en la alternativa cuenta para el bloque y se puede seguir en el original', async ({ page }) => {
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.getByRole('button', { name: /Fui este día/ }).click()
  await page.getByLabel('Qué hice').selectOption('A')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await page.getByRole('button', { name: 'Hoy' }).click()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await menu(page, /^Saltar (ejercicio|el par)$/)
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo sentado en polea baja')
  await menu(page, 'Cambiar por alternativa')
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: 'Remo a una mano apoyado en banco', exact: true }).click()
  await expect(page.getByText(/Serie 1 de 3/)).toBeVisible()
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(pausa(page)).toBeVisible()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 2 de 3/)).toBeVisible()
  // se liberó la polea: de vuelta al original, sigue en la serie 2
  await page.locator('.sesion-alternativa').getByRole('button', { name: 'Volver al original' }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo sentado en polea baja')
  await expect(page.getByText(/Serie 2 de 3/)).toBeVisible()
  await expect(page.locator('.sesion-aviso')).toContainText('remo a una mano')
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 3 de 3/)).toBeVisible()
})
