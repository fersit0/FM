import { chromium, devices } from 'playwright'
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
const b = await chromium.launch()
const p = await (await b.newContext({ ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage()
p.on('dialog', (d) => d.accept())
const errores = []
p.on('pageerror', (e) => errores.push(String(e)))
p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()) })
await p.goto('http://localhost:5173/FM/?seed=0'); await p.waitForTimeout(700)
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('gym-app:settings', JSON.stringify({ horaSalida: '22:00', migracionRutinaFinal: true })) })
await p.goto('http://localhost:5173/FM/'); await p.waitForTimeout(800)
await p.getByRole('button', { name: /Casa, 12 minutos/ }).click()
await p.waitForTimeout(1500)
await p.screenshot({ path: `${dir}/rutina-casa.png` })
console.log('h1:', await p.locator('h1').first().innerText(), '| errores:', errores.slice(0, 3).join(' || ').slice(0, 600))
await b.close()
