// Descarga los sprites de TODOS los monstruos del catálogo desde Rate My Server.
//
// `build-monster-catalog.mjs` solo asigna sprite a un monstruo si el archivo ya
// existe en public/world/sprites/. Este script rellena esa carpeta; después hay
// que regenerar el catálogo con `pnpm run data:monsters`.
//
// Uso: pnpm run data:monster-sprites
// Requiere conexión a Internet. Los sprites ya descargados no se vuelven a pedir.

import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";

const CATALOGO = new URL("../public/data/monsters-index.json", import.meta.url);
const DIRECTORIO = new URL("../public/world/sprites/", import.meta.url);
const ORIGEN = (id) => `https://file5s.ratemyserver.net/mobs/${id}.gif`;
const AGENTE = "AscencionRO monster sprite cache";
const LOTE = 12;

await mkdir(DIRECTORIO, { recursive: true });

const catalogo = JSON.parse(await readFile(CATALOGO, "utf8"));
const ids = [...new Set(catalogo.items.map((m) => m.id))].sort((a, b) => a - b);
console.log(`Catálogo: ${ids.length} monstruos.`);

async function existe(url) {
  try { await access(url); return true; } catch { return false; }
}

async function descargar(id) {
  for (let intento = 0; intento < 3; intento++) {
    try {
      const respuesta = await fetch(ORIGEN(id), { headers: { "user-agent": AGENTE } });
      const tipo = respuesta.headers.get("content-type") ?? "";
      if (respuesta.ok && /^image\//i.test(tipo)) {
        const bytes = Buffer.from(await respuesta.arrayBuffer());
        if (bytes.length > 40) return bytes;
      }
      if (respuesta.status === 404) return null;
    } catch { /* Reintenta una descarga pública fallida. */ }
    await new Promise((r) => setTimeout(r, 300 * (intento + 1)));
  }
  return null;
}

// Rate My Server devuelve una imagen genérica para los IDs que no tiene.
// La descargamos una vez para reconocerla y no guardarla como si fuera un sprite.
const generica = await descargar(999999);
const hashGenerica = generica ? createHash("sha1").update(generica).digest("hex") : "";
console.log(generica ? "Imagen genérica identificada; se descartarán sus copias." : "Sin imagen genérica que descartar.");

const cuentas = { enCache: 0, descargados: 0, sinSprite: 0 };
const sinSprite = [];

async function procesar(id) {
  const destino = new URL(`${id}.gif`, DIRECTORIO);
  if (await existe(destino)) { cuentas.enCache++; return; }
  const bytes = await descargar(id);
  if (!bytes) { cuentas.sinSprite++; sinSprite.push(id); return; }
  if (hashGenerica && createHash("sha1").update(bytes).digest("hex") === hashGenerica) {
    cuentas.sinSprite++; sinSprite.push(id); return;
  }
  await writeFile(destino, bytes);
  cuentas.descargados++;
}

for (let inicio = 0; inicio < ids.length; inicio += LOTE) {
  await Promise.all(ids.slice(inicio, inicio + LOTE).map(procesar));
  const hechos = Math.min(inicio + LOTE, ids.length);
  if (hechos % 120 === 0 || hechos === ids.length) {
    console.log(`  ${hechos}/${ids.length}  (${cuentas.descargados} nuevos, ${cuentas.enCache} en caché, ${cuentas.sinSprite} sin sprite)`);
  }
  await new Promise((r) => setTimeout(r, 200));
}

console.log(`\nDescargados ${cuentas.descargados}, ya estaban ${cuentas.enCache}, sin sprite en el origen ${cuentas.sinSprite}.`);
if (sinSprite.length) {
  const nombres = new Map(catalogo.items.map((m) => [m.id, m.name]));
  console.log("\nSin sprite en Rate My Server:");
  for (const id of sinSprite.slice(0, 40)) console.log(`  ${id}  ${nombres.get(id) ?? ""}`);
  if (sinSprite.length > 40) console.log(`  ... y ${sinSprite.length - 40} más`);
}
console.log("\nSiguiente paso: pnpm run data:monsters");
