// Capturas a 390 px para revisar la rutina final: Hoy, sesión A, sesión B, CASA y dos fichas.
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
mkdirSync(dir, { recursive: true })
const b = await chromium.launch()
const p = await (await b.newContext({ ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage()
p.on('dialog', (d) => d.accept())
const foto = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: `${dir}/${n}.png` }) }
const base = 'http://localhost:5173/FM/'
await p.goto(base + '?seed=1'); await p.waitForTimeout(900); await p.evaluate(() => localStorage.removeItem('gym-app:sesion-activa'))
await p.goto(base); await foto('rutina-hoy')
// sesión B (la que toca con el seed)
await p.getByRole('button', { name: /^Empezar/ }).click(); await p.getByRole('button', { name: 'Saltar' }).click(); await foto('rutina-sesion-B')
await p.getByRole('button', { name: 'Opciones de la sesión' }).click(); await p.getByText('Descartar sesión', { exact: true }).click(); await p.waitForTimeout(600)
// una B registrada hoy para que toque A
await p.locator('.barra').getByRole('button', { name: 'Historial' }).click(); await p.getByRole('button', { name: /Fui este día/ }).click(); await p.getByLabel('Qué hice').selectOption('B'); await p.getByRole('button', { name: 'Guardar' }).click()
await p.locator('.barra').getByRole('button', { name: 'Hoy' }).click(); await p.getByRole('button', { name: /^Empezar/ }).click(); await p.getByRole('button', { name: 'Saltar' }).click(); await foto('rutina-sesion-A')
await p.getByRole('button', { name: 'Opciones de la sesión' }).click(); await p.getByText('Descartar sesión', { exact: true }).click(); await p.waitForTimeout(600)
// CASA: se ofrece cuando ya no alcanza el gym; forzar con la hora
await p.clock.setFixedTime(new Date('2026-09-30T21:00:00')); await p.goto(base); await p.waitForTimeout(600)
await p.getByRole('button', { name: /Casa, 12 minutos/ }).click(); await foto('rutina-casa')
await p.getByRole('button', { name: 'Opciones de la sesión' }).click(); await p.getByText('Descartar sesión', { exact: true }).click(); await p.waitForTimeout(600)
// fichas
await p.locator('.barra').getByRole('button', { name: 'Ejercicios' }).click(); await p.waitForTimeout(400)
await p.getByRole('button', { name: /Press plano con mancuernas/ }).click(); await foto('rutina-ficha-mancuerna')
await p.getByText('Cerrar').click(); await p.waitForTimeout(400)
await p.getByRole('button', { name: /Jalón al pecho/ }).click(); await foto('rutina-ficha-maquina')
await p.mouse.wheel(0, 900); await foto('rutina-ficha-maquina-2')
await b.close(); console.log('listo')
