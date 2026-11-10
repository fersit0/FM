// Hojas con asa (las medianas): se cierran deslizándolas hacia abajo, como en iOS. Si se sueltan antes de tiempo,
// regresan. Las de pantalla completa se cierran con su botón "Cerrar" y no se deslizan.
import { test, expect } from '@playwright/test'
import { limpiar, empezarSesion } from './comun.mjs'

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await limpiar(page)
  await empezarSesion(page)
})

/** Desliza con el dedo `dy` px en `ms` ms, empezando `desde` px abajo del borde de arriba del elemento */
async function deslizar(page, selector, { desde = 10, dy, ms }) {
  await page.evaluate(async ({ selector, desde, dy, ms }) => {
    const el = document.querySelector(selector)
    const r = el.getBoundingClientRect()
    const x = r.left + r.width / 2, y0 = r.top + desde
    // WebKit de escritorio no deja crear toques (new Touch): un evento con la misma forma sirve en los dos motores
    const evento = (tipo, y) => {
      const t = { identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y }
      const activos = tipo === 'touchend' ? [] : [t]
      const e = new Event(tipo, { bubbles: true, cancelable: true })
      Object.defineProperties(e, { touches: { value: activos }, targetTouches: { value: activos }, changedTouches: { value: [t] } })
      el.dispatchEvent(e)
    }
    evento('touchstart', y0)
    for (let i = 1; i <= 10; i++) {
      await new Promise((ok) => setTimeout(ok, ms / 10))
      evento('touchmove', y0 + (dy * i) / 10)
    }
    evento('touchend', y0 + dy)
  }, { selector, desde, dy, ms })
}

const abierta = (page) => page.locator('.hoja-fondo.abierta')

test('la hoja del menú se cierra al deslizarla hacia abajo, sin tocar la opción donde empezó el dedo', async ({ page }) => {
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await expect(abierta(page)).toHaveCount(1)
  await page.waitForTimeout(500)
  // el dedo empieza sobre "Ver técnica"
  await deslizar(page, '.hoja-fondo.abierta .hoja-cuerpo', { dy: 260, ms: 200 })
  await expect(abierta(page)).toHaveCount(0)
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
})

test('si se suelta antes de tiempo, la hoja regresa a su lugar', async ({ page }) => {
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.waitForTimeout(500)
  await deslizar(page, '.hoja-fondo.abierta .hoja', { desde: 6, dy: 40, ms: 600 })
  await page.waitForTimeout(600)
  await expect(abierta(page)).toHaveCount(1)
  const lugar = () => page.locator('.hoja-fondo.abierta .hoja').evaluate((el) => getComputedStyle(el).transform)
  await expect.poll(lugar).toMatch(/^none$|^matrix\(1, 0, 0, 1, 0, 0\)$/)
  // y sigue funcionando: tocar afuera la cierra
  await page.mouse.click(20, 20)
  await expect(abierta(page)).toHaveCount(0)
})

test('las hojas de pantalla completa no se deslizan: se cierran con "Cerrar"', async ({ page }) => {
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
  await page.getByRole('button', { name: /Series de hoy/ }).click()
  await expect(page.locator('.hoja-fondo.abierta .hoja.completa')).toBeVisible()
  await page.waitForTimeout(500)
  await deslizar(page, '.hoja-fondo.abierta .hoja.completa', { desde: 120, dy: 300, ms: 200 })
  await expect(page.locator('.hoja-fondo.abierta .hoja.completa')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect(abierta(page)).toHaveCount(0)
})
