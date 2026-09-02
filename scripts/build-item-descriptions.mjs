import { readFile, writeFile } from "node:fs/promises";
import { argv } from "node:process";

const SOURCE_PATH = new URL("../data/iteminfo/itemInfo.lua", import.meta.url);
const META_PATH = new URL("../public/data/item-descriptions-meta.json", import.meta.url);
const INDEX_PATH = new URL("../public/data/items-index.json", import.meta.url);
export const DESCRIPTION_REVISION = "66cdfec631603fda6a90ba4bbe26ab07b5204c84";
export const DESCRIPTION_SNAPSHOT_DATE = "2026-08-05";
export const DESCRIPTION_SOURCE = "llchrisll/ROenglishRE Pre-Renewal itemInfo.lua";
export const DESCRIPTION_SOURCE_URL = `https://github.com/llchrisll/ROenglishRE/blob/${DESCRIPTION_REVISION}/Translation/Pre-Renewal/SystemEN/LuaFiles514/itemInfo.lua`;

function unescapeLua(value) {
  return value.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

// El cliente de RO escribe el mismo valor de "Class:"/"Compound on:" de
// varias formas según el item ("Twohand Sword", "Two Handed Sword", "Two-
// handed Sword"...). Se normaliza a una sola forma correcta para que la
// ficha no muestre redacciones distintas para el mismo tipo de arma/slot.
const FIELD_VALUE_FIXES = {
  "Accessories": "Accessory",
  "Head Gear": "Headgear",
  "One Handed Axe": "One-Handed Axe",
  "One handed Staff": "One-Handed Staff",
  "One-Hand Sword": "One-Handed Sword",
  "One-handed Sword": "One-Handed Sword",
  "Onehand Sword": "One-Handed Sword",
  "Onehand Spear": "One-Handed Spear",
  "Two Handed Sword": "Two-Handed Sword",
  "Two-handed Sword": "Two-Handed Sword",
  "Twohand Sword": "Two-Handed Sword",
  "Taming item": "Taming Item",
};

function normalizeFieldLine(line) {
  const match = line.match(/^(Class|Compound on):\s*(.+)$/);
  if (!match) return line;
  const value = match[2].trim();
  return `${match[1]}: ${FIELD_VALUE_FIXES[value] ?? value}`;
}

function cleanLine(value) {
  const stripped = unescapeLua(value).replace(/\^[0-9A-Fa-f]{6}/g, "").replace(/[ \t]+$/g, "").replace(/(\S)\s+:\s+/g, "$1: ");
  if (/^_+$/.test(stripped)) return "";
  return normalizeFieldLine(stripped);
}

function usableDescription(lines) {
  const text = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!text || text === "..." || text === ".") return "";
  if (/^Unknown Item, can be identified by using a Magnifier\.?$/i.test(text)) return "";
  return text;
}

export function parseItemInfoLua(text) {
  const descriptions = new Map();
  const startRe = /\[(\d+)\]\s*=\s*\{/g;
  let match;
  while ((match = startRe.exec(text))) {
    const id = Number(match[1]);
    const from = match.index + match[0].length;
    const nextItem = text.indexOf("\n\t[", from);
    const body = text.slice(from, nextItem === -1 ? text.length : nextItem);
    const descBlock = body.match(/\bidentifiedDescriptionName\s*=\s*\{([\s\S]*?)\}/);
    if (!descBlock) continue;
    const lines = [];
    const stringRe = /"((?:\\.|[^"\\])*)"/g;
    let stringMatch;
    while ((stringMatch = stringRe.exec(descBlock[1]))) lines.push(cleanLine(stringMatch[1]));
    const description = usableDescription(lines);
    if (description) descriptions.set(id, description);
  }
  return descriptions;
}

export async function loadItemDescriptions() {
  try {
    return parseItemInfoLua(await readFile(SOURCE_PATH, "utf8"));
  } catch {
    return new Map();
  }
}

function descriptionMeta(descriptions, catalogIds = []) {
  const matched = catalogIds.filter((id) => descriptions.has(id)).length;
  return {
    title: "AscencionRO · Descripciones de cliente Pre-Renewal",
    source: DESCRIPTION_SOURCE,
    sourceUrl: DESCRIPTION_SOURCE_URL,
    revision: DESCRIPTION_REVISION,
    snapshotDate: DESCRIPTION_SNAPSHOT_DATE,
    entries: descriptions.size,
    catalogItems: catalogIds.length || undefined,
    matched: catalogIds.length ? matched : undefined,
    missing: catalogIds.length ? catalogIds.length - matched : undefined,
  };
}

const runningCli = /build-item-descriptions\.mjs$/i.test(argv[1] ?? "");
if (runningCli) {
  const descriptions = await loadItemDescriptions();
  let catalogIds = [];
  try {
    catalogIds = JSON.parse(await readFile(INDEX_PATH, "utf8")).items.map((item) => item.id);
  } catch { /* El recuento contra el catálogo espera a data:catalog. */ }
  const meta = descriptionMeta(descriptions, catalogIds);
  await writeFile(META_PATH, JSON.stringify({ meta }), "utf8");
  const catalogNote = catalogIds.length
    ? ` ${meta.matched} coinciden con el catálogo (${meta.missing} sin texto).`
    : "";
  console.log(`Descripciones extraídas: ${descriptions.size} textos.${catalogNote}`);
}
