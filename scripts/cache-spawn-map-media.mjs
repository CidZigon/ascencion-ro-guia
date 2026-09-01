import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";

// El catálogo de "Mundo" (world-index.json) solo conoce los mapas mencionados
// en el texto de las guías. El bestiario completo (monsters/chunk-*.json)
// referencia muchos más mapas de aparición que nunca pasan por ese índice.
// Este script cachea las imágenes que falten directamente en public/world/maps/,
// con la misma convención de nombre que ya usa cache-world-media.mjs, sin tocar
// world-index.json ni el catálogo curado de Mundo.

const monstersDir=new URL("../public/data/monsters/",import.meta.url);
const mapsDir=new URL("../public/world/maps/",import.meta.url);
await mkdir(mapsDir,{recursive:true});

const codes=new Set();
for(const file of (await readdir(monstersDir)).filter(name=>name.endsWith(".json"))){
  const { items } = JSON.parse(await readFile(new URL(file,monstersDir),"utf8"));
  for(const monster of items)for(const code of monster.maps??[])codes.add(code);
}

async function exists(url){try{await access(url);return true}catch{return false}}
async function cache(code){
  const target=new URL(`${code}.gif`,mapsDir);
  if(await exists(target))return "cached";
  const remotes=[`https://file5s.ratemyserver.net/maps_xl/${code}.gif`,`https://file5s.ratemyserver.net/maps_xl/${code}_re.gif`];
  for(const remote of remotes){
    try{
      const response=await fetch(remote,{headers:{"user-agent":"AscencionRO local reference cache"}});
      if(!response.ok||!/^image\//i.test(response.headers.get("content-type")||""))continue;
      await writeFile(target,Buffer.from(await response.arrayBuffer()));
      return "downloaded";
    }catch{/* Prueba la siguiente variante del recurso. */}
  }
  return "missing";
}

const list=[...codes];
const results=[];
for(let index=0;index<list.length;index+=8)results.push(...await Promise.all(list.slice(index,index+8).map(cache)));
const downloaded=results.filter(result=>result==="downloaded").length;
const cached=results.filter(result=>result==="cached").length;
const missing=list.filter((_,index)=>results[index]==="missing");
console.log(`Mapas de aparición: ${downloaded} descargados, ${cached} ya existentes, ${missing.length} sin imagen disponible.`);
if(missing.length)console.log(`Sin imagen: ${missing.join(", ")}`);
