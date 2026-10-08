// Capturas a 390 px de la rutina v5: Hoy con la que toca, la duración y la versión; "Pon al día tu semana"; sesión A;
// sesión B; la corta; y la ficha de triceps-polea. Reloj fijo en el miércoles 7 oct 2026.
// Uso: CAPTURAS_DIR=capturas node scripts/capturas-v5.mjs   (con el servidor de desarrollo corriendo)
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
await page.clock.install({ time: new Date('2026-10-07T19:00:00') })
// instalación nueva de la v5 con historial de 4 semanas: "Pon al día tu semana" con el 7 oct como A
await page.goto(`${base}?seed=1&fresco=1`)
await page.waitForTimeout(1000)
await page.evaluate(() => localStorage.removeItem('gym-app:sesion-activa'))
await page.goto(base)
await page.getByText('Pon al día tu semana').waitFor()
await foto('v5-pon-al-dia')
await page.getByRole('button', { name: 'Listo' }).click()
// Hoy: toca B, duración y versión
await page.getByText(/Hoy toca/).waitFor()
await foto('v5-hoy')
// sesión B
await page.getByRole('button', { name: /^Empezar/ }).click()
await page.getByRole('button', { name: 'Saltar' }).click()
await foto('v5-sesion-b')
await menu('Descartar sesión')
await page.waitForTimeout(600)
// sesión A: semana limpia con Frida el lunes, sin nada más
await page.goto(`${base}?seed=0&frida=hecha`)
await page.waitForTimeout(800)
await page.goto(base)
await page.getByText(/Hoy toca A/).waitFor()
await page.getByRole('button', { name: /^Empezar/ }).click()
await page.getByRole('button', { name: 'Saltar' }).click()
await foto('v5-sesion-a')
await menu('Descartar sesión')
await page.waitForTimeout(600)
// la corta: a las 8:30 pm
await page.clock.setSystemTime(new Date('2026-10-07T20:30:00'))
await page.goto(base)
await page.getByText(/· corta/).waitFor()
await foto('v5-hoy-corta')
await page.getByRole('button', { name: /^Empezar/ }).click()
await page.getByRole('button', { name: 'Saltar' }).click()
await foto('v5-sesion-corta')
await menu('Seguir después')
// ficha de tríceps con cuerda desde Ejercicios
await page.getByRole('button', { name: 'Ejercicios' }).click()
await page.getByRole('button', { name: /Tríceps con cuerda en la polea de pie/ }).click()
await foto('v5-ficha-triceps-polea')
await page.locator('.hoja-fondo.abierta .hoja-cuerpo').evaluate((el) => el.scrollTo(0, 650))
await foto('v5-ficha-triceps-polea-2')
await browser.close()
console.log('listo:', dir)
