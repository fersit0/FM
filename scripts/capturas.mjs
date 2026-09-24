// Capturas a 390×844 con Playwright. Uso: node scripts/capturas.mjs [ruta] [nombre]
// Ejemplos: node scripts/capturas.mjs '#diseno' diseno   |   node scripts/capturas.mjs '' hoy
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'

const ruta = process.argv[2] ?? '#diseno'
const nombre = process.argv[3] ?? 'captura'
const temps = (process.argv[4] ?? 'reposo,calentamiento,trabajo,fuerte,ultima,descanso,listo').split(',')
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
mkdirSync(dir, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark' })
const page = await ctx.newPage()
await page.goto(`http://localhost:5173/gym-app/${ruta}`)
await page.waitForTimeout(800)
for (const t of temps) {
  await page.evaluate((t) => { document.body.dataset.temp = t }, t)
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${dir}/${nombre}-${t}.png` })
}
await page.evaluate(() => { document.body.dataset.temp = 'fuerte' })
await page.waitForTimeout(800)
await page.screenshot({ path: `${dir}/${nombre}-completa.png`, fullPage: true })
await browser.close()
console.log('listo:', dir)
