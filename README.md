# AscencionRO · Guía Pre-Renewal

Enciclopedia en español para Ragnarok Online Pre-Renewal. El sitio incluye ocho guías, catálogos locales de objetos y monstruos, sprites, mapas, NPC, drops, tiendas y referencias de Endless Tower.

## Abrir en Windows con doble clic

1. Clona este repositorio para que pueda actualizarse automáticamente:

   ```powershell
   git clone https://github.com/CidZigon/ascencion-ro-guia.git
   ```

2. Abre la carpeta y ejecuta **`ABRIR_ASCENCIONRO.cmd`**.

El acceso directo comprueba `main`, conserva cualquier cambio local, prepara las dependencias sólo cuando es necesario, inicia el servidor y abre `http://127.0.0.1:3000/#inicio` en el navegador. Mantén la ventana del iniciador abierta mientras uses el sitio.

Requiere Git y Node.js 22 o superior. Si Codex está instalado, el iniciador también puede reutilizar su Node.js local sin que tengas que abrir ChatGPT.

## Desarrollo

```powershell
pnpm install --frozen-lockfile
pnpm run dev
```

Comprobaciones antes de publicar:

```powershell
pnpm run lint
pnpm test
```

Los catálogos se sirven desde `public/data/`; la navegación normal no consulta Rate My Server ni rAthena. Las fuentes externas sólo se usan al regenerar las instantáneas con los comandos `data:*`.

## Versión alojada

[Abrir AscencionRO](https://ascencion-ro-guia.atesdan-yot.chatgpt.site/)
