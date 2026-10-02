// Recorre cada ejercicio de A, B y CASA con cada una de sus alternativas: al elegirla, tarjeta y ficha son
// de la alternativa (nombre, fotos, series y reps, unidad) y no queda texto ni foto del original; un toque regresa.
import { test, expect } from '@playwright/test'

const normal = (t) => t.replace(/\s+/g, ' ').trim()

async function limpiar(page) {
  await page.goto('?seed=0')
  await page.waitForTimeout(600)
  await page.evaluate(() => localStorage.clear())
  await page.goto('')
  await expect(page.getByRole('button', { name: /^Empezar/ })).toBeVisible()
}
async function biblioteca(page) {
  return page.evaluate(() => {
    const { ejercicios, fotos } = window.fmBiblioteca
    const archivos = (clave) => { const f = fotos[clave]; return f ? [f.a, f.b].filter(Boolean) : [] }
    const item = (e) => ({ id: e.id, nombre: e.nombre, series: e.series, repsMin: e.repsMin, repsMax: e.repsMax, modo: e.modo, ilustracion: e.ilustracion, fotos: archivos(e.ilustracion), caso: e.caso })
    return ejercicios.map((e) => ({ ...item(e), sesion: e.sesion, alternativas: e.alternativas.map(item) }))
  })
}
async function menu(page, opcion) {
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText(opcion, { exact: true }).click()
}
/** Fotos visibles dentro de un contenedor: archivo (sin ruta ni extensión) y alt */
async function fotosDe(loc) {
  return loc.locator('img').evaluateAll((imgs) => imgs.map((i) => ({ archivo: decodeURIComponent(i.getAttribute('src').split('/').pop().replace(/\.jpg$/, '')), alt: i.getAttribute('alt') || '' })))
}

function rango(e) {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope con 2 guardadas'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}

async function revisarSesion(page, lista) {
  for (const e of lista) {
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(e.nombre)
    for (const a of e.alternativas) {
      await menu(page, 'Cambiar por alternativa')
      await page.locator('.hoja-fondo.abierta').getByRole('button', { name: a.nombre, exact: true }).click()
      await expect(page.locator('.hoja-fondo.abierta')).toHaveCount(0)
      const problemas = []
      // tarjeta
      await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(a.nombre)
      const panel = page.locator('.panel')
      const texto = normal(await panel.innerText())
      if (texto.includes(e.nombre) && !a.nombre.includes(e.nombre)) problemas.push(`tarjeta: aparece el nombre del original "${e.nombre}"`)
      if (a.caso && !texto.includes(a.caso)) problemas.push(`tarjeta: no aparece el caso "${a.caso}"`)
      if (!texto.includes('Volver al original')) problemas.push('tarjeta: falta "Volver al original"')
      for (const f of await fotosDe(panel)) {
        if (!f.alt.startsWith(a.nombre)) problemas.push(`tarjeta: foto con alt "${f.alt}"`)
        if (a.fotos.length && !a.fotos.includes(f.archivo)) problemas.push(`tarjeta: foto ${f.archivo} no es de la alternativa`)
        if (!a.fotos.includes(f.archivo) && e.fotos.includes(f.archivo)) problemas.push(`tarjeta: foto del original ${f.archivo}`)
      }
      if (a.modo === 'peso') {
        const unidadEsperada = e.sesion === 'CASA' ? 'kg' : 'lb'
        const u = await page.locator('button.kg').innerText()
        if (u !== unidadEsperada) problemas.push(`tarjeta: unidad ${u}, se esperaba ${unidadEsperada}`)
      }
      // ficha
      await page.getByRole('button', { name: 'Técnica', exact: true }).click()
      const hoja = page.locator('.hoja-fondo.abierta')
      await expect(hoja.locator('h2.t-ejercicio').first()).toHaveText(a.nombre)
      const chips = normal(await hoja.locator('.chips').innerText())
      if (!chips.includes(rango(a))) problemas.push(`ficha: chips "${chips}" sin el rango de la alternativa "${rango(a)}"`)
      // todo el texto de la ficha menos la lista de alternativas (ahí sí se nombran otras)
      const cuerpo = normal(await hoja.locator('.hoja-cuerpo').evaluate((el) => { const c = el.cloneNode(true); c.querySelectorAll('.ficha-seccion:last-of-type, .lista').forEach((x) => x.remove()); return c.innerText }))
      if (cuerpo.includes(e.nombre) && !a.nombre.includes(e.nombre)) problemas.push(`ficha: aparece el nombre del original "${e.nombre}"`)
      for (const f of await fotosDe(hoja.locator('.foto-par, .ficha-foto'))) {
        if (!f.alt.startsWith(a.nombre)) problemas.push(`ficha: foto con alt "${f.alt}"`)
        if (!a.fotos.includes(f.archivo) && e.fotos.includes(f.archivo)) problemas.push(`ficha: foto del original ${f.archivo}`)
      }
      await page.keyboard.press('Escape')
      await expect(hoja).toHaveCount(0)
      expect(problemas, `${e.id} → ${a.id}: ${problemas.join('; ')}`).toEqual([])
      // un toque regresa al original
      await page.locator('.sesion-alternativa').getByRole('button', { name: 'Volver al original' }).click()
      await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(e.nombre)
      await expect(page.locator('.sesion-alternativa')).toHaveCount(0)
    }
    await menu(page, 'Saltar ejercicio')
  }
}

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page)
})

test('sesión A: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = (await biblioteca(page)).filter((e) => e.sesion === 'A')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await revisarSesion(page, lista)
})

test('sesión B: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = (await biblioteca(page)).filter((e) => e.sesion === 'B')
  // una A hoy para que toque B
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.getByRole('button', { name: /Fui este día/ }).click()
  await page.getByLabel('Qué hice').selectOption('A')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await page.getByRole('button', { name: 'Hoy' }).click()
  await expect(page.locator('h1')).toContainText('B:')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await revisarSesion(page, lista)
})

test('CASA: cada alternativa reemplaza todo y regresa', async ({ page }) => {
  const lista = (await biblioteca(page)).filter((e) => e.sesion === 'CASA')
  await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'))
  await page.goto('')
  await page.getByRole('button', { name: /Casa, 12 minutos/ }).click()
  await revisarSesion(page, lista)
})
