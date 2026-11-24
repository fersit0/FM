# MANANAS-30.md · FM versión 8 (24 nov 2026)

Para Claude Code. Lo autoriza Fer. Manda sobre RUTINA-FINAL.md (v7) donde choquen. Lo que aquí no se menciona se queda igual: ejercicios, fichas, fotos, alternativas, progresión, unidades, respaldo y diseño.

## 0. Prompt para pegarle a Code

```
Lee MANANAS-30.md en la raíz del proyecto (si no existe, créalo con el texto que te pego abajo) y aplícalo sobre la v7. Rama nueva mananas-30 desde main. Orden: 1) sesiones y rotación (secciones 2 y 3) en src/logic con pruebas; 2) días, horario y el tipo VISITA (sección 4); 3) contadores, Tu semana y textos (secciones 5 y 6). Commits chicos y no hagas push sin preguntarme. No lances flujos de muchos agentes: hazlo tú directo. Al final dime en corto qué cambió y cuánto duran A y B según tu cálculo, y enséñame capturas a 390 px de: Hoy martes 7:42, Hoy martes 7:58, Hoy martes 8:20, Tu semana con 2 pesas y 1 visita, y la sesión B.
```

## 1. Qué cambió en la vida de Fer

- Entre semana se baña en el club todos los días. La buena es 7:15, llega como 7:40, pesas hasta las 8:15, regadera y sale 8:40.
- De lunes a viernes cualquier mañana es de club. Ya no hay lunes de cardio, miércoles de descanso ni viernes de sauna.
- Llegar cuenta aunque no haya pesas: si llega tarde, solo se baña y la cadena sigue.
- Frida ya no es base de la semana. Si van, es extra.
- Meta: 3 o 4 sesiones de pesas por semana y 5 visitas al club.

## 2. Sesiones nuevas (mismos ids, unos 27 a 28 min con calentamiento)

Dos sesiones que se alternan. Van cargadas a lo que Fer quiere ver: pecho de arriba, espalda ancha y hombro lateral. La pierna va al mínimo a propósito.

**A · Empuje: pecho, hombro y tríceps · Bancos**

| # | id | Series × reps | Descanso |
|---|---|---|---|
| 1 | `press-inclinado` | 4 × 8-10 | 90 s |
| 2 | `aperturas-inclinadas` | 2 × 12-15 | 60 s |
| 3 | `laterales` | 4 × 12-20 | 60 s |
| 4 | `triceps-cabeza` | 3 × 10-12 | 60 s |

**B · Jalón: espalda, pierna y abdomen · Poleas → Terraza**

| # | id | Series × reps | Descanso |
|---|---|---|---|
| 1 | `jalon` | 3 × 10-12 | 75 s |
| 2 | `remo-polea` | 3 × 10-12 | 75 s |
| 3 | `goblet` | 3 × 10-12 | 90 s |
| 4 | `elevacion-piernas` | 3 × 12 | 45 s |

- **Corta (2 ejercicios, unos 12 min):** A `press-inclinado` 3 y `laterales` 3; B `jalon` 3 y `remo-polea` 3. Cuenta como sesión de pesas.
- **Calentamiento:** 3 min de elíptica o caminadora; en la corta, solo la serie de aproximación. Sin cierre de cardio.
- Salen de la rotación y quedan como alternativas, con su historial: `press-plano`, `jalon-cerrado`, `triceps-polea`, `curl-alternado`, `curl-martillo`, `press-militar`, `puente-gluteo`, `crunch`, `remo-pecho-apoyado`.
- Desaparecen la sesión C y "A sin pierna". Las C viejas se quedan en el historial y cuentan como pesas.
- Con 4 mañanas a la semana salen unas 12 series de pecho, 12 de espalda, 8 de hombro lateral, 6 de pierna y 6 de abdomen. No agregues series ni ejercicios: tiene que caber en 30 minutos.
- Si alguna sesión pasa de 28 min con el cálculo de la app, quítale la última serie del cuarto ejercicio y repórtalo.

## 3. Rotación (sustituye a las sesiones base de la semana)

- A y B se alternan sin reiniciar por semana: toca la contraria de la última sesión de club registrada, del día que sea.
- Frida torso cuenta como B: después toca A. Frida pierna cuenta como pesas pero no mueve la rotación. Las `FRIDA` sin tipo cuentan como torso.
- La `VISITA` y `CASA` no mueven la rotación.
- "Hoy prefiero…" se queda; la rotación sigue desde la que se hizo.
- Primera sesión después de actualizar: A.
- Se quitan: sesiones base por semana, la sesión C, extras, regla de espalda, día planeado de Frida y "Mover Frida". Frida se registra cuando pasa, con Pierna o Torso, y nunca se pregunta por ella.

## 4. Días, horario y visita

- Lunes a viernes antes de las 12:00 siempre es día de club y Hoy ofrece la sesión que toca.
- Versión según la hora de inicio, con los ajustes que ya existen (salida 8:40, baño 25 min, última pesa 8:15): normal si cabe; si no, corta si cabe; si no, Hoy dice "Hoy solo regadera".
- **VISITA** (tipo nuevo, sin ejercicios): botón "Ya llegué" en "Hoy solo regadera", y un enlace chico "Solo regadera hoy" siempre visible en las mañanas. Una por día; si ese día se registra una sesión de pesas, la visita se absorbe.
- Recorte en el camino: si la última pesa proyectada pasa de 8:15, quita el cuarto ejercicio y luego series del tercero. Nunca toca los dos primeros.
- Noche y fin de semana: la misma sesión normal, con los topes de la v7. La tarjeta "¿Vas en la noche?" desaparece: si a las 8:45 de un día hábil no hay nada, Hoy dice "Hoy no hubo club · Mañana: B" con los enlaces "Sí fui" y "Voy en la noche".
- Días sin registro: solo se pregunta por días de lunes a viernes, una vez: "¿Fuiste al club el martes?" con Pesas (la que tocaba), Solo regadera y No fui.

## 5. Contadores y Tu semana

- Dos contadores por semana, de lunes a domingo: **Club** (días con pesas en el club o visita), meta 5; **Pesas** (A, B y Frida), meta 3 y sin tope.
- Línea de Hoy: "Hoy toca B · Club 2 de 5 · Pesas 2".
- Tu semana: pesas = letra llena (F con P o T para Frida); solo regadera = punto lleno; planeado = letra en contorno en los días de lunes a viernes que faltan, siguiendo la rotación; sábado y domingo sin plan.
- Se quitan el aviso del jueves de "Pesas extra" y el de rescate del domingo. Queda un solo aviso: si el día hábil anterior no hubo club, arriba en Hoy: "Ayer no hubo club. Hoy sí: nunca dos seguidos."

## 6. Textos

- Reglas en Ejercicios: actualízalas a esta versión (bañarse en el club, lo que quepa de pesas, A y B alternadas).
- Nombres: "A: Empuje" y "B: Jalón".
- Sin frases motivacionales, insignias ni rachas, como siempre.

## 7. Migración

No se borra nada. Las sesiones A, B y C viejas cuentan como pesas con su letra; la C ya no se ofrece. `VISITA` es un tipo nuevo y entra al respaldo. Los ajustes de la v7 se conservan.

## 8. Cómo verificar

- `npm test`, build y e2e en verde, también con NAVEGADOR=webkit.
- Rotación: A lunes, B martes, A miércoles, B jueves, A viernes. Con un día sin ir en medio, sigue donde iba. Viernes A y lunes en la noche Frida torso: el martes toca A. Frida pierna y una visita no mueven nada.
- Horario un martes: empezar 7:42 da la normal; 7:58, la corta; 8:20, "Hoy solo regadera". Un domingo a las 11:00, la normal.
- Contadores: semana con A, una visita y B da "Club 3 de 5 · Pesas 2".
- Tu semana cabe a 375 px y distingue pesas, visita y planeado.
- Todo se ve bien a 375, 390 y 430 px, sin nada cortado.
