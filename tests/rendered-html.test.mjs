import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(path="/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers:{accept:"text/html"} }), { ASSETS:{fetch:async()=>new Response("Not found",{status:404})} }, { waitUntil(){},passThroughOnException(){} });
}

test("renderiza la biblioteca y el acceso al catálogo local",async()=>{
  const response=await render();
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type")??"",/^text\/html\b/i);
  const html=await response.text();
  assert.match(html,/<title>BarrasRO · Enciclopedia Pre-Renewal<\/title>/i);
  assert.match(html,/Todo Midgard/);
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

test("los módulos se cargan por separado y sus enlaces de objetos se resuelven localmente",async()=>{
  const portal=await readFile(new URL("../app/GuidePortal.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(portal,/fetch\("\/content\.bundle"\)/);
  assert.match(portal,/fetch\(`\/data\/modules\/module-\$\{active\}\.html`\)/);
  assert.match(portal,/localizeItemLinks\(shadow\)/);
  assert.match(portal,/cleanVisibleGuideMetadata\(shadow\)/);
  assert.match(portal,/#objeto-\$\{id\}/);
  assert.doesNotMatch(portal,/>M\{m\.id\}</);
  assert.doesNotMatch(portal,/MÓDULO \{m\.id\}/);

  const modules=await readdir(new URL("../public/data/modules/",import.meta.url));
  assert.equal(modules.filter(file=>file.endsWith(".html")).length,8);
  let itemLinks=0;
  for(const file of modules.filter(file=>file.endsWith(".html"))){
    const html=await readFile(new URL(`../public/data/modules/${file}`,import.meta.url),"utf8");
    itemLinks+=(html.match(/ratemyserver\.net[^\"']*[?&]item_id=\d+/gi)??[]).length;
  }
  assert.ok(itemLinks>=290);
});
