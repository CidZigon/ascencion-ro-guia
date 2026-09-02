import { readFile, readdir, writeFile } from "node:fs/promises";

// Este script corre después de data:catalog y data:sources. rAthena reutiliza
// IDs de item para props de NPC usados solo en cutscenes/diálogos de quest
// (variantes "_C", "E_", copias con nivel mínimo 1 de un arma que en la vida
// real pide 40+, etc.). Esos props nunca se venden ni se dropean, y comparten
// nombre con el item real — eso es lo que generaba duplicados como "Light
// Epsilon" ×4. La firma buy<=2 + sell<=1 + sin peso + sin tienda, drop ni
// quest identifica esos props sin tocar cartas, Cash Shop ni items de
// encantamiento reales (esos sí tienen alguna fuente rastreada, o peso/precio
// normal). Aparte, rAthena genera variantes "de ranuras" de casi toda arma
// básica (Sword, Sword_, Sword__) con el mismo precio que el original pero
// sin ninguna tienda que las venda — se detectan por el guion bajo final en
// el AegisName, que nunca aparece en un nombre real de varias palabras.
//
// En vez de borrarlos, se marcan con `unobtainable: true`. El catálogo los
// esconde de "Todos" y de cada categoría normal, y los agrupa aparte en la
// categoría "Archivo" — por si nuestro rastreo de fuentes está incompleto en
// vez de que el item sea realmente imposible de conseguir.

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
  if ((item.buy ?? 0) > 2) return false;
  if ((item.sell ?? 0) > 1) return false;
  if (item.weight !== undefined) return false;
  return true;
}

function isSlotVariantDuplicate(item) {
  if (sourced.has(item.id)) return false;
  return /_+$/.test(item.aegisName);
}

const archivedIds = new Set(catalog.items.filter(item => isUnplayableProp(item) || isSlotVariantDuplicate(item)).map(item => item.id));

const indexItems = catalog.items.map(item => archivedIds.has(item.id) ? { ...item, unobtainable: true } : item);
const typeCounts = {};
for (const item of indexItems) typeCounts[item.type] = (typeCounts[item.type] ?? 0) + 1;

await writeFile(INDEX_PATH, JSON.stringify({
  meta: { ...catalog.meta, count: indexItems.length, typeCounts, archivedCount: archivedIds.size },
  items: indexItems,
}), "utf8");

let chunksTouched = 0;
for (const file of (await readdir(ITEMS_DIR)).filter(name => name.endsWith(".json"))) {
  const path = new URL(file, ITEMS_DIR);
  const { items } = JSON.parse(await readFile(path, "utf8"));
  let touched = false;
  const tagged = items.map(item => {
    if (!archivedIds.has(item.id)) return item;
    touched = true;
    return { ...item, unobtainable: true };
  });
  if (touched) chunksTouched++;
  await writeFile(path, JSON.stringify({ items: tagged }), "utf8");
}

console.log(`Items de archivo marcados: ${archivedIds.size} sin fuente conocida (${chunksTouched} bloques reescritos) de ${catalog.items.length} totales.`);
