// Revisión de pantallas de la v7 (RUTINA-FINAL.md, 14 y 15): Hoy en cada caso de la semana, Tu semana, Registrar y la
// sesión, a 375, 390, 393 y 430 px de ancho, en WebKit (el motor de Safari), como app instalada (pantalla completa con áreas
// seguras) y dentro de Safari (alto recortado por sus barras). En cada paso revisa scroll de lado, textos cortados o
// fuera del ancho, botones de menos de 44 px, campos de menos de 16 px, que el botón principal se vea completo y que la
// tira de Tu semana quepa. Guarda una captura por paso y un informe.json. Semana del lunes 5 de octubre de 2026.
// Uso: REVISION_DIR=/ruta node scripts/revision-v7.mjs   (con el servidor de desarrollo corriendo)
//      TAM=375,390 MODOS=instalada node scripts/revision-v7.mjs   para correr solo una parte
import { webkit, devices } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const dir = process.env.REVISION_DIR ?? 'capturas/revision-v7'
mkdirSync(dir, { recursive: true })
const base = 'http://localhost:5173/FM/'
// ancho, alto como app instalada, áreas seguras, alto dentro de Safari
// 393 es el iPhone 16 de Fer
const TAMANOS = [['375', 375, 667, 20, 0, 553], ['390', 390, 844, 47, 34, 664], ['393', 393, 852, 59, 34, 672], ['430', 430, 932, 59, 34, 752]]
const informe = []

/** Corre en la página: lo que se ve mal en la pantalla actual */
function revisar() {
  const W = innerWidth
  const out = []
  if (document.scrollingElement.scrollWidth > W + 1) out.push(`scroll de lado (${document.scrollingElement.scrollWidth} px)`)
  for (const el of document.querySelectorAll('.pantalla, .hoja-fondo.abierta .hoja-cuerpo')) if (el.scrollWidth > el.clientWidth + 1 && !['hidden', 'clip'].includes(getComputedStyle(el).overflowX)) out.push(`scroll de lado en ${el.className} (${el.scrollWidth} de ${el.clientWidth})`)
  const visible = (el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0' && !el.closest('.hoja-fondo:not(.abierta)') && !el.closest('.oculto-visual')
  }
  const hoja = document.querySelector('.hoja-fondo.abierta')
  const dentro = (el) => !hoja || hoja.contains(el)
  const nombre = (el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 50)
  for (const el of document.querySelectorAll('button, a, input:not([type=file]), select, textarea, label.secundario, [role=switch]')) {
    if (!visible(el) || !dentro(el)) continue
    const r = el.getBoundingClientRect()
    // fuera de la pantalla a propósito y sin foco: el interruptor escondido de la vibración en iOS
    if (el.tabIndex === -1 && (r.right <= 0 || r.left >= W)) continue
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
  // el botón principal completo y visible, sin nada encima (en la hoja abierta, el de la hoja)
  for (const el of document.querySelectorAll('.boton')) {
    if (!visible(el) || !dentro(el)) continue
    const r = el.getBoundingClientRect()
    const texto = nombre(el)
    if (r.top < -1 || r.bottom > innerHeight + 1) out.push(`botón "${texto}" fuera de la pantalla (${Math.round(r.top)}–${Math.round(r.bottom)} de ${innerHeight})`)
    else {
      const sobre = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2)
      if (!sobre || (sobre !== el && !el.contains(sobre))) out.push(`botón "${texto}" tapado por ${sobre ? sobre.className || sobre.tagName : 'nada'}`)
    }
    if (el.scrollWidth > el.clientWidth + 1) out.push(`botón "${texto}" con el texto cortado`)
  }
  // el aviso de Deshacer ocupa su lugar: nada (botón, campo o texto) se cruza con él
  // (con una hoja abierta solo cuenta lo de la hoja; y de lo que está en una lista que se recorre, solo la parte que se ve)
  const recorte = (el) => {
    let r = el.getBoundingClientRect(); let { left, top, right, bottom } = r
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p)
      if (cs.overflowY === 'visible' && cs.overflowX === 'visible') continue
      const q = p.getBoundingClientRect(); left = Math.max(left, q.left); top = Math.max(top, q.top); right = Math.min(right, q.right); bottom = Math.min(bottom, q.bottom)
    }
    return { left, top, right, bottom }
  }
  const aviso = [...document.querySelectorAll('.deshacer')].find(visible)
  if (aviso) {
    const a = aviso.getBoundingClientRect()
    for (const el of document.querySelectorAll('button, input, select, textarea, h1, h2, p, .tira, .fila')) {
      if (!visible(el) || !dentro(el) || aviso.contains(el) || el.contains(aviso)) continue
      const r = recorte(el)
      if (r.bottom <= r.top || r.right <= r.left) continue
      if (r.left < a.right - 1 && a.left < r.right - 1 && r.top < a.bottom - 1 && a.top < r.bottom - 1) out.push(`el aviso de Deshacer tapa: ${nombre(el)}`)
    }
  }
  // la sesión no recorre: lo que no cabe quedaría cortado abajo
  const ses = document.querySelector('.sesion')
  if (ses && ses.scrollHeight > ses.clientHeight + 1) out.push(`la sesión no cabe (${ses.scrollHeight} de ${ses.clientHeight})`)
  // en Hoy, ningún renglón de texto encima del círculo rojo
  const circulo = document.querySelector('.pantalla.inicio > .circulo')
  const textoHoy = document.querySelector('.inicio-texto')
  if (circulo && textoHoy && !hoja) {
    const c = circulo.getBoundingClientRect()
    const cx = (c.left + c.right) / 2, cy = (c.top + c.bottom) / 2, r = c.width / 2
    const caminar = document.createTreeWalker(textoHoy, NodeFilter.SHOW_TEXT)
    for (let n = caminar.nextNode(); n; n = caminar.nextNode()) {
      if (!n.textContent.trim()) continue
      const rg = document.createRange(); rg.selectNodeContents(n)
      for (const b of rg.getClientRects()) {
        const x = Math.max(b.left, Math.min(cx, b.right)), y = Math.max(b.top, Math.min(cy, b.bottom))
        if (Math.hypot(x - cx, y - cy) < r - 1) { out.push(`texto encima del círculo: ${n.textContent.trim().slice(0, 40)}`); break }
      }
    }
  }
  // Tu semana: los siete días completos dentro del ancho
  const tira = document.querySelector('.tira')
  if (tira && visible(tira)) {
    const dias = [...tira.querySelectorAll('.tira-dia')]
    if (dias.length !== 7) out.push(`Tu semana con ${dias.length} días`)
    for (const d of dias) { const r = d.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1) out.push(`Tu semana: un día fuera del ancho (${Math.round(r.left)}–${Math.round(r.right)})`) }
    for (const m of tira.querySelectorAll('.tira-marca')) { const r = m.getBoundingClientRect(); const p = m.parentElement.getBoundingClientRect(); if (r.left < p.left - 1 || r.right > p.right + 1) out.push('Tu semana: un círculo se sale de su día') }
  }
  return [...new Set(out)]
}

async function recorrido(tam, ancho, altoInstalada, top, bottom, altoSafari, modo) {
  const instalada = modo === 'instalada'
  const browser = await webkit.launch()
  const ctx = await browser.newContext({ ...devices['iPhone 15'], viewport: { width: ancho, height: instalada ? altoInstalada : altoSafari }, deviceScaleFactor: 2, colorScheme: 'dark' })
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  const errores = []
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message.slice(0, 200)}`))
  page.on('dialog', (d) => d.accept())
  // env(safe-area-inset-*) no existe fuera del iPhone: como app instalada se simulan sus áreas seguras
  if (instalada) await page.addInitScript(({ top, bottom }) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = `html { --safe-top: ${top}px !important; --safe-bottom: ${bottom}px !important }`; document.head.appendChild(st) }) }, { top, bottom })
  let n = 0
  let reloj = false
  const paso = async (nombre) => {
    await page.waitForTimeout(600)
    const problemas = await page.evaluate(revisar)
    const archivo = `${modo}-${tam}-${String(++n).padStart(2, '0')}-${nombre}.png`
    await page.screenshot({ path: `${dir}/${archivo}` })
    informe.push({ modo, tam, paso: nombre, archivo, problemas, errores: errores.splice(0) })
  }
  const cerrarHoja = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(450) }
  const hoja = () => page.locator('.hoja-fondo.abierta')
  /** Deja la semana como se pide, con el reloj en esa hora: `params` son los de ?seed=0 (frida, registro, fresco) */
  async function escena(hora, params = '') {
    if (reloj) await page.clock.setSystemTime(new Date(hora))
    else { await page.clock.install({ time: new Date(hora) }); reloj = true }
    await page.goto(`${base}?seed=0`)
    await page.waitForTimeout(500)
    await page.evaluate(() => { localStorage.clear() })
    await page.goto(`${base}?seed=0${params}`)
    await page.waitForTimeout(700)
    await page.goto(base)
    await page.waitForTimeout(700)
  }
  const intenta = async (nombre, f) => { try { await f() } catch (e) { informe.push({ modo, tam, paso: `FALLÓ: ${nombre}`, problemas: [e.message.split('\n')[0]], errores: errores.splice(0) }) } }

  // Hoy, un caso por cada día de la tabla de la sección 2
  await intenta('lunes-manana', async () => { await escena('2026-10-05T07:00:00'); await page.getByText(/cardio tranqui/).first().waitFor(); await paso('hoy-lunes-cardio') })
  await intenta('lunes-noche', async () => {
    await escena('2026-10-05T20:30:00'); await page.getByRole('button', { name: 'Fui con Frida' }).waitFor(); await paso('hoy-lunes-frida')
    await page.getByRole('button', { name: 'Fui con Frida' }).click(); await page.getByRole('button', { name: 'Pierna', exact: true }).waitFor(); await paso('hoy-lunes-frida-pierna-o-torso')
    await hoja().getByRole('button', { name: 'Pierna', exact: true }).click(); await paso('hoy-lunes-frida-registrada')
  })
  await intenta('martes-pregunta-frida', async () => { await escena('2026-10-06T06:45:00', '&frida=ninguna'); await page.getByText(/¿Fuiste con Frida el/).waitFor(); await paso('hoy-pregunta-frida') })
  await intenta('martes-645', async () => {
    await escena('2026-10-06T06:45:00', '&frida=torso'); await page.locator('h1', { hasText: /^A: / }).waitFor(); await paso('hoy-martes-645')
    await page.locator('.inicio-texto button.inicio-nota').click(); await paso('hoy-lista'); await cerrarHoja()
    await page.getByRole('button', { name: 'Hoy prefiero…' }).click(); await paso('hoy-prefiero'); await cerrarHoja()
    await page.getByRole('button', { name: 'Registrar sesión' }).click(); await paso('registrar-hoy')
    await hoja().getByLabel('Qué hice').selectOption('FRIDA:torso'); await paso('registrar-frida-con-nota')
    await hoja().getByLabel('Fecha').fill('2026-10-05'); await hoja().getByRole('button', { name: 'Guardar' }).click(); await paso('registrar-ya-tiene'); await cerrarHoja()
    // un día que ya pasó en Tu semana abre registrar en ese día
    await page.locator('.tira button.tira-dia').first().click(); await paso('registrar-desde-tu-semana'); await cerrarHoja()
  })
  await intenta('martes-pierna-sesion', async () => {
    await escena('2026-10-06T06:45:00', '&frida=pierna'); await page.locator('h1', { hasText: 'A: Pecho y espalda' }).waitFor(); await paso('hoy-a-sin-pierna')
    await page.getByRole('button', { name: /^Empezar/ }).click(); await page.locator('h1', { hasText: 'Calentamiento' }).waitFor(); await paso('sesion-calentamiento')
    await page.getByRole('button', { name: 'Saltar' }).click(); await page.getByText(/Serie 1 de/).waitFor(); await paso('sesion-serie-1')
    await page.getByRole('button', { name: 'Serie hecha' }).click(); await page.locator('h1', { hasText: /^Descanso$/ }).waitFor(); await paso('sesion-descanso')
    await page.getByRole('button', { name: 'Saltar' }).click(); await page.getByText(/Serie 2 de/).waitFor(); await paso('sesion-serie-2')
    // al remo con pecho apoyado (el tercero)
    for (let i = 0; i < 2; i++) { await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await page.waitForTimeout(350); await hoja().getByText('Saltar ejercicio', { exact: true }).click(); await page.waitForTimeout(500) }
    await page.locator('.sesion-titulo-fila h1', { hasText: 'Remo con pecho apoyado' }).waitFor(); await paso('sesion-remo-pecho-apoyado')
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await page.waitForTimeout(350); await paso('sesion-menu')
    await hoja().getByText('Cambiar por alternativa', { exact: true }).click(); await page.waitForTimeout(400); await paso('sesion-alternativas')
    await hoja().getByRole('button', { name: /Remo a una mano/ }).first().click(); await page.locator('.sesion-titulo-fila h1', { hasText: 'Remo a una mano' }).waitFor(); await paso('sesion-alternativa-larga')
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await page.waitForTimeout(350); await hoja().getByText('Terminar aquí', { exact: true }).click(); await page.waitForTimeout(800); await paso('sesion-final-manana')
  })
  await intenta('martes-745', async () => {
    await escena('2026-10-06T07:45:00', '&frida=torso'); await page.locator('h1', { hasText: /^A: / }).waitFor(); await paso('hoy-martes-745-corta')
    await page.getByRole('button', { name: /^Empezar/ }).click(); await page.getByRole('button', { name: 'Saltar' }).click(); await page.getByText(/Serie 1 de/).waitFor(); await paso('sesion-corta-sauna-y-bano')
  })
  await intenta('martes-830', async () => {
    await escena('2026-10-06T08:30:00', '&frida=torso'); await page.getByText('No fuiste en la mañana').waitFor(); await paso('hoy-martes-830')
    await page.getByRole('button', { name: 'Ya fui' }).click(); await paso('registrar-ya-fui'); await cerrarHoja()
    await page.getByRole('button', { name: 'Voy en la noche' }).click(); await paso('hoy-voy-en-la-noche')
  })
  await intenta('martes-hoy-no', async () => {
    await escena('2026-10-06T08:30:00', '&frida=torso'); await page.getByRole('button', { name: 'Hoy no' }).click(); await paso('hoy-martes-hoy-no')
  })
  await intenta('martes-hecha', async () => { await escena('2026-10-06T10:00:00', '&frida=torso&registro=2026-10-06:A'); await page.getByText(/A hecha/).first().waitFor(); await paso('hoy-martes-a-hecha') })
  await intenta('lunes-sin-tiempo', async () => {
    await escena('2026-10-05T08:00:00'); await page.getByRole('button', { name: /^Empezar .* igual/ }).click(); await page.getByText('Ya no alcanza en la mañana').first().waitFor(); await paso('hoy-lunes-ya-no-alcanza')
  })
  await intenta('martes-noche', async () => {
    await escena('2026-10-06T20:20:00', '&frida=torso'); await page.getByText('No fuiste en la mañana').waitFor(); await paso('hoy-martes-2020-pregunta')
    await page.getByRole('button', { name: 'Voy en la noche' }).click(); await paso('hoy-martes-2020')
    await page.getByRole('button', { name: /^Empezar/ }).click(); await page.getByRole('button', { name: 'Saltar' }).click(); await page.getByText(/Serie 1 de/).waitFor(); await paso('sesion-noche')
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click(); await page.waitForTimeout(350); await hoja().getByText('Terminar aquí', { exact: true }).click(); await page.waitForTimeout(800); await paso('sesion-cierre-noche')
  })
  await intenta('miercoles', async () => { await escena('2026-10-07T19:00:00', '&frida=torso&registro=2026-10-06:A'); await page.getByText(/Hoy descanso/).waitFor(); await paso('hoy-miercoles-descanso') })
  await intenta('preguntas-seguidas', async () => {
    await escena('2026-10-09T07:00:00', '&frida=torso')
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('gym-app:settings')); s.noFui = []; localStorage.setItem('gym-app:settings', JSON.stringify(s)) })
    await page.goto(base); await page.getByText(/¿Entrenaste el martes/).waitFor()
    await page.getByRole('button', { name: 'No fui' }).click(); await page.getByText(/¿Entrenaste el jueves/).waitFor(); await paso('hoy-pregunta-con-aviso')
  })
  await intenta('miercoles-pregunta', async () => {
    await escena('2026-10-07T07:30:00', '&frida=torso')
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('gym-app:settings')); s.noFui = []; localStorage.setItem('gym-app:settings', JSON.stringify(s)) })
    await page.goto(base); await page.getByText(/¿Entrenaste el/).waitFor(); await paso('hoy-pregunta-dia')
  })
  await intenta('jueves-930', async () => { await escena('2026-10-08T21:30:00', '&frida=torso&registro=2026-10-06:A'); await page.getByText(/Prende tus alarmas de Pesas extra/).waitFor(); await paso('hoy-jueves-930-aviso') })
  await intenta('viernes-completa', async () => { await escena('2026-10-09T07:00:00', '&frida=torso&registro=2026-10-06:A,2026-10-08:B'); await page.getByText(/Semana completa/).first().waitFor(); await paso('hoy-viernes-completa') })
  await intenta('sabado', async () => { await escena('2026-10-10T11:00:00', '&frida=torso&registro=2026-10-06:A'); await page.getByText(/Sábado libre/).waitFor(); await paso('hoy-sabado') })
  await intenta('domingo', async () => { await escena('2026-10-11T11:00:00', '&frida=pierna&registro=2026-10-06:A'); await page.locator('.inicio-texto h1').waitFor(); await paso('hoy-domingo-rescate') })
  await intenta('pon-al-dia', async () => { await escena('2026-10-08T07:00:00', '&fresco=1'); await page.getByText('Pon al día tu semana').waitFor(); await paso('pon-al-dia') })
  // Historial: registrar y cambiar el tipo de Frida
  await intenta('historial', async () => {
    await escena('2026-10-08T07:00:00', '&frida=pierna&registro=2026-10-06:A')
    await page.getByRole('button', { name: 'Historial', exact: true }).click(); await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'Registrar sesión' }).click(); await paso('historial-registrar'); await cerrarHoja()
    await page.locator('.pantalla .fila').first().click(); await page.waitForTimeout(400); await paso('historial-semana')
    const frida = hoja().getByRole('button', { name: /Frida/ }).first()
    if (await frida.isVisible().catch(() => false)) { await frida.click(); await page.waitForTimeout(400); await paso('historial-frida') }
  })
  await browser.close()
}

for (const modo of (process.env.MODOS ?? 'instalada,safari').split(',')) {
  for (const t of TAMANOS.filter((t) => !process.env.TAM || process.env.TAM.split(',').includes(t[0]))) {
    try { await recorrido(...t, modo) } catch (e) { informe.push({ modo, tam: t[0], paso: 'FALLÓ EL RECORRIDO', problemas: [e.message.split('\n')[0]], errores: [] }) }
  }
}
writeFileSync(`${dir}/informe.json`, JSON.stringify(informe, null, 1))
let malos = 0
for (const r of informe) if (r.problemas.length || r.errores.length) { malos++; console.log(`${r.modo} ${r.tam} ${r.paso}:\n  ${[...r.problemas, ...r.errores.map((e) => `consola: ${e}`)].join('\n  ')}`) }
console.log(`${informe.length} pasos, ${malos} con problemas. Capturas en ${dir}`)
