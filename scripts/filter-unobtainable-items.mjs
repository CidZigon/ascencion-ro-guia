import { readFile, readdir, writeFile } from "node:fs/promises";

// Este script corre después de data:catalog y data:sources. rAthena reutiliza
// IDs de item para props de NPC usados solo en cutscenes/diálogos de quest
// (variantes "_C", "E_", copias con nivel mínimo 1 de un arma que en la vida
// real pide 40+, etc.). Esos props nunca se venden ni se dropean, y comparten
// nombre con el item real — eso es lo que generaba duplicados como "Light
// Epsilon" ×4. La firma buy<=1 + sell=0 + sin peso + sin tienda ni drop
// identifica esos props sin tocar cartas, Cash Shop ni items de encantamiento
// reales (esos sí tienen alguna fuente rastreada, o peso/precio normal).

const INDEX_PATH = new URL("../public/data/items-index.json", import.meta.url);
const ITEMS_DIR = new URL("../public/data/items/", import.meta.url);
const SOURCES_DIR = new URL("../public/data/item-sources/", import.meta.url);

const catalog = JSON.parse(await readFile(INDEX_PATH, "utf8"));

const sourced = new Set();
for (const file of (await readdir(SOURCES_DIR)).filter(name => name.endsWith(".json"))) {
  const { items } = JSON.parse(await readFile(new URL(file, SOURCES_DIR), "utf8"));
  for (const id of Object.keys(items)) sourced.add(Number(id));
}

function isUnplayableProp(item) {
  if (sourced.has(item.id)) return false;
  if ((item.buy ?? 0) > 1) return false;
  if ((item.sell ?? 0) !== 0) return false;
  if (item.weight !== undefined) return false;
  return true;
}

const removedIds = new Set(catalog.items.filter(isUnplayableProp).map(item => item.id));

const keptIndexItems = catalog.items.filter(item => !removedIds.has(item.id));
const typeCounts = {};
for (const item of keptIndexItems) typeCounts[item.type] = (typeCounts[item.type] ?? 0) + 1;

await writeFile(INDEX_PATH, JSON.stringify({
  meta: { ...catalog.meta, count: keptIndexItems.length, typeCounts },
  items: keptIndexItems,
}), "utf8");

let chunksTouched = 0;
for (const file of (await readdir(ITEMS_DIR)).filter(name => name.endsWith(".json"))) {
  const path = new URL(file, ITEMS_DIR);
  const { items } = JSON.parse(await readFile(path, "utf8"));
  const kept = items.filter(item => !removedIds.has(item.id));
  if (kept.length !== items.length) chunksTouched++;
  await writeFile(path, JSON.stringify({ items: kept }), "utf8");
}

console.log(`Items sin fuente filtrados: ${removedIds.size} props de NPC descartados (${chunksTouched} bloques reescritos), quedan ${keptIndexItems.length} de ${catalog.items.length}.`);
