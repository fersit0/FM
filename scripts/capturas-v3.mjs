// Capturas a 390 px de la rutina v3: Hoy con duración, sesión A, sesión B, tarjeta de par y ficha de aperturas-maquina.
// Uso: CAPTURAS_DIR=capturas node scripts/capturas-v3.mjs   (con el servidor de desarrollo corriendo)
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
await page.goto(`${base}?seed=1`)
await page.waitForTimeout(1000)
await page.evaluate(() => localStorage.removeItem('gym-app:sesion-activa'))
// martes a las 7 pm de la semana sembrada, con Frida del lunes ya registrada
await page.clock.setFixedTime(new Date(new Date().setHours(19, 0, 0, 0)))
await page.goto(base)
await foto('v3-hoy')
// la que toque primero (A o B según lo sembrado): bloque 1
const letra = async () => (await page.locator('h1').innerText()).trim().charAt(0).toLowerCase()
const primera = await letra()
await page.getByRole('button', { name: /^Empezar/ }).click()
await page.getByRole('button', { name: 'Saltar' }).click()
await foto(`v3-sesion-${primera}`)
// hasta el primer par
for (let i = 0; i < 5 && !(await page.locator('.sesion-par').isVisible()); i++) { await page.waitForTimeout(600); await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await page.getByText(/^Saltar (ejercicio|el par)$/).click(); await page.waitForTimeout(600) }
await page.locator('.sesion-par').waitFor()
await foto('v3-tarjeta-par')
await page.getByRole('button', { name: 'Serie hecha' }).click()
await foto('v3-cambio-par')
await page.getByRole('button', { name: 'Saltar' }).click()
await foto('v3-tarjeta-par-segundo')
// terminar A y abrir B
await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
await page.getByText('Terminar sesión', { exact: true }).click()
await page.getByRole('button', { name: 'Cerrar' }).click()
await page.waitForTimeout(600)
const segunda = await letra()
await page.getByRole('button', { name: /^Empezar/ }).click()
await page.getByRole('button', { name: 'Saltar' }).click()
await foto(`v3-sesion-${segunda}`)
// ficha de aperturas en máquina desde Ejercicios
await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
await page.getByText('Seguir después', { exact: true }).click()
await page.getByRole('button', { name: 'Ejercicios' }).click()
await page.getByRole('button', { name: /Aperturas en máquina/ }).click()
await foto('v3-ficha-aperturas')
await page.locator('.hoja-fondo.abierta .hoja-cuerpo').evaluate((el) => el.scrollTo(0, 650))
await foto('v3-ficha-aperturas-2')
await browser.close()
console.log('listo:', dir)
