// Capturas a 390 px de la rutina v6 (RUTINA-FINAL.md, 0): Hoy en un día de club, Hoy en un día de Frida,
// "Pon al día tu semana", sesión A, sesión B, sesión C y la versión corta. Reloj fijo en la semana del 5 oct 2026.
// Uso: CAPTURAS_DIR=capturas node scripts/capturas-v6.mjs   (con el servidor de desarrollo corriendo)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
mkdirSync(dir, { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('dialog', (d) => d.accept())
await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'html { --safe-top: 47px !important; --safe-bottom: 34px !important }'; document.head.appendChild(st) }) })
const foto = async (n) => { await page.waitForTimeout(5200); await page.screenshot({ path: `${dir}/${n}.png` }) }
const base = 'http://localhost:5173/FM/'
const menu = async (op) => { await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await page.getByText(op, { exact: true }).click() }
const empezar = async () => { await page.getByRole('button', { name: /^Empezar/ }).click(); await page.getByRole('button', { name: 'Saltar' }).click({ force: true }) }
await page.clock.install({ time: new Date('2026-10-07T19:00:00') })

// instalación nueva de la v6 con historial de 4 semanas: "Pon al día tu semana" con el 7 oct como A y el lunes como Frida
await page.goto(`${base}?seed=1&fresco=1`)
await page.waitForTimeout(1000)
await page.evaluate(() => localStorage.removeItem('gym-app:sesion-activa'))
await page.goto(base)
await page.getByText('Pon al día tu semana').waitFor()
await foto('v6-pon-al-dia')
await page.getByRole('button', { name: 'Listo' }).click()
// Hoy en un día de club: jueves 8 con Frida el lunes y la A del miércoles 7 → toca B
await page.clock.setSystemTime(new Date('2026-10-08T19:00:00'))
await page.goto(base)
await page.getByText(/Hoy toca B/).waitFor()
await foto('v6-hoy-club')
// sesión B
await empezar()
await foto('v6-sesion-b')
await menu('Descartar sesión')
await page.waitForTimeout(600)
// Hoy en un día de Frida: lunes 12
await page.clock.setSystemTime(new Date('2026-10-12T10:00:00'))
await page.goto(base)
for (let i = 0; i < 4; i++) { await page.waitForTimeout(300); if (await page.getByText(/¿Entrenaste el/).isVisible().catch(() => false)) await page.getByRole('button', { name: 'No fui' }).click() }
await page.getByText('Hoy vas con Frida').waitFor()
await foto('v6-hoy-frida')
// sesión A: semana limpia con Frida el lunes, miércoles 7
await page.clock.setSystemTime(new Date('2026-10-07T19:00:00'))
await page.goto(`${base}?seed=0&frida=hecha`)
await page.waitForTimeout(800)
await page.goto(base)
await page.getByText(/Hoy toca A/).waitFor()
await empezar()
await foto('v6-sesion-a')
await menu('Descartar sesión')
await page.waitForTimeout(600)
// sesión C: semana sin Frida
await page.goto(`${base}?seed=0&frida=no`)
await page.waitForTimeout(800)
await page.goto(base)
await page.getByText(/Hoy toca C/).waitFor()
await empezar()
await foto('v6-sesion-c')
await menu('Descartar sesión')
await page.waitForTimeout(600)
// la corta: a las 8:30 pm
await page.clock.setSystemTime(new Date('2026-10-07T20:30:00'))
await page.goto(base)
await page.getByText(/· corta/).waitFor()
await foto('v6-hoy-corta')
await empezar()
await foto('v6-sesion-corta')
await menu('Descartar sesión')
await browser.close()
console.log('listo:', dir)
