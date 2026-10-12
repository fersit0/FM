// Revisión de Fer a las capturas v6: el pez nunca tapa texto en Hoy, la foto de la sesión llena el ancho con la
// etiqueta completa, y la primera vez con un ejercicio se ven los dos avisos (primera vez y aproximación).
import { test, expect } from '@playwright/test'
import { limpiar, reloj, empezarSesion } from './comun.mjs'

const cruza = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1

test('en Hoy el pez no queda encima de la línea de arriba ni del título', async ({ page }) => {
  await limpiar(page, 'no')
  await reloj(page, '2026-10-07T20:30:00')
  await page.goto('')
  await expect(page.getByText(/· corta/)).toBeVisible()
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

test('la foto de la sesión llena el ancho, con la etiqueta completa, y la primera vez salen los dos avisos', async ({ page }) => {
  await limpiar(page, 'hecha')
  await empezarSesion(page)
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press inclinado con mancuernas')
  // primera vez con el press y primer ejercicio: los dos avisos
  await expect(page.getByText('Primera vez: empieza con este y ajusta.')).toBeVisible()
  await expect(page.getByText(/Antes, una de aproximación con .*, 10 reps\. No se registra\./)).toBeVisible()
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => {
    const caja = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return { left: b.left, right: b.right } }
    return { marco: caja('.sesion-foto'), foto: caja('.sesion-foto .foto'), etiqueta: caja('.sesion-foto .foto-etiqueta') }
  })
  expect(Math.abs(r.foto.left - r.marco.left)).toBeLessThanOrEqual(1)
  expect(Math.abs(r.foto.right - r.marco.right)).toBeLessThanOrEqual(1)
  expect(r.etiqueta.left - r.foto.left).toBeGreaterThanOrEqual(8)
  expect(r.etiqueta.right).toBeLessThanOrEqual(r.foto.right - 8)
})
