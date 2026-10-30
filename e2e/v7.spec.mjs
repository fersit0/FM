// La v7 de punta a punta (RUTINA-FINAL.md v7, 2, 3 y 14): gym en la mañana, Frida pierna o torso, A sin pierna, Tu
// semana, "¿Vas en la noche?" y los avisos. Semana del lunes 5 de octubre de 2026. Cada prueba fija su día y su hora
// antes de sembrar, así los días anteriores quedan contestados y no salen preguntas.
import { test, expect } from '@playwright/test'
import { reloj } from './comun.mjs'

const hoja = (page) => page.locator('.hoja-fondo.abierta').last()
/** Un día de Tu semana por su nombre ("jueves 8") */
const dia = (page, nombre) => page.locator('.tira').getByRole('listitem', { name: new RegExp(`(^|, )${nombre}:`) })

/** Deja la semana como se pide con el reloj en esa hora: `params` son los de ?seed=0 (frida, registro) */
async function escena(page, hora, params = '') {
  await reloj(page, hora)
  await page.goto('?seed=0')
  await page.waitForTimeout(400)
  await page.evaluate(() => localStorage.clear())
  await page.goto(`?seed=0${params}`)
  await page.waitForTimeout(600)
  await page.goto('')
  await expect(page.locator('.pantalla.inicio')).toBeVisible()
}
/** Renglones de texto de Hoy que se enciman con el círculo rojo (se mide cada renglón, no la caja del párrafo) */
async function encimaCirculo(page) {
  return page.evaluate(() => {
    const c = document.querySelector('.pantalla.inicio > .circulo').getBoundingClientRect()
    const cx = (c.left + c.right) / 2, cy = (c.top + c.bottom) / 2, r = c.width / 2
    const out = []
    const caminar = document.createTreeWalker(document.querySelector('.inicio-texto'), NodeFilter.SHOW_TEXT)
    for (let n = caminar.nextNode(); n; n = caminar.nextNode()) {
      if (!n.textContent.trim()) continue
      const rg = document.createRange(); rg.selectNodeContents(n)
      for (const b of rg.getClientRects()) {
        const x = Math.max(b.left, Math.min(cx, b.right)), y = Math.max(b.top, Math.min(cy, b.bottom))
        if (Math.hypot(x - cx, y - cy) < r - 1) out.push(n.textContent.trim().slice(0, 40))
      }
    }
    return [...new Set(out)]
  })
}
async function irA(page, hora) {
  await reloj(page, hora)
  await page.goto('')
  await expect(page.locator('.pantalla.inicio')).toBeVisible()
}

test.beforeEach(({ page }) => { page.on('dialog', (d) => d.accept()) })

test('"Fui con Frida" no guarda nada hasta elegir Pierna o Torso; con pierna, el martes toca A sin pierna', async ({ page }) => {
  await escena(page, '2026-10-05T20:30:00')
  await page.getByRole('button', { name: 'Fui con Frida' }).click()
  await expect(hoja(page).getByRole('button', { name: 'Pierna', exact: true })).toBeVisible()
  await expect(hoja(page).getByRole('button', { name: 'Torso', exact: true })).toBeVisible()
  // cerrar sin elegir no registra nada
  await page.keyboard.press('Escape')
  await expect(page.locator('.hoja-fondo.abierta')).toHaveCount(0)
  await page.goto('')
  await expect(page.getByRole('button', { name: 'Fui con Frida' })).toBeVisible()
  await expect(dia(page, 'lunes 5')).toHaveAccessibleName(/toca Frida/)
  await page.getByRole('button', { name: 'Fui con Frida' }).click()
  await hoja(page).getByRole('button', { name: 'Pierna', exact: true }).click()
  await expect(page.getByText('lunes 5: Frida pierna registrada.')).toBeVisible()
  await expect(dia(page, 'lunes 5')).toHaveAccessibleName(/Frida pierna, en la noche/)
  await irA(page, '2026-10-06T06:45:00')
  await expect(page.getByText(/Hoy toca A sin pierna · Frida fue pierna el lunes · Semana: 1 de 3/)).toBeVisible()
  await expect(page.locator('h1')).toHaveText('A: Pecho y espalda')
  await expect(page.getByText('Sin pierna: esta semana la hiciste con Frida.')).toBeVisible()
})

test('A sin pierna: Bancos → Terraza con el remo con pecho apoyado; su corta es press, remo y laterales', async ({ page }) => {
  await escena(page, '2026-10-06T06:45:00', '&frida=pierna')
  await page.locator('.inicio-texto button.inicio-nota').click()
  await expect(hoja(page).locator('.fila')).toHaveText([/Press inclinado/, /Aperturas inclinadas/, /Remo con pecho apoyado/, /Elevaciones laterales/, /Tríceps con mancuerna/, /Crunch/])
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-ruta')).toHaveText('Bancos → Terraza')
  await expect(page.locator('.sesion-titulo-fila h1')).toHaveText('Press inclinado con mancuernas')
  await expect(page.getByText(/Serie 1 de 4/)).toBeVisible()
  // la corta, a las 7:45
  await escena(page, '2026-10-06T07:45:00', '&frida=pierna')
  await expect(page.locator('.inicio-texto button.inicio-nota')).toContainText(/3 ejercicios, unos \d+ min · corta/)
  await page.locator('.inicio-texto button.inicio-nota').click()
  await expect(hoja(page).locator('.fila')).toHaveText([/Press inclinado/, /Remo con pecho apoyado/, /Elevaciones laterales/])
})

test('un martes en la mañana la versión sale de la hora al tocar Empezar: B a las 7:20 completa, 7:30 corta, 7:55 "¿Vas en la noche?"', async ({ page }) => {
  // Frida torso y A el lunes: el martes toca B
  const params = '&frida=torso&registro=2026-10-05:A'
  await escena(page, '2026-10-06T07:20:00', params)
  await expect(page.locator('h1')).toHaveText('B: Torso completo')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  // sin el calentamiento (se saltó), las pesas de la B terminan unos 46 min después
  await expect(page.locator('.sesion-linea')).toContainText(/Empezaste 7:2\d · completa · terminas pesas 8:[01]\d · te quedan \d+ min de sauna y baño/)
  await escena(page, '2026-10-06T07:30:00', params)
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-linea')).toContainText(/Empezaste 7:3\d · corta/)
  await expect(page.getByText(/Serie 1 de 3/)).toBeVisible()
  await escena(page, '2026-10-06T07:55:00', params)
  await expect(page.locator('.inicio-texto')).toContainText('Ya no alcanza en la mañana')
  await expect(page.getByRole('button', { name: /Casa, 12 minutos/ })).toHaveCount(0)
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await expect(page.getByText('No fuiste en la mañana')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Voy en la noche' })).toBeVisible()
})

test('un martes a las 8:30 sin sesión: "¿Vas en la noche?" con sus tres botones; "Hoy no" recalcula Tu semana', async ({ page }) => {
  await escena(page, '2026-10-06T08:30:00', '&frida=torso')
  await expect(page.getByText('No fuiste en la mañana')).toBeVisible()
  await expect(page.locator('h1')).toHaveText('A: Pecho y pierna')
  await expect(dia(page, 'martes 6')).toHaveAccessibleName(/toca A/)
  await expect(dia(page, 'jueves 8')).toHaveAccessibleName(/toca B/)
  // "Ya fui" abre registrar en hoy, en la mañana
  await page.getByRole('button', { name: 'Ya fui' }).click()
  await expect(hoja(page).getByLabel('Fecha')).toHaveValue('2026-10-06')
  await expect(hoja(page).getByRole('button', { name: 'Mañana' })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Hoy no' }).click()
  await expect(page.getByText('No fuiste en la mañana')).toHaveCount(0)
  await expect(dia(page, 'martes 6')).toHaveAccessibleName(/martes 6: nada/)
  await expect(dia(page, 'jueves 8')).toHaveAccessibleName(/toca A/)
  await expect(dia(page, 'viernes 9')).toHaveAccessibleName(/toca B/)
})

test('"Voy en la noche" se queda como plan del día; en la noche, 20:15 completa, 20:45 corta y 21:00 casa', async ({ page }) => {
  await escena(page, '2026-10-06T08:30:00', '&frida=torso')
  await page.getByRole('button', { name: 'Voy en la noche' }).click()
  await expect(page.getByText('No fuiste en la mañana')).toHaveCount(0)
  await expect(page.locator('.inicio-texto button.inicio-nota')).toContainText('En la noche')
  for (const [hora, version] of [['20:15', 'completa'], ['20:45', 'corta'], ['21:00', 'corta de todas formas']]) {
    await irA(page, `2026-10-06T${hora}:00`)
    await expect(page.locator('.inicio-texto button.inicio-nota')).toContainText(`· ${version}`)
  }
  await expect(page.getByRole('button', { name: /Casa, 12 minutos/ })).toBeVisible()
})

test('Tu semana: hecho, planeado y hoy; cabe a 375 px; un día que ya pasó abre registrar en ese día', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await escena(page, '2026-10-06T06:45:00', '&frida=pierna')
  const dias = page.locator('.tira').getByRole('listitem')
  await expect(dias).toHaveCount(7)
  const bordes = await dias.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => [r.left, r.right]))
  for (const [izq, der] of bordes) { expect(izq).toBeGreaterThanOrEqual(0); expect(der).toBeLessThanOrEqual(375) }
  expect(await page.evaluate(() => document.scrollingElement.scrollWidth)).toBeLessThanOrEqual(375)
  await expect(dia(page, 'lunes 5')).toHaveAccessibleName('lunes 5: Frida pierna, en la noche. Registrar o cambiar')
  await expect(dia(page, 'martes 6')).toHaveAccessibleName('Hoy, martes 6: toca A')
  await expect(dia(page, 'miércoles 7')).toHaveAccessibleName('miércoles 7: nada')
  await expect(dia(page, 'jueves 8')).toHaveAccessibleName('jueves 8: toca B')
  await expect(page.locator('.tira-dia.hoy')).toHaveCount(1)
  await expect(page.locator('.tira-marca.hecho')).toHaveCount(1)
  await expect(page.locator('.tira-marca.plan')).toHaveCount(2)
  // los días de hoy en adelante no hacen nada
  await expect(page.locator('.tira button')).toHaveCount(1)
  await dia(page, 'lunes 5').click()
  await expect(hoja(page).getByLabel('Fecha')).toHaveValue('2026-10-05')
})

test('cambiar Frida a pierna en Historial recalcula la semana y Tu semana: la A sale sin pierna', async ({ page }) => {
  await escena(page, '2026-10-06T06:45:00', '&frida=torso')
  await expect(page.getByText(/Hoy toca A · Frida fue torso el lunes/)).toBeVisible()
  await expect(dia(page, 'lunes 5')).toHaveAccessibleName(/Frida torso/)
  await page.getByRole('button', { name: 'Historial', exact: true }).click()
  await page.locator('.pantalla .fila').first().click()
  await hoja(page).getByRole('button', { name: /Frida torso/ }).click()
  await hoja(page).getByLabel('Qué hice').selectOption('FRIDA:pierna')
  await page.goto('')
  await expect(page.getByText(/Hoy toca A sin pierna · Frida fue pierna el lunes/)).toBeVisible()
  await expect(dia(page, 'lunes 5')).toHaveAccessibleName(/Frida pierna/)
})

test('jueves: con 2 de 3, el aviso de Pesas extra para el viernes; con 3 de 3, semana completa', async ({ page }) => {
  await escena(page, '2026-10-08T21:30:00', '&frida=torso&registro=2026-10-06:A')
  // después de la última pesa lo principal es mañana, sin Empezar ni texto repetido, y nada encima del círculo rojo
  await expect(page.locator('h1')).toHaveText('Mañana: B')
  await expect(page.locator('.inicio-nota')).toHaveText('Vas en 2 de 3. Prende tus alarmas de Pesas extra.')
  await expect(page.getByText(/Ya pasó la última pesa · Semana: 2 de 3/)).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar|^Hoy prefiero/ })).toHaveCount(0)
  await expect(page.getByText(/Mañana viernes toca/)).toHaveCount(0)
  expect(await encimaCirculo(page)).toEqual([])
  await escena(page, '2026-10-08T09:00:00', '&frida=torso&registro=2026-10-06:A,2026-10-08:B')
  await expect(page.getByText(/Semana completa\. Mañana viernes, sauna\./)).toBeVisible()
  // ya en la noche: "Mañana: sauna"
  await irA(page, '2026-10-08T21:30:00')
  await expect(page.locator('h1')).toHaveText('Mañana: sauna')
  await expect(page.locator('.inicio-nota')).toHaveText('Semana completa.')
  // el viernes, con la semana completa: sauna, con opción de extra
  await irA(page, '2026-10-09T07:00:00')
  await expect(page.getByText(/Semana completa · hoy sauna/)).toBeVisible()
  await expect(page.getByRole('button', { name: /^Pesas extra/ })).toBeVisible()
})

test('el lunes: en la mañana cardio y en la noche Frida; en la tarde no se ofrece sesión de club', async ({ page }) => {
  await escena(page, '2026-10-05T07:00:00')
  await expect(page.getByText('Hoy: cardio tranqui 25 min y sauna · en la noche, Frida')).toBeVisible()
  await irA(page, '2026-10-05T15:00:00')
  await expect(page.getByText('Hoy vas con Frida')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar|^Mejor hago|^Pesas extra/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Fui con Frida' }).click()
  await hoja(page).getByRole('button', { name: 'Torso', exact: true }).click()
  await expect(page.getByText(/El club abre los lunes de 7 a 11/).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar|^Pesas extra/ })).toHaveCount(0)
})

test('domingo de rescate a las 11: completa con el tope de las 18:45, sin recorte y con cierre', async ({ page }) => {
  await escena(page, '2026-10-11T11:00:00', '&frida=torso&registro=2026-10-06:A')
  await expect(page.locator('h1')).toHaveText('B: Torso completo')
  await expect(page.locator('.inicio-texto button.inicio-nota')).toContainText('· completa')
  await expect(page.getByText(/Vas en 2 de 3; hoy antes de las 7 pm te toca B\./)).toBeVisible()
  await page.getByRole('button', { name: /^Empezar/ }).click()
  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.locator('.sesion-linea')).toContainText(/va la completa · terminas pesas 11:\d\d/)
  await expect(page.locator('.sesion-linea')).not.toContainText(/sauna|Quité/)
  await expect(page.getByText(/Serie 1 de/)).toBeVisible()
  await page.getByRole('button', { name: 'Terminar aquí', exact: true }).click()
  await expect(page.locator('h1', { hasText: 'Cierre' })).toBeVisible()
})

test('una de club por día: hecha la del martes, Hoy dice "A hecha" y ya no ofrece otra', async ({ page }) => {
  await escena(page, '2026-10-06T10:00:00', '&frida=torso&registro=2026-10-06:A')
  await expect(page.locator('h1')).toHaveText('A hecha')
  await expect(page.getByText(/Hoy: A hecha · Semana: 2 de 3/)).toBeVisible()
  await expect(page.getByText('Sigue B el jueves.')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar|^Hoy prefiero/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Casa, 12 minutos/ })).toHaveCount(0)
})

test('"Hoy no": Hoy lo dice y lo que sigue, y "Empezar igual" lo quita', async ({ page }) => {
  await escena(page, '2026-10-06T08:30:00', '&frida=torso')
  await page.getByRole('button', { name: 'Hoy no' }).click()
  await expect(page.locator('h1')).toHaveText('Hoy no')
  await expect(page.getByText(/Tu semana se acomoda\. Sigue A el jueves\./)).toBeVisible()
  await expect(page.getByRole('button', { name: /^Empezar A igual/ })).toBeVisible()
})

test('el lunes en la mañana ya sin tiempo, "Empezar igual" no ofrece la noche: el club no abre', async ({ page }) => {
  await escena(page, '2026-10-05T08:00:00')
  await page.getByRole('button', { name: /^Empezar .* igual/ }).click()
  await expect(hoja(page)).toContainText('Ya no alcanza en la mañana')
  await expect(hoja(page)).toContainText('el lunes en la noche el club no abre')
  await expect(page.getByText('No fuiste en la mañana')).toHaveCount(0)
  await expect(hoja(page).getByText(/Casa, 12 minutos/)).toHaveCount(0)
  await expect(hoja(page).getByText(/Corta de todas formas/)).toBeVisible()
})
