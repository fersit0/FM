// Pruebas de punta a punta de los flujos que no pueden trabarse. Corren contra el servidor de desarrollo.
import { test, expect } from '@playwright/test'

async function limpiar(page) {
  await page.goto('?seed=0')
  await page.waitForTimeout(600)
  await page.evaluate(() => { localStorage.clear() })
  await page.goto('')
  await expect(page.getByRole('button', { name: /^Empezar/ })).toBeVisible()
}
async function empezarSesion(page) {
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await expect(page.locator('h1', { hasText: 'Calentamiento' })).toBeVisible()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
}
async function menu(page, opcion) {
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByText(opcion, { exact: true }).click()
}
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
      await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
      continue
    }
    if (await page.getByRole('button', { name: 'Saltar' }).isVisible()) {
      await page.getByRole('button', { name: 'Saltar' }).click()
      await expect(page.locator('h1', { hasText: 'Descanso' })).toHaveCount(0)
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
  await expect(page.getByText('Hoy toca')).toBeVisible()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.locator('.t-listo.num')).toHaveText('1')
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
  await expect(page.getByText('Hoy toca')).toBeVisible()
})

test('cambiar por alternativa y usarla siempre', async ({ page }) => {
  await empezarSesion(page)
  const original = await page.locator('.sesion-titulo h1').innerText()
  await menu(page, 'Cambiar por alternativa')
  const primera = page.locator('.hoja-fondo.abierta .fila').first()
  const nombre = await primera.locator('button.t-cuerpo').innerText()
  await primera.locator('button.t-cuerpo').click()
  await expect(page.locator('.sesion-titulo h1')).toHaveText(nombre)
  expect(nombre).not.toBe(original)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await menu(page, 'Cambiar por alternativa')
  await page.getByText('Usar siempre esta').first().click()
  await expect(page.getByText('Es la de siempre')).toBeVisible()
})

test('salir a medio descanso, recargar y seguir', async ({ page }) => {
  await empezarSesion(page)
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
  await page.waitForTimeout(1500)
  await page.reload()
  await page.getByRole('button', { name: 'Seguir sesión' }).click()
  await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
  const t = await page.locator('.circulo-timer').innerText()
  expect(t).toMatch(/^1:[0-4]\d$|^0:/)
})

test('cerrar la app a media sesión y retomar', async ({ page }) => {
  await empezarSesion(page)
  const titulo = await page.locator('.sesion-titulo h1').innerText()
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByText(/Serie 2 de/)).toBeVisible()
  await page.goto('')
  await expect(page.getByText('Sesión a medias')).toBeVisible()
  await page.getByRole('button', { name: 'Seguir sesión' }).click()
  await expect(page.locator('.sesion-titulo h1')).toHaveText(titulo)
  await expect(page.getByText(/Serie 2 de/)).toBeVisible()
})

test('terminar con 0 series', async ({ page }) => {
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await menu(page, 'Terminar sesión')
  await expect(page.getByText('Listo.')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.locator('.t-listo.num')).toHaveText('1')
})

test('lunes con Frida', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-28T10:00:00'))
  await page.goto('')
  await expect(page.getByText('¿Fuiste con Frida?')).toBeVisible()
  await page.getByRole('button', { name: 'Sí, fui' }).click()
  await expect(page.getByText('¿Fuiste con Frida?')).toHaveCount(0)
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
})

test('registrar un día pasado', async ({ page }) => {
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.getByRole('button', { name: /Fui este día/ }).click()
  const hoy = new Date()
  const ayer = new Date(hoy.getTime() - 86400000)
  const clave = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`
  await page.getByLabel('Fecha').fill(clave)
  await page.getByLabel('Qué hice').selectOption('B')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
})

test('exportar e importar respaldo', async ({ page }) => {
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.getByRole('button', { name: /Fui este día/ }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
  await page.getByRole('button', { name: 'Hoy' }).click()
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
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
})

test('actualizar versión sin perder datos', async ({ page }) => {
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.getByRole('button', { name: /Fui este día/ }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()
  await page.getByRole('button', { name: 'Hoy' }).click()
  await page.evaluate(() => { window.fmActualizar = async () => { location.reload() }; window.dispatchEvent(new Event('fm:version-nueva')) })
  await page.getByText('Hay versión nueva. Toca para actualizar.').click()
  await expect(page.getByText('Hoy toca')).toBeVisible()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(page.locator('.punto.hecho')).toHaveCount(1)
})
