// v8 (MANANAS-30.md y PENDIENTE-V8.md): rotación A/B en Hoy, "Ya llegué", cardio o solo regadera, la pregunta por un
// día sin registro, "Voy en la noche", "Hoy descanso" y Tu semana con visita y cardio. Semana del lunes 23 nov 2026.
import { test, expect } from '@playwright/test'
import { reloj } from './comun.mjs'

/** Hoy a esa hora, con lo registrado (`2026-11-23:A,2026-11-24:VISITA`) y la v8 desde el lunes 23 */
async function abrir(page, fecha, registro = '', ajustes = {}) {
  await reloj(page, fecha)
  await page.goto(`?seed=0${registro ? `&registro=${registro}` : ''}`)
  await page.waitForTimeout(600)
  await page.evaluate((a) => {
    const s = JSON.parse(localStorage.getItem('gym-app:settings') ?? '{}')
    localStorage.setItem('gym-app:settings', JSON.stringify({ ...s, v8Desde: '2026-11-23', ...a }))
  }, ajustes)
  await page.goto('')
  await expect(page.locator('.pantalla.inicio')).toBeVisible()
}
const titulo = (page) => page.locator('.inicio-texto h1')
const linea = (page) => page.locator('.inicio-linea')
const LUNES_A = '2026-11-23:A'

test('rotación: con A el lunes, el martes toca B y Tu semana sigue B, A, B, A', async ({ page }) => {
  await abrir(page, '2026-11-24T07:30:00', LUNES_A)
  await expect(titulo(page)).toHaveText('B: Jalón')
  await expect(linea(page)).toHaveText('Club 1 de 5 · Pesas 1')
  await expect(page.locator('.tira-marca.plan')).toHaveText(['B', 'A', 'B', 'A'])
})

test('"Ya llegué" a las 8:20: solo regadera, cuenta para Club y no mueve la rotación', async ({ page }) => {
  await abrir(page, '2026-11-24T08:20:00', LUNES_A)
  await expect(titulo(page)).toHaveText('Hoy solo regadera')
  await page.getByRole('button', { name: 'Ya llegué' }).click()
  await expect(titulo(page)).toHaveText('Llegaste')
  await expect(linea(page)).toHaveText('Club 2 de 5 · Pesas 1')
  await expect(page.locator('.tira-marca.visita')).toHaveCount(1)
  await expect(page.getByText(/Mañana: B\./)).toBeVisible()
})

test('"Cardio o solo regadera" en la mañana trae "Solo regadera"; en la noche no', async ({ page }) => {
  await abrir(page, '2026-11-24T07:42:00', LUNES_A)
  await page.getByRole('button', { name: 'Cardio o solo regadera' }).click()
  const hoja = page.locator('.hoja-fondo.abierta')
  await hoja.getByRole('button', { name: 'Solo regadera' }).click()
  await expect(titulo(page)).toHaveText('Llegaste')
  await abrir(page, '2026-11-24T19:30:00', LUNES_A, { vaEnLaNoche: '2026-11-24' })
  await page.getByRole('button', { name: 'Cardio o solo regadera' }).click()
  await expect(hoja.getByRole('button', { name: 'Guardar cardio' })).toBeVisible()
  await expect(hoja.getByRole('button', { name: 'Solo regadera' })).toHaveCount(0)
})

test('registrar cardio: cuenta para Club, no para Pesas, y sale en Historial; Registrar sesión abre con ese cardio', async ({ page }) => {
  await abrir(page, '2026-11-24T07:42:00', LUNES_A)
  await page.getByRole('button', { name: 'Cardio o solo regadera' }).click()
  const hoja = page.locator('.hoja-fondo.abierta')
  // la primera vez: elíptica y 25
  await expect(hoja.getByRole('button', { name: 'Elíptica' })).toHaveAttribute('aria-pressed', 'true')
  await expect(hoja.locator('.stepper .t-cifra')).toHaveText('25')
  await hoja.getByRole('button', { name: 'Caminadora' }).click()
  await hoja.getByRole('button', { name: 'Más' }).click()
  await expect(hoja.locator('.stepper .t-cifra')).toHaveText('30')
  await hoja.getByRole('button', { name: 'Guardar cardio' }).click()
  await expect(page.getByText('Cardio: caminadora 30 min.')).toBeVisible()
  await expect(titulo(page)).toHaveText('Cardio hecho')
  await expect(linea(page)).toHaveText('Club 2 de 5 · Pesas 1')
  await page.getByRole('button', { name: 'Registrar sesión' }).click()
  await expect(hoja.getByLabel('Qué hice')).toHaveValue('CARDIO')
  await expect(hoja.getByRole('button', { name: 'Caminadora' })).toHaveAttribute('aria-pressed', 'true')
  await expect(hoja.locator('.stepper .t-cifra')).toHaveText('30')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.locator('.lista .fila').first().click()
  await expect(page.locator('.hoja-fondo.abierta .fila', { hasText: 'martes 24, cardio · caminadora 30 min' })).toBeVisible()
})

test('la pregunta "¿Fuiste al club el…?" va antes de la sesión, una por día', async ({ page }) => {
  await abrir(page, '2026-11-26T07:30:00', LUNES_A, { noFui: [] })
  await expect(titulo(page)).toHaveText('¿Fuiste al club el martes 24?')
  await expect(page.locator('.inicio-pie .dia-boton.marcado')).toHaveText('Pesas: B')
  await page.getByRole('button', { name: 'Solo regadera', exact: true }).click()
  await expect(titulo(page)).toHaveText('¿Fuiste al club el miércoles 25?')
  await expect(page.locator('.inicio-pie .dia-boton.marcado')).toHaveText('Pesas: B')
  await page.getByRole('button', { name: 'No fui' }).click()
  await expect(titulo(page)).toHaveText('B: Jalón')
  await expect(page.locator('.tira-marca.visita')).toHaveCount(1)
})

test('"Voy en la noche": un martes a las 9:30 sin club, la B queda para la noche', async ({ page }) => {
  await abrir(page, '2026-11-24T09:30:00', LUNES_A)
  await expect(titulo(page)).toHaveText('Hoy no hubo club')
  await page.getByRole('button', { name: 'Voy en la noche' }).click()
  await expect(titulo(page)).toHaveText('B: Jalón')
  await expect(page.getByRole('button', { name: /^Empezar/ })).toBeVisible()
})

test('"Hoy descanso": ese día sin plan y al día siguiente sin aviso; la rotación sigue igual', async ({ page }) => {
  await abrir(page, '2026-11-24T07:42:00', LUNES_A)
  await page.getByRole('button', { name: 'Hoy descanso' }).click()
  await expect(titulo(page)).toHaveText('Descanso')
  await expect(page.getByText('Mañana: B.')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Registrar sesión' })).toBeVisible()
  await expect(page.locator('.tira-marca.plan')).toHaveText(['B', 'A', 'B'])
  await expect(linea(page)).toHaveText('Club 1 de 5 · Pesas 1')
  // el miércoles: toca B y no sale "Ayer no hubo club"
  await reloj(page, '2026-11-25T07:30:00')
  await page.goto('')
  await expect(titulo(page)).toHaveText('B: Jalón')
  await expect(page.getByText(/no hubo club/)).toHaveCount(0)
})

test('Tu semana con visita y cardio: el mismo punto lleno, y los dos cuentan para Club', async ({ page }) => {
  await abrir(page, '2026-11-26T07:30:00', `${LUNES_A},2026-11-24:VISITA,2026-11-25:CARDIO`)
  await expect(page.locator('.tira-marca.visita')).toHaveCount(2)
  await expect(page.locator('.tira-dia', { hasText: '' }).nth(2)).toHaveAttribute('aria-label', /miércoles 25: cardio/)
  await expect(linea(page)).toHaveText('Club 3 de 5 · Pesas 1')
  await expect(titulo(page)).toHaveText('B: Jalón')
})
