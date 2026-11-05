// Revisión de Fer a las capturas v6: el pez nunca tapa texto en Hoy, la foto de la sesión llena el ancho con la
// etiqueta completa, y la primera vez con un ejercicio se ven los dos avisos (primera vez y aproximación).
import { test, expect } from '@playwright/test'
import { limpiar, reloj, empezarSesion } from './comun.mjs'

const cruza = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1

test('en Hoy el pez no queda encima de la línea de arriba ni del título', async ({ page }) => {
  // semana sin Frida: el jueves en la noche toca C; a las 20:45 ya va la corta y sale el pez
  await limpiar(page, 'no')
  await reloj(page, '2026-10-08T20:45:00')
  await page.goto('')
  await expect(page.getByText(/Corta si empiezas|· corta/)).toBeVisible()
  await expect(page.locator('.inicio-texto .pez')).toBeVisible()
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => {
    const caja = (x) => { const b = x.getBoundingClientRect(); return { left: b.left, top: b.top, right: b.right, bottom: b.bottom } }
    const pez = caja(document.querySelector('.inicio-texto .pez'))
    // los renglones de texto de verdad, no la caja del párrafo
    const renglones = (sel) => { const el = document.querySelector(sel); const rg = document.createRange(); rg.selectNodeContents(el); return [...rg.getClientRects()].map((b) => ({ left: b.left, top: b.top, right: b.right, bottom: b.bottom })) }
    return { pez, texto: [...renglones('.inicio-linea'), ...renglones('h1.t-inicio')] }
  })
  expect(r.texto.length).toBeGreaterThan(0)
  expect(r.texto.filter((t) => cruza(t, r.pez))).toEqual([])
})

test('la foto de la sesión sale entera, con la etiqueta adentro, y la primera vez sale la aproximación', async ({ page }) => {
  // ACOMODO-FM.md, 1: la foto ya no llena el ancho a fuerza (eso la recortaba); va entera, en su proporción
  await limpiar(page, 'hecha')
  await empezarSesion(page)
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press inclinado con mancuernas')
  await expect(page.getByText(/^Antes: .* × 10, no se registra\.$/)).toBeVisible()
  await expect(page.getByText('Primera vez: empieza con este y ajusta.')).toHaveCount(0)
  await page.waitForTimeout(900)
  const r = await page.evaluate(() => {
    const caja = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, w: b.width, h: b.height } }
    const img = document.querySelector('.sesion-foto img')
    return { foto: caja('.sesion-foto .foto'), etiqueta: caja('.sesion-foto .foto-etiqueta'), real: img.naturalWidth / img.naturalHeight }
  })
  expect(Math.abs(r.foto.w / r.foto.h - r.real) / r.real).toBeLessThan(0.03)
  expect(r.etiqueta.left - r.foto.left).toBeGreaterThanOrEqual(8)
  expect(r.etiqueta.right).toBeLessThanOrEqual(r.foto.right - 8)
  expect(r.etiqueta.bottom).toBeLessThanOrEqual(r.foto.bottom)
  // en la serie 2 la foto le deja su lugar al círculo
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 2 de/)).toBeVisible()
  await expect(page.locator('.sesion-foto')).toHaveCount(0)
})
