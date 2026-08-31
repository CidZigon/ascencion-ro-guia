# Cómo contribuir a AscencionRO

Gracias por echar una mano. Este documento explica cómo trabajamos para que los cambios entren sin romper el sitio.

## Preparar el entorno

Necesitas **Git** y **Node.js 22.13 o superior** (instala la versión LTS desde [nodejs.org](https://nodejs.org)).

```powershell
git clone https://github.com/CidZigon/ascencion-ro-guia.git
cd ascencion-ro-guia
pnpm install
pnpm run dev
```

El sitio queda en `http://127.0.0.1:3000`.

Si `pnpm` no está disponible, actívalo con `corepack enable` en una terminal nueva.

## Flujo de trabajo

1. Parte siempre de `main` actualizado:

   ```powershell
   git checkout main
   git pull
   ```

2. Crea una rama con un nombre que describa el cambio:

   ```powershell
   git checkout -b feat/catalogo-cartas
   ```

   Prefijos que usamos: `feat/` para funcionalidad nueva, `fix/` para arreglos, `chore/` para mantenimiento y `docs/` para documentación.

3. Haz el cambio y comprueba **antes** de subirlo:

   ```powershell
   pnpm run lint
   pnpm test
   ```

   Ambas deben pasar. Las pruebas hacen un build completo, así que tardan un poco.

4. Sube la rama y abre un Pull Request contra `main`. Las mismas comprobaciones se ejecutan solas en el PR.

5. Que lo revise la otra persona antes de fusionar. Nadie fusiona su propio PR sin revisión.

## Mensajes de commit

Una línea, en imperativo y en minúscula, con el mismo prefijo que la rama:

```
feat: añadir catálogo de cartas con sus efectos
fix: corregir el enlace a los drops de Endless Tower
chore: quitar dependencias sin usar
```

## Dónde va cada cosa

| Quieres cambiar… | Toca… |
| --- | --- |
| Navegación y presentación de las guías | `app/GuidePortal.tsx` |
| Catálogo de objetos | `app/ItemCatalog.tsx` |
| Catálogo de monstruos | `app/MonsterCatalog.tsx` |
| Mapas, NPC y spawns | `app/WorldCatalog.tsx` |
| Apariencia de los módulos | `public/modern-modules.css` |
| Texto final de las ocho secciones | `public/data/modules/` |
| Colores y tipografía | `app/theme.css` |

## Datos y catálogos

Los archivos de `public/data/` y `public/world/` **están generados**. No los edites a mano: cambia el script correspondiente en `scripts/` y vuelve a ejecutarlo.

```powershell
pnpm run data:build      # regenera módulos y catálogos
pnpm run audit:links     # comprueba los enlaces de los módulos
```

Los comandos `data:*-sprites` descargan de fuentes externas (rAthena, Rate My Server) y sólo se ejecutan al actualizar instantáneas, nunca durante la navegación normal.

## Recursos binarios

El repositorio ya guarda varios miles de sprites y mapas. Antes de añadir imágenes nuevas, comprueba que no exista ya un equivalente y que el archivo sea el más pequeño que sirva: todo lo que entra se queda en el historial para siempre.

## Qué no subir

- `node_modules/`, `dist/`, `.next/`, `.vinext/` y `.wrangler/` (ya están ignorados).
- Archivos `.env*`, claves o credenciales de cualquier tipo.
- `package-lock.json`: el gestor del proyecto es **pnpm**, y el único lockfile válido es `pnpm-lock.yaml`.
