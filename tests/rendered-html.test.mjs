import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(path="/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers:{accept:"text/html"} }), { ASSETS:{fetch:async()=>new Response("Not found",{status:404})} }, { waitUntil(){},passThroughOnException(){} });
}

test("renderiza la biblioteca limpia y el acceso al catálogo local",async()=>{
  const response=await render();
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type")??"",/^text\/html\b/i);
  const html=await response.text();
  assert.match(html,/<title>AscencionRO · Enciclopedia Pre-Renewal<\/title>/i);
  assert.doesNotMatch(html,/Todo Midgard/);
  assert.doesNotMatch(html,/Busca objetos al instante/);
  assert.match(html,/class="side-rail-nav"/);
  assert.match(html,/>Objetos</);
  assert.match(html,/>Monstruos</);
  assert.match(html,/>Mundo</);
  assert.match(html,/>Guías</);
  assert.doesNotMatch(html,/Your site is taking shape|codex-preview/i);
});
test("el catálogo contiene todos los registros y bloques declarados",async()=>{
  const catalog=JSON.parse(await readFile(new URL("../public/data/items-index.json",import.meta.url),"utf8"));
  const files=(await readdir(new URL("../public/data/items/",import.meta.url))).filter(file=>file.endsWith(".json")).sort();
  assert.equal(catalog.meta.count,6169);
  assert.equal(catalog.items.length,6169);
  assert.equal(files.length,catalog.meta.chunks);
  assert.equal(new Set(catalog.items.map(item=>item.id)).size,6169);
  assert.equal(catalog.meta.archivedCount,658);
  assert.equal(catalog.items.filter(item=>item.unobtainable).length,658);
  const archivedSword=catalog.items.find(item=>item.aegisName==="Sword_");
  assert.equal(archivedSword.unobtainable,true);
  const realSword=catalog.items.find(item=>item.id===1101);
  assert.ok(!realSword.unobtainable);
  assert.ok(catalog.items.every(item=>/^\/world\/items\/\d+\.(?:gif|png)$/.test(item.sprite)));

  const sprites=JSON.parse(await readFile(new URL("../public/data/item-sprites.json",import.meta.url),"utf8"));
  assert.equal(sprites.meta.count,6169);
  assert.equal(sprites.meta.missing,0);
  assert.ok(sprites.meta.exact>=6100);
  assert.equal(Object.keys(sprites.sprites).length,6169);
  await access(new URL(`../public${sprites.sprites[501]}`,import.meta.url));

  const details=[];
  for(const file of files){
    const chunk=JSON.parse(await readFile(new URL(`../public/data/items/${file}`,import.meta.url),"utf8"));
    details.push(...chunk.items);
  }
  assert.equal(details.length,6169);
  assert.deepEqual(details.map(item=>item.id),catalog.items.map(item=>item.id));
  const redPotion=details.find(item=>item.id===501&&item.aegisName==="Red_Potion");
  assert.ok(redPotion);
  assert.match(redPotion.description,/grinded Red Herbs/i);
  assert.match(redPotion.description,/45\s*-\s*65/);
  const poringCardDetail=details.find(item=>item.id===4001);
  assert.match(poringCardDetail.description,/Luk \+2/);
  assert.match(poringCardDetail.description,/Perfect Dodge \+1/);
  // El cliente escribe "Class:"/"Compound on:" de varias formas para el mismo
  // tipo de arma o slot ("Twohand Sword", "Two Handed Sword"...); el pipeline
  // las normaliza a una sola redacción correcta.
  const gloriousClaymore=details.find(item=>item.id===1187);
  assert.match(gloriousClaymore.description,/Class: Two-Handed Sword/);
  assert.ok(!details.some(item=>item.description?.includes("Twohand Sword")));
  assert.ok(!details.some(item=>item.description?.includes("Onehand")));
  assert.ok(catalog.meta.descriptions.matched>=4500);
  assert.equal(catalog.meta.descriptions.revision,"66cdfec631603fda6a90ba4bbe26ab07b5204c84");

  const itemUi=await readFile(new URL("../app/ItemCatalog.tsx",import.meta.url),"utf8");
  const strings=await readFile(new URL("../app/i18n.ts",import.meta.url),"utf8");
  assert.match(strings,/description: "Descripción"/);
  assert.match(strings,/description: "Description"/);
  assert.match(itemUi,/<h3>\{t\.catalog\.description\}<\/h3>/);
  assert.match(itemUi,/item-description/);
  assert.doesNotMatch(itemUi,/Efecto \/ uso/);
  assert.match(itemUi,/function ItemDescription/);
  assert.match(itemUi,/desc-bonus/);
  const theme=await readFile(new URL("../app/theme.css",import.meta.url),"utf8");
  assert.match(theme,/\.desc-bonus\{/);
  assert.match(theme,/\.desc-meta\{/);

  const sourcesMeta=JSON.parse(await readFile(new URL("../public/data/item-sources-meta.json",import.meta.url),"utf8"));
  const sourceFiles=(await readdir(new URL("../public/data/item-sources/",import.meta.url))).filter(file=>file.endsWith(".json")).sort();
  assert.equal(sourceFiles.length,catalog.meta.chunks);
  assert.ok(sourcesMeta.items>=2000);
  assert.ok(sourcesMeta.dropLinks>=4000);
  const potionSources=JSON.parse(await readFile(new URL("../public/data/item-sources/chunk-000.json",import.meta.url),"utf8"));
  assert.ok((potionSources.items[501]??potionSources.items["501"]).shops.length>0);
  const cardChunk=catalog.items.find(item=>item.id===4001).chunk;
  const cardSources=JSON.parse(await readFile(new URL(`../public/data/item-sources/chunk-${String(cardChunk).padStart(3,"0")}.json`,import.meta.url),"utf8"));
  const poringCard=cardSources.items[4001]??cardSources.items["4001"];
  assert.equal(poringCard.drops[0].name,"Poring");
  assert.equal(poringCard.drops[0].id,1002);
});

test("el catálogo de monstruos cubre el bestiario Pre-Renewal y enlaza drops",async()=>{
  const catalog=JSON.parse(await readFile(new URL("../public/data/monsters-index.json",import.meta.url),"utf8"));
  const files=(await readdir(new URL("../public/data/monsters/",import.meta.url))).filter(file=>file.endsWith(".json")).sort();
  assert.equal(catalog.meta.count,750);
  assert.equal(catalog.items.length,750);
  assert.equal(files.length,catalog.meta.chunks);
  assert.equal(new Set(catalog.items.map(item=>item.id)).size,750);
  const poring=catalog.items.find(item=>item.id===1002);
  assert.equal(poring.name,"Poring");
  assert.equal(poring.aegisName,"PORING");
  assert.equal(poring.race,"Plant");
  assert.ok(poring.maps>=1);
  assert.ok(poring.drops>=1);

  const details=[];
  for(const file of files){
    const chunk=JSON.parse(await readFile(new URL(`../public/data/monsters/${file}`,import.meta.url),"utf8"));
    details.push(...chunk.items);
  }
  assert.equal(details.length,750);
  const poringDetail=details.find(item=>item.id===1002);
  assert.ok(poringDetail.maps.includes("prt_fild08")||poringDetail.maps.length>0);
  assert.ok(poringDetail.drops.some(drop=>drop.id===909||drop.name==="Jellopy"));
  assert.equal(poring.element,"Water");
  assert.equal(poring.elementLevel,1);
  const whisper=catalog.items.find(item=>item.id===1179);
  assert.equal(whisper.name,"Whisper");
  assert.equal(whisper.element,"Ghost");
  assert.equal(whisper.elementLevel,3);
  const monsterUi=await readFile(new URL("../app/MonsterCatalog.tsx",import.meta.url),"utf8");
  const monsterStrings=await readFile(new URL("../app/i18n.ts",import.meta.url),"utf8");
  assert.match(monsterStrings,/strengths: "Fortalezas y debilidades"/);
  assert.match(monsterStrings,/strengths: "Strengths and weaknesses"/);
  assert.match(monsterUi,/\{t\.monsters\.strengths\}/);
  assert.match(monsterUi,/element-table/);
  const attrFix=await readFile(new URL("../app/attr-fix.ts",import.meta.url),"utf8");
  const tableMatch=attrFix.match(/const PRE_RE_ATTR:number\[\]\[\]\[\] = (\[[\s\S]*?\n\];)/);
  assert.ok(tableMatch);
  const table=Function(`"use strict"; return ${tableMatch[1]}`)();
  assert.deepEqual(table[0].map(row=>row[1]),[100,25,100,50,175,100,100,100,100,100]);
  assert.deepEqual(table[2].map(row=>row[8]),[0,100,100,100,100,50,100,100,175,100]);
  const theme=await readFile(new URL("../app/theme.css",import.meta.url),"utf8");
  assert.match(theme,/\.monster-catalog \.element-table/);
  assert.match(theme,/\.ele-immune em\{color:#f07171/);
  assert.match(
    theme,
    /\.catalog-toolbar,\.catalog-toolbar\.monster-toolbar,\.world-toolbar\{grid-template-columns:1fr 1fr\}/,
  );
  assert.match(
    theme,
    /\.catalog-toolbar,\.catalog-toolbar\.monster-toolbar,\.world-toolbar\{grid-template-columns:1fr\}/,
  );
  const globals=await readFile(new URL("../app/globals.css",import.meta.url),"utf8");
  assert.match(globals,/@media\(max-width:480px\)\{\.brand>span:last-child\{display:none\}\}/);

  const portal=await readFile(new URL("../app/GuidePortal.tsx",import.meta.url),"utf8");
  assert.match(portal,/active==="monsters"/);
  assert.match(portal,/#monstruo-\$\{/);
  assert.match(portal,/onOpenMonster=\{openMonster\}/);
  const items=await readFile(new URL("../app/ItemCatalog.tsx",import.meta.url),"utf8");
  assert.match(items,/onOpenMonster\(\{id:drop\.id\}\)/);
  assert.match(items,/onPreviewMonster\(drop\.id,drop\.name,drop\.maps,drop\.mvp\)/);
  assert.match(items,/source-row drop-row/);
  assert.match(items,/\/world\/sprites\/\$\{id\}\.gif/);
});

test("el índice del mundo resuelve mapas, monstruos, NPC y guías con medios locales",async()=>{
  const world=JSON.parse(await readFile(new URL("../public/data/world-index.json",import.meta.url),"utf8"));
  assert.ok(world.counts.maps>=180);
  assert.ok(world.counts.monsters>=20);
  assert.ok(world.counts.npcs>=300);
  assert.ok(world.counts.references>=140);
  assert.equal(new Set(world.maps.map(entry=>entry.id)).size,world.maps.length);
  assert.equal(new Set(world.monsters.map(entry=>entry.id)).size,world.monsters.length);
  assert.equal(new Set(world.npcs.map(entry=>entry.id)).size,world.npcs.length);
  assert.equal(new Set(world.references.map(entry=>entry.id)).size,world.references.length);
  const prontera=world.maps.find(entry=>entry.id==="prontera");
  assert.ok(prontera);
  assert.match(prontera.image,/^\/world\/maps\/prontera\.gif$/);
  assert.ok(prontera.points.some(point=>point.x===183&&point.y===333));
  assert.equal(world.monsters.filter(entry=>entry.sprite).length,world.monsters.length);
  assert.ok(world.monsters.every(entry=>entry.locations.length>0));
  assert.ok(world.monsters.find(entry=>entry.id===1007).locations.some(location=>location.map==="prt_fild00"));
  assert.ok(world.npcs.find(entry=>entry.name==="Valkyrie"));
  assert.ok(world.npcs.find(entry=>entry.id==="langry-gef_fild07"));
  assert.equal(world.npcs.find(entry=>entry.id==="langry-gef_fild07").points.length,1);
  assert.equal(world.npcs.filter(entry=>entry.sprite).length,world.npcs.length);
  assert.ok(world.npcs.filter(entry=>entry.spriteApproximate).length<=100);
  for(const sprite of new Set(world.npcs.map(entry=>entry.sprite)))await access(new URL(`../public${sprite}`,import.meta.url));
  assert.equal(world.npcs.find(entry=>entry.name==="Aelle").sprite,"/world/npcs/79.gif");
  assert.ok(world.references.find(entry=>entry.id==="endless-tower"));
});

test("los módulos se cargan por separado y sus enlaces de objetos se resuelven localmente",async()=>{
  const portal=await readFile(new URL("../app/GuidePortal.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(portal,/fetch\("\/content\.bundle"\)/);
  assert.match(portal,/fetch\(`\/data\/modules\/module-\$\{active\}\.en\.html`\)/);
  assert.match(portal,/fetch\(`\/data\/modules\/module-\$\{active\}\.html`\)/);
  assert.match(portal,/guide-search\.en\.json/);
  assert.match(portal,/translated:true/);
  assert.match(portal,/localizeItemLinks\(shadow\)/);
  assert.match(portal,/localizeWorldLinks\(shadow\)/);
  assert.match(portal,/WorldReferenceDialog/);
  assert.match(portal,/ExternalLinkDialog/);
  assert.match(portal,/NeonCursor/);
  assert.match(portal,/link\.dataset\.worldX/);
  assert.match(portal,/link\.closest\("tr"\)/);
  assert.match(portal,/bindModule\(shadow,active,openModule,openCatalog,openMonster,openWorldPreview,openExternalLink\)/);
  assert.match(portal,/prepareGuideNavigation\(shadow,t\.guide\.exploreGuide\)/);
  assert.doesNotMatch(portal,/cleanVisibleGuideMetadata/);
  assert.match(portal,/preparedModules\.current\[key\]/);
  assert.match(portal,/loadModuleStyle\(\)/);
  assert.match(portal,/data-ascencion-theme/);
  assert.match(portal,/const entry=moduleData\?\.\[key\];/);
  assert.doesNotMatch(portal,/<link rel=\\"stylesheet\\" href=\\"\/modern-modules\.css\\">/);
  assert.match(portal,/a\[href\^="#item-"\]/);
  assert.match(portal,/#objeto-\$\{id\}/);
  assert.match(portal,/#mapa-\$\{map\}/);
  assert.match(portal,/#referencia-\$\{id\}/);
  assert.match(portal,/a\[href\*="irowiki\.org\/classic\/"\]/);
  assert.doesNotMatch(portal,/>M\{m\.id\}</);
  assert.doesNotMatch(portal,/MÓDULO \{m\.id\}/);
  assert.doesNotMatch(portal,/window\.open/);

  const atlas=await readFile(new URL("../app/WorldCatalog.tsx",import.meta.url),"utf8");
  const atlasStrings=await readFile(new URL("../app/i18n.ts",import.meta.url),"utf8");
  assert.match(atlasStrings,/heroTitle: "Regiones y mapas de Midgard"/);
  assert.match(atlasStrings,/heroTitle: "Regions and maps of Midgard"/);
  assert.match(atlas,/\{t\.world\.heroTitle\}/);
  assert.match(atlas,/name:"Prontera".*prefixes:\["prt_","iz_"/s);
  assert.match(atlas,/name:"Geffen".*prefixes:\["gef_","gl_"/s);
  assert.match(atlas,/name:"Payon".*prefixes:\["pay_"/s);
  assert.match(atlas,/world-region-group/);
  assert.match(atlas,/scrollIntoView/);
  assert.doesNotMatch(atlas,/Mostrar 80 mapas más/);
  assert.match(atlasStrings,/npcsHere: "NPC registrados en este mapa"/);
  assert.match(atlasStrings,/npcsHere: "NPCs on record for this map"/);
  assert.match(atlas,/\{t\.world\.npcsHere\}/);
  assert.match(atlasStrings,/questsHere: "Quests y referencias relacionadas"/);
  assert.match(atlasStrings,/questsHere: "Related quests and references"/);
  assert.match(atlas,/\{t\.world\.questsHere\}/);
  assert.match(atlas,/findEntry\(payload,current\)/);
  assert.doesNotMatch(atlas,/option value="monster"/);
  assert.doesNotMatch(atlas,/function worldEntries/);

  const theme=await readFile(new URL("../app/theme.css",import.meta.url),"utf8");
  assert.match(theme,/\.world-detail\{[^}]*max-height:calc\(100dvh - 104px\)[^}]*overflow-y:auto/s);
  assert.match(theme,/@media\(max-width:800px\).*\.world-results\{grid-row:2\}/s);

  const modules=await readdir(new URL("../public/data/modules/",import.meta.url));
  assert.equal(modules.filter(file=>/^module-\d+\.html$/.test(file)).length,8);
  let itemCards=0;
  for(const file of modules.filter(file=>/^module-\d+\.html$/.test(file))){
    const html=await readFile(new URL(`../public/data/modules/${file}`,import.meta.url),"utf8");
    itemCards+=(html.match(/id="item-\d+"/g)??[]).length;
  }
  assert.ok(itemCards>=290);
  const equipmentHtml=await readFile(new URL("../public/data/modules/module-6.html",import.meta.url),"utf8");
  assert.doesNotMatch(equipmentHtml,/rAthena DB \+ RMS ID/);
  assert.doesNotMatch(equipmentHtml,/class="rms-direct"/);
  assert.doesNotMatch(equipmentHtml,/class="source-direct"/);
  assert.equal((equipmentHtml.match(/class="item-name-sprite"/g)??[]).length,290);
});

test("las ocho secciones contienen sólo texto final orientado al jugador",async()=>{
  const forbidden=/lo que se tiene planeado|criterio de|qu[eé] entra y qu[eé] no|control de versi[oó]n|auditor[ií]a|versi[oó]n final entregable|entregable final|release estable|estado de release|nota editorial|regla editorial|alcance editorial|metodolog[ií]a de|contenido avanzado absorbido|m[oó]dulo\s*\d|fuentes de v|cerrad[oa] e integrad[oa]|versiones anteriores|respaldo|contenido deliberadamente fuera|no se desarrolla aqu[ií]/i;
  const modules=(await readdir(new URL("../public/data/modules/",import.meta.url))).filter(file=>/^module-\d+\.html$/.test(file)).sort();
  assert.equal(modules.length,8);
  for(const file of modules){
    const html=await readFile(new URL(`../public/data/modules/${file}`,import.meta.url),"utf8");
    const visible=html.replace(/<script\b[\s\S]*?<\/script>/gi," ").replace(/<style\b[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    assert.doesNotMatch(visible,forbidden,file);
    assert.doesNotMatch(html,/<section\b[^>]*id=["'](?:fuentes|metodologia|limites)["']/i,file);
    assert.doesNotMatch(html,/<footer\b/i,file);
    assert.match(html,/<h1\b/i,file);
  }
  const search=JSON.parse(await readFile(new URL("../public/data/guide-search.json",import.meta.url),"utf8"));
  assert.ok(search.length>=800);
  for(const entry of search){
    assert.doesNotMatch(`${entry.title} ${entry.text}`,forbidden,`${entry.module}${entry.anchor}`);
    assert.ok(!["#fuentes","#metodologia","#limites"].includes(entry.anchor));
  }
  const pkg=JSON.parse(await readFile(new URL("../package.json",import.meta.url),"utf8"));
  assert.match(pkg.scripts["data:modules"],/finalize-guide-content\.mjs/);
  assert.match(pkg.scripts["data:descriptions"],/build-item-descriptions\.mjs/);
  assert.match(pkg.scripts["data:build"],/build-item-descriptions\.mjs/);

  const enModules=(await readdir(new URL("../public/data/modules/",import.meta.url))).filter(file=>/^module-\d+\.en\.html$/.test(file));
  const searchEn=JSON.parse(await readFile(new URL("../public/data/guide-search.en.json",import.meta.url),"utf8"));
  assert.ok(Array.isArray(searchEn));
  for(const entry of searchEn){
    assert.doesNotMatch(`${entry.title} ${entry.text}`,forbidden,`${entry.module}${entry.anchor}`);
    assert.ok(!["#fuentes","#metodologia","#limites"].includes(entry.anchor));
  }
  for(const file of enModules){
    const html=await readFile(new URL(`../public/data/modules/${file}`,import.meta.url),"utf8");
    assert.match(html,/<h1\b/i,file);
    assert.doesNotMatch(html,/<footer\b/i,file);
  }
});

test("Endless Tower muestra un sprite local en cada tarjeta de monstruo",async()=>{
  const html=await readFile(new URL("../public/data/modules/module-7.html",import.meta.url),"utf8");
  const cards=(html.match(/class="mobcard"/g)??[]).length;
  const sprites=[...html.matchAll(/<img class="mob-sprite" src="\/world\/sprites\/(\d+)\.gif"[^>]*>/g)];
  const ids=new Set(sprites.map(match=>match[1]));
  assert.equal(cards,451);
  assert.equal(sprites.length,cards);
  assert.equal(ids.size,327);
  assert.ok(sprites.every(match=>/loading="lazy"/.test(match[0])&&/alt="Sprite de [^"]+"/.test(match[0])));
  for(const id of ids){
    const path=new URL(`../public/world/sprites/${id}.gif`,import.meta.url);
    await access(path);
    const bytes=await readFile(path);
    assert.match(bytes.subarray(0,6).toString("ascii"),/^GIF8[79]a$/);
  }
});

test("la auditoría exhaustiva resuelve localmente cada enlace",async()=>{
  const report=JSON.parse(await readFile(new URL("../public/data/module-link-audit.json",import.meta.url),"utf8"));
  assert.equal(report.summary.modules,8);
  assert.equal(report.summary.total,2257);
  assert.equal(report.summary.resolved,2257);
  assert.equal(report.summary.unresolved,0);
  assert.equal(report.summary.externalOccurrences,0);
  assert.equal(report.summary.uniqueExternal,0);
  assert.equal(report.external.length,0);
});

// Complementa la prueba anterior: aquella audita enlaces de texto (<a href>
// a fichas locales), esta audita recursos binarios (sprites de objetos y
// monstruos, imágenes de mapas/NPC, <img> incrustados en las guías) contra
// lo que existe de verdad en public/, y detecta mayúsculas/minúsculas que
// romperían en GitHub Pages (Linux) aunque funcionen en Windows.
test("la auditoría de medios no encuentra sprites ni imágenes rotas",async()=>{
  const report=JSON.parse(await readFile(new URL("../public/data/media-link-audit.json",import.meta.url),"utf8"));
  assert.equal(report.summary.problems,0);
  assert.equal(report.summary.caseIssues,0);
  assert.deepEqual(report.problems,[]);
  assert.deepEqual(report.caseIssues,[]);
});

test("el selector de idioma ofrece los dos idiomas y el diccionario está completo",async()=>{
  const strings=await readFile(new URL("../app/i18n.ts",import.meta.url),"utf8");
  const portal=await readFile(new URL("../app/GuidePortal.tsx",import.meta.url),"utf8");

  // El botón existe y ofrece las dos opciones.
  assert.match(portal,/className="lang-switch"/);
  assert.match(portal,/switchLang\("es"\)/);
  assert.match(portal,/switchLang\("en"\)/);

  // El idioma se lee de un store externo, no de estado sincronizado en un efecto.
  assert.match(portal,/useSyncExternalStore\(subscribeLang,getLang,getServerLang\)/);

  // Los dos bloques del diccionario declaran las mismas claves de primer nivel.
  const claves=lang=>{
    const inicio=strings.indexOf(`  ${lang}: {`);
    assert.ok(inicio>0,`falta el bloque ${lang}`);
    const trozo=strings.slice(inicio,strings.indexOf("\n  },",inicio));
    return [...trozo.matchAll(/^ {4}([A-Za-z]+):/gm)].map(m=>m[1]).sort();
  };
  assert.deepEqual(claves("es"),claves("en"));

  // Ningún catálogo se queda sin diccionario.
  for(const archivo of ["ItemCatalog","MonsterCatalog","WorldCatalog"]){
    const fuente=await readFile(new URL(`../app/${archivo}.tsx`,import.meta.url),"utf8");
    assert.match(fuente,/t:Dict/,`${archivo} no recibe el diccionario`);
  }
});
