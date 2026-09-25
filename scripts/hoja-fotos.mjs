// Hoja de contacto de las fotos base para revisarlas una por una. Uso: node scripts/hoja-fotos.mjs
import { chromium } from 'playwright'
import { readdirSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
mkdirSync(dir, { recursive: true })
const fotos = readdirSync('public/fotos').filter((f) => f.endsWith('-2.jpg')).sort()
const porHoja = 8
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
for (let i = 0; i < fotos.length; i += porHoja) {
  const grupo = fotos.slice(i, i + porHoja)
  const html = `<html><body style="margin:0;background:#fff;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px;font-family:sans-serif">${grupo.map((f) => `<figure style="margin:0"><img src="data:image/jpeg;base64,${readFileSync(resolve('public/fotos', f)).toString('base64')}" style="width:100%;aspect-ratio:3/2;object-fit:cover"><figcaption style="font-size:14px">${f.replace('.jpg', '')}</figcaption></figure>`).join('')}</body></html>`
  await page.setContent(html)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${dir}/fotos-${i / porHoja + 1}.png`, fullPage: true })
}
await browser.close()
console.log('hojas:', Math.ceil(fotos.length / porHoja))
