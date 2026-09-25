// Ninguna pantalla de sesión se encima ni se corta, en cuatro tamaños de iPhone, con el nombre más largo y avisos activos.
import { test, expect } from '@playwright/test'

const TAMANOS = [[375, 667], [390, 844], [393, 852], [430, 932]]
const SELECTORES = ['.sesion-cabecera', '.sesion-titulo-fila h1', '.foto-chica', '.sesion-arriba .t-sub', '.sesion-aviso', '.circulo', '.dial', '.stepper', '.sesion-abajo .boton', '.botones-fila', '.sesion-abajo .t-sub', '.sesion-abajo .secundario', '.sesion-abajo .t-nota', '.resumen-cifras', '.t-descanso', '.t-listo', '.t-titulo']

async function revisar(page, nombre) {
  const r = await page.evaluate((sels) => {
    const cajas = []
    for (const s of sels) for (const el of document.querySelectorAll(s)) {
      const b = el.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) continue
      const st = getComputedStyle(el)
      if (st.visibility === 'hidden' || el.closest('.hoja-fondo:not(.abierta)')) continue
      const cortado = el.scrollHeight > el.clientHeight + 1 && st.overflowY !== 'visible' && !el.classList.contains('dial')
      cajas.push({ s, x: b.left, y: b.top, r: b.right, b: b.bottom, cortado, fuera: b.left < -1 || b.top < -1 || b.right > innerWidth + 1 || b.bottom > innerHeight + 1 })
    }
    const problemas = []
    for (let i = 0; i < cajas.length; i++) {
      const a = cajas[i]
      if (a.fuera) problemas.push(`${a.s} fuera de la pantalla`)
      if (a.cortado) problemas.push(`${a.s} cortado`)
      for (let j = i + 1; j < cajas.length; j++) {
        const c = cajas[j]
        const contiene = (p, q) => p.x <= q.x + 1 && p.y <= q.y + 1 && p.r >= q.r - 1 && p.b >= q.b - 1
        if (contiene(a, c) || contiene(c, a)) continue
        const cruza = a.x < c.r - 1 && c.x < a.r - 1 && a.y < c.b - 1 && c.y < a.b - 1
        if (cruza) problemas.push(`${a.s} se encima con ${c.s}`)
      }
    }
    if (document.documentElement.scrollHeight > innerHeight + 1) problemas.push('la pantalla hace scroll')
    const h1 = document.querySelector('.sesion-titulo-fila h1')
    if (h1 && h1.scrollWidth > h1.clientWidth + 1) problemas.push('título cortado')
    return problemas
  }, SELECTORES)
  expect(r, `${nombre}: ${r.join('; ')}`).toEqual([])
}

for (const [w, h] of TAMANOS) {
  test(`sesión sin encimarse en ${w}×${h}`, async ({ page }) => {
    page.on('dialog', (d) => d.accept())
    await page.setViewportSize({ width: w, height: h })
    await page.goto('?seed=1')
    await page.waitForTimeout(800)
    await page.evaluate(() => localStorage.removeItem('gym-app:sesion-activa'))
    await page.goto('')
    // una B hoy para que toque A y salga el nombre más largo (A1) con aviso de subir peso
    await page.getByRole('button', { name: 'Historial' }).click()
    await page.getByRole('button', { name: /Fui este día/ }).click()
    await page.getByLabel('Qué hice').selectOption('B')
    await page.getByRole('button', { name: 'Guardar' }).click()
    await page.getByRole('button', { name: 'Hoy' }).click()
    await expect(page.locator('h1')).toContainText('Cuerpo completo A')
    await page.getByRole('button', { name: /^Empezar/ }).click()
    await expect(page.locator('h1', { hasText: 'Calentamiento' })).toBeVisible()
    await page.getByRole('button', { name: 'Empezar calentamiento' }).click()
    await page.waitForTimeout(600)
    await revisar(page, 'calentamiento')
    await page.getByRole('button', { name: 'Ya terminé' }).click()
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press de banca plano con mancuernas')
    await expect(page.locator('.sesion-aviso')).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'serie 1')
    await page.getByRole('button', { name: 'Serie hecha' }).click()
    await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'descanso')
    await page.getByRole('button', { name: 'Saltar' }).click()
    await page.waitForTimeout(700)
    await revisar(page, 'serie 2')
    await page.getByRole('button', { name: 'Serie hecha' }).click()
    await page.getByRole('button', { name: 'Saltar' }).click()
    await page.getByRole('button', { name: 'Serie hecha' }).click()
    await page.getByRole('button', { name: 'Saltar' }).click()
    await page.waitForTimeout(700)
    await revisar(page, 'serie 3 completa')
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Terminar sesión', { exact: true }).click()
    await expect(page.getByText('Listo.')).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'resumen')
  })
}
