"use client";
/* eslint-disable @next/next/no-img-element -- sprites oficiales pequeños servidos desde la caché local */

import { useEffect, useMemo, useState } from "react";
import { EQUIP_SLOTS, WEAPON_KINDS } from "./gear";

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
  trade?:Record<string,unknown>; script?:string; equipScript?:string; unEquipScript?:string; description?:string; sourceFile:string;
};
type CatalogPayload = { meta:CatalogMeta; items:ItemIndex[] };

type ItemSources = {
  drops:{id:number;name:string;rate:number;mvp?:boolean;maps:string[]}[];
  shops:{name:string;map:string;x:number;y:number;price:number;cash?:boolean}[];
};

let catalogPromise:Promise<CatalogPayload>|null=null;
const detailChunks=new Map<number,Promise<ItemDetail[]>>();
const sourceChunks=new Map<number,Promise<Record<string,ItemSources>>>();

function loadCatalog(){
  catalogPromise??=fetch("/data/items-index.json").then(response=>{if(!response.ok)throw new Error("catalog");return response.json()});
  return catalogPromise;
}
function loadChunk(chunk:number){
  if(!detailChunks.has(chunk))detailChunks.set(chunk,fetch(`/data/items/chunk-${String(chunk).padStart(3,"0")}.json`).then(response=>{if(!response.ok)throw new Error("detail");return response.json()}).then(data=>data.items));
  return detailChunks.get(chunk)!;
}
function loadSources(chunk:number){
  if(!sourceChunks.has(chunk))sourceChunks.set(chunk,fetch(`/data/item-sources/chunk-${String(chunk).padStart(3,"0")}.json`).then(response=>response.ok?response.json():{items:{}}).then(data=>data.items??{}).catch(()=>({})));
  return sourceChunks.get(chunk)!;
}
function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function zeny(value?:number){return value===undefined?"—":`${new Intl.NumberFormat("es-ES").format(value)} z`}
function weight(value?:number){return value===undefined?"—":`${(value/10).toLocaleString("es-ES",{maximumFractionDigits:1})}`}
function dropRate(rate:number){
  return `${(rate/100).toLocaleString("es-ES",{minimumFractionDigits:rate%100===0?0:2,maximumFractionDigits:2})}%`;
}
function list(value?:string[]){return value?.length?value.map(item=>LOCATION_LABELS[item]??item.replaceAll("_"," ")).join(", "):"Todos / no restringido"}
const TYPE_LABELS:Record<string,string>={Healing:"Curación",Delayconsume:"Consumible diferido",Usable:"Usable",Etc:"Material / Etc.",Weapon:"Arma",Ammo:"Munición",Armor:"Armadura",Card:"Carta",Petegg:"Huevo de pet",Petarmor:"Accesorio de pet",Cash:"Cash"};
const TYPE_SIGILS:Record<string,string>={Healing:"✚",Delayconsume:"◷",Usable:"✦",Etc:"◆",Weapon:"⚔",Ammo:"➶",Armor:"⬟",Card:"▣",Petegg:"◉",Petarmor:"♢",Cash:"✧"};
const LOCATION_LABELS:Record<string,string>={
  Head_Top:"Casco (superior)",Head_Mid:"Casco (medio)",Head_Low:"Casco (inferior)",
  Armor:"Armadura",Garment:"Capa",Shoes:"Zapatos",Both_Accessory:"Accesorios",Left_Hand:"Escudo",
  Right_Hand:"Mano derecha",Both_Hand:"Dos manos",Ammo:"Munición",
  Costume_Head_Top:"Costume (superior)",Costume_Head_Mid:"Costume (medio)",Costume_Head_Low:"Costume (inferior)",
};

/* Categorías visibles del catálogo. Cada una agrupa uno o varios tipos de rAthena;
   son las que sustituyen a los antiguos menús «Equipo» y «Armas». */
type Category = { id:string; label:string; sigil:string; types:string[]|null; facets:"slot"|"weapon"|null };
const CATEGORIES:Category[]=[
  {id:"all",         label:"Todo",        sigil:"◈", types:null,                                   facets:null},
  {id:"equipo",      label:"Equipo",      sigil:"⬟", types:["Armor"],                              facets:"slot"},
  {id:"armas",       label:"Armas",       sigil:"⚔", types:["Weapon"],                             facets:"weapon"},
  {id:"cartas",      label:"Cartas",      sigil:"▣", types:["Card"],                               facets:null},
  {id:"consumibles", label:"Consumibles", sigil:"✚", types:["Healing","Usable","Delayconsume"],    facets:null},
  {id:"materiales",  label:"Materiales",  sigil:"◆", types:["Etc"],                                facets:null},
  {id:"municion",    label:"Munición",    sigil:"➶", types:["Ammo"],                               facets:null},
  {id:"pets",        label:"Pets",        sigil:"◉", types:["Petegg","Petarmor"],                  facets:null},
  {id:"cash",        label:"Cash",        sigil:"✧", types:["Cash"],                               facets:null},
];
const categoryById=(id:string)=>CATEGORIES.find(entry=>entry.id===id)??CATEGORIES[0];

/* Tramos de nivel mínimo. Cubren el recorrido real de un personaje Pre-Renewal. */
const LEVEL_BANDS=[
  {id:"1-24",  label:"1–24",  min:1,  max:24},
  {id:"25-49", label:"25–49", min:25, max:49},
  {id:"50-74", label:"50–74", min:50, max:74},
  {id:"75+",   label:"75+",   min:75, max:Infinity},
];
const SLOT_CHOICES=[0,1,2,3,4];

export type CatalogScope =
  | { kind:"slot"; location:string; eyebrow:string; title:string; description:string }
  | { kind:"weapon"; subType:string; eyebrow:string; title:string; description:string };

export function ItemCatalog({selectedItemId,initialQuery,onSelectItem,onOpenMonster,scope}:{selectedItemId:number|null;initialQuery:string;onSelectItem:(id:number)=>void;onOpenMonster:(options:{id:number})=>void;scope?:CatalogScope}){
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null);
  const [detail,setDetail]=useState<ItemDetail|null>(null);
  const [sourceResult,setSourceResult]=useState<{itemId:number;sources:ItemSources}|null>(null);
  const [query,setQuery]=useState(initialQuery);
  // Un enlace como #arma-dagger ya no bloquea la vista: solo deja los filtros puestos.
  const [category,setCategory]=useState(()=>scope?.kind==="slot"?"equipo":scope?.kind==="weapon"?"armas":"all");
  const [facet,setFacet]=useState<string|null>(()=>scope?.kind==="slot"?scope.location:scope?.kind==="weapon"?scope.subType:null);
  const [slotFilter,setSlotFilter]=useState<number|null>(null);
  const [levelBand,setLevelBand]=useState<string|null>(null);
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
    loadSources(entry.chunk).then(payload=>{if(live)setSourceResult({itemId:selectedItemId,sources:payload[selectedItemId]??payload[String(selectedItemId)]??{drops:[],shops:[]}})}).catch(()=>{if(live)setSourceResult({itemId:selectedItemId,sources:{drops:[],shops:[]}})});
    return()=>{live=false};
  },[catalog,selectedItemId]);

  const activeCategory=categoryById(category);
  const inCategory=useMemo(()=>(item:ItemIndex)=>!activeCategory.types||activeCategory.types.includes(item.type),[activeCategory]);
  const inFacet=useMemo(()=>(item:ItemIndex)=>{
    if(!facet)return true;
    if(activeCategory.facets==="slot")return item.type!=="Card"&&Boolean(item.locations?.includes(facet));
    if(activeCategory.facets==="weapon")return item.subType===facet;
    return true;
  },[facet,activeCategory]);

  // Los contadores de los chips se calculan sobre lo que ya coincide con la búsqueda,
  // así el número dice cuántos resultados quedarían al pulsarlo.
  const searched=useMemo(()=>{
    if(!catalog)return[];
    const key=normalize(query.trim());
    if(!key)return catalog.items;
    return catalog.items.filter(item=>normalize(`${item.id} ${item.name} ${item.aegisName} ${item.type} ${item.subType??""}`).includes(key));
  },[catalog,query]);

  const categoryCounts=useMemo(()=>{
    const counts:Record<string,number>={};
    for(const entry of CATEGORIES)counts[entry.id]=0;
    for(const item of searched)for(const entry of CATEGORIES)if(!entry.types||entry.types.includes(item.type))counts[entry.id]++;
    return counts;
  },[searched]);

  const facetCounts=useMemo(()=>{
    const counts:Record<string,number>={};
    if(!activeCategory.facets)return counts;
    for(const item of searched){
      if(!inCategory(item))continue;
      if(activeCategory.facets==="slot"){if(item.type==="Card")continue;for(const location of item.locations??[])counts[location]=(counts[location]??0)+1}
      else if(item.subType)counts[item.subType]=(counts[item.subType]??0)+1;
    }
    return counts;
  },[searched,activeCategory,inCategory]);

  const filtered=useMemo(()=>{
    const band=levelBand?LEVEL_BANDS.find(entry=>entry.id===levelBand):undefined;
    const result=searched.filter(item=>{
      if(!inCategory(item))return false;
      if(!inFacet(item))return false;
      if(refineable&&!item.refineable)return false;
      if(slotFilter!==null&&(item.slots??0)!==slotFilter)return false;
      if(band){const level=item.equipLevelMin??0;if(level<band.min||level>band.max)return false}
      return true;
    });
    return result.sort((left,right)=>
      sort==="name"?left.name.localeCompare(right.name):
      sort==="level"?(left.equipLevelMin??0)-(right.equipLevelMin??0)||left.id-right.id:
      sort==="type"?left.type.localeCompare(right.type)||left.id-right.id:
      left.id-right.id);
  },[searched,inCategory,inFacet,refineable,slotFilter,levelBand,sort]);

  const activeDetail=detail?.id===selectedItemId?detail:null;
  const activeSources=sourceResult?.itemId===selectedItemId?sourceResult.sources:null;
  const showGear=activeCategory.facets!==null;
  const anyFilter=category!=="all"||facet!==null||slotFilter!==null||levelBand!==null||refineable||query.trim()!=="";

  const pickCategory=(id:string)=>{setCategory(id);setFacet(null);setSlotFilter(null);setLevelBand(null);setLimit(80)};
  const pickFacet=(id:string)=>{setFacet(current=>current===id?null:id);setLimit(80)};
  const clearAll=()=>{setQuery("");setCategory("all");setFacet(null);setSlotFilter(null);setLevelBand(null);setRefineable(false);setLimit(80)};

  if(error)return <section className="catalog-fatal"><h1>Catálogo no disponible</h1><p>No se pudo abrir la copia local. Intenta recargar la página.</p></section>;
  if(!catalog)return <section className="catalog-loading"><div className="loader"/><p>Abriendo la base local de objetos…</p></section>;

  const facetLabel=facet?(activeCategory.facets==="slot"?LOCATION_LABELS[facet]??facet:WEAPON_KINDS.find(kind=>kind.subType===facet)?.title??facet):null;
  const heroTitle=facetLabel??(category==="all"?"Objetos de Midgard":activeCategory.label);
  const heroCopy=category==="all"
    ?`Encuentra cualquiera de los ${catalog.meta.count.toLocaleString("es-ES")} objetos por nombre, Aegis o ID. Filtra por categoría y las fichas se abren aquí mismo.`
    :`${filtered.length.toLocaleString("es-ES")} resultados. Afina con los filtros o busca por nombre, Aegis o ID.`;

  return <section className="item-catalog">
    <header className="catalog-hero">
      <div>{category!=="all"&&<small>{facetLabel?activeCategory.label:"Catálogo"}</small>}<h1>{heroTitle}</h1><p>{heroCopy}</p></div>
    </header>

    <div className="catalog-toolbar">
      <label className="catalog-search"><span>Buscar por nombre, Aegis o ID</span><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(80)}} placeholder="Ej. Poring Card, Red Potion, 501…"/></label>
      <label><span>Orden</span><select value={sort} onChange={event=>setSort(event.target.value)}><option value="id">ID</option><option value="name">Nombre</option><option value="level">Nivel mínimo</option><option value="type">Tipo</option></select></label>
      <button className={refineable?"catalog-toggle active":"catalog-toggle"} onClick={()=>{setRefineable(value=>!value);setLimit(80)}} aria-pressed={refineable}>Refinables</button>
    </div>

    <div className="catalog-filters">
      <div className="filter-row">
        <span className="filter-label">Categoría</span>
        <div className="chip-set">{CATEGORIES.map(entry=>{
          const total=categoryCounts[entry.id]??0;
          return <button key={entry.id} type="button" className={category===entry.id?"filter-chip active":"filter-chip"} disabled={total===0&&entry.id!=="all"} aria-pressed={category===entry.id} onClick={()=>pickCategory(entry.id)}>
            <i aria-hidden="true">{entry.sigil}</i>{entry.label}<em>{total.toLocaleString("es-ES")}</em>
          </button>;
        })}</div>
      </div>

      {activeCategory.facets==="slot"&&<div className="filter-row">
        <span className="filter-label">Parte del cuerpo</span>
        <div className="chip-set">{EQUIP_SLOTS.map(slot=>{
          const total=facetCounts[slot.location]??0;
          return <button key={slot.id} type="button" className={facet===slot.location?"filter-chip active":"filter-chip"} disabled={total===0} aria-pressed={facet===slot.location} onClick={()=>pickFacet(slot.location)}>
            <i aria-hidden="true">{slot.icon}</i>{slot.title}<em>{total}</em>
          </button>;
        })}</div>
      </div>}

      {activeCategory.facets==="weapon"&&<div className="filter-row">
        <span className="filter-label">Tipo de arma</span>
        <div className="chip-set">{WEAPON_KINDS.map(kind=>{
          const total=facetCounts[kind.subType]??0;
          return <button key={kind.id} type="button" className={facet===kind.subType?"filter-chip active":"filter-chip"} disabled={total===0} aria-pressed={facet===kind.subType} onClick={()=>pickFacet(kind.subType)}>
            <i aria-hidden="true">{kind.icon}</i>{kind.title}<em>{total}</em>
          </button>;
        })}</div>
      </div>}

      {showGear&&<div className="filter-row">
        <span className="filter-label">Ranuras</span>
        <div className="chip-set">{SLOT_CHOICES.map(value=>
          <button key={value} type="button" className={slotFilter===value?"filter-chip slim active":"filter-chip slim"} aria-pressed={slotFilter===value} onClick={()=>{setSlotFilter(current=>current===value?null:value);setLimit(80)}}>{value}</button>
        )}</div>
        <span className="filter-label">Nivel mínimo</span>
        <div className="chip-set">{LEVEL_BANDS.map(band=>
          <button key={band.id} type="button" className={levelBand===band.id?"filter-chip slim active":"filter-chip slim"} aria-pressed={levelBand===band.id} onClick={()=>{setLevelBand(current=>current===band.id?null:band.id);setLimit(80)}}>{band.label}</button>
        )}</div>
      </div>}
    </div>

    <div className="catalog-body">
      <div className="catalog-results">
        <div className="catalog-status">
          <span><b>{filtered.length.toLocaleString("es-ES")}</b> coincidencias</span>
          {anyFilter&&<button type="button" className="clear-filters" onClick={clearAll}>Limpiar filtros</button>}
        </div>
        <div className="item-list">{filtered.slice(0,limit).map(item=><button key={item.id} className={selectedItemId===item.id?"item-row selected":"item-row"} onClick={()=>onSelectItem(item.id)}>
          <ItemSprite item={item} className="item-sigil"/>
          <span className="item-main"><b>{item.name}</b><small>{itemLine(item,activeCategory)}</small></span>
          <span className="item-id">#{item.id}</span>
        </button>)}</div>
        {!filtered.length&&<div className="catalog-empty"><b>No encontramos ese objeto.</b><span>Prueba por ID, nombre en inglés o nombre Aegis, o quita algún filtro.</span></div>}
        {limit<filtered.length&&<button className="load-more" onClick={()=>setLimit(value=>value+80)}>Mostrar 80 más</button>}
      </div>
      <aside className="item-detail">{selectedItemId===null?<div className="detail-placeholder"><span>◆</span><h2>Selecciona un objeto</h2><p>Su ficha se abre desde esta lista o desde cualquier enlace dentro de las guías.</p></div>:!activeDetail?<div className="detail-placeholder"><div className="loader"/><p>Cargando ficha…</p></div>:<ItemDetailCard item={activeDetail} sources={activeSources} onOpenMonster={onOpenMonster}/>}</aside>
    </div>
  </section>;
}

/* Segunda línea de cada fila: los datos con los que se decide sin abrir la ficha. */
function itemLine(item:ItemIndex,category:Category){
  const parts:string[]=[];
  if(category.facets==="slot")parts.push(item.locations?.length?item.locations.map(location=>LOCATION_LABELS[location]??location).join(" · "):"Equipo");
  else if(category.facets==="weapon")parts.push(WEAPON_KINDS.find(kind=>kind.subType===item.subType)?.title??item.subType??"Arma");
  else parts.push(`${TYPE_LABELS[item.type]??item.type}${item.subType?` · ${item.subType}`:""}`);
  if(item.attack)parts.push(`ATK ${item.attack}`);
  if(item.defense)parts.push(`DEF ${item.defense}`);
  if(item.slots)parts.push(`${item.slots} slot${item.slots===1?"":"s"}`);
  if(item.equipLevelMin)parts.push(`Nv ${item.equipLevelMin}`);
  return parts.join(" · ");
}

function ItemDetailCard({item,sources,onOpenMonster}:{item:ItemDetail;sources:ItemSources|null;onOpenMonster:(options:{id:number})=>void}){
  const scripts=[['Al equipar',item.equipScript],['Al desequipar',item.unEquipScript]].filter((entry):entry is [string,string]=>Boolean(entry[1]));
  const drops=sources?.drops??[];
  const shops=sources?.shops??[];
  return <div className="detail-card">
    <div className="detail-title"><ItemSprite item={item} className="detail-sigil" detail/><div><span>#{item.id}</span><h2>{item.name}</h2><code>{item.aegisName}</code></div></div>
    <div className="detail-badges"><span>{TYPE_LABELS[item.type]??item.type}</span>{item.subType&&<span>{item.subType}</span>}{item.refineable&&<span>Refinable</span>}</div>
    <dl className="stat-grid">
      <div><dt>Compra</dt><dd>{zeny(item.buy)}</dd></div><div><dt>Venta</dt><dd>{zeny(item.sell)}</dd></div>
      <div><dt>Peso</dt><dd>{weight(item.weight)}</dd></div><div><dt>Nivel mínimo</dt><dd>{item.equipLevelMin??"—"}</dd></div>
      <div><dt>ATK</dt><dd>{item.attack??"—"}</dd></div><div><dt>MATK</dt><dd>{item.magicAttack??"—"}</dd></div>
      <div><dt>DEF</dt><dd>{item.defense??"—"}</dd></div><div><dt>Slots</dt><dd>{item.slots??"—"}</dd></div>
    </dl>
    <section className="detail-section"><h3>Descripción</h3>{item.description?<p className="item-description" lang="en">{item.description}</p>:<p className="source-empty">Esta instantánea no incluye una descripción de cliente para este objeto.</p>}</section>
    <section className="detail-section"><h3>Lo dropean</h3>{sources===null?<p className="source-empty">Buscando monstruos…</p>:drops.length?<div className="source-list">{drops.map(drop=><button type="button" className="source-row source-link" key={`${drop.id}-${drop.mvp?"mvp":"drop"}`} onClick={()=>onOpenMonster({id:drop.id})}><div><b>{drop.name}{drop.mvp&&<span className="mvp">MVP</span>}</b><small>{drop.maps.length?drop.maps.join(" · "):"Mapa no publicado en esta instantánea"}</small></div><em>{dropRate(drop.rate)}</em></button>)}</div>:<p className="source-empty">Ningún monstruo de la base Pre-Renewal lo deja caer.</p>}</section>
    <section className="detail-section"><h3>Dónde se compra</h3>{sources===null?<p className="source-empty">Buscando tiendas…</p>:shops.length?<div className="source-list">{shops.map(shop=><article className="source-row" key={`${shop.map}-${shop.x}-${shop.y}-${shop.name}`}><div><b>{shop.name}</b><small>{shop.map} {shop.x},{shop.y}{shop.cash?" · Cash":""}</small></div><em>{shop.price<0?zeny(item.buy):shop.cash?`${shop.price} C`:zeny(shop.price)}</em></article>)}</div>:<p className="source-empty">Ninguna tienda NPC lo vende en esta instantánea.</p>}</section>
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
