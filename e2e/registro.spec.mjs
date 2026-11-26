// Registro de sesiones a prueba de olvidos (RUTINA-FINAL.md v7, 2 y 14). El reloj está el jueves 8 oct a las 7 pm.
import { test, expect } from '@playwright/test'
import { limpiar, reloj, empezarSesion, menu, registrar, HOY } from './comun.mjs'

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
})

test('martes y miércoles sin registro hacen que el jueves se pregunte por cada uno, una sola vez; "No fui" deja seguir', async ({ page }) => {
  // FRIDA el lunes 5; martes 6 y miércoles 7 quedan sin contestar (sin la lista de noFui que pone ?seed=)
  await limpiar(page, 'hecha')
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('gym-app:settings')); s.noFui = []; localStorage.setItem('gym-app:settings', JSON.stringify(s)) })
  await page.goto('')
  await expect(page.getByText('¿Fuiste al club el martes 6?')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar/ })).toHaveCount(0)
  await expect(page.locator('.inicio-pie .dia-boton.marcado')).toHaveText('Pesas: A')
  await page.getByRole('button', { name: 'No fui' }).click()
  await expect(page.getByText('martes 6: no fuiste.')).toBeVisible()
  await expect(page.getByText('¿Fuiste al club el miércoles 7?')).toBeVisible()
  await page.getByRole('button', { name: 'No fui' }).click()
  await expect(page.getByRole('button', { name: /^Empezar/ })).toBeVisible()
  await page.goto('')
  await expect(page.getByText(/¿Fuiste al club el/)).toHaveCount(0)
})

test('al contestar, el aviso de Deshacer ocupa su lugar y no tapa los botones de la siguiente pregunta', async ({ page }) => {
  // viernes 9 en la mañana sin contestar martes, miércoles ni jueves: preguntas seguidas
  await limpiar(page, 'hecha')
  await reloj(page, '2026-10-09T07:00:00')
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('gym-app:settings')); s.noFui = []; localStorage.setItem('gym-app:settings', JSON.stringify(s)) })
  await page.goto('')
  await expect(page.getByText('¿Fuiste al club el martes 6?')).toBeVisible()
  await page.getByRole('button', { name: 'No fui' }).click()
  await expect(page.getByText('¿Fuiste al club el miércoles 7?')).toBeVisible()
  await expect(page.locator('.deshacer')).toContainText('martes 6: no fuiste.')
  const r = await page.evaluate(() => {
    const a = document.querySelector('.deshacer').getBoundingClientRect()
    return [...document.querySelectorAll('.inicio-pie .dia-boton')].map((el) => {
      const b = el.getBoundingClientRect()
      const encima = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2)
      // renglones distintos (un botón puede tener varios nodos de texto en el mismo renglón: "Pesas: " y "A")
      const rg = document.createRange(); rg.selectNodeContents(el)
      return { texto: el.textContent, tapado: !(encima === el || el.contains(encima)), cruza: b.top < a.bottom && a.top < b.bottom, renglones: new Set([...rg.getClientRects()].map((x) => Math.round(x.top))).size }
    })
  })
  expect(r.map((x) => x.texto)).toEqual(['Pesas: A', 'Solo regadera', 'No fui'])
  for (const x of r) expect(x, x.texto).toMatchObject({ tapado: false, cruza: false, renglones: 1 })
})

test('contestar "Pesas: A" registra la sesión ese día y entonces toca B; "Deshacer" la quita', async ({ page }) => {
  await limpiar(page, 'hecha')
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('gym-app:settings')); s.noFui = []; localStorage.setItem('gym-app:settings', JSON.stringify(s)) })
  await page.goto('')
  await page.getByRole('button', { name: 'Pesas: A', exact: true }).click()
  await expect(page.getByText('martes 6: A registrada.')).toBeVisible()
  // el miércoles ya tocaba B
  await expect(page.getByText('¿Fuiste al club el miércoles 7?')).toBeVisible()
  await expect(page.locator('.inicio-pie .dia-boton.marcado')).toHaveText('Pesas: B')
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.getByText('¿Fuiste al club el martes 6?')).toBeVisible()
})

test('una sesión con una sola serie cuenta como hecha aunque nunca se toque Terminar: al día siguiente se cierra sola y toca la otra', async ({ page }) => {
  await limpiar(page, 'hecha')
  await empezarSesion(page)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await menu(page, 'Seguir después')
  await expect(page.getByText('Sesión a medias')).toBeVisible()
  // ya cuenta para la semana aunque siga abierta
  await expect(page.getByText('Pesas 2')).toBeVisible()
  // al día siguiente, viernes en la mañana
  await reloj(page, '2026-10-09T07:00:00')
  await page.goto('')
  await expect(page.getByText('Sesión a medias')).toHaveCount(0)
  await expect(page.locator('.inicio-linea')).toHaveText('Club 1 de 5 · Pesas 2')
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^B: /)
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.locator('.lista .fila').first().click()
  await expect(page.locator('.hoja-fondo.abierta .fila', { hasText: 'A parcial' })).toBeVisible()
})

test('una sesión a medias sin series se descarta sin dejar rastro', async ({ page }) => {
  await limpiar(page, 'hecha')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await menu(page, 'Seguir después')
  await page.getByRole('button', { name: 'Descartar' }).click()
  await expect(page.getByRole('button', { name: /^Empezar/ })).toBeVisible()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.locator('.t-listo.num')).toHaveText('1')
})

test('registrar una sesión hecha sin la app: nunca en el futuro, una sesión de club por día, con Deshacer', async ({ page }) => {
  await limpiar(page, 'hecha')
  await page.getByRole('button', { name: 'Registrar sesión' }).click()
  const hoja = page.locator('.hoja-fondo.abierta')
  expect(await hoja.getByLabel('Fecha').getAttribute('max')).toBe(HOY)
  await hoja.getByLabel('Qué hice').selectOption('B')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByText('jueves 8: B registrada.')).toBeVisible()
  // una de club por día: hecha la de hoy, Hoy ya no ofrece otra
  await expect(page.locator('.inicio-texto h1')).toHaveText('B hecha')
  await expect(page.locator('.inicio-linea')).toHaveText('Club 1 de 5 · Pesas 2')
  // el mismo día otra vez: abre con la B y ofrece cambiarla en vez de duplicar
  await page.getByRole('button', { name: 'Registrar sesión' }).click()
  await expect(hoja.getByLabel('Qué hice')).toHaveValue('B')
  await hoja.getByLabel('Qué hice').selectOption('A')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(hoja.getByText('El jueves 8 ya tiene B. ¿La cambio a A?')).toBeVisible()
  await hoja.getByRole('button', { name: 'Cambiar a A' }).click()
  await expect(page.locator('.inicio-texto h1')).toHaveText('A hecha')
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.locator('.inicio-texto h1')).toHaveText('B hecha')
  await expect(page.locator('.inicio-linea')).toHaveText('Club 1 de 5 · Pesas 2')
})

test('desde Historial también se registra y se puede cambiar qué hice', async ({ page }) => {
  await limpiar(page, 'hecha')
  await registrar(page, '2026-10-06', 'B')
  await expect(page.locator('.inicio-linea')).toHaveText('Club 1 de 5 · Pesas 2')
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^A: /)
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.locator('.lista .fila').first().click()
  await page.locator('.hoja-fondo.abierta .fila', { hasText: 'martes 6, B registrada' }).click()
  await page.locator('.hoja-fondo.abierta').getByLabel('Qué hice').last().selectOption('A')
  await page.locator('.hoja-fondo.abierta').getByRole('button', { name: 'Cerrar' }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('.hoja-fondo.abierta')).toHaveCount(0)
  await page.getByRole('button', { name: 'Hoy' }).click()
  await expect(page.locator('.inicio-linea')).toHaveText('Club 1 de 5 · Pesas 2')
  await expect(page.locator('.inicio-texto h1')).toHaveText(/^B: /)
})
