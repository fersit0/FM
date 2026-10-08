// Pierna con día de Frida (RUTINA-FINAL.md, 2 y 14), en la semana del 14 de septiembre de 2026 sin datos,
// con una B registrada el domingo 13 para que las preguntas de días sin registro empiecen el lunes.
import { test, expect } from '@playwright/test'
import { limpiar, reloj, contestarNo } from './comun.mjs'

const LUNES = '2026-09-14'
const hora = (fecha, h = '10:00:00') => `${fecha}T${h}`

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page, 'ninguna', '&registro=2026-09-13:B')
})

test('el lunes Hoy muestra FRIDA; "Sí, fui" la registra y A no trae pierna', async ({ page }) => {
  await reloj(page, hora(LUNES))
  await page.goto('')
  await expect(page.getByText('FRIDA: pierna en Foro 4')).toBeVisible()
  await page.getByRole('button', { name: 'Sí, fui' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
  await reloj(page, hora('2026-09-15'))
  await page.goto('')
  await expect(page.locator('h1')).toContainText('A:')
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
  await expect(page.getByText(/8 ejercicios, unos 63 min · completa/)).toBeVisible()
})

test('movida al miércoles: el martes no hay pierna y el miércoles Hoy muestra FRIDA', async ({ page }) => {
  await reloj(page, hora(LUNES))
  await page.goto('')
  await page.getByRole('button', { name: 'Se movió a…' }).click()
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: /^miércoles/ }).click()
  await expect(page.locator('h1')).toContainText('A:')
  await expect(page.getByText(/Pierna con Frida: miércoles 16/)).toBeVisible()
  await reloj(page, hora('2026-09-15'))
  await page.goto('')
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
  await reloj(page, hora('2026-09-16'))
  await page.goto('')
  // lunes y martes quedaron sin registro: se contestan y entonces sale FRIDA
  await contestarNo(page)
  await expect(page.getByText('FRIDA: pierna en Foro 4')).toBeVisible()
})

test('"No hubo": la siguiente completa trae goblet a 3 series al empezar la terraza, la que sigue ya no, y en corta nunca', async ({ page }) => {
  await reloj(page, hora(LUNES))
  await page.goto('')
  await page.getByRole('button', { name: 'No hubo' }).click()
  await expect(page.getByText(/con pierna \(goblet a 3 series\)/)).toBeVisible()
  await expect(page.getByText(/9 ejercicios, unos 65 min/)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Saltar ejercicio', { exact: true }).click()
  }
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Sentadilla goblet')
  await expect(page.locator('.sesion-zona')).toHaveText('Terraza · 6 de 9')
  await expect(page.getByText(/Serie 1 de 3/)).toBeVisible()
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Terminar sesión', { exact: true }).click()
  await expect(page.getByText('Listo.')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect(page.getByText(/Hoy toca B/)).toBeVisible()
  // la siguiente (B) ya no trae pierna esta semana
  await reloj(page, hora('2026-09-16'))
  await page.goto('')
  await page.getByRole('button', { name: 'No fui' }).click()
  await expect(page.locator('h1')).toContainText('B:')
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
  // en corta nunca: a las 20:20 toca corta
  await reloj(page, hora('2026-09-17', '20:20:00'))
  await page.goto('')
  await page.getByRole('button', { name: 'No fui' }).click()
  await expect(page.getByText(/3 ejercicios, unos 30 min · corta/)).toBeVisible()
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
})

test('pregunta pendiente: "Frida" registra FRIDA en ese día y luego sigue con el martes', async ({ page }) => {
  await reloj(page, hora('2026-09-16'))
  await page.goto('')
  await expect(page.getByText('¿Entrenaste el lunes 14?')).toBeVisible()
  await page.getByRole('button', { name: 'Frida' }).click()
  await expect(page.getByText('lunes 14: Frida registrada.')).toBeVisible()
  await expect(page.getByText('¿Entrenaste el martes 15?')).toBeVisible()
  await page.getByRole('button', { name: 'No fui' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
  await expect(page.locator('.punto').first()).toHaveClass(/hecho/)
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
})

test('la corta hace jalón, press inclinado y laterales a 3 series, con los laterales en bancos', async ({ page }) => {
  await reloj(page, hora('2026-09-15', '20:20:00'))
  await page.goto('')
  // el lunes pasó sin respuesta: se contesta primero
  await page.getByRole('button', { name: 'Frida' }).click()
  await expect(page.locator('h1')).toContainText('A:')
  await expect(page.getByText(/3 ejercicios, unos 30 min · corta/)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-ruta')).toHaveText('Poleas → Bancos')
  await expect(page.locator('.sesion-zona')).toHaveText('Poleas · 1 de 3')
  await expect(page.getByText(/Serie 1 de 3/)).toBeVisible()
  await expect(page.locator('.sesion-linea')).toContainText('va la corta')
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press inclinado con mancuernas')
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Elevaciones laterales')
  await expect(page.locator('.sesion-zona')).toHaveText('Bancos · 3 de 3')
})
