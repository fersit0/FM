// Ninguna pantalla se encima ni se corta y el botón principal siempre está completo y visible sin scroll,
// en cuatro iPhones, en Safari (viewport recortado por sus barras) y como app instalada (pantalla completa con
// áreas seguras arriba y abajo), con el nombre más largo, una alternativa elegida y la foto grande.
import { test, expect } from '@playwright/test'

const DISPOSITIVOS = [
  { nombre: 'iPhone SE', w: 375, h: 667, top: 20, bottom: 0, safari: 553 },
  { nombre: 'iPhone 14', w: 390, h: 844, top: 47, bottom: 34, safari: 664 },
  { nombre: 'iPhone 15', w: 393, h: 852, top: 59, bottom: 34, safari: 672 },
  { nombre: 'iPhone 16 Pro Max', w: 430, h: 932, top: 59, bottom: 34, safari: 752 },
]
const SELECTORES = ['.sesion-cabecera', '.sesion-titulo-fila h1', '.sesion-foto', '.sesion-arriba .t-sub', '.sesion-aviso', '.sesion-alternativa', '.sesion-par', '.sesion .circulo', '.sesion-medio > button', '.stepper', '.sesion-abajo .boton', '.botones-fila', '.sesion-abajo .t-sub', '.sesion-abajo .secundario', '.sesion-abajo .t-nota', '.resumen-cifras', '.t-descanso', '.t-listo', '.t-titulo', '.inicio-arriba', '.inicio-texto', '.inicio-pie .boton', '.inicio-pie .secundario', '.barra']

async function revisar(page, nombre) {
  const r = await page.evaluate((sels) => {
    const cajas = []
    for (const s of sels) for (const el of document.querySelectorAll(s)) {
      const b = el.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) continue
      const st = getComputedStyle(el)
      if (st.visibility === 'hidden' || el.closest('.hoja-fondo:not(.abierta)')) continue
      const cortado = el.scrollHeight > el.clientHeight + 1 && st.overflowY !== 'visible' && !el.classList.contains('sesion-foto') && !el.classList.contains('sesion-aviso') && !el.classList.contains('inicio')
      cajas.push({ s, x: b.left, y: b.top, r: b.right, b: b.bottom, cortado, fuera: b.left < -1 || b.top < -1 || b.right > innerWidth + 1 || b.bottom > innerHeight + 1 })
    }
    const problemas = []
    for (let i = 0; i < cajas.length; i++) {
      const a = cajas[i]
      if (a.fuera) problemas.push(`${a.s} fuera de la pantalla`)
      if (a.cortado) problemas.push(`${a.s} cortado`)
      for (let j = i + 1; j < cajas.length; j++) {
        const c = cajas[j]
        const contiene = (p, q) => p.x <= q.x + 1 && p.y <= q.y + 1 && p.r >= q.r - 1 && p.b >= q.b - 1
        if (contiene(a, c) || contiene(c, a)) continue
        const cruza = a.x < c.r - 1 && c.x < a.r - 1 && a.y < c.b - 1 && c.y < a.b - 1
        if (cruza) problemas.push(`${a.s} se encima con ${c.s}`)
      }
    }
    // Botón principal: completo, dentro de la pantalla y nadie encima
    for (const el of document.querySelectorAll('.boton')) {
      if (el.closest('.hoja-fondo:not(.abierta)')) continue
      const b = el.getBoundingClientRect()
      if (b.width === 0) continue
      const texto = el.textContent.trim()
      if (b.top < 0 || b.bottom > innerHeight || b.left < 0 || b.right > innerWidth) problemas.push(`botón "${texto}" se sale de la pantalla (${Math.round(b.top)}–${Math.round(b.bottom)} de ${innerHeight})`)
      const sobre = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2)
      if (!sobre || (sobre !== el && !el.contains(sobre))) problemas.push(`botón "${texto}" tapado por ${sobre ? sobre.className || sobre.tagName : 'nada'}`)
      if (el.scrollWidth > el.clientWidth + 1) problemas.push(`botón "${texto}" con el texto cortado`)
    }
    if (document.querySelector('.sesion') && document.documentElement.scrollHeight > innerHeight + 1) problemas.push('la sesión hace scroll')
    const h1 = document.querySelector('.sesion-titulo-fila h1')
    if (h1 && h1.scrollWidth > h1.clientWidth + 1) problemas.push('título cortado')
    return problemas
  }, SELECTORES)
  expect(r, `${nombre}: ${r.join('; ')}`).toEqual([])
}

for (const d of DISPOSITIVOS) for (const modo of ['Safari', 'instalada']) {
  test(`${d.nombre} ${modo}: nada se encima ni se corta`, async ({ page }) => {
    page.on('dialog', (x) => x.accept())
    const instalada = modo === 'instalada'
    await page.setViewportSize({ width: d.w, height: instalada ? d.h : d.safari })
    if (instalada) {
      // env(safe-area-inset-*) vale 0 en Chromium: se simulan las áreas seguras del iPhone con una hoja de estilos
      await page.addInitScript(({ top, bottom }) => {
        document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = `html { --safe-top: ${top}px !important; --safe-bottom: ${bottom}px !important }`; document.head.appendChild(st) })
      }, { top: d.top, bottom: d.bottom })
    }
    await page.goto('?seed=1')
    await page.waitForTimeout(800)
    await page.evaluate(() => localStorage.removeItem('gym-app:sesion-activa'))
    await page.goto('')
    // una B hoy para que toque A y salga el nombre más largo (A1) con aviso de subir peso
    await page.getByRole('button', { name: 'Historial' }).click()
    await page.getByRole('button', { name: /Fui este día/ }).click()
    await page.getByLabel('Qué hice').selectOption('B')
    await page.getByRole('button', { name: 'Guardar' }).click()
    await page.getByRole('button', { name: 'Hoy' }).click()
    await expect(page.locator('h1')).toContainText('A:')
    await page.waitForTimeout(500)
    await revisar(page, 'inicio')
    await page.getByRole('button', { name: /^Empezar/ }).click()
    await expect(page.locator('h1', { hasText: 'Calentamiento' })).toBeVisible()
    await page.waitForTimeout(600)
    await revisar(page, 'calentamiento')
    await page.getByRole('button', { name: 'Empezar calentamiento' }).click()
    await page.waitForTimeout(600)
    await revisar(page, 'calentamiento corriendo')
    await page.getByRole('button', { name: 'Ya terminé' }).click()
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press inclinado con mancuernas')
    await expect(page.locator('.sesion-aviso')).toBeVisible()
    await page.waitForTimeout(700)
    if (instalada && d.h >= 800) expect(await page.locator('.sesion-foto img').first().boundingBox().then((b) => b?.height ?? 0)).toBeGreaterThan(100)
    await revisar(page, 'serie 1')
    await page.getByRole('button', { name: 'Serie hecha' }).click()
    await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'descanso')
    await page.getByRole('button', { name: 'Saltar' }).click()
    await expect(page.getByText(/Serie 2 de/)).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'serie 2')
    // jalón con la alternativa de nombre más largo
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Saltar ejercicio', { exact: true }).click()
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Jalón al pecho en polea, agarre ancho')
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Cambiar por alternativa', { exact: true }).click()
    await page.locator('.hoja-fondo.abierta').getByRole('button', { name: 'Dominadas asistidas en máquina o con liga' }).click()
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Dominadas asistidas en máquina o con liga')
    await page.waitForTimeout(700)
    await revisar(page, 'alternativa con nombre largo')
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Serie hecha' }).click()
      await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
      await page.getByRole('button', { name: 'Saltar' }).click()
      await expect(page.locator('h1', { hasText: 'Descanso' })).toHaveCount(0)
    }
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press militar sentado con mancuernas')
    await page.waitForTimeout(700)
    await revisar(page, 'tercer ejercicio')
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Ejercicio anterior', { exact: true }).click()
    await expect(page.getByRole('button', { name: 'Siguiente ejercicio' })).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'ejercicio completo con Siguiente ejercicio')
    // tarjeta de par (laterales + remo con pecho apoyado) y los 15 s de cambio
    await page.getByRole('button', { name: 'Siguiente ejercicio' }).click()
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Saltar ejercicio', { exact: true }).click()
    await expect(page.locator('.sesion-par')).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'tarjeta de par')
    await page.getByRole('button', { name: 'Serie hecha' }).click()
    await expect(page.locator('h1', { hasText: 'Cambio' })).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'cambio de par')
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Terminar sesión', { exact: true }).click()
    await expect(page.getByText('Listo.')).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'resumen')
  })
}
