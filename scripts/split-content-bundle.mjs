import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("../public/content.bundle", import.meta.url), "utf8");
const dataKey = "const MODULE_DATA=";
const metaKey = ";const MODULE_META=";
const searchKey = "const SEARCH_INDEX=";
const dataStart = source.indexOf(dataKey) + dataKey.length;
const dataEnd = source.indexOf(metaKey, dataStart);
const searchStart = source.indexOf(searchKey) + searchKey.length;
const searchTail = source.slice(searchStart).match(/^(\[.*\]);\s*let currentModule=/s);

if (dataStart < dataKey.length || dataEnd < 0 || searchStart < searchKey.length || !searchTail) {
  throw new Error("No se pudo leer public/content.bundle");
}

const modules = JSON.parse(source.slice(dataStart, dataEnd));
const searchIndex = JSON.parse(searchTail[1]);
const outputDir = new URL("../public/data/modules/", import.meta.url);
await mkdir(outputDir, { recursive: true });

for (const [id, encoded] of Object.entries(modules)) {
  const html = Buffer.from(encoded, "base64").toString("utf8");
  await writeFile(new URL(`module-${id}.html`, outputDir), html, "utf8");
}

await writeFile(new URL("../public/data/guide-search.json", import.meta.url), JSON.stringify(searchIndex), "utf8");
console.log(`Biblioteca dividida: ${Object.keys(modules).length} módulos y ${searchIndex.length} entradas de búsqueda.`);

