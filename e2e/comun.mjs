// Helpers compartidos. El reloj se fija en el jueves 8 oct 2026 a las 7 pm (avanza desde ahí): es día de pesas, la
// versión automática da completa y la semana es siempre la misma. Como en la v7 a esa hora Hoy pregunta "¿Vas en la
// noche?", `limpiar` deja contestado "Voy en la noche" para ese día. `frida`: 'hecha' registra FRIDA el lunes de esa semana
// (entonces toca A); 'no' marca "esta semana no hay" (entra C y toca C); 'ninguna' no registra nada (Hoy pregunta
// "¿Fuiste con Frida el lunes?").
// Con ?seed= la app arranca sin carga inicial, sin "Pon al día tu semana" y con los días anteriores contestados.
import { expect } from '@playwright/test'

export const HOY = '2026-10-08'
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
  await vaEnLaNoche(page)
  await page.goto('')
  // con 'ninguna', Hoy pregunta primero "¿Fuiste con Frida el lunes?"
  await expect(frida === 'ninguna' ? page.locator('.pantalla.inicio') : page.getByRole('button', { name: /^Empezar/ })).toBeVisible()
}
/** Deja contestado "Voy en la noche" para el día del reloj (lo mismo que tocar el botón de "¿Vas en la noche?") */
export async function vaEnLaNoche(page) {
  await page.evaluate(() => {
    const d = new Date()
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const s = JSON.parse(localStorage.getItem('gym-app:settings') ?? '{}')
    localStorage.setItem('gym-app:settings', JSON.stringify({ ...s, vaEnLaNoche: clave }))
  })
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
/** Contesta "No hubo" a la pregunta de Frida y "No fui" a las preguntas por días sin registro que haya */
export async function contestarNo(page) {
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(250)
    if (await page.getByText(/¿Fuiste con Frida el/).isVisible().catch(() => false)) { await page.getByRole('button', { name: 'No hubo' }).click(); continue }
    if (!(await page.getByText(/¿Entrenaste el/).isVisible().catch(() => false))) return
    await page.getByRole('button', { name: 'No fui' }).click()
  }
}
/** "Terminar aquí" vive en el ✕ de la sesión (ACOMODO-FM.md, 7) */
export async function terminarAqui(page) {
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.locator('.hoja-fondo.abierta').getByText('Terminar aquí', { exact: true }).click()
}
