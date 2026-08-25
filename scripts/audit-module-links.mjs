import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const modulesDir=new URL("../public/data/modules/",import.meta.url);
const reportFile=new URL("../public/data/module-link-audit.json",import.meta.url);
const checkExternal=process.argv.includes("--check-external");
const shouldWrite=process.argv.includes("--write");

function decode(value=""){
  return value.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ");
}
function plainText(value=""){
  return decode(value.replace(/<script\b[\s\S]*?<\/script>/gi," ").replace(/<style\b[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();
}
function slug(value=""){
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
function attribute(tag,name){
  const match=tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`,"i"));
  return match?decode(match[2]):"";
}
function safeUrl(value){
  try{return new URL(decode(value),"https://ascencion-ro-guia.invalid")}catch{return null}
}
function enclosingBlock(html,index,tag,predicate=()=>true){
  let start=html.lastIndexOf(`<${tag}`,index);
  while(start>=0){
    const openingEnd=html.indexOf(">",start);
    const end=html.indexOf(`</${tag}>`,openingEnd);
    if(openingEnd>=0&&end>=index&&predicate(html.slice(start,openingEnd+1)))return html.slice(start,end+tag.length+3);
    start=html.lastIndexOf(`<${tag}`,start-1);
  }
  return "";
}
function anchorWithClass(block,className){
  for(const match of block.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)){
    const opening=match[0].slice(0,match[0].indexOf(">")+1);
    if(attribute(opening,"class").split(/\s+/).includes(className))return {href:attribute(opening,"href"),label:plainText(match[0])};
  }
  return null;
}
function npcMapAt(html,index){
  const span=enclosingBlock(html,index,"span",tag=>attribute(tag,"class").split(/\s+/).includes("npcref"));
  const row=enclosingBlock(html,index,"tr");
  const paragraph=enclosingBlock(html,index,"p");
  const listItem=enclosingBlock(html,index,"li");
  const wrapper=span||row||paragraph||listItem||"";
  const mapHref=anchorWithClass(wrapper,"maplink")?.href||"";
  const mapUrl=safeUrl(mapHref);
  return mapUrl?.searchParams.get("map")||mapHref.match(/^#mapa-(.+)$/)?.[1]||"";
}

const itemIndex=JSON.parse(await readFile(new URL("../public/data/items-index.json",import.meta.url),"utf8"));
const monsterIndex=JSON.parse(await readFile(new URL("../public/data/monsters-index.json",import.meta.url),"utf8"));
const worldIndex=JSON.parse(await readFile(new URL("../public/data/world-index.json",import.meta.url),"utf8"));
const itemIds=new Set(itemIndex.items.map(item=>String(item.id)));
const monsterIds=new Set(monsterIndex.items.map(item=>String(item.id)));
const worldIds={
  map:new Set(worldIndex.maps.map(entry=>String(entry.id))),
  npc:new Set(worldIndex.npcs.map(entry=>String(entry.id))),
  reference:new Set(worldIndex.references.map(entry=>String(entry.id))),
};

const moduleFiles=(await readdir(modulesDir)).filter(file=>/^module-\d+\.html$/.test(file)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
const modules=new Map();
for(const file of moduleFiles){
  const id=Number(file.match(/\d+/)[0]);
  const html=await readFile(new URL(file,modulesDir),"utf8");
  const ids=new Set([...html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].map(match=>decode(match[2])));
  modules.set(id,{file,html,ids});
}

const categoryCounts={};
const occurrences=[];
const unresolved=[];
const externalByHref=new Map();
function record(category,module,href,label,resolved,target=""){
  categoryCounts[category]=(categoryCounts[category]||0)+1;
  const entry={module,href,label,category,resolved,target};
  occurrences.push(entry);
  if(!resolved)unresolved.push(entry);
  if(category==="external-fallback"){
    const external=externalByHref.get(href)??{href,count:0,modules:[],labels:[]};
    external.count++;
    if(!external.modules.includes(module))external.modules.push(module);
    if(label&&!external.labels.includes(label))external.labels.push(label);
    externalByHref.set(href,external);
  }
}

for(const [module,{html,ids}] of modules){
  const anchors=[...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)];
  const npcMapsByName=new Map();
  for(const match of anchors){
    const opening=match[0].slice(0,match[0].indexOf(">")+1);
    if(!attribute(opening,"class").split(/\s+/).includes("npclink"))continue;
    const map=npcMapAt(html,match.index),name=slug(plainText(match[0])||"npc");
    if(!map)continue;
    const known=npcMapsByName.get(name)??new Set();
    known.add(map);npcMapsByName.set(name,known);
  }
  for(const match of anchors){
    const anchor=match[0],opening=anchor.slice(0,anchor.indexOf(">")+1);
    const rawHref=attribute(opening,"href"),href=decode(rawHref),label=plainText(anchor).slice(0,160);
    const classes=attribute(opening,"class").split(/\s+/);

    if(classes.includes("npclink")){
      const name=slug(label||"npc"),known=npcMapsByName.get(name),map=npcMapAt(html,match.index)||(known?.size===1?[...known][0]:"");
      if(map){
        const npcId=`${name}-${map}`;
        record("npc-local",module,href,label,worldIds.npc.has(npcId),`#npc-${npcId}`);
        continue;
      }
    }

    const legacyItem=href.match(/^#item-(\d+)$/);
    if(legacyItem){record("item-local",module,href,label,itemIds.has(legacyItem[1]),`#objeto-${legacyItem[1]}`);continue}

    const localItem=href.match(/^#objeto-(\d+)$/);
    if(localItem){record("item-local",module,href,label,itemIds.has(localItem[1]),href);continue}

    const localMonster=href.match(/^#monstruo-(\d+)$/);
    if(localMonster){record("monster-local",module,href,label,monsterIds.has(localMonster[1]),href);continue}

    const localWorld=href.match(/^#(mapa|npc|referencia)-(.+)$/);
    if(localWorld){
      const kind=localWorld[1]==="mapa"?"map":localWorld[1];
      record(`${kind}-local`,module,href,label,worldIds[kind].has(localWorld[2]),href);
      continue;
    }

    if(/^https?:\/\//i.test(href)){
      const url=safeUrl(href);
      if(url&&/ratemyserver\.net$/i.test(url.hostname)){
        const itemId=url.searchParams.get("item_id");
        const map=url.searchParams.get("map")||(url.searchParams.get("area")?`area-${url.searchParams.get("area")}`:"");
        const monster=url.searchParams.get("mob_id");
        if(itemId){record("item-local",module,href,label,itemIds.has(itemId),`#objeto-${itemId}`);continue}
        if(map){record("map-local",module,href,label,worldIds.map.has(map),`#mapa-${map}`);continue}
        if(monster){record("monster-local",module,href,label,monsterIds.has(monster),`#monstruo-${monster}`);continue}
      }
      if(url&&/irowiki\.org$/i.test(url.hostname)&&url.pathname.startsWith("/classic/")){
        const raw=url.pathname.split("/").filter(Boolean).at(-1)||"referencia";
        let name=raw;
        try{name=decodeURIComponent(raw)}catch{/* Conserva una ruta que no usa codificación URI válida. */}
        const referenceId=slug(name.replaceAll("_"," "))||"referencia";
        record("reference-local",module,href,label,worldIds.reference.has(referenceId),`#referencia-${referenceId}`);
        continue;
      }
      record("external-fallback",module,href,label,Boolean(url),href);
      continue;
    }

    const crossModule=href.match(/^#module-(\d+)(?:#(.+))?$/);
    if(crossModule){
      const targetModule=modules.get(Number(crossModule[1]));
      const resolved=Boolean(targetModule)&&(!crossModule[2]||targetModule.ids.has(crossModule[2]));
      record("internal",module,href,label,resolved,href);
      continue;
    }
    if(href.startsWith("#")){
      const target=href.slice(1);
      record("internal",module,href,label,Boolean(target)&&ids.has(target),href);
      continue;
    }
    record("unsupported",module,href,label,false,href);
  }
}

const external=[...externalByHref.values()].sort((a,b)=>a.href.localeCompare(b.href));
if(checkExternal){
  await Promise.all(external.map(async entry=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(entry.href,{redirect:"follow",signal:controller.signal,headers:{"user-agent":"AscencionRO-Link-Audit/1.0"}});
      entry.status=response.status;
      entry.finalUrl=response.url;
      entry.reachable=response.status!==404&&response.status!==410;
    }catch(error){
      entry.status=null;
      entry.finalUrl=entry.href;
      entry.reachable=false;
      entry.error=error instanceof Error?error.message:String(error);
    }finally{clearTimeout(timeout)}
  }));
}

const summary={
  modules:modules.size,
  total:occurrences.length,
  resolved:occurrences.length-unresolved.length,
  unresolved:unresolved.length,
  localOccurrences:occurrences.filter(entry=>entry.category!=="external-fallback").length,
  externalOccurrences:categoryCounts["external-fallback"]||0,
  uniqueExternal:external.length,
  categories:categoryCounts,
};
const report={generatedAt:new Date().toISOString(),summary,external,unresolved};

if(shouldWrite){
  await mkdir(new URL("../public/data/",import.meta.url),{recursive:true});
  await writeFile(reportFile,`${JSON.stringify(report,null,2)}\n`,"utf8");
}

console.log(`Enlaces auditados: ${summary.total}; resueltos: ${summary.resolved}; pendientes: ${summary.unresolved}.`);
console.log(`Referencias locales: ${summary.localOccurrences}; externas: ${summary.externalOccurrences} apariciones / ${summary.uniqueExternal} destinos.`);
for(const [category,count] of Object.entries(categoryCounts).sort())console.log(`  ${category}: ${count}`);
if(unresolved.length)console.error(JSON.stringify(unresolved.slice(0,25),null,2));
if(checkExternal)for(const entry of external)console.log(`  ${entry.status??"ERR"} ${entry.href}${entry.finalUrl!==entry.href?` -> ${entry.finalUrl}`:""}`);
if(unresolved.length)process.exitCode=1;
