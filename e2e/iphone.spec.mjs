// Lo que salió al revisar FM en un iPhone 16 del simulador (10 nov 2026): la pantalla brincaba cuando se iba el aviso de
// Deshacer, "Terminar aquí" quedaba escondido en el menú del ✕ y detrás del reloj se veía el color de la pantalla de atrás
// con Técnica abierta.
import { test, expect } from '@playwright/test'
import { limpiar, empezarSesion, menu } from './comun.mjs'

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page)
})

/** Dónde queda (arriba, en px) cada botón y título de la pantalla, sin contar el aviso mismo */
const posiciones = (page, selector) => page.locator(selector).evaluateAll((els) => els.filter((e) => !e.closest('.deshacer')).map((e) => `${e.textContent?.trim().slice(0, 20)}@${Math.round(e.getBoundingClientRect().top)}`))
/** Espera a que se vaya el aviso de Deshacer (5 s) */
const sinAviso = (page) => expect(page.locator('.deshacer')).toHaveCount(0, { timeout: 8000 })

test('en la serie, cuando se va el aviso no se mueve nada: nombre, Técnica, − y + se quedan donde estaban', async ({ page }) => {
  await empezarSesion(page)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText('Descanso saltado.')).toBeVisible()
  await page.waitForTimeout(1000)
  const conAviso = await posiciones(page, '.panel h1, .panel button')
  await sinAviso(page)
  await page.waitForTimeout(400)
  expect(await posiciones(page, '.panel h1, .panel button')).toEqual(conAviso)
})

test('el lugar apartado se suelta al cambiar de paso: el calentamiento llega sin hueco arriba', async ({ page }) => {
  await empezarSesion(page)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await sinAviso(page)
  const lugar = page.locator('.sesion > .aviso-lugar')
  expect((await lugar.boundingBox())?.height ?? 0).toBeGreaterThan(30)
  await menu(page, 'Paso anterior')
  await expect(page.locator('h1', { hasText: 'Calentamiento' })).toBeVisible()
  await expect(lugar).toBeHidden()
})

test('en Hoy, cuando se va el aviso no se mueven la semana, el título ni los botones', async ({ page }) => {
  await page.getByRole('button', { name: 'Hoy prefiero…' }).click()
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: /^C:/ }).click()
  await expect(page.locator('.deshacer')).toBeVisible()
  await page.waitForTimeout(1000)
  const conAviso = await posiciones(page, '.inicio h1, .inicio button')
  await sinAviso(page)
  await page.waitForTimeout(400)
  expect(await posiciones(page, '.inicio h1, .inicio button')).toEqual(conAviso)
})

test('el menú del ✕ enseña todas las acciones sin recorrerlo, hasta "Terminar aquí" y "Descartar sesión"', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await empezarSesion(page)
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  const hoja = page.locator('.hoja-fondo.abierta')
  await page.waitForTimeout(500)
  for (const opcion of ['Ver técnica', 'Saltar ejercicio', 'Seguir después', 'Terminar aquí', 'Descartar sesión']) {
    await expect(hoja.getByText(opcion, { exact: true })).toBeInViewport({ ratio: 1 })
  }
})

test('con Técnica abierta la barra de estado es tinta, y al cerrarla regresa al color de la serie', async ({ page }) => {
  await empezarSesion(page)
  const color = () => page.locator('meta[name="theme-color"]').getAttribute('content')
  await expect.poll(color).toBe('#FF3D00')
  await page.getByRole('button', { name: 'Técnica' }).click()
  await expect.poll(color).toBe('#121318')
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect.poll(color).toBe('#FF3D00')
})
