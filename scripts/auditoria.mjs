// Auditoría de PULIDO-FM.md (2.3): recorre toda la app en WebKit (el motor de Safari) emulando iPhone SE, 15 y 15 Pro Max,
// con ?seed=1 y vacía (como la primera vez). En cada pantalla revisa errores de consola, scroll horizontal, botones de
// menos de 44 px, campos con letra de menos de 16 px y textos cortados o fuera de la pantalla. Guarda una captura por paso.
// Uso: AUDITORIA_DIR=/ruta node scripts/auditoria.mjs   (con el servidor de desarrollo corriendo)
import { webkit, devices } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const dir = process.env.AUDITORIA_DIR ?? 'capturas/auditoria'
mkdirSync(dir, { recursive: true })
const base = 'http://localhost:5173/FM/'
const TAMANOS = [['se', 375, 667], ['15', 393, 852], ['max', 430, 932]]
const informe = []

/** Corre en la página: lo que se ve mal en la pantalla actual */
function revisar() {
  const W = innerWidth
  const out = []
  if (document.scrollingElement.scrollWidth > W + 1) out.push(`scroll horizontal (${document.scrollingElement.scrollWidth} px)`)
  const visible = (el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && r.right > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0' && !el.closest('.hoja-fondo:not(.abierta)') && !el.closest('.oculto-visual')
  }
  // si hay una hoja abierta, solo cuenta lo que está en ella
  const hoja = document.querySelector('.hoja-fondo.abierta')
  const dentro = (el) => !hoja || hoja.contains(el)
  const nombre = (el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 50)
  for (const el of document.querySelectorAll('button, a, input:not([type=file]), select, textarea, label.secundario, [role=switch]')) {
    if (!visible(el) || !dentro(el)) continue
    const r = el.getBoundingClientRect()
    if (r.height < 43.5 || r.width < 43.5) out.push(`toque chico ${Math.round(r.width)}×${Math.round(r.height)}: ${nombre(el)}`)
    if (r.right > W + 1 || r.left < -1) out.push(`fuera del ancho: ${nombre(el)}`)
    if (el.matches('input, select, textarea') && parseFloat(getComputedStyle(el).fontSize) < 16) out.push(`campo con letra < 16 px: ${nombre(el)}`)
  }
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el) || !dentro(el) || el.closest('.circulo, .pez, svg')) continue
    const cs = getComputedStyle(el)
    const conTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (!conTexto) continue
    const r = el.getBoundingClientRect()
    if (r.right > W + 1 || r.left < -1) out.push(`texto fuera del ancho: ${nombre(el)}`)
    const corta = cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none')
    if (corta && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll' && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + (el.querySelector('button') ? 14 : 2))) out.push(`texto cortado: ${nombre(el)}`)
  }
  // la barra de abajo no tapa botones cuando ya no hay más que bajar
  const barra = document.querySelector('.barra')
  const alFondo = innerHeight + scrollY >= document.scrollingElement.scrollHeight - 1
  if (barra && !hoja && alFondo) {
    const b = barra.getBoundingClientRect()
    for (const el of document.querySelectorAll('.pantalla button')) {
      if (!visible(el) || barra.contains(el)) continue
      const r = el.getBoundingClientRect()
      if (r.bottom > b.top + 1 && r.top < b.bottom && r.bottom <= innerHeight) out.push(`la barra tapa: ${nombre(el)}`)
    }
  }
  return [...new Set(out)]
}

async function recorrido(nombreTam, ancho, alto, modo) {
  const browser = await webkit.launch()
  const ctx = await browser.newContext({ ...devices['iPhone 15'], viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, colorScheme: 'dark' })
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  const errores = []
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message.slice(0, 200)}`))
  page.on('dialog', (d) => d.accept())
  await page.clock.install({ time: new Date('2026-10-07T19:00:00') })
  let n = 0
  const paso = async (nombre) => {
    await page.waitForTimeout(700)
    const problemas = await page.evaluate(revisar)
    const archivo = `${modo}-${nombreTam}-${String(++n).padStart(2, '0')}-${nombre}.png`
    await page.screenshot({ path: `${dir}/${archivo}` })
    informe.push({ modo, tam: nombreTam, paso: nombre, problemas, errores: errores.splice(0) })
  }
  const cerrarHoja = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(500) }
  const alFondo = () => page.locator('.hoja-fondo.abierta .hoja').evaluate((h) => { const c = h.querySelector('.hoja-cuerpo'); if (c) c.scrollTop = c.scrollHeight })
  const menu = async (op) => { await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await page.waitForTimeout(400); await page.locator('.hoja-fondo.abierta').getByText(op, { exact: true }).click() }

  if (modo === 'datos') {
    await page.goto(`${base}?seed=1`)
    await page.waitForTimeout(1200)
    await page.goto(base)
  } else {
    await page.goto(base)
    await page.waitForTimeout(800)
  }
  await page.waitForTimeout(800)
  if (await page.getByText('Pon al día tu semana').isVisible().catch(() => false)) {
    await paso('pon-al-dia')
    await page.getByRole('button', { name: 'Listo' }).click()
  }
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(300)
    if (await page.getByText(/¿Fuiste con Frida el/).isVisible().catch(() => false)) { await paso('pregunta-frida'); await page.getByRole('button', { name: 'Fui con Frida' }).click(); continue }
    if (await page.getByText(/¿Entrenaste el/).isVisible().catch(() => false)) { await paso('pregunta-dia'); await page.getByRole('button', { name: 'No fui' }).click(); continue }
    break
  }
  await page.waitForTimeout(5500) // que se vaya el Deshacer
  await paso('hoy')
  await page.locator('.inicio-texto button.inicio-nota').click(); await paso('hoy-lista'); await cerrarHoja()
  await page.getByRole('button', { name: 'Hoy prefiero…' }).click(); await paso('hoy-prefiero'); await cerrarHoja()
  await page.getByRole('button', { name: 'Registrar sesión' }).click(); await paso('hoy-registrar'); await cerrarHoja()
  const mover = page.getByRole('button', { name: /Frida: .*Mover|sin Frida\. Cambiar/ })
  if (await mover.isVisible().catch(() => false)) { await mover.click(); await paso('hoy-frida'); await cerrarHoja() }
  await page.getByRole('button', { name: 'Ajustes', exact: true }).click(); await paso('ajustes')
  await alFondo()
  await paso('ajustes-abajo'); await cerrarHoja()

  // sesión
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await paso('calentamiento')
  await page.getByRole('button', { name: 'Saltar' }).click()
  await paso('serie-1')
  await page.getByRole('button', { name: 'Técnica' }).click(); await paso('tecnica')
  await alFondo()
  await paso('tecnica-abajo'); await cerrarHoja()
  await page.getByRole('button', { name: 'Peso' }).click().catch(() => {}); await paso('teclado-peso'); await page.keyboard.press('Escape').catch(() => {}); await page.locator('body').click({ position: { x: 5, y: 200 } }).catch(() => {})
  await page.getByRole('button', { name: 'Serie hecha' }).click()
  await page.waitForTimeout(2500)
  await paso('descanso')
  await page.getByRole('button', { name: 'Saltar' }).click()
  await paso('serie-2')
  await menu('Cambiar por alternativa'); await paso('alternativas')
  await page.locator('.hoja-fondo.abierta button').filter({ hasNotText: 'Usar siempre' }).first().click(); await paso('alternativa-elegida')
  await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await paso('menu'); await cerrarHoja()
  await menu('Series de hoy'); await paso('series-hoy'); await cerrarHoja()
  await page.getByRole('button', { name: 'Terminar aquí' }).first().click()
  await paso('cierre')
  await page.getByRole('button', { name: 'Saltar' }).click().catch(() => {})
  await paso('resumen')
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await page.waitForTimeout(600)

  // historial
  await page.getByRole('button', { name: 'Historial', exact: true }).click(); await paso('historial')
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await paso('historial-abajo')
  await page.evaluate(() => scrollTo(0, 0))
  const semana = page.locator('.pantalla .fila').first()
  await semana.click(); await paso('historial-semana')
  const ses = page.locator('.hoja-fondo.abierta .fila').first()
  if (await ses.isVisible().catch(() => false)) { await ses.click(); await paso('historial-sesion'); await cerrarHoja() }
  await cerrarHoja()
  await page.getByRole('button', { name: /^Peso corporal/ }).click(); await paso('peso'); await cerrarHoja()
  await page.getByRole('button', { name: /^Cintura/ }).click(); await paso('cintura'); await cerrarHoja()
  await page.getByRole('button', { name: /^Fotos/ }).click(); await paso('fotos'); await cerrarHoja()
  await page.getByRole('button', { name: 'Registrar sesión' }).click(); await paso('historial-registrar'); await cerrarHoja()
  // ejercicios
  await page.getByRole('button', { name: 'Ejercicios', exact: true }).click(); await paso('ejercicios')
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await paso('ejercicios-abajo')
  await page.evaluate(() => scrollTo(0, 0))
  await page.locator('.pantalla .fila').first().click(); await paso('ficha'); await cerrarHoja()
  await browser.close()
}

for (const modo of (process.env.MODOS ?? 'datos,vacia').split(',')) {
  for (const [nombre, w, h] of TAMANOS.filter((t) => !process.env.TAM || process.env.TAM.split(',').includes(t[0]))) {
    try { await recorrido(nombre, w, h, modo) } catch (e) { informe.push({ modo, tam: nombre, paso: 'FALLÓ EL RECORRIDO', problemas: [e.message.split('\n')[0]], errores: [] }) }
  }
}
writeFileSync(`${dir}/informe.json`, JSON.stringify(informe, null, 1))
for (const r of informe) if (r.problemas.length || r.errores.length) console.log(`${r.modo} ${r.tam} ${r.paso}:\n  ${[...r.problemas, ...r.errores.map((e) => `consola: ${e}`)].join('\n  ')}`)
