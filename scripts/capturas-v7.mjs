// Capturas a 390 px de la rutina v7 (RUTINA-FINAL.md, 0), en WebKit (el motor de Safari): Hoy martes 6:45 am, Hoy
// martes 8:30 am sin nada registrado, Hoy lunes en la noche al tocar "Fui con Frida", Tu semana con Frida pierna, Hoy
// jueves 9:30 pm con el aviso del viernes y la sesión A sin pierna. Semana del lunes 5 de octubre de 2026.
// Uso: CAPTURAS_DIR=capturas node scripts/capturas-v7.mjs   (con el servidor de desarrollo corriendo)
import { webkit, devices } from 'playwright'
import { mkdirSync } from 'node:fs'
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
mkdirSync(dir, { recursive: true })
const base = 'http://localhost:5173/FM/'
const browser = await webkit.launch()
const ctx = await browser.newContext({ ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark' })
const page = await ctx.newPage()
const errores = []
page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()) })
page.on('pageerror', (e) => errores.push(e.message))
page.on('dialog', (d) => d.accept())
await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'html { --safe-top: 47px !important; --safe-bottom: 34px !important }'; document.head.appendChild(st) }) })
// espera a que se vaya el Deshacer (5 s) para que no tape nada
const foto = async (n) => { await page.waitForTimeout(5300); await page.screenshot({ path: `${dir}/${n}.png` }) }
let reloj = false
/** Deja la semana como se pide, con el reloj en esa hora: `params` son los de ?seed=0 (frida, registro) */
async function escena(hora, params = '') {
  if (reloj) await page.clock.setSystemTime(new Date(hora))
  else { await page.clock.install({ time: new Date(hora) }); reloj = true }
  await page.goto(`${base}?seed=0${params}`)
  await page.waitForTimeout(900)
  await page.goto(base)
  await page.waitForTimeout(900)
}

// Hoy martes 6:45 am: Frida torso el lunes en la noche; toca A, completa
await escena('2026-10-06T06:45:00', '&frida=torso')
await page.getByText(/Hoy toca A/).waitFor()
await foto('v7-hoy-martes-645')
// Hoy martes 8:30 am sin nada registrado: "¿Vas en la noche?"
await escena('2026-10-06T08:30:00', '&frida=torso')
await page.getByText('No fuiste en la mañana').waitFor()
await foto('v7-hoy-martes-830')
// Hoy lunes en la noche al tocar "Fui con Frida": Pierna o Torso
await escena('2026-10-05T20:30:00')
await page.getByRole('button', { name: 'Fui con Frida' }).click()
await page.getByRole('button', { name: 'Pierna', exact: true }).waitFor()
await foto('v7-hoy-lunes-frida')
// Tu semana con Frida pierna: martes 6:45 am, la A sale sin pierna
await escena('2026-10-06T06:45:00', '&frida=pierna')
await page.getByText(/Hoy toca A sin pierna/).waitFor()
await foto('v7-tu-semana-frida-pierna')
// la sesión A sin pierna
await page.getByRole('button', { name: /^Empezar/ }).click()
await page.getByRole('button', { name: 'Saltar' }).click({ force: true })
await page.getByText(/Serie 1 de/).waitFor()
await foto('v7-sesion-a-sin-pierna')
// Hoy jueves 9:30 pm con el aviso del viernes: Frida torso el lunes y A el martes, van 2 de 3
await escena('2026-10-08T21:30:00', '&frida=torso&registro=2026-10-06:A')
await page.getByText(/Prende tus alarmas de Pesas extra/).waitFor()
await foto('v7-hoy-jueves-930')
await browser.close()
if (errores.length) { console.log('errores de consola:\n' + errores.join('\n')); process.exitCode = 1 }
console.log('listo:', dir)
