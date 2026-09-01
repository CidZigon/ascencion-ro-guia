# Contexto del proyecto para Claude

Notas para cualquier asistente que trabaje en este repositorio. Léelas antes de proponer cambios.

## Qué es

Enciclopedia en español para Ragnarok Online **Pre-Renewal** (servidor AscencionRO / BarrasRO). Ocho guías más catálogos de objetos, monstruos y mundo. El público son jugadores, no desarrolladores: el texto va en español y orientado al jugador.

## Stack

- **vinext** `1.0.0-beta.2` sobre Vite 8 y React 19 (App Router al estilo Next).
- Se compila para **Cloudflare Workers** con `@cloudflare/vite-plugin`; el punto de entrada del servidor es `worker/index.ts`.
- Tailwind 4 para estilos utilitarios, más CSS propio en `app/theme.css` y `public/modern-modules.css`.
- Gestor de paquetes: **pnpm**. `pnpm-lock.yaml` es el único lockfile válido.

`vinext` está en beta: si un build falla sin causa aparente, sospecha de la versión del framework antes que del código del sitio.

## Reglas del proyecto

1. **El sitio no consulta fuentes externas en tiempo de ejecución.** Todo sale de `public/data/` y `public/world/`. Rate My Server y rAthena sólo se tocan al regenerar instantáneas con los comandos `data:*`.
2. **`public/data/` y `public/world/` están generados.** Para cambiarlos, edita el script de `scripts/` y vuelve a ejecutarlo. Nunca los edites a mano.
3. **Antes de dar un cambio por bueno**, ejecuta `pnpm run lint` y `pnpm test`. Las pruebas hacen un build completo y comprueban el HTML renderizado.
4. **El repositorio pesa unos 85 MB** por los miles de sprites y mapas versionados. No añadas binarios a la ligera.

## Estado y dirección

- El proyecto nació como una plantilla de OpenAI Sites. Ese andamiaje (autenticación de ChatGPT, D1/Drizzle, ejemplos) ya se retiró; si encuentras restos, se pueden quitar.
- **Objetivo pendiente: desplegar en una instancia EC2.** Hoy el build apunta a Cloudflare Workers. Migrar implica pasar al build de Node (`vinext build` + `vinext start`) y retirar `worker/`, `@cloudflare/vite-plugin` y `wrangler`. Es un cambio de runtime, no un borrado de archivos: no lo hagas por partes ni sin avisar.

## Estilo

- Todo el texto visible al usuario, los mensajes de commit y la documentación van **en español**.
- Nombres de ramas: `feat/`, `fix/`, `chore/`, `docs/`.
- `app/GuidePortal.tsx` pasa de 500 líneas y concentra portal, navegación y modales. Si lo tocas mucho, propón dividirlo antes de seguir añadiéndole cosas.

## Flujo

Rama → cambio → `pnpm run lint` y `pnpm test` → Pull Request contra `main` → revisión de la otra persona → merge. Nadie fusiona sin revisión.
