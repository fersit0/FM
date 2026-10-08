// Pruebas de punta a punta de los flujos que no pueden trabarse. Corren contra el servidor de desarrollo.
import { test, expect } from '@playwright/test'
import { limpiar, empezarSesion, menu, pausa, reloj, registrar, contestarNo } from './comun.mjs'

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page)
})

test('sesión completa de principio a fin', async ({ page }) => {
  await empezarSesion(page)
  for (let i = 0; i < 60; i++) {
    if (await page.getByText('Cierre', { exact: true }).isVisible()) break
    if (await page.getByRole('button', { name: 'Serie hecha' }).isVisible()) {
      await page.getByRole('button', { name: 'Serie hecha' }).click()
      await expect(pausa(page)).toBeVisible()
      continue
    }
    if (await page.getByRole('button', { name: 'Saltar' }).isVisible()) {
      await page.getByRole('button', { name: 'Saltar' }).click()
      await expect(pausa(page)).toHaveCount(0)
      continue
    }
    if (await page.getByRole('button', { name: 'Siguiente ejercicio' }).isVisible()) { await page.getByRole('button', { name: 'Siguiente ejercicio' }).click(); await page.waitForTimeout(300); continue }
    await page.waitForTimeout(200)
  }
  await expect(page.getByText('Cierre', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText('Listo.')).toBeVisible()
  await expect(page.locator('.resumen-cifra .t-cifra').nth(2)).not.toHaveText('0')
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect(page.getByText(/Hoy toca/)).toBeVisible()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.locator('.t-listo.num')).toHaveText('2')
})

test('saltar todos los ejercicios', async ({ page }) => {
  await empezarSesion(page)
  for (let i = 0; i < 10; i++) {
    if (await page.getByText('Cierre', { exact: true }).isVisible()) break
    await menu(page, 'Saltar ejercicio')
  }
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText('Listo.')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect(page.getByText(/Hoy toca/)).toBeVisible()
})

test('cambiar por alternativa y usarla siempre', async ({ page }) => {
  await empezarSesion(page)
  const original = await page.locator('.sesion-titulo-fila h1').innerText()
  await menu(page, 'Cambiar por alternativa')
  const primera = page.locator('.hoja-fondo.abierta .fila').first()
  const nombre = await primera.locator('button.t-cuerpo').innerText()
  await primera.locator('button.t-cuerpo').click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(nombre)
  expect(nombre).not.toBe(original)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
  await page.getByRole('button', { name: 'Saltar' }).click()
  // de vuelta al original, la alternativa se puede marcar como la de siempre
  await page.locator('.sesion-alternativa').getByRole('button', { name: 'Volver al original' }).click()
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(original)
  await menu(page, 'Cambiar por alternativa')
  await page.getByText('Usar siempre esta').first().click()
  await expect(page.getByText('Es la de siempre')).toBeVisible()
  // hoy ya se eligió el original a mano: se respeta; la de siempre aplica desde la próxima sesión
  await page.keyboard.press('Escape')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(original)
})

test('salir a medio descanso, recargar y seguir', async ({ page }) => {
  await empezarSesion(page)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
  await page.waitForTimeout(1500)
  await page.reload()
  // se retoma sola, sin tocar nada
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
  const t = await page.locator('.circulo-timer').innerText()
  expect(t).toMatch(/^1:[0-4]\d$|^0:/)
})

test('cerrar la app a media sesión y retomar', async ({ page }) => {
  await empezarSesion(page)
  const titulo = await page.locator('.sesion-titulo-fila h1').innerText()
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 2 de/)).toBeVisible()
  await page.goto('')
  // iOS cerró la app: se retoma sola, en el mismo ejercicio y serie
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText(titulo)
  await expect(page.getByText(/Serie 2 de/)).toBeVisible()
})

test('seguir después deja la sesión en Inicio hasta que yo la retome', async ({ page }) => {
  await empezarSesion(page)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await menu(page, 'Seguir después')
  await expect(page.getByText('Sesión a medias')).toBeVisible()
  await page.goto('')
  await expect(page.getByText('Sesión a medias')).toBeVisible()
  await page.getByRole('button', { name: 'Seguir sesión' }).click()
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
})

test('tras un error no se retoma sola', async ({ page }) => {
  await empezarSesion(page)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.evaluate(() => sessionStorage.setItem('gym-app:sin-retomar', '1'))
  await page.goto('')
  await expect(page.getByText('Sesión a medias')).toBeVisible()
})

test('terminar con 0 series', async ({ page }) => {
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await menu(page, 'Terminar sesión')
  await expect(page.getByText('Listo.')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.locator('.t-listo.num')).toHaveText('2')
})

test('lunes con Frida', async ({ page }) => {
  // el lunes 12 de la semana siguiente: Hoy muestra FRIDA y "Sí, fui" la registra
  await reloj(page, '2026-10-12T10:00:00')
  await page.goto('')
  await contestarNo(page)
  await expect(page.getByText('FRIDA: pierna en Foro 4')).toBeVisible()
  await page.getByRole('button', { name: 'Sí, fui' }).click()
  await expect(page.getByText('FRIDA: pierna en Foro 4')).toHaveCount(0)
  await expect(page.getByText('lunes 12: Frida registrada.')).toBeVisible()
  await expect(page.getByText(/Hoy toca/)).toBeVisible()
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
})

test('registrar un día pasado', async ({ page }) => {
  await registrar(page, '2026-10-06', 'B')
  await expect(page.locator('.punto.hecho')).toHaveCount(2)
})

test('exportar e importar respaldo', async ({ page }) => {
  await registrar(page, null, 'A')
  await expect(page.locator('.punto.hecho')).toHaveCount(2)
  await page.getByRole('button', { name: 'Ajustes' }).click()
  const descarga = page.waitForEvent('download')
  await page.getByText('Exportar respaldo').click()
  const archivo = await (await descarga).path()
  await page.getByText('Cerrar').click()
  await page.goto('?seed=0')
  await page.waitForTimeout(600)
  await page.goto('')
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.getByText('Todavía no hay señal', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Hoy' }).click()
  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.locator('input[type="file"][accept*="json"]').setInputFiles(archivo)
  await expect(page.getByText('Respaldo importado')).toBeVisible()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(2)
})

test('actualizar versión sin perder datos', async ({ page }) => {
  await registrar(page, null, 'A')
  await page.evaluate(() => { window.fmActualizar = async () => { location.reload() }; window.dispatchEvent(new Event('fm:version-nueva')) })
  await page.getByText('Hay versión nueva. Toca para actualizar.').click()
  await expect(page.getByText(/Hoy toca/)).toBeVisible()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(2)
})
