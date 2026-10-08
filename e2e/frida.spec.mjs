// Pierna con día de Frida (RUTINA-FINAL.md, 2 y 14), con el reloj fijo en una semana sin datos.
import { test, expect } from '@playwright/test'
import { limpiar } from './comun.mjs'

const LUNES = '2026-09-14'
const hora = (fecha, h = '10:00:00') => new Date(`${fecha}T${h}`)

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page)
})

test('el lunes Hoy muestra FRIDA; "Sí, fui" la registra y A no trae pierna', async ({ page }) => {
  await page.clock.setFixedTime(hora(LUNES))
  await page.goto('')
  await expect(page.getByText('FRIDA: pierna en Foro 4')).toBeVisible()
  await page.getByRole('button', { name: 'Sí, fui' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
  await page.clock.setFixedTime(hora('2026-09-15'))
  await page.goto('')
  await expect(page.locator('h1')).toContainText('A:')
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
  await expect(page.getByText(/unos 57 min/)).toBeVisible()
})

test('movida al miércoles: el martes no hay pierna y el miércoles Hoy muestra FRIDA', async ({ page }) => {
  await page.clock.setFixedTime(hora(LUNES))
  await page.goto('')
  await page.getByRole('button', { name: 'Se movió a…' }).click()
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: /^miércoles/ }).click()
  await expect(page.locator('h1')).toContainText('A:')
  await expect(page.getByText(/Pierna con Frida: miércoles 16/)).toBeVisible()
  await page.clock.setFixedTime(hora('2026-09-15'))
  await page.goto('')
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
  await page.clock.setFixedTime(hora('2026-09-16'))
  await page.goto('')
  await expect(page.getByText('FRIDA: pierna en Foro 4')).toBeVisible()
})

test('"Esta semana no hay": la siguiente completa trae pierna a 3 series, la que sigue ya no, y en corta nunca', async ({ page }) => {
  await page.clock.setFixedTime(hora(LUNES))
  await page.goto('')
  await page.getByRole('button', { name: 'No hubo' }).click()
  await expect(page.getByText(/con pierna \(goblet a 3 series\)/)).toBeVisible()
  await expect(page.getByText(/unos 59 min/)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Sentadilla goblet')
  await expect(page.getByText(/Serie 1 de 3/)).toBeVisible()
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Terminar sesión', { exact: true }).click()
  await expect(page.getByText('Listo.')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect(page.getByText('Hoy toca')).toBeVisible()
  await expect(page.locator('h1')).toContainText('B:')
  // la siguiente (B) ya no trae pierna esta semana
  await page.clock.setFixedTime(hora('2026-09-16'))
  await page.goto('')
  await expect(page.locator('h1')).toContainText('B:')
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
  // en corta nunca: a las 20:20 toca corta
  await page.clock.setFixedTime(hora('2026-09-17', '20:20:00'))
  await page.goto('')
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
})

test('el día planeado pasó sin respuesta: al día siguiente pregunta antes de armar la sesión; "No hubo" activa la pierna', async ({ page }) => {
  await page.clock.setFixedTime(hora('2026-09-15'))
  await page.goto('')
  await expect(page.getByText('¿Fuiste con Frida el lunes 14?')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'No hubo' }).click()
  await expect(page.locator('h1')).toContainText('A:')
  await expect(page.getByText(/con pierna/)).toBeVisible()
})

test('pregunta pendiente y "Sí, fui" registra FRIDA en ese día', async ({ page }) => {
  await page.clock.setFixedTime(hora('2026-09-16'))
  await page.goto('')
  await expect(page.getByText('¿Fuiste con Frida el lunes 14?')).toBeVisible()
  await page.getByRole('button', { name: 'Sí, fui' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
  await expect(page.locator('.punto').first()).toHaveClass(/hecho/)
  await expect(page.getByText(/con pierna/)).toHaveCount(0)
})

test('la corta hace los bloques 1, 2 y el par de laterales a 2 series', async ({ page }) => {
  await page.clock.setFixedTime(hora('2026-09-15', '20:20:00'))
  await page.goto('')
  // el lunes pasó sin respuesta: se contesta primero
  await page.getByRole('button', { name: 'Sí, fui' }).click()
  await expect(page.locator('h1')).toContainText('A:')
  await expect(page.getByText(/3 bloques/)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-cabecera .t-nota')).toHaveText('1 de 3')
  await expect(page.getByText(/Serie 1 de 2/)).toBeVisible()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Elevaciones laterales')
  await expect(page.locator('.sesion-par')).toContainText('Remo con pecho apoyado')
})
