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
  assert.match(html,/Busca objetos al instante/);
  assert.match(html,/Explora ciudades y mapas/);
  assert.doesNotMatch(html,/Your site is taking shape|codex-preview/i);
});
test("el catálogo contiene todos los registros y bloques declarados",async()=>{
  const catalog=JSON.parse(await readFile(new URL("../public/data/items-index.json",import.meta.url),"utf8"));
  const files=(await readdir(new URL("../public/data/items/",import.meta.url))).filter(file=>file.endsWith(".json")).sort();
  assert.equal(catalog.meta.count,6169);
  assert.equal(catalog.items.length,6169);
  assert.equal(files.length,catalog.meta.chunks);
  assert.equal(new Set(catalog.items.map(item=>item.id)).size,6169);
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
  assert.ok(details.find(item=>item.id===501&&item.aegisName==="Red_Potion"));
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
  assert.match(portal,/fetch\(`\/data\/modules\/module-\$\{active\}\.html`\)/);
  assert.match(portal,/localizeItemLinks\(shadow\)/);
  assert.match(portal,/localizeWorldLinks\(shadow\)/);
  assert.match(portal,/WorldReferenceDialog/);
  assert.match(portal,/ExternalLinkDialog/);
  assert.match(portal,/NeonCursor/);
  assert.match(portal,/link\.dataset\.worldX/);
  assert.match(portal,/link\.closest\("tr"\)/);
  assert.match(portal,/bindModule\(shadow,active,openModule,openCatalog,openWorldPreview,openExternalLink\)/);
  assert.match(portal,/cleanVisibleGuideMetadata\(shadow\)/);
  assert.match(portal,/preparedModules\.current\[active\]/);
  assert.match(portal,/loadModuleStyle\(\)/);
  assert.match(portal,/data-ascencion-theme/);
  assert.match(portal,/if\(!moduleData\?\.\[active\]\)\{shadow\.innerHTML="";return\}/);
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
  assert.match(atlas,/Regiones y mapas de Midgard/);
  assert.match(atlas,/name:"Prontera".*prefixes:\["prt_","iz_"/s);
  assert.match(atlas,/name:"Geffen".*prefixes:\["gef_","gl_"/s);
  assert.match(atlas,/name:"Payon".*prefixes:\["pay_"/s);
  assert.match(atlas,/world-region-group/);
  assert.match(atlas,/scrollIntoView/);
  assert.doesNotMatch(atlas,/Mostrar 80 mapas más/);
  assert.match(atlas,/NPC registrados en este mapa/);
  assert.match(atlas,/Quests y referencias relacionadas/);
  assert.match(atlas,/findEntry\(payload,current\)/);
  assert.doesNotMatch(atlas,/option value="monster"/);
  assert.doesNotMatch(atlas,/function worldEntries/);

  const theme=await readFile(new URL("../app/theme.css",import.meta.url),"utf8");
  assert.match(theme,/\.world-detail\{[^}]*max-height:calc\(100dvh - 104px\)[^}]*overflow-y:auto/s);
  assert.match(theme,/@media\(max-width:800px\).*\.world-results\{grid-row:2\}/s);

  const modules=await readdir(new URL("../public/data/modules/",import.meta.url));
  assert.equal(modules.filter(file=>file.endsWith(".html")).length,8);
  let itemLinks=0;
  for(const file of modules.filter(file=>file.endsWith(".html"))){
    const html=await readFile(new URL(`../public/data/modules/${file}`,import.meta.url),"utf8");
    itemLinks+=(html.match(/ratemyserver\.net[^"']*[?&]item_id=\d+/gi)??[]).length;
  }
  assert.ok(itemLinks>=290);
});

test("la auditoría exhaustiva resuelve cada enlace y separa los destinos externos",async()=>{
  const report=JSON.parse(await readFile(new URL("../public/data/module-link-audit.json",import.meta.url),"utf8"));
  assert.equal(report.summary.modules,8);
  assert.equal(report.summary.total,2940);
  assert.equal(report.summary.resolved,2940);
  assert.equal(report.summary.unresolved,0);
  assert.equal(report.summary.externalOccurrences,10);
  assert.equal(report.summary.uniqueExternal,8);
  assert.equal(report.external.length,8);
  assert.ok(report.external.every(entry=>entry.status!==404&&entry.status!==410));
});
