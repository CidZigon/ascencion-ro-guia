import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const REVISION = "e985006171d2eb320ee512a653f4c83aea3d81b6";
const INDEX_PATH = new URL("../public/data/items-index.json", import.meta.url);
const OUTPUT_DIR = new URL("../public/data/item-sources/", import.meta.url);
const META_PATH = new URL("../public/data/item-sources-meta.json", import.meta.url);
const MAX_MAPS = 8;

function rankMap(map) {
  if (/^(?:\d+@|sec_|event|test|g_room|new_)/i.test(map)) return 4;
  if (/_fild/i.test(map)) return 0;
  if (/_dun/i.test(map)) return 1;
  if (/_in/i.test(map)) return 3;
  return 2;
}

function sortMaps(maps) {
  return [...maps].sort((left, right) => rankMap(left) - rankMap(right) || left.localeCompare(right));
}

function rankShopMap(map) {
  if (/^(?:\d+@|sec_|event|test|g_room|new_)/i.test(map)) return 4;
  if (/_dun/i.test(map)) return 3;
  if (/_fild/i.test(map)) return 2;
  return 0;
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
      const response = await fetch(url, { headers: { "user-agent": "AscencionRO local item sources" } });
      if (response.ok) return Buffer.from(await response.arrayBuffer());
    } catch { /* Reintenta la descarga pública. */ }
    await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
  }
  return null;
}

function shopName(value) {
  return value.replace(/#[^#]*$/, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

const GETITEM = /\bgetitem2?\s+([A-Za-z0-9_]+)\s*,\s*(-?\d+)/i;

function parseMobDatabase(text) {
  const monsters = [];
  let current = null;
  let dropList = null;
  let drop = null;

  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const idMatch = raw.match(/^ {2}- Id:\s*(\d+)\s*$/);
    if (idMatch) {
      if (current) monsters.push(current);
      current = { id: Number(idMatch[1]), name: "", aegisName: "", drops: [] };
      dropList = null;
      drop = null;
      continue;
    }
    if (!current) continue;

    const aegis = raw.match(/^ {4}AegisName:\s*(\S+)\s*$/);
    if (aegis) { current.aegisName = aegis[1]; continue; }
    const name = raw.match(/^ {4}Name:\s*(.+?)\s*$/);
    if (name) { current.name = name[1]; continue; }
    if (/^ {4}Drops:\s*$/.test(raw)) { dropList = "drop"; drop = null; continue; }
    if (/^ {4}MvpDrops:\s*$/.test(raw)) { dropList = "mvp"; drop = null; continue; }
    if (/^ {4}[A-Za-z]/.test(raw)) { dropList = null; drop = null; continue; }

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

function parseNpcFile(content, shops, spawns, quests) {
  // getitem vive dentro del cuerpo de un script NPC, varias líneas después de
  // su encabezado. Se recuerda el último encabezado visto (mapa, coordenadas
  // y nombre) y se le atribuye cualquier getitem hasta el siguiente NPC.
  let current = null;
  for (const line of content.split(/\r?\n/)) {
    if (!line || /^\s*\/\//.test(line) || line.startsWith("-")) continue;
    const fields = line.split("\t").map(field => field.trim()).filter(Boolean);
    const header = fields[0]?.match(/^([a-z0-9@_]+),(\d+),(\d+)(?:,\d+){0,2}$/i);
    if (header && header[1] !== "-" && fields.length >= 3) {
      const kind = fields[1]?.toLowerCase();
      if (kind === "shop" || kind === "cashshop") {
        current = null;
        const inventory = fields[3] || "";
        const comma = inventory.indexOf(",");
        if (comma < 0) continue;
        const items = inventory.slice(comma + 1);
        for (const entry of items.split(",")) {
          const match = entry.trim().match(/^(\d+):(-?\d+)(?::\d+)?$/);
          if (!match) continue;
          shops.push({
            itemId: Number(match[1]),
            name: shopName(fields[2] || "Tienda"),
            map: header[1],
            x: Number(header[2]),
            y: Number(header[3]),
            price: Number(match[2]),
            cash: kind === "cashshop",
          });
        }
        continue;
      }
      if (kind === "monster" || kind === "boss_monster") {
        current = null;
        const mob = (fields[3] || "").match(/^(\d+),/);
        if (mob) spawns.push({ map: header[1], id: Number(mob[1]) });
        continue;
      }
      if (kind === "script") {
        current = { map: header[1], x: Number(header[2]), y: Number(header[3]), name: shopName(fields[2] || "NPC") };
        continue;
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const getitem = line.match(GETITEM);
    if (getitem && Number(getitem[2]) > 0) quests.push({ itemRef: getitem[1], ...current });
  }
}

function addDrop(byItem, itemId, monster, drop, maps) {
  const entry = byItem.get(itemId) ?? { drops: [], shops: [], quests: [] };
  if (!entry.drops.some(item => item.id === monster.id && item.mvp === drop.mvp)) {
    entry.drops.push({
      id: monster.id,
      name: monster.name || monster.aegisName,
      rate: drop.rate,
      ...(drop.mvp ? { mvp: true } : {}),
      maps: sortMaps(maps).slice(0, MAX_MAPS),
    });
  }
  byItem.set(itemId, entry);
}

function addShop(byItem, shop) {
  const entry = byItem.get(shop.itemId) ?? { drops: [], shops: [], quests: [] };
  if (!entry.shops.some(item => item.name === shop.name && item.map === shop.map && item.x === shop.x && item.y === shop.y)) {
    entry.shops.push({
      name: shop.name,
      map: shop.map,
      x: shop.x,
      y: shop.y,
      price: shop.price,
      ...(shop.cash ? { cash: true } : {}),
    });
  }
  byItem.set(shop.itemId, entry);
}

function addQuest(byItem, itemId, quest) {
  const entry = byItem.get(itemId) ?? { drops: [], shops: [], quests: [] };
  if (!entry.quests.some(item => item.name === quest.name && item.map === quest.map && item.x === quest.x && item.y === quest.y)) {
    entry.quests.push({ name: quest.name, map: quest.map, x: quest.x, y: quest.y });
  }
  byItem.set(itemId, entry);
}

const catalog = JSON.parse(await readFile(INDEX_PATH, "utf8"));
const aegisToId = new Map(catalog.items.map(item => [item.aegisName.toLowerCase(), item.id]));
const chunkByItem = new Map(catalog.items.map(item => [item.id, item.chunk]));

const workDir = await mkdtemp(join(tmpdir(), "ascencionro-sources-"));
try {
  const archive = join(workDir, "rathena.tgz");
  const tarball = await fetchBuffer(`https://codeload.github.com/rathena/rathena/tar.gz/${REVISION}`);
  if (!tarball) throw new Error("No se pudo descargar la revisión pública de rAthena");
  await writeFile(archive, tarball);
  await run(process.platform === "win32" ? "tar.exe" : "tar", ["-xzf", archive, "-C", workDir]);

  const root = join(workDir, `rathena-${REVISION}`);
  const mobText = await readFile(join(root, "db", "pre-re", "mob_db.yml"), "utf8");
  const monsters = parseMobDatabase(mobText);

  const shops = [];
  const spawns = [];
  const questItems = [];
  for (const file of await filesInside(join(root, "npc"))) {
    if (file.includes(`${join("npc", "re")}`) || file.includes("/npc/re/") || file.includes("\\npc\\re\\")) continue;
    const content = await readFile(file, "utf8");
    parseNpcFile(content, shops, spawns, questItems);
  }

  const mapsByMob = new Map();
  for (const spawn of spawns) {
    const list = mapsByMob.get(spawn.id) ?? [];
    if (!list.includes(spawn.map)) list.push(spawn.map);
    mapsByMob.set(spawn.id, list);
  }

  const byItem = new Map();
  let dropLinks = 0;
  for (const monster of monsters) {
    const maps = mapsByMob.get(monster.id) ?? [];
    for (const drop of monster.drops) {
      const itemId = aegisToId.get(drop.item.toLowerCase());
      if (!itemId || !drop.rate) continue;
      addDrop(byItem, itemId, monster, drop, maps);
      dropLinks++;
    }
  }
  for (const shop of shops) {
    if (!chunkByItem.has(shop.itemId)) continue;
    addShop(byItem, shop);
  }
  let questLinks = 0;
  for (const quest of questItems) {
    const itemId = /^\d+$/.test(quest.itemRef) ? Number(quest.itemRef) : aegisToId.get(quest.itemRef.toLowerCase());
    if (!itemId || !chunkByItem.has(itemId)) continue;
    addQuest(byItem, itemId, quest);
    questLinks++;
  }

  // El equipo de recompensa de Battleground/WoE (prefijos BF_/Krieger_ en
  // rAthena) se compra con un NPC de puntos que arma el ítem por script
  // (callsub + variable), algo que un rastreo de getitem literal no puede
  // resolver. El prefijo es una convención estable en todo rAthena, así que
  // se marca a mano en vez de dejarlo pasar por "sin fuente conocida".
  const BG_WOE_PREFIX = /^(?:BF_|Krieger_)/;
  let bgWoeLinks = 0;
  for (const item of catalog.items) {
    if (!BG_WOE_PREFIX.test(item.aegisName)) continue;
    addQuest(byItem, item.id, { name: "Recompensa de Battleground / WoE", map: null });
    bgWoeLinks++;
  }

  function compareQuests(left, right) {
    if (!left.map && !right.map) return left.name.localeCompare(right.name);
    if (!left.map) return 1;
    if (!right.map) return -1;
    return rankShopMap(left.map) - rankShopMap(right.map) || left.map.localeCompare(right.map) || left.name.localeCompare(right.name);
  }
  for (const entry of byItem.values()) {
    entry.drops.sort((left, right) => Number(Boolean(right.mvp)) - Number(Boolean(left.mvp)) || right.rate - left.rate || left.name.localeCompare(right.name));
    entry.shops.sort((left, right) => rankShopMap(left.map) - rankShopMap(right.map) || left.map.localeCompare(right.map) || left.name.localeCompare(right.name));
    entry.quests.sort(compareQuests);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const chunkCount = catalog.meta.chunks;
  let sourcedItems = 0;
  for (let chunk = 0; chunk < chunkCount; chunk++) {
    const items = {};
    for (const [itemId, entry] of byItem) {
      if (chunkByItem.get(itemId) !== chunk) continue;
      items[itemId] = entry;
      sourcedItems++;
    }
    await writeFile(new URL(`chunk-${String(chunk).padStart(3, "0")}.json`, OUTPUT_DIR), JSON.stringify({ items }), "utf8");
  }

  await writeFile(META_PATH, JSON.stringify({
    revision: REVISION,
    source: "rAthena db/pre-re/mob_db.yml + npc shops Pre-Renewal",
    items: sourcedItems,
    dropLinks,
    shopLinks: shops.filter(shop => chunkByItem.has(shop.itemId)).length,
    questLinks,
    bgWoeLinks,
    chunks: chunkCount,
  }), "utf8");

  console.log(`Fuentes generadas: ${sourcedItems} objetos, ${dropLinks} drops, ${shops.length} filas de tienda, ${questLinks} recompensas de quest, ${bgWoeLinks} de Battleground/WoE.`);
} finally {
  await rm(workDir, { recursive: true, force: true });
}
