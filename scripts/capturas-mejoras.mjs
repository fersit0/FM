// Capturas a 390 px de las mejoras: peso por serie en lb, alternativa elegida (tarjeta y ficha) y una ficha nueva.
// Uso: CAPTURAS_DIR=capturas node scripts/capturas-mejoras.mjs   (con el servidor de desarrollo corriendo)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const dir = process.env.CAPTURAS_DIR ?? 'capturas'
mkdirSync(dir, { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('dialog', (d) => d.accept())
// áreas seguras del iPhone 14 instalado
await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'html { --safe-top: 47px !important; --safe-bottom: 34px !important }'; document.head.appendChild(st) }) })
// se esperan 5 s para que no salga el aviso de Deshacer en la captura
const foto = async (n) => { await page.waitForTimeout(5200); await page.screenshot({ path: `${dir}/${n}.png` }) }
await page.goto('http://localhost:5173/FM/?seed=0')
await page.waitForTimeout(800)
await page.evaluate(() => localStorage.clear())
await page.goto('http://localhost:5173/FM/')
await page.getByRole('button', { name: /^Empezar/ }).click()
await page.getByRole('button', { name: 'Saltar' }).click()
// serie 1 en 30 lb, sube a 35 y la hace; serie 2 arranca en 35
await page.getByRole('button', { name: /^Más 5 lb/ }).click()
await page.getByRole('button', { name: 'Serie hecha' }).click()
await page.getByRole('button', { name: 'Saltar' }).click()
await page.getByRole('button', { name: /^Más 5 lb/ }).click()
await foto('mejoras-serie-2-lb')
// escribir el exacto con el teclado
await page.locator('.circulo-cifra button').first().click()
await page.locator('.cifra-input').fill('37.5')
await foto('mejoras-serie-escribiendo-peso')
await page.locator('.cifra-input').press('Enter')
await page.getByRole('button', { name: 'Serie hecha' }).click()
await page.getByRole('button', { name: 'Saltar' }).click()
await page.locator('.sesion-aviso').getByRole('button', { name: 'Editar' }).click()
await foto('mejoras-series-de-hoy-editar')
await page.keyboard.press('Escape')
await page.waitForTimeout(500)
// alternativa: jalón → dominadas asistidas
await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
await page.getByText('Saltar ejercicio', { exact: true }).click()
await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
await page.getByText('Cambiar por alternativa', { exact: true }).click()
await page.locator('.hoja-fondo.abierta').getByRole('button', { name: 'Dominadas asistidas en máquina o con liga' }).click()
await foto('mejoras-alternativa-tarjeta')
await page.getByRole('button', { name: 'Técnica', exact: true }).click()
await foto('mejoras-alternativa-ficha')
await page.keyboard.press('Escape')
await page.waitForTimeout(500)
// ficha nueva desde Ejercicios: remo con pecho apoyado
await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
await page.getByText('Seguir después', { exact: true }).click()
await page.getByRole('button', { name: 'Ejercicios' }).click()
await page.getByRole('button', { name: /Remo con pecho apoyado/ }).click()
await foto('mejoras-ficha-remo-pecho-apoyado')
await page.locator('.hoja-fondo.abierta .hoja-cuerpo').evaluate((el) => el.scrollTo(0, 700))
await foto('mejoras-ficha-remo-pecho-apoyado-2')
await browser.close()
console.log('listo:', dir)
