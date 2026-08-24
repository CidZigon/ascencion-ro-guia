import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const modulesDir=new URL("../public/data/modules/",import.meta.url);
const output=new URL("../public/data/world-index.json",import.meta.url);
const files=(await readdir(modulesDir)).filter(file=>file.endsWith(".html")).sort();
const maps=new Map();
const monsters=new Map();
const npcs=new Map();
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
function safeContext(value){return /<|[a-z-]+="/i.test(value)?"":value}
function contextAround(html,index){
  const containers=[["<tr","</tr>"],["<p","</p>"],["<details","</details>"]];
  for(const [open,close] of containers){const start=html.lastIndexOf(open,index),end=html.indexOf(close,index);if(start>=0&&end>index&&end-start<6500)return text(html.slice(start,end+close.length)).slice(0,360)}
  return text(html.slice(Math.max(0,index-240),index+520)).slice(0,360);
}
function slug(value){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function anchor(block,className){
  const match=block.match(new RegExp(`<a\\b(?=[^>]*class="[^"]*\\b${className}\\b[^"]*")[^>]*href="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>`,"i"));
  return match?{href:decode(match[1]),label:text(match[2])}:null;
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
      const entry=maps.get(mapCode)??{id:mapCode,code:mapCode,labels:[],contexts:[],topics:[]};
      addUnique(entry.labels,label.replace(/^📍\s*/,""));
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
    if(!npc)continue;
    const mapUrl=location?safeUrl(location.href):null;
    const map=mapUrl?.searchParams.get("map")||null;
    const id=`${slug(npc.label)}${map?`-${map}`:""}`;
    const entry=npcs.get(id)??{id,name:npc.label,map,locations:[],contexts:[],topics:[]};
    addUnique(entry.locations,location?.label||"");
    addUnique(entry.contexts,safeContext(contextAround(html,match.index||0)));
    if(!entry.topics.includes(topic))entry.topics.push(topic);
    npcs.set(id,entry);
  }
}

const payload={
  counts:{maps:maps.size,monsters:monsters.size,npcs:npcs.size},
  maps:[...maps.values()].sort((a,b)=>a.code.localeCompare(b.code)),
  monsters:[...monsters.values()].sort((a,b)=>a.id-b.id),
  npcs:[...npcs.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id)),
};
await mkdir(new URL("../public/data/",import.meta.url),{recursive:true});
await writeFile(output,JSON.stringify(payload),"utf8");
console.log(`Índice local del mundo: ${payload.counts.maps} mapas, ${payload.counts.monsters} monstruos y ${payload.counts.npcs} NPC.`);
