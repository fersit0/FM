# PENDIENTE-V8.md · estado de la rama `mananas-30` (24 nov 2026)

La v8 (MANANAS-30.md) ya está aplicada en esta rama: datos, lógica, pantallas y pruebas unitarias. `npm test` y `npm run build` pasan. No rehagas lo hecho: termina lo que falta, directo y sin flujos de agentes. No hagas merge ni push a `main` sin que Fer lo pida.

## Hecho
- `src/data/ejercicios.ts`: A (empuje) y B (jalón) nuevas; la C se queda solo para el historial; lo que salió quedó como alternativa.
- `src/logic`: `semana.ts` (rotación A/B, contadores Club y Pesas, aviso único), `registro.ts` (visita, días hábiles sin registro), `tusemana.ts`, `horario.ts` (solo regadera, completa recortada), `sesion.ts` (recorte por series). Pruebas reescritas.
- Pantallas: `Hoy.tsx` reescrita (modos club, regadera, sinclub, hecha, visita, libre), `TuSemana`, `Registrar`, `Historial`, `Ejercicios`, `Sesion` (sin cierre, recorte nuevo).
- `useDatos.ts`: al arrancar la v8 una sola vez guarda `v8Desde` y, si salida y baño seguían en 8:40 y 25, los pasa a 8:45 y 35.
- `scripts/capturas-v8.mjs`: con `npm run dev` corriendo, saca las capturas a 390 px (ya revisadas una vez: nada cortado a 375, 390 ni 430).

## Decisiones que se apartan de MANANAS-30.md (se quedan así)
1. Con la cuenta de la app, A dura 29.5 min y B 28.75, ya con tríceps y elevación de piernas en 2 series (la spec pedía quitar una serie si pasaban de 28).
2. Orden de A: press inclinado, laterales, aperturas, tríceps. Los dos primeros son la corta y nunca se recortan.
3. La completa se empieza mientras quepan sus dos primeros ejercicios; lo demás se recorta en el camino, de atrás para adelante y por series, y solo desde que se llega al segundo ejercicio (con el ritmo real). Con la regla literal de la spec, llegando 7:40 casi siempre habría tocado la corta.
4. Tope de la mañana por defecto 8:10 (salida 8:45, baño 35). Con eso: completa hasta 7:49 (A) o 7:54 (B), corta hasta 7:55, después solo regadera.
5. La corta no lleva cardio: 1 min de serie de aproximación.
6. Sin cierre de cardio tampoco en la noche.
7. El aviso "Ayer no hubo club" no sale si ayer hubo Frida.
8. Solo se pregunta por días desde `v8Desde`; "Pon al día tu semana" ya no existe.
9. La visita de un día con pesas no se borra: se oculta en Historial y no suma otro día de club.
10. La línea de Hoy lleva solo los contadores ("Club 2 de 5 · Pesas 2"); la letra va en el título.

## Falta (en este orden)

0. **Arranque.** En la carpeta del proyecto: si `git status` muestra cambios sin commit en `main`, para y pregúntale a Fer. Si está limpio: `git fetch origin`, `git checkout mananas-30`, `npm ci` y confirma que `npm test` y `npm run build` pasan antes de tocar nada.

1. **"Hoy descanso" (nuevo, lo pidió Fer el 25 nov, el día que amaneció enfermo).** Hoy no tiene cómo decir "hoy no voy, estoy malo" sin que al día siguiente salga "Ayer no hubo club. Hoy sí: nunca dos seguidos.".
   - `Settings.descansos?: string[]` (YYYY-MM-DD).
   - En Hoy, en un día hábil sin club (modos `club`, `regadera` y `sinclub`, nunca con sesión en curso): botón de texto "Hoy descanso", un toque y Deshacer, como los demás. Ese día Hoy queda en un modo nuevo `descanso`: título "Descanso", nota con lo que sigue ("Mañana: B.") y solo "Registrar sesión".
   - `avisoAyer` no avisa si el día hábil anterior está en `descansos`. `diasSinRegistro` no pregunta por esos días. En Tu semana ese día no lleva plan. La rotación y los contadores no cambian (la meta de Club sigue en 5).
   - Si ese día luego se registra pesas o visita, se quita de `descansos`.
   - Pruebas en `semana.test.ts`, `registro.test.ts` y `tusemana.test.ts`. Nada más que esto: no agregues otros modos ni ajustes.

2. **e2e, sin gastar de más.** Siguen escritas para la v7. Corre `npx playwright test` una vez en chromium. Borra completos `frida.spec.mjs`, `v7.spec.mjs` y `revision-v6.spec.mjs` (prueban cosas que ya no existen). En los demás, borra los casos de cosas que ya no existen (plan y "Mover" de Frida, "¿Vas en la noche?", sesión C, A sin pierna, cierre, "Pon al día") y arregla solo lo que truene por textos o por el reloj de `e2e/comun.mjs` (hoy fija un jueves 7 pm con "Voy en la noche"; `seed.ts` ya acepta `registro=FECHA:VISITA`). Agrega un `v8.spec.mjs` corto: rotación en Hoy, "Ya llegué" a las 8:20, "Solo regadera hoy", la pregunta "¿Fuiste al club el…?", "Voy en la noche", "Hoy descanso" y Tu semana con visita. WebKit (`NAVEGADOR=webkit`) una sola vez al final.

3. Versión `0.8.0` en `package.json` y `package-lock.json`, y una línea arriba de `RUTINA-FINAL.md` que diga que `MANANAS-30.md` manda.

4. **Revisión a mano a 390 px:** con `npm run dev` corriendo, `node scripts/capturas-v8.mjs` (agrégale la captura de "Hoy descanso"). Revisa tú las capturas, y con el reloj del navegador fijo haz una B completa, un recorte en el camino (7:55 al llegar al segundo ejercicio) y "Terminar aquí".

5. **Enséñale a Fer 5 capturas** (Hoy 7:42, Hoy 8:20, Tu semana con visita, Hoy descanso y la sesión B) y dile en tres líneas qué cambió. Solo si dice que sí: merge a `main` y push, que es lo que publica la app. Después dile que abra FM en el iPhone, toque "Hay versión nueva" y revise en Ajustes que diga salida 8:45 y 35 de baño.
