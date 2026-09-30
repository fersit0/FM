import { chromium, devices } from 'playwright'
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
const b = await chromium.launch()
const p = await (await b.newContext({ ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage()
const foto = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: `${dir}/${n}.png` }) }
await p.goto('http://localhost:5173/FM/?seed=1'); await p.waitForTimeout(900); await p.evaluate(() => localStorage.removeItem('gym-app:sesion-activa')); await p.goto('http://localhost:5173/FM/')
await p.locator('.barra').getByRole('button', { name: 'Ejercicios' }).click(); await p.waitForTimeout(400)
await p.getByRole('button', { name: /Press plano con mancuernas/ }).click(); await foto('rutina-ficha-mancuerna')
await p.locator('.hoja-fondo.abierta .hoja-cuerpo').evaluate((el) => el.scrollBy(0, 700)); await foto('rutina-ficha-mancuerna-2')
await p.locator('.hoja-fondo.abierta').getByText('Cerrar').click(); await p.waitForTimeout(500)
await p.getByRole('button', { name: /Jalón al pecho/ }).click(); await foto('rutina-ficha-maquina')
await p.locator('.hoja-fondo.abierta .hoja-cuerpo').evaluate((el) => el.scrollBy(0, 1400)); await foto('rutina-ficha-maquina-2')
await b.close(); console.log('listo')
