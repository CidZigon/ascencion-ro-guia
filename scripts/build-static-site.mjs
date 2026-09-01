// Genera un sitio completamente estático a partir del build de vinext.
//
// El sitio es 100% cliente: todos los componentes de `app/` son "use client" y
// los datos se piden por fetch a archivos de `public/`. Por eso basta con
// renderizar la portada una vez, guardarla como index.html y juntarla con los
// recursos del cliente y con `public/`.
//
// Uso: pnpm run build && pnpm run export:static
// Salida: ./sitio-estatico

import { access, cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const root = process.cwd();
const SALIDA = resolve(root, "sitio-estatico");

async function existe(ruta) {
  try { await access(ruta); return true; } catch { return false; }
}

const servidor = resolve(root, "dist/server/index.js");
if (!(await existe(servidor))) {
  console.error("[ERROR] Falta dist/server/index.js. Ejecuta antes: pnpm run build");
  process.exit(1);
}

let recursosCliente = null;
for (const candidata of ["dist/client", "dist/assets", "dist/static"]) {
  if (await existe(resolve(root, candidata))) { recursosCliente = resolve(root, candidata); break; }
}
if (!recursosCliente) {
  console.error("[ERROR] No se encontró la carpeta de recursos del cliente dentro de dist/.");
  process.exit(1);
}

// Renderiza la portada con el mismo worker que usan las pruebas.
const { default: worker } = await import(pathToFileURL(servidor).href);
const respuesta = await worker.fetch(
  new Request("http://localhost/", { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);
const html = await respuesta.text();
if (respuesta.status !== 200 || !html.includes("AscencionRO")) {
  console.error(`[ERROR] La portada no se renderizó (HTTP ${respuesta.status}).`);
  process.exit(1);
}

await rm(SALIDA, { recursive: true, force: true });
await mkdir(SALIDA, { recursive: true });
await cp(recursosCliente, SALIDA, { recursive: true });
await cp(resolve(root, "public"), SALIDA, { recursive: true, force: true });
await writeFile(resolve(SALIDA, "index.html"), html, "utf8");
await writeFile(resolve(SALIDA, "404.html"), html, "utf8");
// Sin .nojekyll, GitHub Pages ignora _next/ y el sitio se queda sin JavaScript.
await writeFile(resolve(SALIDA, ".nojekyll"), "", "utf8");

// Comprobaciones: si algo falta, es mejor fallar aquí que publicar un sitio roto.
const obligatorios = [
  "index.html",
  ".nojekyll",
  "data/items-index.json",
  "data/monsters-index.json",
  "data/world-index.json",
  "modern-modules.css",
  "world/items/501.gif",
  ...[...html.matchAll(/src="(\/[^"]+)"/g)].map((m) => m[1].slice(1)),
];
const faltan = [];
for (const archivo of obligatorios) {
  if (!(await existe(resolve(SALIDA, archivo)))) faltan.push(archivo);
}
if (faltan.length) {
  console.error("[ERROR] Faltan archivos en el sitio estático:");
  for (const f of faltan) console.error("  -", f);
  process.exit(1);
}

let total = 0;
async function pesar(dir) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = resolve(dir, entrada.name);
    if (entrada.isDirectory()) await pesar(ruta);
    else total += (await stat(ruta)).size;
  }
}
await pesar(SALIDA);

console.log(`Sitio estático listo en ./sitio-estatico (${(total / 1024 / 1024).toFixed(1)} MB)`);
console.log(`Comprobados ${obligatorios.length} archivos clave.`);
