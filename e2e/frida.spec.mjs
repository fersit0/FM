// Frida y la elección de la sesión (RUTINA-FINAL.md v7, 2 y 14), en la semana del 14 de septiembre de 2026 sin datos,
// con una B registrada el domingo 13 para que las preguntas de días sin registro empiecen el lunes. En la v7 el lunes en
// la mañana es cardio y Frida es en la noche; el martes en la mañana son pesas; el miércoles, descanso.
import { test, expect } from '@playwright/test'
import { limpiar, reloj, contestarNo, registrar, terminarAqui } from './comun.mjs'

const LUNES = '2026-09-14'
const hora = (fecha, h = '10:00:00') => `${fecha}T${h}`

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page, 'ninguna', '&registro=2026-09-13:B')
})

test('el lunes en la noche Hoy muestra "Hoy vas con Frida"; "Fui con Frida" la registra sin ejercicios y el martes toca A', async ({ page }) => {
  await reloj(page, hora(LUNES, '20:00:00'))
  await page.goto('')
  await expect(page.getByText('Hoy vas con Frida')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Fui con Frida' }).click()
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: 'Torso', exact: true }).click()
  await expect(page.getByText('lunes 14: Frida torso registrada.')).toBeVisible()
  await expect(page.locator('.tira-marca.hecho')).toHaveCount(1)
  await reloj(page, hora('2026-09-15', '06:45:00'))
  await page.goto('')
  await expect(page.locator('h1')).toContainText('A: Pecho y pierna')
  await expect(page.getByText(/Frida fue torso el lunes · Semana: 1 de 3/)).toBeVisible()
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^A: /)
  await expect(page.getByText(/7 ejercicios, unos \d+ min(\. Completa si empiezas| · completa)/)).toBeVisible()
})

test('movida al miércoles: el martes toca A porque Frida es mañana, y el miércoles Hoy muestra Frida', async ({ page }) => {
  await reloj(page, hora(LUNES, '20:00:00'))
  await page.goto('')
  await page.getByRole('button', { name: 'Se movió a…' }).click()
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: /^miércoles/ }).click()
  // el lunes en la noche el club no abre
  await expect(page.locator('h1')).toHaveText('Club cerrado')
  await expect(page.getByText(/Frida: miércoles 16. Mover/)).toBeVisible()
  await reloj(page, hora('2026-09-15', '06:45:00'))
  await page.goto('')
  await expect(page.locator('h1')).toContainText('A:')
  await reloj(page, hora('2026-09-16'))
  await page.goto('')
  // el martes quedó sin registro: se contesta y entonces sale Frida
  await contestarNo(page)
  await expect(page.getByText('Hoy vas con Frida')).toBeVisible()
})

test('"No hubo": la semana es C, A y B; C va por Poleas → Bancos → Terraza y "Terminar aquí" cierra con lo hecho', async ({ page }) => {
  await reloj(page, hora(LUNES, '20:00:00'))
  await page.goto('')
  await page.getByRole('button', { name: 'No hubo' }).click()
  await expect(page.getByText(/Mañana martes toca C/)).toBeVisible()
  await reloj(page, hora('2026-09-15', '06:30:00'))
  await page.goto('')
  await expect(page.locator('h1')).toContainText('C: Espalda y hombro')
  await expect(page.getByText(/6 ejercicios, unos \d+ min(\. Completa si empiezas| · completa)/)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-ruta')).toHaveText('Poleas → Bancos → Terraza')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Jalón al pecho, agarre ancho')
  await expect(page.locator('.sesion-ruta .actual')).toHaveText('Poleas')
  await expect(page.locator('.sesion-cuenta')).toHaveText('1 de 6')
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await terminarAqui(page)
  // en la mañana no hay cierre: directo al resumen
  await expect(page.locator('h1', { hasText: 'Cierre' })).toHaveCount(0)
  await expect(page.getByText('Listo.')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect(page.locator('h1')).toHaveText('C hecha')
  // después de C no va B mientras falte A: el miércoles (descanso) "si vas igual" es A
  await reloj(page, hora('2026-09-16'))
  await page.goto('')
  await expect(page.locator('h1')).toHaveText('Descanso')
  await expect(page.getByText(/Si vas igual, va la A y cuenta/)).toBeVisible()
  // y con A hecha, B
  await registrar(page, '2026-09-16', 'A')
  await reloj(page, hora('2026-09-17', '06:30:00'))
  await page.goto('')
  await expect(page.getByText(/La última fue A el miércoles 16 · Semana: 2 de 3/)).toBeVisible()
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^B: /)
})

test('pregunta pendiente: Pierna o Torso registra ese día y luego sigue con el martes', async ({ page }) => {
  await reloj(page, hora('2026-09-16'))
  await page.goto('')
  await expect(page.getByText('¿Fuiste con Frida el lunes 14?')).toBeVisible()
  await page.getByRole('button', { name: 'Torso', exact: true }).click()
  await expect(page.getByText('lunes 14: Frida torso registrada.')).toBeVisible()
  await expect(page.getByText('¿Entrenaste el martes 15?')).toBeVisible()
  await expect(page.locator('.inicio-pie .dia-boton.marcado')).toHaveText('A')
  await page.getByRole('button', { name: 'No fui' }).click()
  await expect(page.locator('.tira-marca.hecho')).toHaveCount(1)
  await expect(page.locator('.tira-dia').first().locator('.tira-marca')).toHaveClass(/hecho/)
  // el miércoles es descanso; si va igual, A
  await expect(page.locator('h1')).toHaveText('Descanso')
  await expect(page.getByText(/Si vas igual, va la A y cuenta/)).toBeVisible()
})

test('registrar Frida otro día la vuelve el día de Frida de esa semana', async ({ page }) => {
  // martes después de las 21:00 (ya sin "¿Vas en la noche?"): "Se movió a…" desde la pregunta del lunes
  await reloj(page, hora('2026-09-15', '21:10:00'))
  await page.goto('')
  await expect(page.getByText('¿Fuiste con Frida el lunes 14?')).toBeVisible()
  await page.getByRole('button', { name: 'Se movió a…' }).click()
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: /^martes/ }).click()
  await expect(page.getByText('Hoy vas con Frida')).toBeVisible()
  await page.getByRole('button', { name: 'Fui con Frida' }).click()
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: 'Torso', exact: true }).click()
  await expect(page.getByText(/Frida fue torso el martes · Semana: 1 de 3/)).toBeVisible()
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^A: /)
  await expect(page.locator('.tira-dia').nth(1).locator('.tira-marca')).toHaveClass(/hecho/)
})

test('la corta de C: jalón ancho, press militar y laterales a 3 series', async ({ page }) => {
  await reloj(page, hora(LUNES, '20:00:00'))
  await page.goto('')
  await page.getByRole('button', { name: 'No hubo' }).click()
  // martes en la noche: a las 20:20 la completa de C todavía cabe (pesas hasta 21:05, tope 21:15); a las 20:40 ya no
  await reloj(page, hora('2026-09-15', '20:20:00'))
  await page.goto('')
  await page.getByRole('button', { name: 'Voy en la noche' }).click()
  await expect(page.getByText(/6 ejercicios, unos \d+ min(\. Completa si empiezas| · completa)/)).toBeVisible()
  await reloj(page, hora('2026-09-15', '20:40:00'))
  await page.goto('')
  await expect(page.getByText(/3 ejercicios, unos \d+ min(\. Tienes \d+ min hasta la última pesa\. Corta si empiezas| · corta)/)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await expect(page.locator('.sesion-linea')).toContainText('va la corta')
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-ruta')).toHaveText('Poleas → Bancos')
  await expect(page.locator('.sesion-ruta .actual')).toHaveText('Poleas')
  await expect(page.locator('.sesion-cuenta')).toHaveText('1 de 3')
  await expect(page.getByText(/Serie 1 de 3/)).toBeVisible()
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press militar sentado con mancuernas')
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText('Saltar ejercicio', { exact: true }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Elevaciones laterales')
  await expect(page.locator('.sesion-ruta .actual')).toHaveText('Bancos')
  await expect(page.locator('.sesion-cuenta')).toHaveText('3 de 3')
})

test('"Hoy prefiero": cambia la sesión de hoy con un toque y se deshace', async ({ page }) => {
  await reloj(page, hora('2026-09-15', '06:45:00'))
  await page.goto('')
  await page.getByRole('button', { name: 'Torso', exact: true }).click()
  await expect(page.locator('h1')).toContainText('A:')
  await page.getByRole('button', { name: 'Hoy prefiero…' }).click()
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: /^B:/ }).click()
  await expect(page.getByText('Hoy B.')).toBeVisible()
  await expect(page.locator('h1')).toContainText('B: Torso completo')
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^B: /)
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.locator('h1')).toContainText('A:')
})

test('jueves en la noche avisa del viernes; el domingo, el rescate hasta las 7 pm, y con 3 hechas la extra es opcional', async ({ page }) => {
  // semana del 5 de octubre con Frida el lunes y A el martes
  await limpiar(page, 'hecha', '&registro=2026-10-06:A')
  await reloj(page, '2026-10-08T21:00:00')
  await page.goto('')
  await contestarNo(page)
  await expect(page.getByText(/Vas en 2 de 3\. Mañana viernes toca B: prende tus alarmas de Pesas extra\./)).toBeVisible()
  await reloj(page, '2026-10-11T10:00:00')
  await page.goto('')
  await contestarNo(page)
  await expect(page.getByText(/Frida fue torso el lunes · Semana: 2 de 3/)).toBeVisible()
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^B: /)
  await expect(page.getByText(/Vas en 2 de 3; hoy antes de las 7 pm te toca B\./)).toBeVisible()
  await registrar(page, '2026-10-08', 'B')
  await expect(page.getByText(/Extra y opcional · Frida fue torso el lunes · Semana: 3 de 3/)).toBeVisible()
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^A: /)
})
