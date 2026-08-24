"use client";
/* eslint-disable @next/next/no-img-element -- sprites oficiales pequeños servidos desde la caché local */

import { useEffect, useMemo, useState } from "react";

type CatalogMeta = {
  count:number; revision:string; snapshotDate:string; source:string; sourceUrl:string;
  chunks:number; typeCounts:Record<string,number>;
};
type ItemIndex = {
  id:number; name:string; aegisName:string; sprite?:string; type:string; subType?:string; buy?:number; sell?:number;
  weight?:number; attack?:number; defense?:number; slots?:number; equipLevelMin?:number;
  refineable?:boolean; locations?:string[]; chunk:number;
};
type ItemDetail = ItemIndex & {
  magicAttack?:number; range?:number; weaponLevel?:number; armorLevel?:number; equipLevelMax?:number;
  gradable?:boolean; view?:number; gender?:string; jobs:string[]; classes:string[]; flags?:Record<string,unknown>;
  trade?:Record<string,unknown>; script?:string; equipScript?:string; unEquipScript?:string; sourceFile:string;
};
type CatalogPayload = { meta:CatalogMeta; items:ItemIndex[] };

let catalogPromise:Promise<CatalogPayload>|null=null;
const detailChunks=new Map<number,Promise<ItemDetail[]>>();

function loadCatalog(){
  catalogPromise??=fetch("/data/items-index.json").then(response=>{if(!response.ok)throw new Error("catalog");return response.json()});
  return catalogPromise;
}
function loadChunk(chunk:number){
  if(!detailChunks.has(chunk))detailChunks.set(chunk,fetch(`/data/items/chunk-${String(chunk).padStart(3,"0")}.json`).then(response=>{if(!response.ok)throw new Error("detail");return response.json()}).then(data=>data.items));
  return detailChunks.get(chunk)!;
}
function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function zeny(value?:number){return value===undefined?"—":`${new Intl.NumberFormat("es-ES").format(value)} z`}
function weight(value?:number){return value===undefined?"—":`${(value/10).toLocaleString("es-ES",{maximumFractionDigits:1})}`}
function list(value?:string[]){return value?.length?value.map(item=>item.replaceAll("_"," ")).join(", "):"Todos / no restringido"}
const TYPE_LABELS:Record<string,string>={Healing:"Curación",Delayconsume:"Consumible diferido",Usable:"Usable",Etc:"Material / Etc.",Weapon:"Arma",Ammo:"Munición",Armor:"Armadura",Card:"Carta",Petegg:"Huevo de pet",Petarmor:"Accesorio de pet",Cash:"Cash"};
const TYPE_SIGILS:Record<string,string>={Healing:"✚",Delayconsume:"◷",Usable:"✦",Etc:"◆",Weapon:"⚔",Ammo:"➶",Armor:"⬟",Card:"▣",Petegg:"◉",Petarmor:"♢",Cash:"✧"};

export function ItemCatalog({selectedItemId,initialQuery,onSelectItem}:{selectedItemId:number|null;initialQuery:string;onSelectItem:(id:number)=>void}){
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null);
  const [detail,setDetail]=useState<ItemDetail|null>(null);
  const [query,setQuery]=useState(initialQuery);
  const [type,setType]=useState("all");
  const [sort,setSort]=useState("id");
  const [refineable,setRefineable]=useState(false);
  const [limit,setLimit]=useState(80);
  const [error,setError]=useState(false);

  useEffect(()=>{let live=true;loadCatalog().then(data=>{if(live)setCatalog(data)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[]);
  useEffect(()=>{
    if(!catalog||selectedItemId===null)return;
    const entry=catalog.items.find(item=>item.id===selectedItemId);
    if(!entry)return;
    let live=true;
    loadChunk(entry.chunk).then(items=>{if(live)setDetail(items.find(item=>item.id===selectedItemId)??null)}).catch(()=>{if(live)setError(true)});
    return()=>{live=false};
  },[catalog,selectedItemId]);

  const types=useMemo(()=>catalog?Object.entries(catalog.meta.typeCounts).sort((a,b)=>a[0].localeCompare(b[0])):[],[catalog]);
  const filtered=useMemo(()=>{
    if(!catalog)return[];
    const key=normalize(query.trim());
    const result=catalog.items.filter(item=>(type==="all"||item.type===type)&&(!refineable||item.refineable)&&(!key||normalize(`${item.id} ${item.name} ${item.aegisName} ${item.type} ${item.subType??""}`).includes(key)));
    return result.sort((left,right)=>sort==="name"?left.name.localeCompare(right.name):sort==="type"?left.type.localeCompare(right.type)||left.id-right.id:left.id-right.id);
  },[catalog,query,type,refineable,sort]);
  const activeDetail=detail?.id===selectedItemId?detail:null;

  if(error)return <section className="catalog-fatal"><h1>Catálogo no disponible</h1><p>No se pudo abrir la copia local. Intenta recargar la página.</p></section>;
  if(!catalog)return <section className="catalog-loading"><div className="loader"/><p>Abriendo la base local de objetos…</p></section>;

  return <section className="item-catalog">
    <header className="catalog-hero">
      <div><h1>Objetos de Midgard</h1><p>Encuentra cualquiera de los {catalog.meta.count.toLocaleString("es-ES")} objetos por nombre, Aegis o ID. Las fichas se abren aquí mismo.</p></div>
    </header>
    <div className="catalog-toolbar">
      <label className="catalog-search"><span>Buscar por nombre, Aegis o ID</span><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(80)}} placeholder="Ej. Poring Card, Red Potion, 501…"/></label>
      <label><span>Tipo</span><select value={type} onChange={event=>{setType(event.target.value);setLimit(80)}}><option value="all">Todos los tipos</option>{types.map(([name,count])=><option key={name} value={name}>{TYPE_LABELS[name]??name} · {count}</option>)}</select></label>
      <label><span>Orden</span><select value={sort} onChange={event=>setSort(event.target.value)}><option value="id">ID</option><option value="name">Nombre</option><option value="type">Tipo</option></select></label>
      <button className={refineable?"catalog-toggle active":"catalog-toggle"} onClick={()=>{setRefineable(value=>!value);setLimit(80)}} aria-pressed={refineable}>Refinables</button>
    </div>
    <div className="catalog-body">
      <div className="catalog-results">
        <div className="catalog-status"><b>{filtered.length.toLocaleString("es-ES")}</b> coincidencias</div>
        <div className="item-list">{filtered.slice(0,limit).map(item=><button key={item.id} className={selectedItemId===item.id?"item-row selected":"item-row"} onClick={()=>onSelectItem(item.id)}>
          <ItemSprite item={item} className="item-sigil"/>
          <span className="item-main"><b>{item.name}</b><small>{TYPE_LABELS[item.type]??item.type}{item.subType?` · ${item.subType}`:""}{item.slots!==undefined?` · ${item.slots} slot${item.slots===1?"":"s"}`:""}</small></span>
          <span className="item-id">#{item.id}</span>
        </button>)}</div>
        {!filtered.length&&<div className="catalog-empty"><b>No encontramos ese objeto.</b><span>Prueba por ID, nombre en inglés o nombre Aegis.</span></div>}
        {limit<filtered.length&&<button className="load-more" onClick={()=>setLimit(value=>value+80)}>Mostrar 80 más</button>}
      </div>
      <aside className="item-detail">{selectedItemId===null?<div className="detail-placeholder"><span>◆</span><h2>Selecciona un objeto</h2><p>Su ficha se abre desde esta lista o desde cualquier enlace dentro de las guías.</p></div>:!activeDetail?<div className="detail-placeholder"><div className="loader"/><p>Cargando ficha…</p></div>:<ItemDetailCard item={activeDetail}/>}</aside>
    </div>
  </section>;
}

function ItemDetailCard({item}:{item:ItemDetail}){
  const scripts=[['Efecto / uso',item.script],['Al equipar',item.equipScript],['Al desequipar',item.unEquipScript]].filter((entry):entry is [string,string]=>Boolean(entry[1]));
  return <div className="detail-card">
    <div className="detail-title"><ItemSprite item={item} className="detail-sigil" detail/><div><span>#{item.id}</span><h2>{item.name}</h2><code>{item.aegisName}</code></div></div>
    <div className="detail-badges"><span>{TYPE_LABELS[item.type]??item.type}</span>{item.subType&&<span>{item.subType}</span>}{item.refineable&&<span>Refinable</span>}</div>
    <dl className="stat-grid">
      <div><dt>Compra</dt><dd>{zeny(item.buy)}</dd></div><div><dt>Venta</dt><dd>{zeny(item.sell)}</dd></div>
      <div><dt>Peso</dt><dd>{weight(item.weight)}</dd></div><div><dt>Nivel mínimo</dt><dd>{item.equipLevelMin??"—"}</dd></div>
      <div><dt>ATK</dt><dd>{item.attack??"—"}</dd></div><div><dt>MATK</dt><dd>{item.magicAttack??"—"}</dd></div>
      <div><dt>DEF</dt><dd>{item.defense??"—"}</dd></div><div><dt>Slots</dt><dd>{item.slots??"—"}</dd></div>
    </dl>
    <section className="detail-section"><h3>Ubicación de equipo</h3><p>{list(item.locations)}</p></section>
    <section className="detail-section"><h3>Jobs compatibles</h3><p>{list(item.jobs)}</p></section>
    {item.classes.length>0&&<section className="detail-section"><h3>Clases</h3><p>{list(item.classes)}</p></section>}
    {scripts.length>0&&<section className="detail-section"><h3>Mecánica verificada</h3>{scripts.map(([label,script])=><details key={label}><summary>{label}</summary><pre>{script}</pre></details>)}</section>}
    {(item.trade||item.flags)&&<section className="detail-section"><details><summary>Restricciones y banderas</summary><pre>{JSON.stringify({flags:item.flags,trade:item.trade},null,2)}</pre></details></section>}
  </div>;
}

function ItemSprite({item,className,detail=false}:{item:ItemIndex;className:string;detail?:boolean}){
  const fallback=TYPE_SIGILS[item.type]??"◆";
  if(!item.sprite)return <span className={className}>{fallback}</span>;
  return <span className={`${className} item-sprite`}><img src={item.sprite} alt={detail?`Sprite de ${item.name}`:""} loading={detail?"eager":"lazy"} onError={event=>event.currentTarget.parentElement?.classList.add("sprite-broken")}/><i aria-hidden="true">{fallback}</i></span>;
}
