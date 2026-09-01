# AscencionRO · Guía Pre-Renewal

Enciclopedia en español para Ragnarok Online Pre-Renewal. El sitio incluye ocho guías, catálogos locales de objetos y monstruos, sprites, mapas, NPC, drops, tiendas y referencias de Endless Tower.

Todo el contenido se sirve desde el propio repositorio: la navegación normal no consulta Rate My Server ni rAthena. Las fuentes externas sólo se usan al regenerar las instantáneas con los comandos `data:*`.

## Abrir en Windows con doble clic

1. Clona este repositorio para que pueda actualizarse automáticamente:

   ```powershell
   git clone https://github.com/CidZigon/ascencion-ro-guia.git
   ```

2. Abre la carpeta y ejecuta **`ABRIR_ASCENCIONRO.cmd`**.

El acceso directo comprueba `main`, conserva cualquier cambio local, prepara las dependencias sólo cuando es necesario, inicia el servidor y abre `http://127.0.0.1:3000/#inicio` en el navegador. Mantén la ventana del iniciador abierta mientras uses el sitio.

Requiere **Git** y **Node.js 22.13 o superior** ([nodejs.org](https://nodejs.org), versión LTS).

## Desarrollo

```powershell
pnpm install
pnpm run dev
```

Comprobaciones antes de abrir un Pull Request:

```powershell
pnpm run lint
pnpm test
```

Las mismas dos comprobaciones se ejecutan automáticamente en cada Pull Request.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `app/` | Interfaz: portal de guías, catálogos de objetos, monstruos y mundo. |
| `public/data/` | Catálogos generados que consume el sitio. |
| `public/world/` | Mapas y sprites de NPC y monstruos. |
| `data/` | Instantáneas de las fuentes originales (rAthena, iteminfo). |
| `scripts/` | Generación, caché y auditoría de los catálogos. |
| `tests/` | Pruebas del HTML renderizado. |
| `worker/` | Punto de entrada del servidor. |

## Comandos de datos

Los datos y sprites actuales ya están incluidos, así que no hace falta ejecutarlos para trabajar en el sitio.

| Comando | Qué hace |
| --- | --- |
| `pnpm run data:build` | Regenera módulos y todos los catálogos. |
| `pnpm run data:monsters` | Regenera el catálogo de monstruos. |
| `pnpm run data:world` | Regenera mapas, NPC y spawns. |
| `pnpm run audit:links` | Comprueba y corrige los enlaces de los módulos. |

Los comandos `data:*-sprites` descargan recursos y requieren conexión a Internet.

## Cómo contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md).
