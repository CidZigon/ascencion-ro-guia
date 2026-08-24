import { access, mkdir, readFile, writeFile } from "node:fs/promises";

const indexUrl=new URL("../public/data/world-index.json",import.meta.url);
const world=JSON.parse(await readFile(indexUrl,"utf8"));
const targets=[
  ...world.monsters.map(monster=>({
    target:new URL(`../public/world/sprites/${monster.id}.gif`,import.meta.url),
    publicPath:`/world/sprites/${monster.id}.gif`,
    remotes:[`https://file5s.ratemyserver.net/mobs/${monster.id}.gif`],
    entry:monster,
    field:"sprite",
  })),
  ...world.maps.filter(map=>!map.id.startsWith("area-")).map(map=>({
    target:new URL(`../public/world/maps/${map.id}.gif`,import.meta.url),
    publicPath:`/world/maps/${map.id}.gif`,
    remotes:[`https://file5s.ratemyserver.net/maps_xl/${map.id}.gif`,`https://file5s.ratemyserver.net/maps_xl/${map.id}_re.gif`],
    entry:map,
    field:"image",
  })),
];

await mkdir(new URL("../public/world/sprites/",import.meta.url),{recursive:true});
await mkdir(new URL("../public/world/maps/",import.meta.url),{recursive:true});

async function exists(url){try{await access(url);return true}catch{return false}}
async function cache(target){
  if(!target.refresh&&await exists(target.target)){target.entry[target.field]=target.publicPath;return "cached"}
  for(const remote of target.remotes){
    try{
      const response=await fetch(remote,{headers:{"user-agent":"AscencionRO local reference cache"}});
      if(!response.ok||!/^image\//i.test(response.headers.get("content-type")||""))continue;
      await writeFile(target.target,Buffer.from(await response.arrayBuffer()));
      target.entry[target.field]=target.publicPath;
      return "downloaded";
    }catch{/* Prueba la siguiente variante del recurso. */}
  }
  if(await exists(target.target)){target.entry[target.field]=target.publicPath;return "cached"}
  return "missing";
}

const results=[];
for(let index=0;index<targets.length;index+=8)results.push(...await Promise.all(targets.slice(index,index+8).map(cache)));
await writeFile(indexUrl,JSON.stringify(world),"utf8");
const downloaded=results.filter(result=>result==="downloaded").length;
const cached=results.filter(result=>result==="cached").length;
const missing=results.filter(result=>result==="missing").length;
console.log(`Medios del mundo: ${downloaded} descargados, ${cached} existentes y ${missing} sin imagen disponible.`);
