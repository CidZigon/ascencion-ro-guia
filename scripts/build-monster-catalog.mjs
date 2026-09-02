import { access, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const REVISION = "e985006171d2eb320ee512a653f4c83aea3d81b6";
const SNAPSHOT_DATE = "2026-08-23";
const INDEX_PATH = new URL("../public/data/items-index.json", import.meta.url);
const OUTPUT_DIR = new URL("../public/data/monsters/", import.meta.url);
const CATALOG_PATH = new URL("../public/data/monsters-index.json", import.meta.url);
const SPRITE_DIR = new URL("../public/world/sprites/", import.meta.url);
const CHUNK_SIZE = 200;

function rankMap(map) {
  if (/^(?:\d+@|sec_|event|test|g_room|new_)/i.test(map)) return 4;
  if (/_fild/i.test(map)) return 0;
  if (/_dun/i.test(map)) return 1;
  if (/_in/i.test(map)) return 3;
  return 2;
}

/* Densidad de spawn: cuántos monstruos hay por segundo de reaparición en un
   mapa. Con ella se ordenan los mapas de un monstruo de mayor a menor
   probabilidad práctica de encontrarlo, en vez de un orden alfabético plano. */
function spawnDensity(entry) {
  if (!entry.count) return 0;
  if (!entry.delay) return entry.count;
  return entry.count / (entry.delay / 1000);
}

function sortSpawns(entries) {
  return [...entries].sort((left, right) => spawnDensity(right) - spawnDensity(left) || rankMap(left.map) - rankMap(right.map) || left.map.localeCompare(right.map));
}

function scalar(value) {
  const clean = value.trim();
  if (clean === "true") return true;
  if (clean === "false") return false;
  if (clean === "null" || clean === "~") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(clean)) return Number(clean);
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    return clean.slice(1, -1).replace(/\\"/g, '"').replace(/''/g, "'");
  }
  return clean;
}

function run(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { stdio: "ignore" });
    child.on("error", reject);
    child.on("exit", code => (code === 0 ? resolve() : reject(new Error(`${file} terminó con código ${code}`))));
  });
}

async function filesInside(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await filesInside(path));
    else if (entry.name.endsWith(".txt") || entry.name.endsWith(".yml")) found.push(path);
  }
  return found;
}

async function fetchBuffer(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "AscencionRO local monster catalog" } });
      if (response.ok) return Buffer.from(await response.arrayBuffer());
    } catch { /* Reintenta la descarga pública. */ }
    await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
  }
  return null;
}

async function spritePath(id) {
  try {
    await access(new URL(`${id}.gif`, SPRITE_DIR));
    return `/world/sprites/${id}.gif`;
  } catch {
    return undefined;
  }
}

function parseMobDatabase(text) {
  const monsters = [];
  let current = null;
  let dropList = null;
  let drop = null;

  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const idMatch = raw.match(/^ {2}- Id:\s*(\d+)\s*$/);
    if (idMatch) {
      if (current) monsters.push(current);
      current = { id: Number(idMatch[1]), drops: [] };
      dropList = null;
      drop = null;
      continue;
    }
    if (!current) continue;

    if (/^ {4}Drops:\s*$/.test(raw)) { dropList = "drop"; drop = null; continue; }
    if (/^ {4}MvpDrops:\s*$/.test(raw)) { dropList = "mvp"; drop = null; continue; }
    if (/^ {4}[A-Za-z][\w]*:\s*$/.test(raw)) { dropList = null; drop = null; continue; }

    const field = raw.match(/^ {4}([A-Za-z][\w]*):\s*(.+?)\s*$/);
    if (field) {
      current[field[1]] = scalar(field[2]);
      dropList = null;
      drop = null;
      continue;
    }

    const item = raw.match(/^ {6}- Item:\s*(\S+)\s*$/);
    if (item && dropList) {
      drop = { item: item[1], rate: 0, mvp: dropList === "mvp" };
      current.drops.push(drop);
      continue;
    }
    const rate = raw.match(/^ {8}Rate:\s*(\d+)\s*$/);
    if (rate && drop) drop.rate = Number(rate[1]);
  }
  if (current) monsters.push(current);
  return monsters;
}

function parseSpawnLine(line, spawns) {
  if (!line || /^\s*\/\//.test(line) || line.startsWith("-")) return;
  const fields = line.split("\t").map(field => field.trim()).filter(Boolean);
  if (fields.length < 4) return;
  const header = fields[0].match(/^([a-z0-9@_]+),(\d+),(\d+)(?:,\d+){0,2}$/i);
  if (!header || header[1] === "-") return;
  const kind = fields[1]?.toLowerCase();
  if (kind !== "monster" && kind !== "boss_monster") return;
  const mob = (fields[3] || "").match(/^(\d+),(\d+)(?:,(\d+))?/);
  if (mob) spawns.push({ map: header[1], id: Number(mob[1]), count: Number(mob[2]), delay: mob[3] !== undefined ? Number(mob[3]) : undefined });
}

const items = JSON.parse(await readFile(INDEX_PATH, "utf8")).items;
const aegisToItem = new Map(items.map(item => [item.aegisName.toLowerCase(), { id: item.id, name: item.name }]));

const workDir = await mkdtemp(join(tmpdir(), "ascencionro-monsters-"));
try {
  const archive = join(workDir, "rathena.tgz");
  const tarball = await fetchBuffer(`https://codeload.github.com/rathena/rathena/tar.gz/${REVISION}`);
  if (!tarball) throw new Error("No se pudo descargar la revisión pública de rAthena");
  await writeFile(archive, tarball);
  await run(process.platform === "win32" ? "tar.exe" : "tar", ["-xzf", archive, "-C", workDir]);

  const root = join(workDir, `rathena-${REVISION}`);
  const parsed = parseMobDatabase(await readFile(join(root, "db", "pre-re", "mob_db.yml"), "utf8"));
  const spawns = [];
  for (const file of await filesInside(join(root, "npc"))) {
    if (file.includes(`${join("npc", "re")}`) || file.includes("/npc/re/") || file.includes("\\npc\\re\\")) continue;
    const content = await readFile(file, "utf8");
    for (const line of content.split(/\r?\n/)) parseSpawnLine(line, spawns);
  }

  const mapsByMob = new Map();
  for (const spawn of spawns) {
    let byMap = mapsByMob.get(spawn.id);
    if (!byMap) { byMap = new Map(); mapsByMob.set(spawn.id, byMap); }
    const existing = byMap.get(spawn.map);
    if (existing) {
      existing.count += spawn.count;
      if (spawn.delay !== undefined) existing.delay = existing.delay === undefined ? spawn.delay : Math.min(existing.delay, spawn.delay);
    } else byMap.set(spawn.map, { count: spawn.count, delay: spawn.delay });
  }

  const monsters = [];
  for (const monster of parsed) {
    const maps = sortSpawns([...(mapsByMob.get(monster.id) ?? new Map()).entries()].map(([map, info]) => ({ map, count: info.count, delay: info.delay })));
    const drops = monster.drops
      .map(drop => {
        const item = aegisToItem.get(drop.item.toLowerCase());
        if (!item || !drop.rate) return null;
        return { id: item.id, name: item.name, rate: drop.rate, ...(drop.mvp ? { mvp: true } : {}) };
      })
      .filter(Boolean)
      .sort((left, right) => Number(Boolean(right.mvp)) - Number(Boolean(left.mvp)) || right.rate - left.rate || left.name.localeCompare(right.name));
    const mvp = Boolean(monster.MvpExp) || drops.some(drop => drop.mvp);
    // "Mini boss": monstruos con Class: Boss en rAthena (agresivos, inmunes a
    // status) que no son MVP verdaderos. Se excluyen del filtro de mejor
    // rendimiento para no mezclarlos con el farmeo normal de campo.
    const miniboss = monster.Class === "Boss" && !mvp;
    const race = monster.Race || "Formless";
    const element = monster.Element || "Neutral";
    monsters.push({
      id: monster.id,
      aegisName: monster.AegisName ?? "",
      name: monster.Name || monster.AegisName || `Monstruo ${monster.id}`,
      sprite: await spritePath(monster.id),
      level: monster.Level,
      hp: monster.Hp,
      baseExp: monster.BaseExp,
      jobExp: monster.JobExp,
      mvpExp: monster.MvpExp,
      attack: monster.Attack,
      attack2: monster.Attack2,
      defense: monster.Defense,
      magicDefense: monster.MagicDefense,
      str: monster.Str,
      agi: monster.Agi,
      vit: monster.Vit,
      int: monster.Int,
      dex: monster.Dex,
      luk: monster.Luk,
      attackRange: monster.AttackRange,
      size: monster.Size,
      race,
      element,
      elementLevel: monster.ElementLevel,
      walkSpeed: monster.WalkSpeed,
      className: monster.Class,
      mvp,
      miniboss,
      maps,
      drops,
    });
  }

  // rAthena reutiliza el mismo mob_db para objetos y guardianes de WoE, mobs de
  // eventos de temporada y duplicados exclusivos de instancia/quest (prefijos
  // G_, EM_, EVENT_, R_, etc.). Sin drops ni un spawn de campo real no son
  // monstruos que un jugador vaya a buscar en la enciclopedia.
  const playable = monsters.filter(monster => monster.drops.length > 0 || monster.maps.length > 0);
  playable.sort((left, right) => left.id - right.id);
  const raceCounts = {};
  const elementCounts = {};
  for (const monster of playable) {
    raceCounts[monster.race] = (raceCounts[monster.race] ?? 0) + 1;
    elementCounts[monster.element] = (elementCounts[monster.element] ?? 0) + 1;
  }
  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const file of await readdir(OUTPUT_DIR)) {
    if (/^chunk-\d+\.json$/.test(file)) await rm(new URL(file, OUTPUT_DIR));
  }
  const indexItems = [];
  for (let start = 0; start < playable.length; start += CHUNK_SIZE) {
    const chunkNumber = start / CHUNK_SIZE;
    const chunkItems = playable.slice(start, start + CHUNK_SIZE);
    await writeFile(new URL(`chunk-${String(chunkNumber).padStart(3, "0")}.json`, OUTPUT_DIR), JSON.stringify({ items: chunkItems }), "utf8");
    for (const monster of chunkItems) {
      indexItems.push({
        id: monster.id,
        name: monster.name,
        aegisName: monster.aegisName,
        sprite: monster.sprite,
        level: monster.level,
        hp: monster.hp,
        baseExp: monster.baseExp,
        jobExp: monster.jobExp,
        race: monster.race,
        element: monster.element,
        elementLevel: monster.elementLevel,
        size: monster.size,
        mvp: monster.mvp || undefined,
        miniboss: monster.miniboss || undefined,
        maps: monster.maps.length,
        drops: monster.drops.length,
        chunk: chunkNumber,
      });
    }
  }

  await writeFile(CATALOG_PATH, JSON.stringify({
    meta: {
      title: "AscencionRO · Monstruos Pre-Renewal",
      count: playable.length,
      revision: REVISION,
      snapshotDate: SNAPSHOT_DATE,
      source: "rAthena db/pre-re/mob_db.yml + npc spawn scripts",
      sourceUrl: `https://github.com/rathena/rathena/tree/${REVISION}/db/pre-re`,
      chunks: Math.ceil(playable.length / CHUNK_SIZE),
      raceCounts,
      elementCounts,
    },
    items: indexItems,
  }), "utf8");

  console.log(`Catálogo de monstruos: ${playable.length} fichas en ${Math.ceil(playable.length / CHUNK_SIZE)} bloques (${monsters.length - playable.length} sin drop ni spawn de campo descartados).`);
} finally {
  await rm(workDir, { recursive: true, force: true });
}
