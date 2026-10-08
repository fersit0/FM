// Helpers compartidos. El reloj se fija en el miércoles 7 oct 2026 a las 7 pm (avanza desde ahí), así la versión
// automática da completa y la semana es siempre la misma. `frida`: 'hecha' registra FRIDA el lunes de esa semana;
// 'no' marca "esta semana no hay" (la siguiente completa trae pierna); 'ninguna' no registra nada.
// Con ?seed= la app arranca sin carga inicial, sin "Pon al día tu semana" y con los días anteriores contestados.
import { expect } from '@playwright/test'

export const HOY = '2026-10-07'
const conReloj = new WeakSet()
/** Fija la hora (y sigue avanzando desde ahí); la segunda vez solo la mueve */
export async function reloj(page, fecha = `${HOY}T19:00:00`) {
  if (conReloj.has(page)) await page.clock.setSystemTime(new Date(fecha))
  else { await page.clock.install({ time: new Date(fecha) }); conReloj.add(page) }
}
export async function limpiar(page, frida = 'hecha', extra = '') {
  await reloj(page)
  await page.goto('?seed=0')
  await page.waitForTimeout(500)
  await page.evaluate(() => localStorage.clear())
  await page.goto(`?seed=0&frida=${frida}${extra}`)
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
export const pausa = (page) => page.locator('h1', { hasText: /^Descanso$/ })
/** Registrar sesión desde Historial */
export async function registrar(page, fecha, tipo) {
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.getByRole('button', { name: /Registrar sesión/ }).click()
  if (fecha) await page.getByLabel('Fecha').fill(fecha)
  await page.getByLabel('Qué hice').selectOption(tipo)
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.locator('.hoja-fondo.abierta')).toHaveCount(0)
  await page.getByRole('button', { name: 'Hoy' }).click()
}
/** Contesta "No fui" a las preguntas por días sin registro que haya */
export async function contestarNo(page) {
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(250)
    if (!(await page.getByText(/¿Entrenaste el/).isVisible().catch(() => false))) return
    await page.getByRole('button', { name: 'No fui' }).click()
  }
}
