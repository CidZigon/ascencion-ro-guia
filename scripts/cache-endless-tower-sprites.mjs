import { access, mkdir, readFile, writeFile } from "node:fs/promises";

const modulePath = new URL("../public/data/modules/module-7.html", import.meta.url);
const spriteDir = new URL("../public/world/sprites/", import.meta.url);
const html = await readFile(modulePath, "utf8");
const ids = [...new Set([...html.matchAll(/<span class=["']id["']>ID\s+(\d+)<\/span>/gi)].map(match => match[1]))].sort((a, b) => Number(a) - Number(b));

await mkdir(spriteDir, { recursive: true });

async function exists(url) {
  try { await access(url); return true; } catch { return false; }
}

async function cacheSprite(id) {
  const target = new URL(`${id}.gif`, spriteDir);
  if (await exists(target)) return "cached";
  const source = `https://file5s.ratemyserver.net/mobs/${id}.gif`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(source, { headers: { "user-agent": "AscencionRO Endless Tower sprite cache" } });
      const type = response.headers.get("content-type") ?? "";
      if (response.ok && /^image\//i.test(type)) {
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length > 40) { await writeFile(target, bytes); return "downloaded"; }
      }
    } catch { /* Reintenta una descarga pública fallida. */ }
    await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
  }
  return "missing";
}

const stats = { cached: 0, downloaded: 0, missing: 0 };
for (let start = 0; start < ids.length; start += 16) {
  const batch = ids.slice(start, start + 16);
  const results = await Promise.all(batch.map(cacheSprite));
  for (const result of results) stats[result]++;
}

console.log(`Endless Tower: ${ids.length} sprites únicos; ${stats.downloaded} descargados, ${stats.cached} en caché, ${stats.missing} faltantes.`);
if (stats.missing) process.exitCode = 1;
