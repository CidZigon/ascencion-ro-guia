import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const modulesDir=new URL("../public/data/modules/",import.meta.url);
const output=new URL("../public/data/world-index.json",import.meta.url);
const files=(await readdir(modulesDir)).filter(file=>file.endsWith(".html")).sort();
const maps=new Map();
const monsters=new Map();
const npcs=new Map();
const references=new Map();
let entityCache={monsters:{},npcs:{}};
try{entityCache=JSON.parse(await readFile(new URL("../public/data/world-entities-cache.json",import.meta.url),"utf8"))}catch{/* La caché se genera por separado. */}
const topicNames=["","Progresión y EXP","Accesos y dungeons","Historias y lore","Aventuras regionales","Jobs y habilidades","Equipo y fabricación","Endless Tower","Compañeros"];

function decode(value=""){
  return value.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ");
}
function text(value=""){
  let result=decode(value.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\b(?:class|href|target|rel|title|data-[\w-]+)="[^"]*"/gi," ")).replace(/\s+/g," ").trim();
  for(let id=1;id<topicNames.length;id++)result=result.replace(new RegExp(`m[oó]dulo\\s*0?${id}`,"gi"),topicNames[id]);
  return result.replace(/\bm[oó]dulor\b/gi,"personal").replace(/\bm[oó]dulos\b/gi,"secciones").replace(/\bm[oó]dulo\b/gi,"sección");
}
function safeUrl(value){try{return new URL(decode(value),"https://ratemyserver.net")}catch{return null}}
function addUnique(list,value,limit=8){if(value&&!list.includes(value)&&list.length<limit)list.push(value)}
function addPoint(list,label,kind="reference",limit=36){
  const match=label.match(/(?:^|\D)(\d{1,3})\s*,\s*(\d{1,3})(?:\D|$)/);
  if(!match)return;
  const x=Number(match[1]),y=Number(match[2]);
  if(x>500||y>500||list.some(point=>point.x===x&&point.y===y&&point.label===label))return;
  if(list.length<limit)list.push({x,y,label:label.replace(/^📍\s*/,""),kind});
}
function safeContext(value){return /<|[a-z-]+="/i.test(value)?"":value}
/* .slice(0,N) puro corta a mitad de palabra ("...permite utilizar la entrad").
   Se recorta al último espacio dentro del límite para terminar en una palabra
   completa, y se marca con "…" que sí se trata de un fragmento parcial. */
function truncateAtWord(value,max){
  if(value.length<=max)return value;
  const cut=value.slice(0,max);
  const lastSpace=cut.lastIndexOf(" ");
  return `${lastSpace>max*0.6?cut.slice(0,lastSpace):cut}…`;
}
function contextAround(html,index){
  const containers=[["<tr","</tr>"],["<p","</p>"],["<details","</details>"]];
  for(const [open,close] of containers){const start=html.lastIndexOf(open,index),end=html.indexOf(close,index);if(start>=0&&end>index&&end-start<6500)return truncateAtWord(text(html.slice(start,end+close.length)),360)}
  return truncateAtWord(text(html.slice(Math.max(0,index-240),index+520)),360);
}
function slug(value){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function referenceInfo(value){
  const url=safeUrl(value);
  if(!url||!/irowiki\.org$/i.test(url.hostname))return null;
  const raw=url.pathname.split("/").filter(Boolean).at(-1)||"referencia";
  let decoded=raw;
  try{decoded=decodeURIComponent(raw)}catch{/* Conserva el segmento original si no es URI válida. */}
  const name=decoded.replace(/_/g," ").replace(/\s+/g," ").trim();
  return {id:slug(name)||"referencia",name};
}
async function mediaPath(folder,file){
  try{await access(new URL(`../public/world/${folder}/${file}.gif`,import.meta.url));return `/world/${folder}/${file}.gif`}catch{return null}
}
function anchor(block,className){
  const match=block.match(new RegExp(`<a\\b(?=[^>]*class="[^"]*\\b${className}\\b[^"]*")[^>]*href="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>`,"i"));
  return match?{href:decode(match[1]),label:text(match[2])}:null;
}
function enclosingBlock(html,index,tag,predicate=()=>true){
  let start=html.lastIndexOf(`<${tag}`,index);
  while(start>=0){
    const openingEnd=html.indexOf(">",start),end=html.indexOf(`</${tag}>`,openingEnd);
    if(openingEnd>=0&&end>=index&&predicate(html.slice(start,openingEnd+1)))return html.slice(start,end+tag.length+3);
    start=html.lastIndexOf(`<${tag}`,start-1);
  }
  return "";
}
function collectNpc(npc,location,topic,html,index){
  if(!npc)return;
  const mapUrl=location?safeUrl(location.href):null;
  const map=mapUrl?.searchParams.get("map")||null;
  const id=`${slug(npc.label)}${map?`-${map}`:""}`;
  const entry=npcs.get(id)??{id,name:npc.label,map,locations:[],points:[],contexts:[],topics:[]};
  addUnique(entry.locations,location?.label||"");
  addPoint(entry.points,location?.label||"","npc");
  addUnique(entry.contexts,safeContext(contextAround(html,index)));
  if(!entry.topics.includes(topic))entry.topics.push(topic);
  npcs.set(id,entry);
}

for(const file of files){
  const html=await readFile(new URL(file,modulesDir),"utf8");
  const topic=Number(file.match(/\d+/)?.[0]||0);
  const rmsAnchor=/<a\b[^>]*href="([^"]*ratemyserver\.net[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  for(const match of html.matchAll(rmsAnchor)){
    const url=safeUrl(match[1]);
    if(!url)continue;
    const label=text(match[2]),context=safeContext(contextAround(html,match.index||0));
    const mapCode=url.searchParams.get("map")||(url.searchParams.get("area")?`area-${url.searchParams.get("area")}`:null);
    const mobId=Number(url.searchParams.get("mob_id")||0);
    if(mapCode){
      const entry=maps.get(mapCode)??{id:mapCode,code:mapCode,labels:[],points:[],contexts:[],topics:[]};
      addUnique(entry.labels,label.replace(/^📍\s*/,""));
      addPoint(entry.points,label);
      addUnique(entry.contexts,context);
      if(!entry.topics.includes(topic))entry.topics.push(topic);
      maps.set(mapCode,entry);
    }
    if(mobId){
      const entry=monsters.get(mobId)??{id:mobId,name:label||`Monstruo ${mobId}`,contexts:[],topics:[]};
      if(label&&entry.name.startsWith("Monstruo "))entry.name=label;
      addUnique(entry.contexts,context);
      if(!entry.topics.includes(topic))entry.topics.push(topic);
      monsters.set(mobId,entry);
    }
  }

  const npcRef=/<span\b[^>]*class="[^"]*\bnpcref\b[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
  for(const match of html.matchAll(npcRef)){
    const npc=anchor(match[1],"npclink"),location=anchor(match[1],"maplink");
    collectNpc(npc,location,topic,html,match.index||0);
  }

  const tableRow=/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  for(const match of html.matchAll(tableRow)){
    if(/\bnpcref\b/i.test(match[1]))continue;
    collectNpc(anchor(match[1],"npclink"),anchor(match[1],"maplink"),topic,html,match.index||0);
  }

  // Quest walkthroughs also place NPCs in paragraphs and list items. Index those
  // direct NPC/location pairs so the guide never creates a dead local reference.
  const npcAnchor=/<a\b(?=[^>]*class="[^"]*\bnpclink\b[^"]*")[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  for(const match of html.matchAll(npcAnchor)){
    const index=match.index||0;
    const span=enclosingBlock(html,index,"span",tag=>/\bnpcref\b/i.test(tag));
    const row=enclosingBlock(html,index,"tr");
    const paragraph=enclosingBlock(html,index,"p");
    const listItem=enclosingBlock(html,index,"li");
    const location=anchor(span||row||paragraph||listItem,"maplink");
    if(location)collectNpc({href:decode(match[1]),label:text(match[2])},location,topic,html,index);
  }

  const visibleHtml=html.replace(/<footer\b[\s\S]*?<\/footer>/gi,"");
  const wikiAnchor=/<a\b([^>]*?)href="([^"]*irowiki\.org\/classic\/[^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi;
  for(const match of visibleHtml.matchAll(wikiAnchor)){
    if(/\bnpclink\b/i.test(`${match[1]} ${match[3]}`))continue;
    const info=referenceInfo(match[2]);
    if(!info)continue;
    const context=safeContext(contextAround(visibleHtml,match.index||0));
    const entry=references.get(info.id)??{id:info.id,name:info.name,contexts:[],topics:[]};
    addUnique(entry.contexts,context,12);
    if(!entry.topics.includes(topic))entry.topics.push(topic);
    references.set(info.id,entry);
  }
}

for(const npc of npcs.values()){
  npc.points=npc.points.filter((point,index,points)=>points.findIndex(candidate=>candidate.x===point.x&&candidate.y===point.y)===index);
  const cached=entityCache.npcs?.[npc.id];
  npc.sprite=cached?.sprite||null;
  npc.spriteApproximate=Boolean(cached?.spriteApproximate);
  const verified=cached?.verifiedLocation;
  if(verified){
    npc.map??=verified.map;
    const verifiedLabel=`📍 ${verified.map} ${verified.x},${verified.y}`;
    addUnique(npc.locations,verifiedLabel);
    addPoint(npc.points,verifiedLabel,"npc");
  }
  npc.points=npc.points.filter((point,index,points)=>points.findIndex(candidate=>candidate.x===point.x&&candidate.y===point.y)===index);
  if(!npc.map||!maps.has(npc.map))continue;
  const map=maps.get(npc.map);
  for(const location of npc.locations)addPoint(map.points,`${npc.name} · ${location}`,"npc");
}

for(const monster of monsters.values()){
  monster.locations=entityCache.monsters?.[monster.id]?.locations||[];
  for(const location of monster.locations){
    const map=maps.get(location.map)??{id:location.map,code:location.map,labels:[],points:[],contexts:[],topics:[]};
    addUnique(map.labels,`${location.map}${location.name&&location.name!==location.map?` · ${location.name}`:""}`);
    addUnique(map.contexts,`${monster.name} · ${location.spawn}`);
    for(const topic of monster.topics)if(!map.topics.includes(topic))map.topics.push(topic);
    maps.set(location.map,map);
  }
}

const mapEntries=await Promise.all([...maps.values()].map(async entry=>({...entry,image:entry.id.startsWith("area-")?null:await mediaPath("maps",entry.id)})));
const monsterEntries=await Promise.all([...monsters.values()].map(async entry=>({...entry,sprite:await mediaPath("sprites",entry.id)})));

const payload={
  counts:{maps:maps.size,monsters:monsters.size,npcs:npcs.size,references:references.size},
  maps:mapEntries.sort((a,b)=>a.code.localeCompare(b.code)),
  monsters:monsterEntries.sort((a,b)=>a.id-b.id),
  npcs:[...npcs.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id)),
  references:[...references.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id)),
};
await mkdir(new URL("../public/data/",import.meta.url),{recursive:true});
await writeFile(output,JSON.stringify(payload),"utf8");
console.log(`Índice local del mundo: ${payload.counts.maps} mapas, ${payload.counts.monsters} monstruos, ${payload.counts.npcs} NPC y ${payload.counts.references} guías.`);
