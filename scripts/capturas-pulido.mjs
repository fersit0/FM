// Capturas de PULIDO-FM.md (7) en WebKit (el motor de Safari) a 393 px: Hoy en día de club, de Frida y en semana sin
// Frida, "Pon al día tu semana", la sesión con el descanso corriendo, una alternativa, la corta, el resumen, Historial,
// Ajustes y una ficha. Hoy y la sesión también a 375 (iPhone SE) y 430 (Pro Max). Reloj fijo en la semana del 5 oct 2026.
// Uso: CAPTURAS_DIR=capturas node scripts/capturas-pulido.mjs   (con el servidor de desarrollo corriendo)
import { webkit, devices } from 'playwright'
import { mkdirSync } from 'node:fs'
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
mkdirSync(dir, { recursive: true })
const base = 'http://localhost:5173/FM/'
const browser = await webkit.launch()

/** Una página del tamaño dado, con las áreas seguras del iPhone simuladas (isla arriba, indicador abajo) */
async function pagina(ancho, alto, arriba, abajo) {
  const ctx = await browser.newContext({ ...devices['iPhone 15'], viewport: { width: ancho, height: alto }, deviceScaleFactor: 2, colorScheme: 'dark' })
  const page = await ctx.newPage()
  page.on('dialog', (d) => d.accept())
  await page.addInitScript(([t, b]) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = `html { --safe-top: ${t}px !important; --safe-bottom: ${b}px !important }`; document.head.appendChild(st) }) }, [arriba, abajo])
  await page.clock.install({ time: new Date('2026-10-07T19:00:00') })
  return page
}
// espera a que se vaya el Deshacer (5 s) para que no tape nada
const foto = async (page, n) => { await page.waitForTimeout(5300); await page.screenshot({ path: `${dir}/${n}.png` }) }
const menu = async (page, op) => { await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await page.waitForTimeout(450); await page.locator('.hoja-fondo.abierta').getByText(op, { exact: true }).click() }
const empezar = async (page) => { await page.getByRole('button', { name: /^Empezar/ }).click(); await page.getByRole('button', { name: 'Saltar' }).click({ force: true }) }
/** Instalación nueva con 4 semanas de historial: Frida el lunes 5 y la A del miércoles 7 */
async function conHistorial(page) {
  await page.goto(`${base}?seed=1&fresco=1`)
  await page.waitForTimeout(1000)
  await page.evaluate(() => localStorage.removeItem('gym-app:sesion-activa'))
  await page.goto(base)
  await page.getByText('Pon al día tu semana').waitFor()
}

// ---------- 393 px (iPhone 15) ----------
const p = await pagina(393, 852, 59, 34)
await conHistorial(p)
await foto(p, 'pulido-pon-al-dia')
await p.getByRole('button', { name: 'Listo' }).click()
// jueves 8: club, toca B
await p.clock.setSystemTime(new Date('2026-10-08T19:00:00'))
await p.goto(base)
await p.getByText(/Hoy toca B/).waitFor()
await foto(p, 'pulido-hoy-club-393')
await empezar(p)
await foto(p, 'pulido-sesion-393')
await p.getByRole('button', { name: 'Técnica' }).click()
await foto(p, 'pulido-ficha')
await p.keyboard.press('Escape')
await p.getByRole('button', { name: 'Serie hecha' }).click()
await foto(p, 'pulido-descanso')
await p.getByRole('button', { name: 'Saltar' }).click()
await menu(p, 'Cambiar por alternativa')
await p.waitForTimeout(500)
await p.locator('.hoja-fondo.abierta .alt-boton').first().click()
await foto(p, 'pulido-alternativa')
await p.getByRole('button', { name: 'Terminar aquí' }).first().click()
await p.getByRole('button', { name: 'Saltar' }).click()
await foto(p, 'pulido-resumen')
await p.getByRole('button', { name: 'Cerrar' }).click()
await p.getByRole('button', { name: 'Historial', exact: true }).click()
await foto(p, 'pulido-historial')
await p.getByRole('button', { name: 'Hoy', exact: true }).click()
await p.getByRole('button', { name: 'Ajustes', exact: true }).click()
await foto(p, 'pulido-ajustes')
await p.keyboard.press('Escape')
// lunes 12: día de Frida (los días sin registro de antes se contestan "No fui")
await p.clock.setSystemTime(new Date('2026-10-12T10:00:00'))
await p.goto(base)
for (let i = 0; i < 4; i++) { await p.waitForTimeout(300); if (await p.getByText(/¿Entrenaste el/).isVisible().catch(() => false)) await p.getByRole('button', { name: 'No fui' }).click() }
await p.getByText('Hoy vas con Frida').waitFor()
await foto(p, 'pulido-hoy-frida')
// semana sin Frida: toca C
await p.clock.setSystemTime(new Date('2026-10-07T19:00:00'))
await p.goto(`${base}?seed=0&frida=no`)
await p.waitForTimeout(800)
await p.goto(base)
await p.getByText(/Hoy toca C/).waitFor()
await foto(p, 'pulido-hoy-sin-frida')
// la corta: Frida el lunes, miércoles a las 8:30 pm
await p.goto(`${base}?seed=0&frida=hecha`)
await p.waitForTimeout(800)
await p.clock.setSystemTime(new Date('2026-10-07T20:30:00'))
await p.goto(base)
await p.getByText(/· corta/).waitFor()
await empezar(p)
await foto(p, 'pulido-corta')
await p.context().close()

// ---------- Hoy y la sesión a 375 (iPhone SE, sin isla) y 430 (Pro Max) ----------
for (const [ancho, alto, arriba, abajo] of [[375, 667, 20, 0], [430, 932, 59, 34]]) {
  const q = await pagina(ancho, alto, arriba, abajo)
  await conHistorial(q)
  await q.getByRole('button', { name: 'Listo' }).click()
  await q.clock.setSystemTime(new Date('2026-10-08T19:00:00'))
  await q.goto(base)
  await q.getByText(/Hoy toca B/).waitFor()
  await foto(q, `pulido-hoy-club-${ancho}`)
  await empezar(q)
  await foto(q, `pulido-sesion-${ancho}`)
  await q.context().close()
}
await browser.close()
console.log('listo:', dir)
