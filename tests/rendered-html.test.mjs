import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
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
  assert.doesNotMatch(html,/Your site is taking shape|codex-preview/i);
});
test("el catálogo contiene todos los registros y bloques declarados",async()=>{
  const catalog=JSON.parse(await readFile(new URL("../public/data/items-index.json",import.meta.url),"utf8"));
  const files=(await readdir(new URL("../public/data/items/",import.meta.url))).filter(file=>file.endsWith(".json")).sort();
  assert.equal(catalog.meta.count,6169);
  assert.equal(catalog.items.length,6169);
  assert.equal(files.length,catalog.meta.chunks);
  assert.equal(new Set(catalog.items.map(item=>item.id)).size,6169);

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
  assert.ok(world.npcs.filter(entry=>entry.sprite).length>=90);
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
  assert.match(portal,/link\.closest\("tr"\)/);
  assert.match(portal,/bindModule\(shadow,active,openModule,openCatalog,openWorldPreview,openExternalLink\)/);
  assert.match(portal,/cleanVisibleGuideMetadata\(shadow\)/);
  assert.match(portal,/preparedModules\.current\[active\]/);
  assert.match(portal,/a\[href\^="#item-"\]/);
  assert.match(portal,/#objeto-\$\{id\}/);
  assert.match(portal,/#mapa-\$\{map\}/);
  assert.match(portal,/#referencia-\$\{id\}/);
  assert.match(portal,/a\[href\*="irowiki\.org\/classic\/"\]/);
  assert.doesNotMatch(portal,/>M\{m\.id\}</);
  assert.doesNotMatch(portal,/MÓDULO \{m\.id\}/);
  assert.doesNotMatch(portal,/window\.open/);

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
