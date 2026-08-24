import { access, mkdir, readFile, writeFile } from "node:fs/promises";

const indexUrl=new URL("../public/data/world-index.json",import.meta.url);
const cacheUrl=new URL("../public/data/world-entities-cache.json",import.meta.url);
const npcMediaDir=new URL("../public/world/npcs/",import.meta.url);
const world=JSON.parse(await readFile(indexUrl,"utf8"));
let cache={monsters:{},npcs:{}};
try{cache=JSON.parse(await readFile(cacheUrl,"utf8"))}catch{/* Primera generación de la caché. */}
cache.monsters??={};
cache.npcs??={};
await mkdir(npcMediaDir,{recursive:true});

function decode(value=""){
  return value.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#0*39;|&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ");
}
function text(value=""){return decode(value.replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim()}
function normalize(value=""){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
async function exists(url){try{await access(url);return true}catch{return false}}
async function fetchText(url){
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(url,{headers:{"user-agent":"AscencionRO local world cache"}});
      if(response.ok)return await response.text();
    }catch{/* Reintenta la consulta pública. */}
    await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
  }
  return "";
}
async function download(url,target){
  if(await exists(target))return true;
  try{
    const response=await fetch(url,{headers:{"user-agent":"AscencionRO local world cache"}});
    if(!response.ok||!/^image\//i.test(response.headers.get("content-type")||""))return false;
    await writeFile(target,Buffer.from(await response.arrayBuffer()));
    return true;
  }catch{return false}
}
function parseMonsterLocations(html){
  const locations=[];
  const pattern=/<a\b[^>]*href=['"][^'"]*map=([^&'"]+)(?:&amp;|&)s_block=mob_block[^'"]*['"][^>]*>([\s\S]*?)<\/a>\s*<div\b[^>]*class=['"]tips_mm['"][^>]*>([\s\S]*?)<\/div>/gi;
  for(const match of html.matchAll(pattern)){
    const map=decode(match[1]),spawn=text(match[2]).replace(/\s+\(/," (").trim(),name=text(match[3]).replace(/^[-–]\s*/,"");
    if(!locations.some(location=>location.map===map))locations.push({map,name:name||map,spawn});
  }
  return locations;
}
function parseNpcCandidates(html){
  const starts=[...html.matchAll(/<div\b[^>]*class=['"]npc_shop['"][^>]*>/gi)].map(match=>match.index||0);
  return starts.map((start,index)=>html.slice(start,starts[index+1]??html.indexOf("Town map shortcuts",start))).map(block=>{
    const spriteId=block.match(/file5s\.ratemyserver\.net\/quests\/npcs\/(\d+)\.gif/i)?.[1]||null;
    const name=text(block.match(/<td\b[^>]*valign=['"]top['"][^>]*>\s*<b>([\s\S]*?)<\/b>/i)?.[1]||"");
    const position=block.match(/Map\s*(?:&amp;|&)\s*Position:<\/b>\s*([^\s<(]+)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    return {spriteId,name,map:position?decode(position[1]):null,x:position?Number(position[2]):null,y:position?Number(position[3]):null};
  }).filter(candidate=>candidate.spriteId&&candidate.name);
}
function chooseNpc(candidates,npc){
  const exact=candidates.filter(candidate=>normalize(candidate.name)===normalize(npc.name));
  const pool=exact.length?exact:candidates;
  const point=npc.points?.[0];
  return pool.sort((a,b)=>score(b,npc,point)-score(a,npc,point))[0]||null;
}
function score(candidate,npc,point){
  return (normalize(candidate.name)===normalize(npc.name)?12:0)+(candidate.map&&candidate.map===npc.map?8:0)+(point&&candidate.x===point.x&&candidate.y===point.y?5:0);
}

let monsterFetched=0,npcFetched=0,npcSprites=0;
for(const monster of world.monsters){
  if(cache.monsters[monster.id]?.locations?.length)continue;
  const html=await fetchText(`https://ratemyserver.net/index.php?mob_id=${monster.id}&page=mob_db`);
  cache.monsters[monster.id]={locations:parseMonsterLocations(html)};
  monsterFetched++;
}

for(let index=0;index<world.npcs.length;index+=5){
  await Promise.all(world.npcs.slice(index,index+5).map(async npc=>{
    const existing=cache.npcs[npc.id];
    if(existing?.checked)return;
    const url=new URL("https://ratemyserver.net/index.php");
    url.searchParams.set("npcsearch","Search");
    url.searchParams.set("page","nsw_npc_search");
    url.searchParams.set("snpc_name",npc.name);
    const html=await fetchText(url);
    const match=chooseNpc(parseNpcCandidates(html),npc);
    const result={checked:true,sprite:null,verifiedLocation:null};
    if(match?.spriteId){
      const target=new URL(`${match.spriteId}.gif`,npcMediaDir);
      if(await download(`https://file5s.ratemyserver.net/quests/npcs/${match.spriteId}.gif`,target)){
        result.sprite=`/world/npcs/${match.spriteId}.gif`;
        npcSprites++;
      }
      if(match.map&&match.x!==null&&match.y!==null)result.verifiedLocation={map:match.map,x:match.x,y:match.y};
    }
    cache.npcs[npc.id]=result;
    npcFetched++;
  }));
  await writeFile(cacheUrl,JSON.stringify(cache),"utf8");
  await new Promise(resolve=>setTimeout(resolve,120));
}

await writeFile(cacheUrl,JSON.stringify(cache),"utf8");
const located=Object.values(cache.monsters).filter(entry=>entry.locations?.length).length;
const sprites=Object.values(cache.npcs).filter(entry=>entry.sprite).length;
console.log(`Entidades locales: ${located}/${world.monsters.length} enemigos con mapas; ${sprites}/${world.npcs.length} NPC con sprite. Consultas nuevas: ${monsterFetched} enemigos, ${npcFetched} NPC; ${npcSprites} sprites descargados.`);
