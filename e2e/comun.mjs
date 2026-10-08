// Helpers compartidos. `frida`: 'hecha' registra FRIDA el lunes de esta semana (A y B sin pierna, sin pregunta pendiente);
// 'no' marca "esta semana no hay" (la siguiente completa trae pierna).
import { expect } from '@playwright/test'

export async function limpiar(page, frida = 'hecha') {
  await page.goto('?seed=0')
  await page.waitForTimeout(500)
  await page.evaluate(() => localStorage.clear())
  await page.goto(`?seed=0&frida=${frida}`)
  await page.waitForTimeout(600)
  await page.goto('')
  await expect(page.getByRole('button', { name: /^Empezar/ })).toBeVisible()
}
export async function empezarSesion(page) {
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await expect(page.locator('h1', { hasText: 'Calentamiento' })).toBeVisible()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
}
export async function menu(page, opcion) {
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText(opcion, { exact: typeof opcion === 'string' }).click()
}
/** Descanso o los 15 s de cambio dentro de un par */
export const pausa = (page) => page.locator('h1', { hasText: /^(Descanso|Cambio)$/ })
