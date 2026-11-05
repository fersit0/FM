// Ninguna pantalla se encima ni se corta y el botón principal siempre está completo y visible sin scroll,
// en cuatro iPhones, en Safari (viewport recortado por sus barras) y como app instalada (pantalla completa con
// áreas seguras arriba y abajo), con el nombre más largo, una alternativa elegida y la foto grande.
import { test, expect } from '@playwright/test'
import { reloj, terminarAqui } from './comun.mjs'

const DISPOSITIVOS = [
  { nombre: 'iPhone SE', w: 375, h: 667, top: 20, bottom: 0, safari: 553 },
  { nombre: 'iPhone 14', w: 390, h: 844, top: 47, bottom: 34, safari: 664 },
  { nombre: 'iPhone 15 y 16', w: 393, h: 852, top: 59, bottom: 34, safari: 672 },
  { nombre: 'iPhone 16 Pro Max', w: 430, h: 932, top: 59, bottom: 34, safari: 752 },
]
const SELECTORES = ['.sesion-cabecera', '.sesion-linea', '.sesion-titulo-fila h1', '.sesion-foto', '.sesion-arriba .t-sub', '.sesion-ocupado', '.sesion-cuenta', '.sesion-aviso', '.sesion-alternativa', '.sesion .circulo', '.sesion-medio > button', '.serie-peso > button', '.stepper', '.sesion-abajo .boton', '.botones-fila', '.sesion-abajo .t-sub', '.sesion-abajo .secundario', '.sesion-abajo .t-nota', '.resumen-cifras', '.t-descanso', '.t-listo', '.t-titulo', '.inicio-arriba', '.inicio-texto', '.inicio-pie .boton', '.inicio-pie .secundario', '.inicio-pie .dia-botones', '.dia-fila', '.barra', '.deshacer']

async function revisar(page, nombre) {
  const r = await page.evaluate((sels) => {
    const cajas = []
    for (const s of sels) for (const el of document.querySelectorAll(s)) {
      const b = el.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) continue
      const st = getComputedStyle(el)
      if (st.visibility === 'hidden' || el.closest('.hoja-fondo:not(.abierta)')) continue
      // con una hoja abierta, lo de atrás queda tapado a propósito: solo cuenta lo de la hoja
      const hojaAbierta = document.querySelectorAll('.hoja-fondo.abierta')
      if (hojaAbierta.length && !hojaAbierta[hojaAbierta.length - 1].contains(el)) continue
      const cortado = el.scrollHeight > el.clientHeight + 1 && st.overflowY !== 'visible' && !el.classList.contains('sesion-foto') && !el.classList.contains('sesion-aviso') && !el.classList.contains('sesion-linea') && !el.classList.contains('inicio')
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
        if (cruza) problemas.push(`${a.s} (${Math.round(a.y)}–${Math.round(a.b)}) se encima con ${c.s} (${Math.round(c.y)}–${Math.round(c.b)})`)
      }
    }
    // Botón principal: completo, dentro de la pantalla y nadie encima
    for (const el of document.querySelectorAll('.boton, .dia-boton')) {
      if (el.closest('.hoja-fondo:not(.abierta)')) continue
      // con una hoja abierta, lo de atrás queda tapado a propósito: solo cuentan los botones de la hoja
      if (document.querySelector('.hoja-fondo.abierta') && !el.closest('.hoja-fondo.abierta')) continue
      const b = el.getBoundingClientRect()
      if (b.width === 0) continue
      const texto = el.textContent.trim()
      if (b.top < 0 || b.bottom > innerHeight || b.left < 0 || b.right > innerWidth) problemas.push(`botón "${texto}" se sale de la pantalla (${Math.round(b.top)}–${Math.round(b.bottom)} de ${innerHeight})`)
      const sobre = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2)
      if (!sobre || (sobre !== el && !el.contains(sobre))) problemas.push(`botón "${texto}" tapado por ${sobre ? sobre.className || sobre.tagName : 'nada'}`)
      if (el.scrollWidth > el.clientWidth + 1) problemas.push(`botón "${texto}" con el texto cortado`)
    }
    if (document.querySelector('.sesion') && document.documentElement.scrollHeight > innerHeight + 1) problemas.push('la sesión hace scroll')
    // la sesión no recorre: lo que no cabe quedaría cortado abajo
    const ses = document.querySelector('.sesion')
    if (ses && ses.scrollHeight > ses.clientHeight + 1) problemas.push(`la sesión no cabe (${ses.scrollHeight} de ${ses.clientHeight})`)
    const h1 = document.querySelector('.sesion-titulo-fila h1')
    if (h1 && h1.scrollWidth > h1.clientWidth + 1) problemas.push('título cortado')
    // la línea de hora tiene que verse completa, con su botón
    const linea = document.querySelector('.sesion-linea')
    if (linea && linea.scrollHeight > linea.clientHeight + 1) problemas.push('línea de hora cortada')
    // ACOMODO-FM.md, 23. 1) La foto de la serie siempre entera: su caja tiene la proporción de la imagen (nada recortado)
    for (const img of document.querySelectorAll('.sesion-foto img')) {
      if (getComputedStyle(img).visibility === 'hidden' || !img.naturalWidth) continue
      const b = img.getBoundingClientRect()
      const real = img.naturalWidth / img.naturalHeight, caja = b.width / b.height
      if (Math.abs(caja - real) / real > 0.03) problemas.push(`foto recortada: caja ${Math.round(b.width)}×${Math.round(b.height)}, foto ${img.naturalWidth}×${img.naturalHeight}`)
    }
    // 2) El círculo de la serie de 140 o más (en pantallas de 640 de alto o más)
    const circ = document.querySelector('.serie-peso .circulo')
    if (circ && innerHeight >= 640 && circ.getBoundingClientRect().width < 139.5) problemas.push(`círculo de la serie de ${Math.round(circ.getBoundingClientRect().width)} (mínimo 140)`)
    // 3) Todo texto con contraste de 4.5 o más contra lo que tiene detrás (3 si es grande: 24 px, o 18.7 en negritas)
    const color = (t) => {
      let m = t.match(/^rgba?\(([^)]+)\)/)
      if (m) { const v = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] ?? 1] }
      m = t.match(/^color\(srgb ([^)]+)\)/)
      if (m) { const v = m[1].split(/[\s\/]+/).filter(Boolean).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1] }
      return null
    }
    const sobre = (a, b) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1)
    const lum = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]) }
    const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
    const hojas = document.querySelectorAll('.hoja-fondo.abierta')
    const hoja = hojas[hojas.length - 1]
    // el círculo no recibe toques (pointer-events: none) y elementsFromPoint no lo vería: mientras se mide, sí
    const medir = document.createElement('style')
    medir.textContent = '.circulo { pointer-events: auto !important }'
    document.head.appendChild(medir)
    for (const el of document.querySelectorAll('.pantalla *, .hoja-fondo.abierta *, .barra *')) {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
      if (el.closest('.foto, .pez, svg, .hoja-fondo:not(.abierta)') || (hoja && !hoja.contains(el))) continue
      const st = getComputedStyle(el)
      if (st.visibility === 'hidden' || st.display === 'none') continue
      const rg = document.createRange(); rg.selectNodeContents(el)
      const r = [...rg.getClientRects()].find((x) => x.width > 0 && x.height > 0)
      if (!r || r.bottom < 0 || r.top > innerHeight) continue
      let fg = color(st.color); if (!fg) continue
      let op = 1; for (let p = el; p; p = p.parentElement) op *= parseFloat(getComputedStyle(p).opacity)
      fg = [fg[0], fg[1], fg[2], fg[3] * op]
      // el fondo: lo que hay debajo del centro del texto, sin contar el texto mismo
      const capas = []
      for (const debajo of document.elementsFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2)) {
        // el fondo del propio elemento cuenta (un botón con su color); lo que tiene adentro no
        if (debajo !== el && el.contains(debajo)) continue
        const c = color(getComputedStyle(debajo).backgroundColor)
        if (c && c[3] > 0) { capas.push(c); if (c[3] >= 0.99) break }
      }
      let fondo = [255, 255, 255, 1]
      for (const c of capas.reverse()) fondo = sobre(c, fondo)
      const tam = parseFloat(st.fontSize), negrita = parseInt(st.fontWeight, 10) >= 700
      const minimo = tam >= 24 || (negrita && tam >= 18.7) ? 3 : 4.5
      const cr = contraste(sobre(fg, fondo), fondo)
      if (cr < minimo) problemas.push(`texto con poco contraste (${cr.toFixed(2)}, mínimo ${minimo}): "${el.textContent.trim().slice(0, 40)}"`)
    }
    medir.remove()
    return [...new Set(problemas)]
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
    await reloj(page)
    await page.goto('?seed=1&fresco=1')
    await page.waitForTimeout(800)
    await page.evaluate(() => localStorage.removeItem('gym-app:sesion-activa'))
    await page.goto('')
    // "Pon al día tu semana" y la pregunta por un día
    await expect(page.getByText('Pon al día tu semana')).toBeVisible()
    await page.waitForTimeout(500)
    await revisar(page, 'pon al día tu semana')
    await page.getByRole('button', { name: 'Listo' }).click()
    // de nuevo con el historial sembrado y el martes sin contestar: pregunta por el martes
    await page.goto('?seed=1')
    await page.waitForTimeout(800)
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('gym-app:settings')); s.noFui = []; localStorage.setItem('gym-app:settings', JSON.stringify(s)) })
    await page.goto('')
    await expect(page.getByText(/¿Entrenaste el/)).toBeVisible()
    await page.waitForTimeout(500)
    await revisar(page, 'pregunta por un día')
    await page.getByRole('button', { name: 'No fui' }).click()
    // jueves a las 7 pm sin sesión: primero "¿Vas en la noche?" (RUTINA-FINAL.md v7, 2.4)
    await expect(page.getByText('No fuiste en la mañana')).toBeVisible()
    await page.waitForTimeout(500)
    await revisar(page, 'vas en la noche')
    await page.getByRole('button', { name: 'Voy en la noche' }).click()
    // "Hoy prefiero C" para que salga el jalón con aviso y la alternativa de nombre más largo
    await page.getByRole('button', { name: 'Hoy prefiero…' }).click()
    await page.waitForTimeout(500)
    await revisar(page, 'hoy prefiero')
    await page.locator('.hoja-fondo.abierta').getByRole('button', { name: /^C:/ }).click()
    await expect(page.locator('h1')).toContainText('C:')
    // con el aviso de Deshacer a la vista ("Hoy C."): ocupa su lugar y no tapa nada
    await expect(page.locator('.deshacer')).toBeVisible()
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
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Jalón al pecho, agarre ancho')
    // el jalón es el primer ejercicio: lleva la aproximación (y ya no "Primera vez…", ACOMODO-FM.md, 10)
    await expect(page.locator('.sesion-aviso').last()).toContainText('Antes:')
    await expect(page.locator('.sesion-aviso').first()).toBeVisible()
    // la línea de la hora ya no va en la serie (ACOMODO-FM.md, 5)
    await expect(page.locator('.sesion-linea')).toHaveCount(0)
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
    // la alternativa de nombre más largo
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Cambiar por alternativa', { exact: true }).click()
    await page.locator('.hoja-fondo.abierta').getByRole('button', { name: 'Remo a una mano con mancuerna, jalando hacia la cadera' }).click()
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo a una mano con mancuerna, jalando hacia la cadera')
    await page.waitForTimeout(700)
    await revisar(page, 'alternativa con nombre largo')
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: 'Serie hecha' }).click()
      await expect(page.locator('h1', { hasText: 'Descanso' })).toBeVisible()
      await page.getByRole('button', { name: 'Saltar' }).click()
      await expect(page.locator('h1', { hasText: 'Descanso' })).toHaveCount(0)
    }
    await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Remo sentado en máquina')
    await page.waitForTimeout(700)
    await revisar(page, 'segundo ejercicio')
    await page.getByRole('button', { name: 'Opciones de la sesión' }).click()
    await page.getByText('Ejercicio anterior', { exact: true }).click()
    await expect(page.getByRole('button', { name: 'Siguiente ejercicio' })).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'ejercicio completo con Siguiente ejercicio')
    await page.getByRole('button', { name: 'Siguiente ejercicio' }).click()
    await terminarAqui(page)
    await expect(page.locator('h1', { hasText: 'Cierre' })).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'cierre')
    await page.getByRole('button', { name: 'Saltar' }).click()
    await expect(page.getByText('Listo.')).toBeVisible()
    await page.waitForTimeout(700)
    await revisar(page, 'resumen')
  })
}
