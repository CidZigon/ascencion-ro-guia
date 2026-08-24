import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const REVISION="e985006171d2eb320ee512a653f4c83aea3d81b6";
const worldUrl=new URL("../public/data/world-index.json",import.meta.url);
const cacheUrl=new URL("../public/data/world-entities-cache.json",import.meta.url);
const spriteDir=new URL("../public/world/npcs/",import.meta.url);
const world=JSON.parse(await readFile(worldUrl,"utf8"));
const cache=JSON.parse(await readFile(cacheUrl,"utf8"));
cache.npcs??={};
await mkdir(spriteDir,{recursive:true});

function normalize(value=""){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function run(file,args){return new Promise((resolve,reject)=>{const child=spawn(file,args,{stdio:"ignore"});child.on("error",reject);child.on("exit",code=>code===0?resolve():reject(new Error(`${file} terminó con código ${code}`)))})}
async function filesInside(directory){
  const found=[];
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const path=join(directory,entry.name);
    if(entry.isDirectory())found.push(...await filesInside(path));
    else if(entry.name.endsWith(".txt"))found.push(path);
  }
  return found;
}
async function fetchBuffer(url){
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(url,{headers:{"user-agent":"AscencionRO local NPC sprite cache"}});
      if(response.ok)return Buffer.from(await response.arrayBuffer());
    }catch{/* Reintenta una descarga pública interrumpida. */}
    await new Promise(resolve=>setTimeout(resolve,200*(attempt+1)));
  }
  return null;
}

const workDir=await mkdtemp(join(tmpdir(),"ascencionro-rathena-"));
try{
  const archive=join(workDir,"rathena.tgz");
  const tarball=await fetchBuffer(`https://codeload.github.com/rathena/rathena/tar.gz/${REVISION}`);
  if(!tarball)throw new Error("No se pudo descargar la revisión pública de rAthena");
  await writeFile(archive,tarball);
  await run(process.platform==="win32"?"tar.exe":"tar",["-xzf",archive,"-C",workDir]);

  const root=join(workDir,`rathena-${REVISION}`),npcRoot=join(root,"npc");
  const identityResponse=await fetch("https://raw.githubusercontent.com/ThemonChan/Translation/master/Data/luafiles514/lua%20files/datainfo/NPCIdentity.lub",{headers:{"user-agent":"AscencionRO local NPC sprite cache"}});
  if(!identityResponse.ok)throw new Error("No se pudo cargar la tabla pública de identidades de NPC");
  const identity=await identityResponse.text(),constants={};
  for(const match of identity.matchAll(/\b(JT_[A-Z0-9_]+)\s*=\s*(\d+)\s*,/g))constants[match[1]]=Number(match[2]);

  const entries=[];
  for(const file of await filesInside(npcRoot)){
    const content=await readFile(file,"utf8");
    for(const line of content.split(/\r?\n/)){
      if(!line||/^\s*\/\//.test(line))continue;
      const match=line.match(/^([a-z0-9@_]+),(\d+),(\d+),(?:\d+)\s+\t?(?:script|shop|cashshop)\s+\t?([^\t]+?)\s+\t?([A-Z0-9_]+)(?:,|\s|$)/i);
      if(!match)continue;
      const view=/^\d+$/.test(match[5])?Number(match[5]):constants[match[5].startsWith("JT_")?match[5]:`JT_${match[5]}`];
      if(view)entries.push({map:match[1],x:Number(match[2]),y:Number(match[3]),name:match[4].replace(/#[^\s]+/g," ").trim(),view});
    }
  }

  function candidateFor(npc){
    const points=npc.points??[],name=normalize(npc.name);
    const exact=entries.filter(entry=>entry.map===npc.map&&points.some(point=>point.x===entry.x&&point.y===entry.y));
    if(exact.length)return exact.sort((a,b)=>Number(normalize(b.name)===name)-Number(normalize(a.name)===name))[0];
    return entries.find(entry=>entry.map===npc.map&&normalize(entry.name)===name)??null;
  }

  let matched=0,downloaded=0;
  const missing=world.npcs.filter(npc=>!cache.npcs[npc.id]?.sprite);
  for(let index=0;index<missing.length;index+=16){
    await Promise.all(missing.slice(index,index+16).map(async npc=>{
      const candidate=candidateFor(npc);
      if(!candidate)return;
      matched++;
      const bytes=await fetchBuffer(`https://file5s.ratemyserver.net/quests/npcs/${candidate.view}.gif`);
      if(!bytes)return;
      await writeFile(new URL(`${candidate.view}.gif`,spriteDir),bytes);
      cache.npcs[npc.id]={...(cache.npcs[npc.id]??{}),checked:true,sprite:`/world/npcs/${candidate.view}.gif`,verifiedLocation:{map:candidate.map,x:candidate.x,y:candidate.y},source:"rAthena coordinates + client identity"};
      downloaded++;
    }));
    console.log(`Cruce rAthena: ${Math.min(index+16,missing.length)} / ${missing.length}`);
  }
  await writeFile(cacheUrl,JSON.stringify(cache),"utf8");
  const total=Object.values(cache.npcs).filter(entry=>entry.sprite).length;
  console.log(`Sprites NPC tras cruce local: ${total}/${world.npcs.length}; ${matched} coincidencias de script, ${downloaded} imágenes añadidas.`);
}finally{
  const safePrefix=join(tmpdir(),"ascencionro-rathena-");
  if(workDir.startsWith(safePrefix))await rm(workDir,{recursive:true,force:true});
}
