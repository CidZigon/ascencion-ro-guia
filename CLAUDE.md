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
- **El sitio se publica como estático** en https://cidzigon.github.io/ desde el repositorio `CidZigon/CidZigon.github.io`. Lo genera `scripts/build-static-site.mjs` y lo sube el workflow `.github/workflows/publicar.yml` en cada push a `main`.
- El build sigue produciendo un worker de Cloudflare, pero **solo se usa para prerenderizar la portada**. No hay servidor en producción, así que no hacen falta EC2, S3 ni Cloudflare. Si algún día se necesita servidor de verdad, eso sí sería un cambio de runtime: hablarlo antes.
- El siguiente paso natural, si el sitio deja de ser solo pruebas, es un dominio propio apuntando a GitHub Pages. Las rutas de los datos son absolutas (`/world/items/501.gif`, más de 13.000), así que **el sitio tiene que servirse desde la raíz de un dominio**, nunca desde un subdirectorio.

## Estilo

- Todo el texto visible al usuario, los mensajes de commit y la documentación van **en español**.
- Nombres de ramas: `feat/`, `fix/`, `chore/`, `docs/`.
- `app/GuidePortal.tsx` pasa de 500 líneas y concentra portal, navegación y modales. Si lo tocas mucho, propón dividirlo antes de seguir añadiéndole cosas.

## Flujo

Rama → cambio → `pnpm run lint` y `pnpm test` → Pull Request contra `main` → revisión de la otra persona → merge. Nadie fusiona sin revisión.
