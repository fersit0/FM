// Capturas de la v8 (MANANAS-30.md, 0 y 8). Con `npm run dev` corriendo: node scripts/capturas-v8.mjs [carpeta]
// Fija el reloj en la semana del lunes 23 de noviembre de 2026 y deja cada pantalla en un PNG de 390 px de ancho.
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/FM/'
const DESTINO = process.argv[2] ?? 'capturas-v8'
// CHROMIUM=/ruta/al/chrome usa un navegador ya instalado en vez del que baja Playwright
const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
const anchos = []

/** Página nueva con el reloj fijo y los datos que se pidan (`registro` = "2026-11-23:A,2026-11-24:VISITA") */
async function abrir(fecha, { registro = '', ancho = 390, sinNoFui = false, ajustes = {} } = {}) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark', hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date(fecha) })
  await page.goto(`${BASE}?seed=0${registro ? `&registro=${registro}` : ''}`)
  await page.waitForTimeout(700)
  await page.evaluate(({ sinNoFui, ajustes }) => {
    const s = JSON.parse(localStorage.getItem('gym-app:settings') ?? '{}')
    localStorage.setItem('gym-app:settings', JSON.stringify({ ...s, ...(sinNoFui ? { noFui: [] } : {}), v8Desde: '2026-11-23', ...ajustes }))
  }, { sinNoFui, ajustes })
  await page.goto(BASE)
  await page.waitForTimeout(700)
  return page
}
async function foto(page, nombre) {
  await page.waitForTimeout(350)
  const [contenido, ventana] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
  anchos.push(`${nombre}: ${contenido <= ventana ? 'cabe' : `SE SALE (${contenido} de ${ventana})`}`)
  await page.screenshot({ path: `${DESTINO}/${nombre}.png` })
}

// Hoy, un martes: 7:42 la completa, 7:52 la corta, 8:20 solo regadera
for (const [hora, nombre] of [['07:42', 'hoy-martes-742'], ['07:52', 'hoy-martes-752'], ['08:20', 'hoy-martes-820']]) {
  const page = await abrir(`2026-11-24T${hora}:00`, { registro: '2026-11-23:A' })
  await foto(page, nombre)
  if (nombre === 'hoy-martes-742') { await page.getByRole('button', { name: /ejercicios, unos/ }).click(); await foto(page, 'hoy-lista-b') }
  if (nombre === 'hoy-martes-820') { await page.getByRole('button', { name: 'Ya llegué' }).click(); await page.waitForTimeout(6500); await foto(page, 'hoy-llegaste') }
  await page.context().close()
}
// lo mismo a 375 y 430 de ancho
for (const ancho of [375, 430]) { const page = await abrir('2026-11-24T07:42:00', { registro: '2026-11-23:A', ancho }); await foto(page, `hoy-martes-742-${ancho}`); await page.context().close() }
// un martes sin club: a las 9:30, y el aviso del miércoles
{ const page = await abrir('2026-11-24T09:30:00', { registro: '2026-11-23:A' }); await foto(page, 'hoy-sin-club'); await page.context().close() }
{ const page = await abrir('2026-11-25T07:30:00', { registro: '2026-11-23:A', ajustes: { noFui: ['2026-11-24'] } }); await foto(page, 'hoy-aviso-ayer'); await page.context().close() }
// Tu semana con 2 pesas y 1 visita: A lunes, regadera martes, B miércoles; jueves en la mañana
{ const page = await abrir('2026-11-26T07:30:00', { registro: '2026-11-23:A,2026-11-24:VISITA,2026-11-25:B' }); await foto(page, 'tu-semana-2-pesas-1-visita'); await page.context().close() }
// la pregunta por un día sin registro
{ const page = await abrir('2026-11-26T07:30:00', { registro: '2026-11-23:A', sinNoFui: true }); await foto(page, 'hoy-pregunta'); await page.context().close() }
// ya hecha la del día, y el sábado
{ const page = await abrir('2026-11-24T10:00:00', { registro: '2026-11-23:A,2026-11-24:B' }); await foto(page, 'hoy-hecha'); await page.context().close() }
{ const page = await abrir('2026-11-28T10:00:00', { registro: '2026-11-23:A,2026-11-24:B' }); await foto(page, 'hoy-sabado'); await page.context().close() }
// la sesión B: calentamiento y primera serie
{
  const page = await abrir('2026-11-24T07:35:00', { registro: '2026-11-23:A' })
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await foto(page, 'sesion-b-calentamiento')
  await page.getByRole('button', { name: 'Saltar' }).click()
  await foto(page, 'sesion-b-serie')
  await page.context().close()
}
// Ejercicios e Historial
{
  const page = await abrir('2026-11-26T07:30:00', { registro: '2026-11-23:A,2026-11-24:VISITA,2026-11-25:B' })
  await page.getByRole('button', { name: 'Ejercicios', exact: true }).click(); await foto(page, 'ejercicios')
  await page.getByRole('button', { name: 'Historial', exact: true }).click(); await foto(page, 'historial')
  await page.context().close()
}
await navegador.close()
console.log(anchos.join('\n'))
