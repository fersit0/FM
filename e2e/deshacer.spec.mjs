import { test, expect } from '@playwright/test'
import { limpiar, empezarSesion, terminarAqui, menu } from './comun.mjs'

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page)
  await empezarSesion(page)
})

test('deshacer serie hecha regresa con los mismos valores', async ({ page }) => {
  await page.getByRole('button', { name: 'Más', exact: true }).click()
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

test('Deshacer "Ocupado: después" no borra la alternativa que se eligió mientras estaba el aviso', async ({ page }) => {
  const titulo = page.locator('.sesion-titulo-fila h1')
  const original = await titulo.innerText()
  await page.locator('.sesion-ocupado').getByRole('button', { name: 'Ocupado: después' }).click()
  await expect(titulo).not.toHaveText(original)
  // con el aviso todavía a la vista, el que quedó se cambia por su alternativa
  await menu(page, 'Cambiar por alternativa')
  const hoja = page.locator('.hoja-fondo.abierta')
  const alternativa = (await hoja.locator('button').first().innerText()).split('\n')[0]
  await hoja.locator('button').first().click()
  await expect(titulo).toHaveText(alternativa)
  await page.getByRole('button', { name: 'Deshacer' }).click()
  // regresa el original y, después de él, sigue la alternativa elegida
  await expect(titulo).toHaveText(original)
  await menu(page, 'Saltar ejercicio')
  await expect(titulo).toHaveText(alternativa)
})

test('un doble toque en "Serie hecha" guarda una sola serie', async ({ page }) => {
  const caja = await page.getByRole('button', { name: 'Serie hecha' }).boundingBox()
  const x = caja.x + caja.width / 2, y = caja.y + caja.height / 2
  // los dos toques juntos, sin esperar a que se guarde el primero
  await Promise.all([page.mouse.click(x, y), page.mouse.click(x, y)])
  await expect(page.getByText('Serie guardada.')).toBeVisible()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await expect(page.getByText('1 registrada,', { exact: false })).toBeVisible()
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

test('descartar pide confirmación; "Terminar aquí" no, pero se deshace', async ({ page }) => {
  page.removeAllListeners('dialog')
  page.on('dialog', (d) => d.dismiss())
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Descartar sesión', { exact: true }).click()
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
  await page.keyboard.press('Escape')
  await terminarAqui(page)
  await expect(page.locator('h1', { hasText: 'Cierre' })).toBeVisible()
  await page.getByText('Terminaste aquí. Cuenta para la semana.').waitFor()
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
})

test('editar y borrar una sesión pasada desde Historial', async ({ page }) => {
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await terminarAqui(page)
  await expect(page.locator('h1', { hasText: 'Cierre' })).toBeVisible()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.locator('.lista .fila').first().click()
  await page.locator('.hoja-fondo.abierta .fila', { hasText: /, A parcial/ }).first().click()
  const reps = page.locator('.hoja-fondo.abierta').getByLabel('Reps').first()
  await reps.fill('9')
  await reps.blur()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Borrar sesión' }).click()
  await expect(page.locator('.hoja-fondo.abierta')).toHaveCount(0)
  // queda solo la Frida de la semana
  await expect(page.locator('.t-listo.num')).toHaveText('1')
})
