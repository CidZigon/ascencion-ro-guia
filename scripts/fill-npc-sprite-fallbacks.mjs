import { mkdir, readFile, writeFile } from "node:fs/promises";

const worldUrl=new URL("../public/data/world-index.json",import.meta.url);
const cacheUrl=new URL("../public/data/world-entities-cache.json",import.meta.url);
const spriteDir=new URL("../public/world/npcs/",import.meta.url);
const world=JSON.parse(await readFile(worldUrl,"utf8"));
const cache=JSON.parse(await readFile(cacheUrl,"utf8"));
cache.npcs??={};
await mkdir(spriteDir,{recursive:true});

function normalize(value=""){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function aliasNames(value=""){return [...new Set([value,...value.split(new RegExp("[/—]")),value.replace(/\([^)]*\)/g," ")].map(normalize).filter(name=>name.length>=3))]}
function samePoint(left,right){return left.map&&left.map===right.map&&(left.points??[]).some(a=>(right.points??[]).some(b=>a.x===b.x&&a.y===b.y))}
function hash(value){let result=0;for(const char of value)result=(result*31+char.charCodeAt(0))>>>0;return result}

const verified=world.npcs.filter(npc=>npc.sprite),byName=new Map();
for(const npc of verified)for(const alias of aliasNames(npc.name))if(!byName.has(alias))byName.set(alias,npc);
const roles=[
  {pattern:/blacksmith|merchant|trader|seller|weapon|altiregen|geschup/i,id:731,role:"mercader / herrero"},
  {pattern:/assassin|thief|rogue/i,id:730,role:"thief / assassin"},
  {pattern:/mage|wizard|sorcer|magic/i,id:735,role:"mage / wizard"},
  {pattern:/hunter|archer|bow/i,id:732,role:"archer / hunter"},
  {pattern:/sage|scholar|library|book/i,id:754,role:"sage / erudito"},
  {pattern:/priest|pope|sister|father|church|acolyte/i,id:79,role:"iglesia"},
  {pattern:/crusader|knight|guard|sword|soldier|commander/i,id:751,role:"guardia / knight"},
  {pattern:/monk|friar/i,id:753,role:"monk"},
  {pattern:/kid|boy|child|girl/i,id:82,role:"niño"},
  {pattern:/laphine|fairy|grenouille/i,id:436,role:"laphine"},
];
const generic=[83,84,85,90,91,92];
const required=new Set([...roles.map(role=>role.id),...generic]);
for(const id of required){
  try{
    const response=await fetch(`https://file5s.ratemyserver.net/quests/npcs/${id}.gif`,{headers:{"user-agent":"AscencionRO local NPC sprite cache"}});
    if(response.ok&&/^image\//i.test(response.headers.get("content-type")||""))await writeFile(new URL(`${id}.gif`,spriteDir),Buffer.from(await response.arrayBuffer()));
  }catch{/* El archivo puede existir ya en la caché local. */}
}

let inherited=0,representative=0;
for(const npc of world.npcs.filter(entry=>!entry.sprite)){
  const aliases=aliasNames(npc.name);
  const named=aliases.map(alias=>byName.get(alias)).find(Boolean);
  const colocated=verified.find(candidate=>samePoint(candidate,npc));
  const source=named??colocated;
  if(source?.sprite){
    cache.npcs[npc.id]={...(cache.npcs[npc.id]??{}),checked:true,sprite:source.sprite,spriteApproximate:Boolean(source.spriteApproximate||!named),source:named?"sprite heredado por identidad":"sprite representativo por ubicación"};
    inherited++;
    continue;
  }
  const role=roles.find(entry=>entry.pattern.test(`${npc.name} ${npc.contexts?.join(" ")??""}`));
  const id=role?.id??generic[hash(npc.id)%generic.length];
  cache.npcs[npc.id]={...(cache.npcs[npc.id]??{}),checked:true,sprite:`/world/npcs/${id}.gif`,spriteApproximate:true,source:`representación de rol: ${role?.role??"habitante de Midgard"}`};
  representative++;
}

await writeFile(cacheUrl,JSON.stringify(cache),"utf8");
const total=Object.values(cache.npcs).filter(entry=>entry.sprite).length;
const approximate=Object.values(cache.npcs).filter(entry=>entry.spriteApproximate).length;
console.log(`Cobertura visual NPC: ${total}/${world.npcs.length}; ${inherited} heredados, ${representative} representaciones de rol, ${approximate} marcados como aproximados.`);
