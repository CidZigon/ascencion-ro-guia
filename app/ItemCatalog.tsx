"use client";
/* eslint-disable @next/next/no-img-element -- sprites oficiales pequeños servidos desde la caché local */

import { useEffect, useMemo, useState } from "react";
import { EQUIP_SLOTS, WEAPON_KINDS } from "./gear";
import type { Dict } from "./i18n";
import { ReportIssueLink } from "./report-issue";

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
  gradable?:boolean; view?:number; gender?:string; jobs:string[]; classes:string[];
  script?:string; equipScript?:string; unEquipScript?:string; description?:string; sourceFile:string;
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
/* rAthena expone las tasas de drop a 1x; AscencionRO corre a 10x. El excedente
   por encima de 100% no puede dropear varias veces en un solo evento, así que
   se recorta ahí. */
const SERVER_DROP_MULTIPLIER=10;
function dropRate(rate:number){
  const scaled=Math.min(rate*SERVER_DROP_MULTIPLIER,10000);
  return `${(scaled/100).toLocaleString("es-ES",{minimumFractionDigits:scaled%100===0?0:2,maximumFractionDigits:2})}%`;
}
const TYPE_SIGILS:Record<string,string>={Healing:"✚",Delayconsume:"◷",Usable:"✦",Etc:"◆",Weapon:"⚔",Ammo:"➶",Armor:"⬟",Card:"▣",Petegg:"◉",Petarmor:"♢",Cash:"✧"};
const typeLabel=(t:Dict,type:string)=>(t.types as Record<string,string>)[type]??type;
const locationLabel=(t:Dict,location:string)=>(t.locations as Record<string,string>)[location]??location.replaceAll("_"," ");
const weaponLabel=(t:Dict,subType?:string)=>subType?(t.weapons as Record<string,string>)[subType]??subType:"";
function labelList(t:Dict,value?:string[]){return value?.length?value.map(entry=>locationLabel(t,entry)).join(", "):t.catalog.anyLocation}

/* Las descripciones vienen tal cual del cliente (iteminfo.lua, en inglés):
   líneas separadas por \n, con bonos cortos ("Luk +2"), líneas de meta
   ("Class: Card") y, en sets de cartas, texto narrativo más largo. Se
   clasifica línea por línea para resaltar los bonos sin tocar el resto. */
type DescLine =
  |{kind:"meta";label:string;value:string}
  |{kind:"bonus";text:string}
  |{kind:"heading";text:string}
  |{kind:"text";text:string};
const DESC_META_KEYS=["Class","Compound on","Weight","Jobs","Weapon Level","Armor Level","Required Level"];
const BONUS_LINE=/^[A-Za-z][A-Za-z0-9 ()'./-]*\s[+-]\d+(?:\.\d+)?%?$/;
function classifyDescLine(raw:string):DescLine{
  const line=raw.trim();
  const metaKey=DESC_META_KEYS.find(key=>line.startsWith(`${key}:`));
  if(metaKey)return{kind:"meta",label:metaKey,value:line.slice(metaKey.length+1).trim()};
  if(/^\[.+\]$/.test(line))return{kind:"heading",text:line.slice(1,-1)};
  if(BONUS_LINE.test(line))return{kind:"bonus",text:line};
  return{kind:"text",text:line};
}
function parseItemDescription(raw:string):DescLine[][]{
  return raw.split(/\n{2,}/).map(block=>block.split("\n").map(classifyDescLine).filter(line=>line.kind!=="text"||line.text.length>0));
}
function ItemDescription({text}:{text:string}){
  return <div className="item-description" lang="en">{parseItemDescription(text).map((lines,blockIndex)=>{
    const rendered:JSX.Element[]=[];
    let bonusBuffer:string[]=[];
    const flushBonus=(key:string)=>{
      if(!bonusBuffer.length)return;
      rendered.push(<div className="desc-bonus-row" key={key}>{bonusBuffer.map((bonus,index)=><span className="desc-bonus" key={index}>{bonus}</span>)}</div>);
      bonusBuffer=[];
    };
    lines.forEach((line,lineIndex)=>{
      if(line.kind==="bonus"){bonusBuffer.push(line.text);return}
      flushBonus(`b${lineIndex}`);
      if(line.kind==="meta")rendered.push(<div className="desc-meta" key={lineIndex}><b>{line.label}</b><span>{line.value}</span></div>);
      else if(line.kind==="heading")rendered.push(<h4 className="desc-heading" key={lineIndex}>{line.text}</h4>);
      else rendered.push(<p className="desc-text" key={lineIndex}>{line.text}</p>);
    });
    flushBonus("tail");
    return <div className="desc-block" key={blockIndex}>{rendered}</div>;
  })}</div>;
}

/* Categorías visibles del catálogo. Cada una agrupa uno o varios tipos de rAthena;
   son las que sustituyen a los antiguos menús «Equipo» y «Armas». */
type Category = { id:string; sigil:string; types:string[]|null; facets:"slot"|"weapon"|"cardSlot"|null };
const CATEGORIES:Category[]=[
  {id:"all",         sigil:"◈", types:null,                                facets:null},
  {id:"equipo",      sigil:"⬟", types:["Armor"],                           facets:"slot"},
  {id:"armas",       sigil:"⚔", types:["Weapon"],                          facets:"weapon"},
  {id:"cartas",      sigil:"▣", types:["Card"],                            facets:"cardSlot"},
  {id:"consumibles", sigil:"✚", types:["Healing","Usable","Delayconsume"], facets:null},
  {id:"materiales",  sigil:"◆", types:["Etc"],                             facets:null},
  {id:"municion",    sigil:"➶", types:["Ammo"],                            facets:null},
  {id:"pets",        sigil:"◉", types:["Petegg","Petarmor"],               facets:null},
  {id:"cash",        sigil:"✧", types:["Cash"],                            facets:null},
];
const categoryById=(id:string)=>CATEGORIES.find(entry=>entry.id===id)??CATEGORIES[0];

/* Las cartas de arma usan Right_Hand como ubicación, una ranura que no existe
   en el equipo normal (las armas tienen su propio filtro por tipo). Se agrega
   solo para el filtro de cartas, sin tocar EQUIP_SLOTS que también usa la
   categoría de Equipo. */
const CARD_SLOTS=[...EQUIP_SLOTS,{id:"arma",location:"Right_Hand",icon:"⚔",title:"Arma",description:"Cartas para compuestas en armas de cualquier tipo."}];
const categoryLabel=(t:Dict,id:string)=>(t.categories as Record<string,string>)[id]??id;

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

export function ItemCatalog({selectedItemId,initialQuery,onSelectItem,onOpenMonster,onPreviewMonster,scope,t}:{selectedItemId:number|null;initialQuery:string;onSelectItem:(id:number)=>void;onOpenMonster:(options:{id:number})=>void;onPreviewMonster:(id:number,name:string,maps:string[],mvp?:boolean)=>void;scope?:CatalogScope;t:Dict}){
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
    if(activeCategory.facets==="cardSlot")return Boolean(item.locations?.includes(facet));
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
      else if(activeCategory.facets==="cardSlot"){for(const location of item.locations??[])counts[location]=(counts[location]??0)+1}
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
  const showGear=activeCategory.facets==="slot"||activeCategory.facets==="weapon";
  const anyFilter=category!=="all"||facet!==null||slotFilter!==null||levelBand!==null||refineable||query.trim()!=="";

  const pickCategory=(id:string)=>{setCategory(id);setFacet(null);setSlotFilter(null);setLevelBand(null);setLimit(80)};
  const pickFacet=(id:string)=>{setFacet(current=>current===id?null:id);setLimit(80)};
  const clearAll=()=>{setQuery("");setCategory("all");setFacet(null);setSlotFilter(null);setLevelBand(null);setRefineable(false);setLimit(80)};

  if(error)return <section className="catalog-fatal"><h1>{t.catalog.fatalTitle}</h1><p>{t.catalog.fatalCopy}</p></section>;
  if(!catalog)return <section className="catalog-loading"><div className="loader"/><p>{t.catalog.opening}</p></section>;

  const facetLabel=facet?((activeCategory.facets==="slot"||activeCategory.facets==="cardSlot")?locationLabel(t,facet):weaponLabel(t,facet)):null;
  const heroTitle=facetLabel??(category==="all"?t.catalog.heroTitle:categoryLabel(t,category));
  const heroCopy=category==="all"
    ?t.catalog.heroCopy(catalog.meta.count.toLocaleString("es-ES"))
    :t.catalog.heroFiltered(filtered.length.toLocaleString("es-ES"));

  return <section className="item-catalog">
    <header className="catalog-hero">
      <div>{category!=="all"&&<small>{facetLabel?categoryLabel(t,category):t.catalog.eyebrow}</small>}<h1>{heroTitle}</h1><p>{heroCopy}</p></div>
    </header>

    <div className="catalog-toolbar">
      <label className="catalog-search"><span>{t.catalog.searchLabel}</span><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(80)}} placeholder={t.catalog.searchPlaceholder}/></label>
      <label><span>{t.catalog.sort}</span><select value={sort} onChange={event=>setSort(event.target.value)}><option value="id">{t.catalog.sortId}</option><option value="name">{t.catalog.sortName}</option><option value="level">{t.catalog.sortLevel}</option><option value="type">{t.catalog.sortType}</option></select></label>
      <button className={refineable?"catalog-toggle active":"catalog-toggle"} onClick={()=>{setRefineable(value=>!value);setLimit(80)}} aria-pressed={refineable}>{t.catalog.refineable}</button>
    </div>

    <div className="catalog-filters">
      <div className="filter-row">
        <span className="filter-label">{t.catalog.filterCategory}</span>
        <div className="chip-set">{CATEGORIES.map(entry=>{
          const total=categoryCounts[entry.id]??0;
          return <button key={entry.id} type="button" className={category===entry.id?"filter-chip active":"filter-chip"} disabled={total===0&&entry.id!=="all"} aria-pressed={category===entry.id} onClick={()=>pickCategory(entry.id)}>
            <i aria-hidden="true">{entry.sigil}</i>{categoryLabel(t,entry.id)}<em>{total.toLocaleString("es-ES")}</em>
          </button>;
        })}</div>
      </div>

      {(activeCategory.facets==="slot"||activeCategory.facets==="cardSlot")&&<div className="filter-row">
        <span className="filter-label">{t.catalog.filterSlot}</span>
        <div className="chip-set">{(activeCategory.facets==="cardSlot"?CARD_SLOTS:EQUIP_SLOTS).map(slot=>{
          const total=facetCounts[slot.location]??0;
          return <button key={slot.id} type="button" className={facet===slot.location?"filter-chip active":"filter-chip"} disabled={total===0} aria-pressed={facet===slot.location} onClick={()=>pickFacet(slot.location)}>
            <i aria-hidden="true">{slot.icon}</i>{locationLabel(t,slot.location)}<em>{total}</em>
          </button>;
        })}</div>
      </div>}

      {activeCategory.facets==="weapon"&&<div className="filter-row">
        <span className="filter-label">{t.catalog.filterWeapon}</span>
        <div className="chip-set">{WEAPON_KINDS.map(kind=>{
          const total=facetCounts[kind.subType]??0;
          return <button key={kind.id} type="button" className={facet===kind.subType?"filter-chip active":"filter-chip"} disabled={total===0} aria-pressed={facet===kind.subType} onClick={()=>pickFacet(kind.subType)}>
            <i aria-hidden="true">{kind.icon}</i>{weaponLabel(t,kind.subType)}<em>{total}</em>
          </button>;
        })}</div>
      </div>}

      {showGear&&<div className="filter-row">
        <span className="filter-label">{t.catalog.filterSlots}</span>
        <div className="chip-set">{SLOT_CHOICES.map(value=>
          <button key={value} type="button" className={slotFilter===value?"filter-chip slim active":"filter-chip slim"} aria-pressed={slotFilter===value} onClick={()=>{setSlotFilter(current=>current===value?null:value);setLimit(80)}}>{value}</button>
        )}</div>
        <span className="filter-label">{t.catalog.filterLevel}</span>
        <div className="chip-set">{LEVEL_BANDS.map(band=>
          <button key={band.id} type="button" className={levelBand===band.id?"filter-chip slim active":"filter-chip slim"} aria-pressed={levelBand===band.id} onClick={()=>{setLevelBand(current=>current===band.id?null:band.id);setLimit(80)}}>{band.label}</button>
        )}</div>
      </div>}
    </div>

    <div className="catalog-body">
      <div className="catalog-results">
        <div className="catalog-status">
          <span><b>{filtered.length.toLocaleString("es-ES")}</b> {t.catalog.matches}</span>
          {anyFilter&&<button type="button" className="clear-filters" onClick={clearAll}>{t.catalog.clearFilters}</button>}
        </div>
        <div className="item-list">{filtered.slice(0,limit).map(item=><button key={item.id} className={selectedItemId===item.id?"item-row selected":"item-row"} onClick={()=>onSelectItem(item.id)}>
          <ItemSprite item={item} className="item-sigil"/>
          <span className="item-main"><b>{item.name}</b><small>{itemLine(t,item,activeCategory)}</small></span>
          <span className="item-id">#{item.id}</span>
        </button>)}</div>
        {!filtered.length&&<div className="catalog-empty"><b>{t.catalog.emptyTitle}</b><span>{t.catalog.emptyHint}</span></div>}
        {limit<filtered.length&&<button className="load-more" onClick={()=>setLimit(value=>value+80)}>{t.catalog.more}</button>}
      </div>
      <aside className="item-detail">{selectedItemId===null?<div className="detail-placeholder"><span>◆</span><h2>{t.catalog.pickTitle}</h2><p>{t.catalog.pickCopy}</p></div>:!activeDetail?<div className="detail-placeholder"><div className="loader"/><p>{t.catalog.loadingCard}</p></div>:<ItemDetailCard item={activeDetail} sources={activeSources} onOpenMonster={onOpenMonster} onPreviewMonster={onPreviewMonster} t={t}/>}</aside>
    </div>
  </section>;
}

/* Segunda línea de cada fila: los datos con los que se decide sin abrir la ficha. */
function itemLine(t:Dict,item:ItemIndex,category:Category){
  const parts:string[]=[];
  if(category.facets==="slot"||category.facets==="cardSlot")parts.push(item.locations?.length?item.locations.map(entry=>locationLabel(t,entry)).join(" · "):t.catalog.equipment);
  else if(category.facets==="weapon")parts.push(weaponLabel(t,item.subType)||t.catalog.weapon);
  else parts.push(`${typeLabel(t,item.type)}${item.subType?` · ${item.subType}`:""}`);
  if(item.attack)parts.push(`ATK ${item.attack}`);
  if(item.defense)parts.push(`DEF ${item.defense}`);
  if(item.slots)parts.push(t.catalog.slotWord(item.slots));
  if(item.equipLevelMin)parts.push(t.catalog.levelShort(item.equipLevelMin));
  return parts.join(" · ");
}

/* La misma tienda (ej. "Weapon Dealer") suele repetirse en varias ciudades al
   mismo precio. Se agrupa por nombre+precio para no listar la misma fila una
   vez por ciudad; si el precio cambia entre ciudades, queda como fila aparte. */
function groupShops(shops:ItemSources["shops"]){
  const groups=new Map<string,{name:string;maps:string[];price:number;cash?:boolean}>();
  for(const shop of shops){
    const key=`${shop.name}|${shop.cash?"c":"z"}|${shop.price}`;
    const group=groups.get(key);
    if(group){if(!group.maps.includes(shop.map))group.maps.push(shop.map)}
    else groups.set(key,{name:shop.name,maps:[shop.map],price:shop.price,cash:shop.cash});
  }
  return [...groups.values()];
}

function ItemDetailCard({item,sources,onOpenMonster,onPreviewMonster,t}:{item:ItemDetail;sources:ItemSources|null;onOpenMonster:(options:{id:number})=>void;onPreviewMonster:(id:number,name:string,maps:string[],mvp?:boolean)=>void;t:Dict}){
  const scripts=[[t.catalog.onEquip,item.equipScript],[t.catalog.onUnequip,item.unEquipScript]].filter((entry):entry is [string,string]=>Boolean(entry[1]));
  // Un monstruo sin mapa de aparición conocido casi siempre es una variante de
  // instancia/evento que reutiliza el nombre de otro monstruo real (mismo caso
  // que Angeling o Nightmare); mostrarlo aquí solo confunde sobre dónde cazar.
  const drops=(sources?.drops??[]).filter(drop=>drop.maps.length>0);
  const shops=groupShops(sources?.shops??[]);
  return <div className="detail-card">
    <div className="detail-title"><ItemSprite item={item} className="detail-sigil" detail/><div><span>#{item.id}</span><h2>{item.name}</h2><code>{item.aegisName}</code></div></div>
    <div className="detail-badges"><span>{typeLabel(t,item.type)}</span>{item.subType&&<span>{item.subType}</span>}{item.refineable&&<span>{t.catalog.refineable}</span>}</div>
    <dl className="stat-grid">
      <div><dt>{t.catalog.buy}</dt><dd>{zeny(item.buy)}</dd></div><div><dt>{t.catalog.sell}</dt><dd>{zeny(item.sell)}</dd></div>
      <div><dt>{t.catalog.weight}</dt><dd>{weight(item.weight)}</dd></div><div><dt>{t.catalog.minLevel}</dt><dd>{item.equipLevelMin??"—"}</dd></div>
      <div><dt>ATK</dt><dd>{item.attack??"—"}</dd></div><div><dt>MATK</dt><dd>{item.magicAttack??"—"}</dd></div>
      <div><dt>DEF</dt><dd>{item.defense??"—"}</dd></div><div><dt>{t.catalog.slots}</dt><dd>{item.slots??"—"}</dd></div>
    </dl>
    <section className="detail-section"><h3>{t.catalog.description}</h3>{item.description?<ItemDescription text={item.description}/>:<p className="source-empty">{t.catalog.noDescription}</p>}</section>
    <section className="detail-section"><h3>{t.catalog.droppedBy}</h3>{sources===null?<p className="source-empty">{t.catalog.searchingMonsters}</p>:drops.length?<div className="source-list">{drops.map(drop=><div className="source-row drop-row" key={`${drop.id}-${drop.mvp?"mvp":"drop"}`}>
      <button type="button" className="item-sigil drop-sprite" onClick={()=>onPreviewMonster(drop.id,drop.name,drop.maps,drop.mvp)} title={t.catalog.viewSpawns} aria-label={`${t.catalog.viewSpawns}: #${drop.id} ${drop.name}`}><DropSprite id={drop.id} name={drop.name} mvp={drop.mvp}/></button>
      <button type="button" className="drop-info" onClick={()=>onOpenMonster({id:drop.id})}><b>#{drop.id}{drop.mvp&&<span className="mvp">MVP</span>}</b><small>{drop.name}</small></button>
      <em>{dropRate(drop.rate)}</em>
    </div>)}</div>:<p className="source-empty">{t.catalog.noDrops}</p>}</section>
    <section className="detail-section"><h3>{t.catalog.soldAt}</h3>{sources===null?<p className="source-empty">{t.catalog.searchingShops}</p>:shops.length?<div className="source-list">{shops.map(shop=><article className="source-row" key={`${shop.name}-${shop.price}-${shop.cash?"c":"z"}`}><div><b>{shop.name}</b><small>{shop.maps.join(" · ")}{shop.cash?" · Cash":""}</small></div><em>{shop.price<0?zeny(item.buy):shop.cash?`${shop.price} C`:zeny(shop.price)}</em></article>)}</div>:<p className="source-empty">{t.catalog.noShops}</p>}</section>
    <section className="detail-section"><h3>{t.catalog.equipLocation}</h3><p>{labelList(t,item.locations)}</p></section>
    <section className="detail-section"><h3>{t.catalog.jobs}</h3><p>{labelList(t,item.jobs)}</p></section>
    {item.classes.length>0&&<section className="detail-section"><h3>{t.catalog.classes}</h3><p>{labelList(t,item.classes)}</p></section>}
    {scripts.length>0&&<section className="detail-section"><h3>{t.catalog.mechanics}</h3>{scripts.map(([label,script])=><details key={label}><summary>{label}</summary><pre>{script}</pre></details>)}</section>}
    <ReportIssueLink kind="Objeto" id={item.id} name={item.name} label={t.catalog.reportIssue}/>
  </div>;
}

function ItemSprite({item,className,detail=false}:{item:ItemIndex;className:string;detail?:boolean}){
  const fallback=TYPE_SIGILS[item.type]??"◆";
  if(!item.sprite)return <span className={className}>{fallback}</span>;
  return <span className={`${className} item-sprite`}><img src={item.sprite} alt={detail?`Sprite: ${item.name}`:""} loading={detail?"eager":"lazy"} onError={event=>event.currentTarget.parentElement?.classList.add("sprite-broken")}/><i aria-hidden="true">{fallback}</i></span>;
}

/* Sprite del monstruo dentro de la fila «Lo dropean». Sigue la misma convención
   de rutas que public/data/monsters-index.json (/world/sprites/{id}.gif) sin
   tener que cargar el índice de monstruos solo para esto. */
function DropSprite({id,name,mvp}:{id:number;name:string;mvp?:boolean}){
  const fallback=mvp?"♛":"♜";
  return <span className="item-sprite"><img src={`/world/sprites/${id}.gif`} alt={`Sprite de ${name}`} loading="lazy" onError={event=>event.currentTarget.parentElement?.classList.add("sprite-broken")}/><i aria-hidden="true">{fallback}</i></span>;
}
