import { readFile, writeFile } from "node:fs/promises";

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
    ["Para nuestro servidor Pre-Renewal: si usamos un cliente moderno, podemos conservar mecánicas Pre-Re y habilitar esta QoL. Si usamos un cliente realmente antiguo, la AI Lua clásica no puede auto-feed; usar macros externos sería automatización de terceros.", "Con un cliente moderno pueden conservarse las mecánicas Pre-Renewal y habilitar auto-feed. En clientes antiguos, la AI Lua clásica no puede alimentar automáticamente; las macros externas se consideran automatización de terceros."],
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
    .replace(/<div class=["']warn-note["']><b>Contenido deliberadamente fuera:<\/b>[\s\S]*?<\/div>/gi, "");
  return output;
}

function finalizeModule(html, id) {
  let output = applyPlayerFacingRewrites(html);
  for (const section of removedSections.get(id) ?? []) output = removeSection(output, section);
  output = output.replace(/<a\b[^>]*href=["']#(?:fuentes|metodologia|limites)["'][^>]*>[\s\S]*?<\/a>/gi, "");
  output = output.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");
  output = output.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, headings.get(id));
  output = removeMetaElements(output);
  output = cleanTextNodes(output);
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
