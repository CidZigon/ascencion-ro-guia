import { existsSync, statSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

/* Complemento de audit-module-links.mjs: aquel audita los <a href> de texto
   de las guías (enlazan por ID a fichas locales); este audita los recursos
   binarios — sprites de objetos y monstruos, imágenes de mapas, NPCs, y los
   <img> incrustados directamente en el HTML de cada guía — comprobando que
   el archivo exista de verdad en public/ y no solo que la ruta esté bien
   formada. También detecta mayúsculas/minúsculas que no coinciden con el
   nombre real en disco: en Windows es invisible, pero GitHub Pages sirve
   desde Linux (sensible a mayúsculas) y ahí sí rompe. */

const publicDir = new URL("../public/", import.meta.url);
const reportFile = new URL("../public/data/media-link-audit.json", import.meta.url);
const shouldWrite = process.argv.includes("--write");

function toDiskUrl(urlPath) {
  return new URL(urlPath.replace(/^\//, ""), publicDir);
}

const problems = [];
const caseIssues = [];
const realPathByLower = new Map();

async function indexRealPaths(dirUrl, prefix = "") {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  for (const entry of entries) {
    const rel = `${prefix}${entry.name}`;
    if (entry.isDirectory()) await indexRealPaths(new URL(`${entry.name}/`, dirUrl), `${rel}/`);
    else realPathByLower.set(rel.toLowerCase(), rel);
  }
}

function checkPath(urlPath, source, id, name) {
  if (!urlPath || !urlPath.startsWith("/")) return;
  const rel = urlPath.replace(/^\//, "");
  const disk = toDiskUrl(urlPath);
  if (!existsSync(disk)) { problems.push({ source, id, name, path: urlPath, issue: "missing-file" }); return }
  if (statSync(disk).size === 0) problems.push({ source, id, name, path: urlPath, issue: "zero-bytes" });
  const real = realPathByLower.get(rel.toLowerCase());
  if (real && real !== rel) caseIssues.push({ source, id, name, referenced: urlPath, actualCase: `/${real}` });
}

async function readJson(relPath) {
  return JSON.parse(await readFile(new URL(relPath, publicDir), "utf8"));
}

async function main() {
  await indexRealPaths(publicDir);

  const itemsIdx = await readJson("data/items-index.json");
  for (const item of itemsIdx.items) if (item.sprite) checkPath(item.sprite, "item-index", item.id, item.name);

  const itemChunks = (await readdir(new URL("data/items/", publicDir))).filter(f => f.endsWith(".json"));
  for (const file of itemChunks) {
    const payload = await readJson(`data/items/${file}`);
    for (const item of payload.items) if (item.sprite) checkPath(item.sprite, `item-detail:${file}`, item.id, item.name);
  }

  const monIdx = await readJson("data/monsters-index.json");
  for (const mon of monIdx.items) if (mon.sprite) checkPath(mon.sprite, "monster-index", mon.id, mon.name);

  const monChunks = (await readdir(new URL("data/monsters/", publicDir))).filter(f => f.endsWith(".json"));
  for (const file of monChunks) {
    const payload = await readJson(`data/monsters/${file}`);
    for (const mon of payload.items) if (mon.sprite) checkPath(mon.sprite, `monster-detail:${file}`, mon.id, mon.name);
  }

  const worldIdx = await readJson("data/world-index.json");
  for (const map of worldIdx.maps) if (map.image) checkPath(map.image, "world-map", map.id, map.id);
  for (const npc of worldIdx.npcs) if (npc.sprite) checkPath(npc.sprite, "world-npc", npc.id, npc.name);

  // Sprites de monstruos citados en "lo dropean" (item-sources): mismo patrón
  // /world/sprites/{id}.gif que usa el catálogo, comprobado una vez por ID.
  const sourcesDir = new URL("data/item-sources/", publicDir);
  if (existsSync(sourcesDir)) {
    const seen = new Set();
    for (const file of (await readdir(sourcesDir)).filter(f => f.endsWith(".json"))) {
      const payload = await readJson(`data/item-sources/${file}`);
      for (const entry of Object.values(payload.items ?? {})) {
        for (const drop of entry.drops ?? []) {
          if (seen.has(drop.id)) continue;
          seen.add(drop.id);
          checkPath(`/world/sprites/${drop.id}.gif`, `item-source-drop:${file}`, drop.id, drop.name);
        }
      }
    }
  }

  // <img src="..."> incrustados en cada guía. El src real siempre precede a
  // onerror en estos tags generados, así que un escaneo no-goloso hasta el
  // primer src="..." encuentra la imagen primaria; el this.src='...' dentro
  // de onerror (si existe) es el respaldo que el navegador usa cuando la
  // primaria da 404. Solo cuenta como roto si primaria Y respaldo fallan —
  // así se detectó y corrigió el ID 10021 en la guía de Compañeros.
  const modulesDir = new URL("data/modules/", publicDir);
  const moduleFiles = (await readdir(modulesDir)).filter(f => f.endsWith(".html"));
  const seenPerModule = new Set();
  for (const file of moduleFiles) {
    const html = await readFile(new URL(file, modulesDir), "utf8");
    for (const match of html.matchAll(/<img\b[^>]*?>/gi)) {
      const tag = match[0];
      const primary = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
      if (!primary || !primary.startsWith("/")) continue;
      const key = `${file}|${primary}`;
      if (seenPerModule.has(key)) continue;
      seenPerModule.add(key);
      if (existsSync(toDiskUrl(primary))) { checkPath(primary, `module:${file}`, primary, primary); continue }
      const fallback = tag.match(/onerror\s*=\s*"[^"]*\bsrc\s*=\s*'([^']+)'/i)?.[1];
      if (fallback && existsSync(toDiskUrl(fallback))) continue; // el navegador se recupera por onerror
      problems.push({ source: `module:${file}`, id: primary, name: primary, path: primary, issue: fallback ? "primary-and-fallback-missing" : "missing-file-no-fallback" });
    }
  }

  const summary = {
    problems: problems.length,
    caseIssues: caseIssues.length,
    byIssue: Object.fromEntries([...new Set(problems.map(p => p.issue))].map(issue => [issue, problems.filter(p => p.issue === issue).length])),
  };
  const report = { generatedAt: new Date().toISOString(), summary, problems, caseIssues };

  if (shouldWrite) {
    await mkdir(new URL("../public/data/", import.meta.url), { recursive: true });
    await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  console.log(`Recursos con problema: ${summary.problems}. Discrepancias de mayúsculas/minúsculas: ${summary.caseIssues}.`);
  if (problems.length) console.error(JSON.stringify(problems.slice(0, 25), null, 2));
  if (caseIssues.length) console.error(JSON.stringify(caseIssues.slice(0, 25), null, 2));
  if (problems.length || caseIssues.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exit(1) });
