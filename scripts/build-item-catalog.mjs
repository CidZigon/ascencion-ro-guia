import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

const SOURCE_DIR = new URL("../data/rathena/", import.meta.url);
const OUTPUT_DIR = new URL("../public/data/items/", import.meta.url);
const INDEX_PATH = new URL("../public/data/items-index.json", import.meta.url);
const REVISION = "e985006171d2eb320ee512a653f4c83aea3d81b6";
const SNAPSHOT_DATE = "2026-08-23";
const SOURCE_FILES = ["item_db_equip.yml", "item_db_usable.yml", "item_db_etc.yml"];
const CHUNK_SIZE = 400;

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

function parseNested(lines) {
  const result = {};
  for (const line of lines) {
    const match = line.match(/^\s{6}([A-Za-z][\w]*):(?:\s*(.*))?$/);
    if (match) result[match[1]] = match[2] ? scalar(match[2]) : true;
  }
  return result;
}

function parseItemDatabase(text, sourceFile) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const items = [];
  let current = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const itemStart = line.match(/^  - Id:\s*(\d+)\s*$/);
    if (itemStart) {
      if (current) items.push(current);
      current = { Id: Number(itemStart[1]), _source: sourceFile };
      continue;
    }
    if (!current) continue;

    const field = line.match(/^    ([A-Za-z][\w]*):(?:\s*(.*))?$/);
    if (!field) continue;
    const [, key, raw = ""] = field;

    if (raw === "|" || raw === "|-" || raw === ">" || raw === ">-") {
      const block = [];
      while (index + 1 < lines.length && !/^    [A-Za-z][\w]*:/.test(lines[index + 1]) && !/^  - Id:/.test(lines[index + 1])) {
        index += 1;
        block.push(lines[index].replace(/^ {6}/, ""));
      }
      current[key] = block.join("\n").trim();
      continue;
    }

    if (!raw) {
      const nested = [];
      while (index + 1 < lines.length && !/^    [A-Za-z][\w]*:/.test(lines[index + 1]) && !/^  - Id:/.test(lines[index + 1])) {
        index += 1;
        nested.push(lines[index]);
      }
      current[key] = parseNested(nested);
      continue;
    }

    current[key] = scalar(raw);
  }

  if (current) items.push(current);
  return items;
}

function trueKeys(value) {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).filter(([, enabled]) => enabled !== false).map(([key]) => key);
}

function compactMap(value) {
  if (!value || typeof value !== "object" || !Object.keys(value).length) return undefined;
  return value;
}

function detail(item) {
  return {
    id: item.Id,
    aegisName: item.AegisName ?? "",
    name: item.Name ?? item.AegisName ?? `Item ${item.Id}`,
    type: item.Type ?? "Etc",
    subType: item.SubType,
    buy: item.Buy,
    sell: item.Sell ?? (typeof item.Buy === "number" ? Math.floor(item.Buy / 2) : undefined),
    weight: item.Weight,
    attack: item.Attack,
    magicAttack: item.MagicAttack,
    defense: item.Defense,
    range: item.Range,
    slots: item.Slots,
    weaponLevel: item.WeaponLevel,
    armorLevel: item.ArmorLevel,
    equipLevelMin: item.EquipLevelMin,
    equipLevelMax: item.EquipLevelMax,
    refineable: item.Refineable === true,
    gradable: item.Gradable === true,
    view: item.View,
    gender: item.Gender,
    jobs: trueKeys(item.Jobs),
    classes: trueKeys(item.Classes),
    locations: trueKeys(item.Locations),
    flags: compactMap(item.Flags),
    trade: compactMap(item.Trade),
    script: item.Script,
    equipScript: item.EquipScript,
    unEquipScript: item.UnEquipScript,
    sourceFile: item._source,
  };
}

function indexEntry(item, chunk) {
  return {
    id: item.id,
    name: item.name,
    aegisName: item.aegisName,
    type: item.type,
    subType: item.subType,
    buy: item.buy,
    sell: item.sell,
    weight: item.weight,
    attack: item.attack,
    defense: item.defense,
    slots: item.slots,
    equipLevelMin: item.equipLevelMin,
    refineable: item.refineable || undefined,
    locations: item.locations.length ? item.locations : undefined,
    chunk,
  };
}

await mkdir(OUTPUT_DIR, { recursive: true });

const parsed = [];
for (const sourceFile of SOURCE_FILES) {
  const text = await readFile(new URL(sourceFile, SOURCE_DIR), "utf8");
  parsed.push(...parseItemDatabase(text, sourceFile));
}

const byId = new Map();
for (const item of parsed) byId.set(item.Id, detail(item));
const items = [...byId.values()].sort((left, right) => left.id - right.id);
const typeCounts = {};
for (const item of items) typeCounts[item.type] = (typeCounts[item.type] ?? 0) + 1;

const indexItems = [];
for (let start = 0; start < items.length; start += CHUNK_SIZE) {
  const chunkNumber = start / CHUNK_SIZE;
  const chunkItems = items.slice(start, start + CHUNK_SIZE);
  const filename = `chunk-${String(chunkNumber).padStart(3, "0")}.json`;
  await writeFile(new URL(filename, OUTPUT_DIR), JSON.stringify({ items: chunkItems }), "utf8");
  for (const item of chunkItems) indexItems.push(indexEntry(item, chunkNumber));
}

const catalog = {
  meta: {
    title: "BarrasRO · Catálogo local Pre-Renewal",
    count: items.length,
    revision: REVISION,
    snapshotDate: SNAPSHOT_DATE,
    source: "rAthena db/pre-re",
    sourceUrl: `https://github.com/rathena/rathena/tree/${REVISION}/db/pre-re`,
    files: SOURCE_FILES.map((file) => basename(file)),
    chunks: Math.ceil(items.length / CHUNK_SIZE),
    typeCounts,
  },
  items: indexItems,
};

await writeFile(INDEX_PATH, JSON.stringify(catalog), "utf8");
console.log(`Catálogo generado: ${items.length} objetos en ${catalog.meta.chunks} bloques.`);
