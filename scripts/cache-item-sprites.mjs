import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const catalog=JSON.parse(await readFile(new URL("../public/data/items-index.json",import.meta.url),"utf8"));
const outputDir=new URL("../public/world/items/",import.meta.url);
const manifestUrl=new URL("../public/data/item-sprites.json",import.meta.url);
const refresh=process.argv.includes("--refresh");
let previous={sprites:{}};
try{previous=JSON.parse(await readFile(manifestUrl,"utf8"))}catch{/* Primera generación de los sprites. */}
await mkdir(outputDir,{recursive:true});

async function fetchBytes(url){
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(url,{headers:{"user-agent":"AscencionRO local item sprite cache"}});
      const type=response.headers.get("content-type")||"";
      if(response.ok&&/^image\//i.test(type))return {bytes:Buffer.from(await response.arrayBuffer()),type};
    }catch{/* Reintenta una descarga pública interrumpida. */}
    await new Promise(resolve=>setTimeout(resolve,180*(attempt+1)));
  }
  return null;
}
async function removeIfPresent(url){try{await unlink(url)}catch{/* No existe una variante anterior. */}}

const placeholder=await fetchBytes("https://file5s.ratemyserver.net/items/small/999999.gif");
const placeholderHash=placeholder?createHash("sha1").update(placeholder.bytes).digest("hex"):"";
const sprites={},sourceCounts={ratemyserver:0,divinePride:0,cached:0,inherited:0,missing:0};

async function cacheItem(item){
  const oldPath=previous.sprites?.[item.id];
  if(!refresh&&oldPath){sprites[item.id]=oldPath;sourceCounts.cached++;return}

  const rms=await fetchBytes(`https://file5s.ratemyserver.net/items/small/${item.id}.gif`);
  const rmsHash=rms?createHash("sha1").update(rms.bytes).digest("hex"):"";
  if(rms&&rmsHash!==placeholderHash){
    const target=new URL(`${item.id}.gif`,outputDir);
    await writeFile(target,rms.bytes);
    await removeIfPresent(new URL(`${item.id}.png`,outputDir));
    sprites[item.id]=`/world/items/${item.id}.gif`;
    sourceCounts.ratemyserver++;
    return;
  }

  for(const region of ["iRO","kRO"]){
    const fallback=await fetchBytes(`https://www.divine-pride.net/img/items/item/${region}/${item.id}`);
    if(!fallback)continue;
    const target=new URL(`${item.id}.png`,outputDir);
    await writeFile(target,fallback.bytes);
    await removeIfPresent(new URL(`${item.id}.gif`,outputDir));
    sprites[item.id]=`/world/items/${item.id}.png`;
    sourceCounts.divinePride++;
    return;
  }
  sourceCounts.missing++;
}

for(let index=0;index<catalog.items.length;index+=24){
  await Promise.all(catalog.items.slice(index,index+24).map(cacheItem));
  if(index&&index%480===0)console.log(`Sprites de objetos: ${Math.min(index+24,catalog.items.length)} / ${catalog.items.length}`);
}

function spriteKey(value=""){return value.toLowerCase().replace(/^e_/i,"").replace(/_c$/i,"").replace(/_box\d*$/i,"").replace(/_+/g,"_").replace(/\d+$/," ").replace(/[^a-z0-9]+/g," ").trim()}
const available=catalog.items.filter(item=>sprites[item.id]);
const byName=new Map(),byAegis=new Map();
for(const item of available){
  const name=spriteKey(item.name),aegis=spriteKey(item.aegisName);
  if(name&&!byName.has(name))byName.set(name,item);
  if(aegis&&!byAegis.has(aegis))byAegis.set(aegis,item);
}
const representatives={Healing:501,Delayconsume:601,Usable:602,Etc:909,Weapon:1101,Ammo:1750,Armor:2301,Card:4001,Petegg:9001,Petarmor:10001,Cash:12208};
for(const item of catalog.items.filter(entry=>!sprites[entry.id])){
  const source=byAegis.get(spriteKey(item.aegisName))??byName.get(spriteKey(item.name))??catalog.items.find(entry=>entry.id===representatives[item.type]);
  if(source&&sprites[source.id]){sprites[item.id]=sprites[source.id];sourceCounts.inherited++;sourceCounts.missing--}
}

const exact=Object.entries(sprites).filter(([id,path])=>path.endsWith(`/${id}.gif`)||path.endsWith(`/${id}.png`)).length;
const manifest={
  meta:{
    count:Object.keys(sprites).length,
    requested:catalog.items.length,
    missing:sourceCounts.missing,
    exact,
    inherited:catalog.items.length-exact,
    rmsGif:Object.entries(sprites).filter(([id,path])=>path.endsWith(`/${id}.gif`)).length,
    divinePridePng:Object.entries(sprites).filter(([id,path])=>path.endsWith(`/${id}.png`)).length,
    sources:["RateMyServer item sprites","Divine Pride item images"],
  },
  sprites,
};
await writeFile(manifestUrl,`${JSON.stringify(manifest)}\n`,"utf8");
console.log(`Sprites locales de objetos: ${manifest.meta.count}/${manifest.meta.requested}; RMS ${sourceCounts.ratemyserver}, Divine Pride ${sourceCounts.divinePride}, caché ${sourceCounts.cached}, heredados ${sourceCounts.inherited}, faltantes ${sourceCounts.missing}.`);
