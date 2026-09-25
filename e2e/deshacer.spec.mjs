import { test, expect } from '@playwright/test'

async function aSerie(page) {
  await page.goto('?seed=0')
  await page.waitForTimeout(600)
  await page.evaluate(() => localStorage.clear())
  await page.goto('')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
}
test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await aSerie(page)
})

test('deshacer serie hecha regresa con los mismos valores', async ({ page }) => {
  await page.getByRole('button', { name: 'Más' }).click()
  const reps = await page.locator('.stepper .t-cifra').innerText()
  const peso = await page.locator('.circulo-cifra button').first().innerText()
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.getByText('Serie guardada.')).toBeVisible()
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
  await expect(page.locator('.stepper .t-cifra')).toHaveText(reps)
  await expect(page.locator('.circulo-cifra button').first()).toHaveText(peso)
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await expect(page.getByText('0 registradas', { exact: false })).toBeVisible()
})

test('deshacer saltar descanso', async ({ page }) => {
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 2 de/)).toBeVisible()
  await page.getByText('Descanso saltado.').waitFor()
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
})

test('deshacer saltar ejercicio', async ({ page }) => {
  const titulo = await page.locator('.sesion-titulo-fila h1').innerText()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).not.toHaveText(titulo)
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(titulo)
})

test('editar y borrar series de hoy', async ({ page }) => {
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByRole('button', { name: /Series de hoy/ }).click()
  const reps = page.locator('.hoja-fondo.abierta').getByLabel('Reps').first()
  await reps.fill('7')
  await reps.blur()
  await page.waitForTimeout(400)
  await expect(reps).toHaveValue('7')
  await page.getByRole('button', { name: 'Borrar' }).click()
  await expect(page.getByText('Todavía no hay series.')).toBeVisible()
})

test('terminar y descartar piden confirmación', async ({ page }) => {
  page.removeAllListeners('dialog')
  page.on('dialog', (d) => d.dismiss())
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Terminar sesión', { exact: true }).click()
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
  await page.getByText('Descartar sesión', { exact: true }).click()
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
})

test('editar y borrar una sesión pasada desde Historial', async ({ page }) => {
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Terminar sesión', { exact: true }).click()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.locator('.lista .fila').first().click()
  await page.locator('.hoja-fondo.abierta .fila').first().click()
  const reps = page.locator('.hoja-fondo.abierta').getByLabel('Reps').first()
  await reps.fill('9')
  await reps.blur()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Borrar sesión' }).click()
  await expect(page.getByText('Todavía no hay señal', { exact: false })).toBeVisible()
})
