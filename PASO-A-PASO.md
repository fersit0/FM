# Paso a paso para armar la app

## Antes de empezar (10 min)

1. Instala Claude Desktop desde claude.ai/download e inicia sesión con tu cuenta Max.
2. Crea una cuenta gratuita en github.com si no tienes. Anota tu usuario.
3. Copia esta carpeta `gym-app` a tu Mac, por ejemplo en `Documentos/Proyectos/gym-app`. Adentro deben quedar `BRIEF.md`, `CLAUDE.md` y este archivo.
4. En Claude Desktop, pestaña Code, nueva sesión, ambiente Local, selecciona la carpeta `gym-app`.
5. Modelo: Opus 5.5.
6. Antes de arrancar, entra a Ajustes > Uso y toma nota de dónde vas en la semana.

## Prompt de arranque (pégalo tal cual)

```
Lee CLAUDE.md y BRIEF.md completos, incluyendo el Anexo A, antes de escribir código. Luego dime en 10 líneas cómo lo vas a construir y qué dudas tienes. Contesto y arrancas con la fase 1 como está descrita en CLAUDE.md. No pases a la fase 2 hasta que yo vea la fase 1 corriendo en la vista previa.
```

Contesta sus dudas en una sola respuesta y dile "arranca".

## Prompts por fase

Cuando te muestre una fase y ya la revisaste:

```
Fase 1 revisada. [Aquí tus cambios, concretos, o "sin cambios"]. Pasa a la fase 2.
```

Y así con cada una. Para la fase 4, cambia el modelo a Fable 5.1 y usa:

```
Fase 4. Aplica el Anexo A completo. Antes de tocar código, dime en 8 líneas cómo vas a traducir la identidad a esta app: paleta exacta con hex, tipografías, cómo se ve el estado de temperatura en la pantalla Sesión, y cómo se ve el historial como tráfico nocturno. Lo apruebo y luego implementas.
```

Después de la fase 4, regresa a Opus 5.5 (o Sonnet para cosas chicas).

## Verla en tu iPhone mientras la construyes

```
Levanta el servidor de desarrollo accesible desde mi red local y dame la URL exacta para abrirla en Safari del iPhone. Estamos en el mismo Wi-Fi.
```

## Publicarla (fase 5)

```
Fase 5. Crea el repositorio en GitHub con nombre gym-app (público), configura el workflow de GitHub Pages, sube todo y dame la URL final. Si necesitas que yo haga algo en github.com, dame los pasos exactos.
```

Cuando te dé la URL: ábrela en Safari del iPhone, botón de compartir, "Agregar a pantalla de inicio". Ya quedó. Cada cambio que Claude suba después se aplica solo la siguiente vez que abras la app.

## Prompts de mantenimiento

Algo se rompió:
```
Este es el error: [pégalo]. Arréglalo sin cambiar nada más.
```

Un cambio te dejó peor:
```
Regresa al último commit y dime qué se perdió.
```

Quieres un ajuste:
```
En la pantalla [X], [cambio concreto]. Solo eso.
```

Ya terminaste por hoy:
```
Haz commit de lo que hay, súbelo a GitHub y dime en 5 líneas en qué quedamos para retomar mañana.
```

## Para no acabarte el uso de la chamba

- Una sola sesión de Claude Code a la vez.
- Prompts concretos. "Se ve mal" gasta el doble que "el botón Empezar más grande y el naranja más quemado".
- Revisa Ajustes > Uso cada dos fases. Si vas arriba de la mitad del semanal, cierra el día ahí.
- Fable 5.1 solo en fase 4 y en bugs donde Opus dio vueltas dos veces.
- Si te pide instalar algo o correr un comando, lee qué es y acepta. No actives "aceptar todo".

## Modelos, en corto

- Opus 5.5: construir (fases 1, 2, 3, 5).
- Fable 5.1: diseño (fase 4) y rescate de bugs.
- Sonnet: ajustes de texto, colores, tamaños, cosas chicas.
