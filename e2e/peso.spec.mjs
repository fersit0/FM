// Pesos en lb por serie: paso del ejercicio con − y +, cifra exacta con el teclado, kg/lb que se queda guardado,
// cada serie con su propio peso, borrador que sobrevive a cerrar la app, y CASA en kg.
import { test, expect } from '@playwright/test'
import { limpiar, empezarSesion as aSerie } from './comun.mjs'

async function seguirSiHaceFalta(page) {
  const seguir = page.getByRole('button', { name: 'Seguir sesión' })
  if (await seguir.isVisible().catch(() => false)) await seguir.click()
}
const cifra = (page) => page.locator('.circulo-cifra button').first()
const unidad = (page) => page.locator('button.kg')

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page)
})

test('press inclinado arranca en 30 lb y sube de 5 en 5; kg/lb se queda guardado', async ({ page }) => {
  await aSerie(page)
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press inclinado con mancuernas')
  await expect(cifra(page)).toHaveText('30')
  await expect(unidad(page)).toHaveText('lb')
  await page.getByRole('button', { name: /^Más 5 lb/ }).click()
  await expect(cifra(page)).toHaveText('35')
  await page.getByRole('button', { name: /^Menos 5 lb/ }).click()
  await page.getByRole('button', { name: /^Menos 5 lb/ }).click()
  await expect(cifra(page)).toHaveText('25')
  // a kilos: 25 lb son 11.3, redondeado al paso de 1
  await unidad(page).click()
  await expect(unidad(page)).toHaveText('kg')
  await expect(cifra(page)).toHaveText('11')
  await page.getByRole('button', { name: /^Más 1 kg/ }).click()
  await expect(cifra(page)).toHaveText('12')
  await page.reload()
  await seguirSiHaceFalta(page)
  await expect(unidad(page)).toHaveText('kg')
  await expect(cifra(page)).toHaveText('12')
  await unidad(page).click()
  await expect(unidad(page)).toHaveText('lb')
  await expect(cifra(page)).toHaveText('25')
})

test('tocar la cifra abre el teclado y acepta el exacto', async ({ page }) => {
  await aSerie(page)
  await cifra(page).click()
  const campo = page.getByLabel('Peso', { exact: true })
  await expect(campo).toBeFocused()
  expect(await campo.getAttribute('inputmode')).toBe('decimal')
  await campo.fill('17.5')
  await campo.press('Enter')
  await expect(cifra(page)).toHaveText('17.5')
  await expect(page.locator('.circulo-equivalencia')).toHaveText('8 kg')
})

test('cada serie con su propio peso: la nueva arranca con el de la anterior y cambiarla no toca la primera', async ({ page }) => {
  await aSerie(page)
  await page.getByRole('button', { name: /^Más 5 lb/ }).click()
  await expect(cifra(page)).toHaveText('35')
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
  await expect(page.locator('.sesion-abajo .t-sub')).toContainText('serie 2, 35 lb')
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 2 de/)).toBeVisible()
  await expect(cifra(page)).toHaveText('35')
  await expect(page.locator('.sesion-aviso')).toContainText('Hechas en lb: 35 × 10')
  await page.getByRole('button', { name: /^Más 5 lb/ }).click()
  await page.getByRole('button', { name: /^Más 5 lb/ }).click()
  await page.getByRole('button', { name: 'Menos', exact: true }).click()
  await expect(cifra(page)).toHaveText('45')
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-aviso')).toContainText('Hechas en lb: 35 × 10, 45 × 9')
  await page.locator('.sesion-aviso').getByRole('button', { name: 'Editar' }).click()
  const hoja = page.locator('.hoja-fondo.abierta')
  await expect(hoja.getByLabel('Peso').nth(0)).toHaveValue('35')
  await expect(hoja.getByLabel('Peso').nth(1)).toHaveValue('45')
  // editar la primera serie no toca la segunda
  await hoja.getByLabel('Peso').nth(0).fill('32.5')
  await hoja.getByLabel('Peso').nth(0).blur()
  await page.waitForTimeout(400)
  await expect(hoja.getByLabel('Peso').nth(1)).toHaveValue('45')
  await page.keyboard.press('Escape')
  await expect(page.locator('.sesion-aviso')).toContainText('Hechas en lb: 32.5 × 10, 45 × 9')
})

test('cerrar la app a medio ajuste conserva peso y reps', async ({ page }) => {
  await aSerie(page)
  await page.getByRole('button', { name: /^Más 5 lb/ }).click()
  await page.getByRole('button', { name: /^Más 5 lb/ }).click()
  await page.getByRole('button', { name: 'Más', exact: true }).click()
  await expect(cifra(page)).toHaveText('40')
  await expect(page.locator('.stepper .t-cifra')).toHaveText('11')
  await page.goto('')
  await seguirSiHaceFalta(page)
  await expect(cifra(page)).toHaveText('40')
  await expect(page.locator('.stepper .t-cifra')).toHaveText('11')
})

test('CASA va en kg y arranca en 4', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'))
  await page.goto('')
  await page.getByRole('button', { name: /Casa, 12 minutos/ }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toContainText('Laterales')
  await expect(unidad(page)).toHaveText('kg')
  await expect(cifra(page)).toHaveText('4')
  await page.getByRole('button', { name: /^Más 1 kg/ }).click()
  await expect(cifra(page)).toHaveText('5')
})
