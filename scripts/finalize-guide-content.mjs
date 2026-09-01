import { readFile, writeFile } from "node:fs/promises";

// Mismas traducciones que usa el catálogo de Monstruos (app/i18n.ts) — para que
// Endless Tower muestre raza/elemento/tamaño con el mismo texto en vez de una
// traducción manual aparte que se desincroniza (ej. "Amorfo" vs "Sin forma").
const RACE_ES = { Formless: "Sin forma", Undead: "No muerto", Brute: "Bruto", Plant: "Planta", Insect: "Insecto", Fish: "Pez", Demon: "Demonio", Demihuman: "Humanoide", Angel: "Ángel", Dragon: "Dragón" };
const ELEMENT_ES = { Neutral: "Neutral", Water: "Agua", Earth: "Tierra", Fire: "Fuego", Wind: "Viento", Poison: "Veneno", Holy: "Sagrado", Dark: "Oscuro", Ghost: "Fantasma", Undead: "No muerto" };
const SIZE_ES = { Small: "Pequeño", Medium: "Mediano", Large: "Grande" };
const monstersById = await (async () => {
  try {
    const catalog = JSON.parse(await readFile(new URL("../public/data/monsters-index.json", import.meta.url), "utf8"));
    return new Map(catalog.items.map(m => [m.id, m]));
  } catch {
    return new Map(); // Se regenera después en data:build; sin datos, la sección 7 conserva su texto original.
  }
})();

const moduleNames = new Map([
  [1, "Progresión y EXP"],
  [2, "Accesos y dungeons"],
  [3, "Historias y lore"],
  [4, "Aventuras regionales"],
  [5, "Jobs y habilidades"],
  [6, "Equipo y fabricación"],
  [7, "Endless Tower"],
  [8, "Compañeros"],
]);

const headings = new Map([
  [1, '<h1>EXP &amp; Leveling</h1>'],
  [2, '<h1>Ragnarok Online Pre-Renewal<br/><span style="color:var(--gold)">Access Quests</span></h1>'],
  [3, '<h1>Ragnarok Online Pre-Renewal<br/><span style="color:var(--gold)">Historias resumidas</span></h1>'],
  [4, '<h1>Ragnarok Online Pre-Renewal<br/><span style="color:var(--gold)">Aventuras regionales</span></h1>'],
  [5, '<h1>Ragnarok Online Pre-Renewal<br/><span style="color:var(--gold)">Job Change y habilidades</span></h1>'],
  [6, '<h1>Ragnarok Online Pre-Renewal<br/><span style="color:var(--gold)">Enciclopedia de Equipment &amp; Crafting</span></h1>'],
  [7, '<h1>Ragnarok Online Pre-Renewal<br/><span class="gold">Endless Tower</span></h1>'],
  [8, '<h1>🐾 Minions &amp;<br/><span style="color:var(--gold)">Compañeros</span></h1>'],
]);

const removedSections = new Map([
  [1, ["fuentes"]],
  [2, ["fuentes"]],
  [3, ["fuentes"]],
  [4, ["fuentes"]],
  [5, ["fuentes"]],
  [6, ["metodologia"]],
  [7, ["fuentes"]],
  [8, ["limites", "fuentes"]],
]);

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function removeSection(html, id) {
  const opener = new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i").exec(html);
  if (!opener) return html;
  const tag = /<section\b[^>]*>|<\/section\s*>/gi;
  tag.lastIndex = opener.index + opener[0].length;
  let depth = 1;
  let match;
  while ((match = tag.exec(html))) {
    depth += /^<section\b/i.test(match[0]) ? 1 : -1;
    if (depth === 0) return html.slice(0, opener.index) + html.slice(tag.lastIndex);
  }
  throw new Error(`No se encontró el cierre de la sección #${id}`);
}

function cleanModuleReferences(value) {
  let result = value;
  for (const [id, name] of moduleNames) {
    result = result
      .replace(new RegExp(`\\bdel\\s+m[oó]dulo\\s*0?${id}\\b`, "gi"), `de ${name}`)
      .replace(new RegExp(`\\ben\\s+el\\s+m[oó]dulo\\s*0?${id}\\b`, "gi"), `en ${name}`)
      .replace(new RegExp(`\\bal\\s+m[oó]dulo\\s*0?${id}\\b`, "gi"), `a ${name}`)
      .replace(new RegExp(`\\bm[oó]dulo\\s*0?${id}\\b`, "gi"), name);
  }
  return result.replace(/\bm[oó]dulos\b/gi, "secciones").replace(/\bm[oó]dulo\b/gi, "sección");
}

function cleanPlainText(value) {
  if (!value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  let result = cleanModuleReferences(value.trim())
    .replace(/\bEntregable oficial\s*[·—-]?\s*/gi, "")
    .replace(/\bVersi[oó]n final entregable\.?\s*/gi, "")
    .replace(/\bEntregable final aprobado[^.]*\.?\s*/gi, "")
    .replace(/\s*[·—-]?\s*(?:release\s+estable|release)(?:\s*[·—-]\s*\d{4}-\d{2}-\d{2})?/gi, "")
    .replace(/\s*[·—-]?\s*v\d+(?:\.\d+)+/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s*[·—-]\s*/, "")
    .trim();
  return result ? `${leading}${result}${trailing}` : "";
}

function cleanTextNodes(html) {
  const protectedBlocks = [];
  let output = html.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, block => {
    const index = protectedBlocks.push(block) - 1;
    return `<x-finalize-block data-index="${index}"></x-finalize-block>`;
  });
  output = output.replace(/(^|>)([^<]+)(?=<|$)/g, (_match, prefix, text) => `${prefix}${cleanPlainText(text)}`);
  return output.replace(/<x-finalize-block data-index="(\d+)"><\/x-finalize-block>/g, (_match, index) => protectedBlocks[Number(index)]);
}

/* Las tarjetas de Endless Tower traían raza/elemento/tamaño escritos a mano,
   con traducciones que se desincronizaron del catálogo de Monstruos (ej.
   "Amorfo"/"Bruto-Animal"/"Semihumano" en vez de "Sin forma"/"Bruto"/
   "Humanoide"). Se reemplazan por los mismos datos y el mismo texto que ya
   usa el catálogo, por ID. Si un ID no está en el catálogo (variante de
   evento ya filtrada del bestiario), se deja la tarjeta como estaba. */
/* La tabla-resumen de bosses por piso repite las mismas razas con la misma
   terminología desincronizada, pero ahí no hay un ID por celda para resolver
   por catálogo (varios bosses comparten fila) — se corrige el texto suelto. */
function fixEndlessTowerRaceLabels(html) {
  return html
    .replaceAll("Amorfo", "Sin forma")
    .replaceAll("Bruto/Animal", "Bruto")
    .replaceAll("Semihumano", "Humanoide")
    .replaceAll("No-muerto", "No muerto");
}

function fixEndlessTowerMonsterMeta(html) {
  return html.replace(/<div class="mobmeta">[\s\S]*?<span class="id">ID (\d+)<\/span><\/div>/g, (match, idText) => {
    const monster = monstersById.get(Number(idText));
    if (!monster) return match;
    const race = RACE_ES[monster.race] ?? monster.race;
    const element = `${ELEMENT_ES[monster.element] ?? monster.element}${monster.elementLevel ? ` ${monster.elementLevel}` : ""}`;
    const size = monster.size ? SIZE_ES[monster.size] ?? monster.size : null;
    return `<div class="mobmeta"><span>${element}</span><span>${race}</span>${size ? `<span>${size}</span>` : ""}<span class="id">ID ${idText}</span></div>`;
  });
}

/* Cada fila de la tabla de Cute Pets ya trae el "Mob ID" y los IDs de los
   ítems asociados (taming item, comida, accesorio) porque una mascota Pre-Re
   es directamente ese monstruo domesticado. Se agregan los sprites que ya
   existen en la caché local, sin depender de nada nuevo — y solo dentro de
   las filas de esa tabla, para no tocar otros "ID" del resto de la guía. */
/* Cada guía abre con una cuadrícula de estadísticas numéricas ("290 ítems
   únicos", "99 pisos auditados"...) que no ayuda a decidir qué hacer, solo
   repite un conteo. Se identifica por su forma: tarjetas con un número/dato
   corto en negrita y una etiqueta corta, sin más contenido dentro. Las
   tarjetas con explicaciones más largas (con <p>) no coinciden y se
   conservan, porque esas sí son contenido explicativo. */
function removeSummaryStatGrids(html) {
  return html.replace(/<div class="grid">(?:\s*<div class="card"><b(?: class="big")?>[^<]*<\/b>[^<]*<\/div>)+\s*<\/div>\s*/g, "");
}

function addPetSprites(html) {
  return html.replace(/<tr class="petrow searchable"[\s\S]*?<\/tr>/g, row => {
    let fixed = row.replace(/<span class="id">Mob ID (\d+)<\/span>/, (match, id) => {
      return `<img class="pet-sprite" src="/world/sprites/${id}.gif" alt="" loading="lazy" onerror="this.style.display='none'"/>${match}`;
    });
    fixed = fixed.replace(/>([A-Za-z][^<]*?) <span class="id">ID (\d+)<\/span>/g, (match, label, id) => {
      return `>${label} <img class="pet-item-sprite" src="/world/items/${id}.gif" alt="" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='/world/items/${id}.png'}else{this.style.display='none'}"/><span class="id">ID ${id}</span>`;
    });
    return fixed;
  });
}

function addEndlessTowerSprites(html) {
  return html.replace(/<div class="mobcard"><div class="mobname"><b>([^<]+)<\/b>([\s\S]*?)<\/div><div class="mobmeta">([\s\S]*?)<span class="id">ID\s+(\d+)<\/span>([\s\S]*?)<\/div><\/div>/g, (_match, name, nameTail, metaStart, id, metaEnd) => {
    const label = stripTags(name).replaceAll('"', "&quot;");
    return `<div class="mobcard"><img class="mob-sprite" src="/world/sprites/${id}.gif" alt="Sprite de ${label}" loading="lazy" width="72" height="72"/><div class="mobcard-copy"><div class="mobname"><b>${name}</b>${nameTail}</div><div class="mobmeta">${metaStart}<span class="id">ID ${id}</span>${metaEnd}</div></div></div>`;
  });
}

/* Solo Equipo y fabricación quedó con notas de control de calidad interno
   (insignia de procedencia de datos y enlaces de cita a fuentes externas) en
   cada uno de sus 290 ítems — no aportan nada a un jugador y ahora el propio
   catálogo de Objetos cubre esa información mejor. */
function removeEquipmentProvenanceNotes(html) {
  return html
    .replace(/<span class="ibadge rms">[^<]*<\/span>/g, "")
    .replace(/<div class="item-links">[\s\S]*?<\/div>/g, "")
    .replace(/<div class="route-links">[\s\S]*?<\/div>/g, "");
}

function addEquipmentSprites(html) {
  return html.replace(/<div class="item-name">#(\d+) · ([^<]*)<\/div>/g, (_match, id, label) => {
    return `<div class="item-name"><img class="item-name-sprite" src="/world/items/${id}.gif" alt="" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='/world/items/${id}.png'}else{this.style.display='none'}"/>#${id} · ${label}</div>`;
  });
}

/* Progresión y EXP enlaza 31 monstruos por nombre (a RateMyServer, localizado
   luego a la ficha interna por GuidePortal) pero nunca muestra su sprite en
   la propia tabla — hay que abrir la ficha para verlo. Se agrega un ícono
   junto al nombre, igual que ya tienen los catálogos de Objetos y Monstruos. */
function addMonsterLinkSprites(html) {
  return html.replace(/(<a class="moblink"[^>]*href="[^"]*mob_id=(\d+)[^"]*"[^>]*>)/g, (_match, tag, id) => {
    return `${tag}<img class="moblink-sprite" src="/world/sprites/${id}.gif" alt="" loading="lazy" onerror="this.style.display='none'"/>`;
  });
}

/* Fecha de compilación del contenido — un dato de gestión editorial, no algo
   que un jugador necesite para decidir si le conviene una quest. */
function removeContentDateBadge(html) {
  return html.replace(/<div class="badge">\d{2} [A-ZÁÉÍÓÚ]{3} \d{4}<\/div>\s*/g, "");
}

/* GuidePortal.tsx localiza en tiempo de ejecución los enlaces a RateMyServer
   (mapas, mobs) para que abran la ficha propia del sitio en vez de salir a
   una pestaña externa — pero el texto visible de varias guías se escribió
   antes de esa localización y todavía promete "abrir RMS". Se corrige para
   que el texto describa lo que realmente pasa al hacer clic. */
function fixStaleRmsClaims(html) {
  return html
    .replaceAll(" · RMS map", "")
    .replace(/Toca el nombre del mob para abrir su ficha de RMS\./, "Toca el nombre del mob para abrir su ficha local.")
    .replace(/📍 ubicación → RateMyServer Pre-Re/, "📍 ubicación → mapa local");
}

/* Esta nota de Compañeros hablaba en primera persona del plural ("nuestro
   servidor") como si el lector fuera parte del equipo que administra
   AscencionRO, y el reemplazo anterior nunca coincidía porque el texto real
   parte en dos por una etiqueta <b> intermedia. Se corrige el HTML completo. */
function fixCompanionClientNote(html) {
  return html.replace(
    /<p><b>Para nuestro servidor Pre-Renewal:<\/b> si usamos un cliente moderno, podemos conservar mecánicas Pre-Re y habilitar esta QoL\. Si usamos un cliente realmente antiguo, la AI Lua clásica no puede auto-feed; usar macros externos sería automatización de terceros\.<\/p>/,
    "<p><b>Compatibilidad de cliente:</b> con un cliente moderno pueden conservarse las mecánicas Pre-Renewal y habilitar auto-feed. En clientes antiguos, la AI Lua clásica no puede alimentar automáticamente; las macros externas se consideran automatización de terceros.</p>",
  );
}

function removeMetaElements(html) {
  const metaLabel = /m[oó]dulo\s*\d|release|entregable|auditor[ií]a|control de versi[oó]n|alcance editorial|fuentes\s*\/\s*l[ií]mites|contenido avanzado absorbido/i;
  const blocks = [
    /<div\b([^>]*\bclass=["'][^"']*(?:badge|release-badge|release-note|eyebrow)[^"']*["'][^>]*)>([\s\S]*?)<\/div>/gi,
    /<span\b([^>]*\bclass=["'][^"']*(?:badge|release-badge|release-note|eyebrow)[^"']*["'][^>]*)>([\s\S]*?)<\/span>/gi,
  ];
  let output = html;
  for (const pattern of blocks) output = output.replace(pattern, (match, _attrs, body) => metaLabel.test(stripTags(body)) ? "" : match);
  output = output.replace(/<(p|div)\b([^>]*\bclass=["'][^"']*\baudit\b[^"']*["'][^>]*)>[\s\S]*?<\/\1>/gi, "");
  output = output.replace(/<p\b([^>]*\bclass=["'][^"']*\brelease-note\b[^"']*["'][^>]*)>[\s\S]*?<\/p>/gi, "");
  return output;
}

function applyPlayerFacingRewrites(html) {
  const replacements = [
    ["18</b>rutas MVP auditadas", "18</b>accesos con MVP"],
    ["Auditoría especial", "Accesos especiales"],
    ["<strong>🧭 Cómo usar Módulo 2</strong>", "<strong>🧭 Cómo encontrar un acceso</strong>"],
    ["<strong>📖 Cómo leer Módulo 3</strong>", "<strong>📖 Cómo leer estas historias</strong>"],
    ["🎮 Vivir esta historia en Módulo 2", "🎮 Abrir la ruta jugable"],
    ["<strong>🧭 Cómo usar Módulo 4</strong>", "<strong>🧭 Cómo explorar estas aventuras</strong>"],
    ["<div class=\"eyebrow\">Contenido avanzado absorbido de Módulo 9</div>", "<div class=\"eyebrow\">Crafting avanzado</div>"],
    ["Contenido avanzado absorbido de Módulo 9", "Crafting avanzado"],
    ["Contenido avanzado absorbido de sección 9", "Crafting avanzado"],
    ["Aquí solo entra la parte avanzada que termina en <b>crear equipment</b>: progreso de Seals, God Item Creation, materiales de castillos y Okolnir. Estrategia WoE y Endless Tower permanecen fuera de Módulo 6.", "Aquí encontrarás las rutas que terminan en <b>crear equipment</b>: progreso de Seals, God Item Creation, materiales de castillos y Okolnir."],
    ["Aquí solo entra la parte avanzada que termina en crear equipment : progreso de Seals, God Item Creation, materiales de castillos y Okolnir. Estrategia WoE y Endless Tower permanecen fuera de Módulo 6.", "Rutas para crear equipment: progreso de Seals, God Item Creation, materiales de castillos y Okolnir."],
    ["Aquí solo entra la parte avanzada que termina en crear equipment : progreso de Seals, God Item Creation, materiales de castillos y Okolnir. Estrategia WoE y Endless Tower permanecen fuera de Equipo y fabricación.", "Rutas para crear equipment: progreso de Seals, God Item Creation, materiales de castillos y Okolnir."],
    ["<div class=\"recommended\"><b>✅ Versión final entregable de Módulo 8.</b> Incluye Mercenarios, Homúnculos clásicos y Cute Pets Pre-Renewal, con builds, materiales, stats/percentiles, consumibles, AI y bonus pasivos Loyal traducidos.</div>", "<div class=\"recommended\"><b>✅ Tres sistemas completos.</b> Mercenarios, Homúnculos clásicos y Cute Pets Pre-Renewal con builds, materiales, estadísticas, consumibles, AI y bonus pasivos.</div>"],
    ["<div class=\"callout\"><b>Estructura de Módulo 8:</b>", "<div class=\"callout\"><b>Diferencias rápidas:</b>"],
    ["<div class=\"warning\"><b>Corte histórico:</b> Homunculus S queda fuera. Esta módulo se limita al sistema clásico anterior a 14.1 y mantiene el corte general del proyecto en ≤ Episode 13.2.</div>", "<div class=\"warning\"><b>Compatibilidad:</b> Homunculus S pertenece a Episode 14.1+; el contenido Pre-Renewal ≤13.2 utiliza Amistr, Filir, Lif y Vanilmirth clásicos.</div>"],
    ["<div class=\"eyebrow\">v10.1 · Optimización</div>", "<div class=\"eyebrow\">Builds recomendadas</div>"],
    ["<div class=\"eyebrow\">Sistema 3 · Reordenado v10.2</div>", "<div class=\"eyebrow\">Sistema 3</div>"],
    ["<div class=\"warning\"><b>Auditoría rAthena actual:</b> <code>npc/other/mercenary_rent.txt</code> instancia <b>Mercenary Manager#Spear</b> en Prontera (41,337) y <b>Mercenary Manager#Bow</b> en Payon Archer Village (99,167). El mismo script define el tipo Sword y un switch GM en Izlude, pero no instancia allí un <code>Mercenary Manager#Sword</code> ni <code>Mercenary Merchant#Sword</code>. En nuestro servidor habrá que revisar/restaurar esa entrada si queremos los tres guilds accesibles.</div>", "<div class=\"warning\"><b>Ubicaciones disponibles:</b> Spear Mercenary Manager está en Prontera (41,337) y Bow Mercenary Manager en Payon Archer Village (99,167). La variante Sword puede no estar disponible; consulta los servicios habilitados en AscencionRO antes de reunir Loyalty para ese gremio.</div>"],
    ["Auditoría rAthena actual:", "Ubicaciones disponibles:"],
    ["En nuestro servidor habrá que revisar/restaurar esa entrada si queremos los tres guilds accesibles.", "La variante Sword puede no estar disponible; consulta los servicios habilitados en AscencionRO antes de reunir Loyalty para ese gremio."],
    ["Para nuestro proyecto lo considero útil para QA en cuentas de prueba y carga del servidor, no como sustituto del AI nativo de companions.", "No sustituye la AI nativa de los companions y su uso debe respetar las reglas de AscencionRO."],
    ["Se incluye aquí porque su <b>acceso sí está restringido por una quest/instancia</b>. La estrategia piso por piso se reservará para contenido avanzado; Módulo 2 solo necesita enseñarte a entrar correctamente.", "Su <b>acceso está restringido por una quest/instancia</b>. Esta sección explica cómo entrar correctamente; la estrategia piso por piso está disponible en Endless Tower."],
    ["Esta quest se incluye aquí porque es un requisito real de", "Esta quest es un requisito de"],
    ["No es una quest permanente, pero sí una barrera real de acceso y por eso se conserva en Módulo 2.", "No es una quest permanente: funciona como una barrera real de acceso."],
    ["Esta zona tiene dos implementaciones históricas. La guía muestra ambas para que un jugador privado no crea que su servidor está «roto».", "Esta zona puede usar dos implementaciones históricas según el servidor. Revisa cuál está habilitada antes de comenzar."],
    ["La ruta más larga de Módulo 2. Todas las quests necesarias están dentro de esta misma zona y cada referencia es clicable.", "Esta es la ruta de acceso más larga. Todas las quests necesarias están dentro de esta zona y cada referencia es clicable."],
    ["MVPs de acceso libre como Ifrit, Valkyrie Randgris, Tao Gunka, Drake, Osiris, etc. no necesitan una access quest específica y por eso no aparecen como “faltantes”. Endless Tower se reserva para contenido avanzado/instancias: contiene muchos MVPs, pero no es la quest de acceso natural a cada uno.", "MVPs de acceso libre como Ifrit, Valkyrie Randgris, Tao Gunka, Drake y Osiris no requieren una quest previa. Endless Tower reúne numerosos MVPs, pero su acceso se explica como una instancia independiente."],
    ["📅 Compatibilidad con nuestro alcance", "📅 Compatibilidad Pre-Renewal"],
    ["no pertenecen a este alcance", "se introdujeron en episodios posteriores"],
    ["Optimización ⚔️ Mercenarios", "Builds recomendadas ⚔️ Mercenarios"],
    ["Fuente del efecto: cada descripción anterior se tradujo directamente desde el Script de db/pre-re/pet_db.yml usando la semántica de doc/item_bonus.txt . El script raw permanece oculto dentro de cada fila para poder auditarlo sin ensuciar la lectura.", "Los efectos mostrados provienen de db/pre-re/pet_db.yml y se interpretan con la semántica de doc/item_bonus.txt."],
    ["Herramientas de administrador rAthena: para QA existen comandos como @homstats y @homshuffle . @homshuffle recalcula el crecimiento como si subiera nuevamente desde Lv1, por lo que debe permanecer GM-only; es excelente para probar la distribución de stats, pero rompería la progresión si se entrega a jugadores.", ""],
    ["La estrategia del dungeon no se desarrolla aquí: Equipo y fabricación conserva únicamente lo necesario para entender y completar la creación del equipment.", ""],
    ["La estrategia del dungeon no se desarrolla aquí: Módulo 6 conserva únicamente lo necesario para entender y completar la creación del equipment.", ""],
    ["Contenido deliberadamente fuera: WoE Point System se excluye porque iRO Classic lo marca como específico de iRO y actualmente no implementado. Endless Tower también permanece fuera porque no es un sistema de crafting.", ""],
  ];
  let output = html;
  for (const [from, to] of replacements) output = output.replaceAll(from, to);
  output = output
    .replace(/<p>La estrategia del dungeon no se desarrolla aquí:[\s\S]*?<\/p>/gi, "")
    .replace(/<div class=["']warn-note["']><b>Contenido deliberadamente fuera:<\/b>[\s\S]*?<\/div>/gi, "")
    .replace(/cada ficha usa el ID exacto del item DB Pre-Renewal de rAthena\s+y enlaza al mismo ID en RateMyServer Pre-Re\.\s+Esto evita confundir/, "cada ficha usa el ID exacto del item DB Pre-Renewal de rAthena, visible junto a su nombre. Esto evita confundir");
  return output;
}

function finalizeModule(html, id) {
  let output = applyPlayerFacingRewrites(html);
  for (const section of removedSections.get(id) ?? []) output = removeSection(output, section);
  output = output.replace(/<a\b[^>]*href=["']#(?:fuentes|metodologia|limites)["'][^>]*>[\s\S]*?<\/a>/gi, "");
  output = output.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");
  output = output.replace(/<p>\s*<\/p>/gi, "");
  output = output.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, headings.get(id));
  output = removeMetaElements(output);
  output = cleanTextNodes(output);
  output = removeContentDateBadge(output);
  output = fixStaleRmsClaims(output);
  output = fixCompanionClientNote(output);
  output = removeSummaryStatGrids(output);
  if (id === 1) output = addMonsterLinkSprites(output);
  if (id === 6) { output = removeEquipmentProvenanceNotes(output); output = addEquipmentSprites(output); }
  if (id === 7) { output = fixEndlessTowerRaceLabels(output); output = fixEndlessTowerMonsterMeta(output); output = addEndlessTowerSprites(output); }
  if (id === 8) output = addPetSprites(output);
  return output;
}

const moduleDir = new URL("../public/data/modules/", import.meta.url);
for (const id of moduleNames.keys()) {
  const path = new URL(`module-${id}.html`, moduleDir);
  const html = await readFile(path, "utf8");
  await writeFile(path, finalizeModule(html, id), "utf8");
}

const searchPath = new URL("../public/data/guide-search.json", import.meta.url);
const searchIndex = JSON.parse(await readFile(searchPath, "utf8"));
const removedAnchors = new Set(["#fuentes", "#metodologia", "#limites"]);
const cleanedSearch = searchIndex
  .filter(entry => !removedAnchors.has(entry.anchor))
  .map(entry => ({
    ...entry,
    title: entry.anchor === "#pets" ? "💗 Cute Pets y bonus pasivos" : cleanPlainText(applyPlayerFacingRewrites(entry.title)),
    text: cleanPlainText(applyPlayerFacingRewrites(entry.text)),
    moduleTitle: moduleNames.get(entry.module) ?? cleanPlainText(entry.moduleTitle),
  }));
await writeFile(searchPath, JSON.stringify(cleanedSearch), "utf8");

console.log(`Contenido final: ${moduleNames.size} secciones y ${cleanedSearch.length} entradas de búsqueda.`);
