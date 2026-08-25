"use client";
/* eslint-disable @next/next/no-img-element -- sprites oficiales pequeños servidos desde la caché local */

import { useEffect, useMemo, useState } from "react";
import { damageTakenFromElements } from "./attr-fix";

type CatalogMeta = {
  count:number; revision:string; snapshotDate:string; source:string; sourceUrl:string;
  chunks:number; raceCounts:Record<string,number>; elementCounts:Record<string,number>;
};
type MonsterIndex = {
  id:number; name:string; aegisName:string; sprite?:string; level?:number; hp?:number;
  race:string; element:string; elementLevel?:number; size?:string; mvp?:boolean;
  maps:number; drops:number; chunk:number;
};
type MonsterDrop = { id:number; name:string; rate:number; mvp?:boolean };
type MonsterDetail = Omit<MonsterIndex,"maps"|"drops"> & {
  baseExp?:number; jobExp?:number; mvpExp?:number; attack?:number; attack2?:number;
  defense?:number; magicDefense?:number; str?:number; agi?:number; vit?:number; int?:number;
  dex?:number; luk?:number; attackRange?:number; walkSpeed?:number; className?:string;
  maps:string[]; drops:MonsterDrop[];
};
type CatalogPayload = { meta:CatalogMeta; items:MonsterIndex[] };

let catalogPromise:Promise<CatalogPayload>|null=null;
const detailChunks=new Map<number,Promise<MonsterDetail[]>>();

function loadCatalog(){
  catalogPromise??=fetch("/data/monsters-index.json").then(response=>{if(!response.ok)throw new Error("monsters");return response.json()});
  return catalogPromise;
}
function loadChunk(chunk:number){
  if(!detailChunks.has(chunk))detailChunks.set(chunk,fetch(`/data/monsters/chunk-${String(chunk).padStart(3,"0")}.json`).then(response=>{if(!response.ok)throw new Error("detail");return response.json()}).then(data=>data.items));
  return detailChunks.get(chunk)!;
}
function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function stat(value?:number){return value===undefined?"—":value.toLocaleString("es-ES")}
function dropRate(rate:number){
  return `${(rate/100).toLocaleString("es-ES",{minimumFractionDigits:rate%100===0?0:2,maximumFractionDigits:2})}%`;
}
function elementModifierClass(percent:number){
  if(percent===0)return "ele-immune";
  if(percent<0)return "ele-absorb";
  if(percent<100)return "ele-resist";
  if(percent>100)return "ele-weak";
  return "ele-flat";
}
const RACE_LABELS:Record<string,string>={Formless:"Sin forma",Undead:"No muerto",Brute:"Bruto",Plant:"Planta",Insect:"Insecto",Fish:"Pez",Demon:"Demonio",Demihuman:"Humanoide",Angel:"Ángel",Dragon:"Dragón"};
const ELEMENT_LABELS:Record<string,string>={Neutral:"Neutral",Water:"Agua",Earth:"Tierra",Fire:"Fuego",Wind:"Viento",Poison:"Veneno",Holy:"Sagrado",Dark:"Oscuro",Ghost:"Fantasma",Undead:"No muerto"};
const SIZE_LABELS:Record<string,string>={Small:"Pequeño",Medium:"Mediano",Large:"Grande"};

export function MonsterCatalog({selectedMonsterId,initialQuery,onSelectMonster,onOpenItem}:{selectedMonsterId:number|null;initialQuery:string;onSelectMonster:(id:number)=>void;onOpenItem:(id:number)=>void}){
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null);
  const [detail,setDetail]=useState<MonsterDetail|null>(null);
  const [query,setQuery]=useState(initialQuery);
  const [race,setRace]=useState("all");
  const [element,setElement]=useState("all");
  const [sort,setSort]=useState("id");
  const [mvpOnly,setMvpOnly]=useState(false);
  const [limit,setLimit]=useState(80);
  const [error,setError]=useState(false);

  useEffect(()=>{let live=true;loadCatalog().then(data=>{if(live)setCatalog(data)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[]);
  useEffect(()=>{
    if(!catalog||selectedMonsterId===null)return;
    const entry=catalog.items.find(item=>item.id===selectedMonsterId);
    if(!entry)return;
    let live=true;
    loadChunk(entry.chunk).then(items=>{if(live)setDetail(items.find(item=>item.id===selectedMonsterId)??null)}).catch(()=>{if(live)setError(true)});
    return()=>{live=false};
  },[catalog,selectedMonsterId]);

  const races=useMemo(()=>catalog?Object.entries(catalog.meta.raceCounts).sort((a,b)=>a[0].localeCompare(b[0])):[],[catalog]);
  const elements=useMemo(()=>catalog?Object.entries(catalog.meta.elementCounts).sort((a,b)=>a[0].localeCompare(b[0])):[],[catalog]);
  const filtered=useMemo(()=>{
    if(!catalog)return[];
    const key=normalize(query.trim());
    const result=catalog.items.filter(item=>{
      if(race!=="all"&&item.race!==race)return false;
      if(element!=="all"&&item.element!==element)return false;
      if(mvpOnly&&!item.mvp)return false;
      return !key||normalize(`${item.id} ${item.name} ${item.aegisName} ${item.race} ${item.element}`).includes(key);
    });
    return result.sort((left,right)=>sort==="name"?left.name.localeCompare(right.name):sort==="level"?(left.level??0)-(right.level??0)||left.id-right.id:left.id-right.id);
  },[catalog,query,race,element,mvpOnly,sort]);
  const activeDetail=detail?.id===selectedMonsterId?detail:null;

  if(error)return <section className="catalog-fatal"><h1>Catálogo no disponible</h1><p>No se pudo abrir la copia local de monstruos. Intenta recargar la página.</p></section>;
  if(!catalog)return <section className="catalog-loading"><div className="loader"/><p>Abriendo el bestiario local…</p></section>;

  return <section className="item-catalog monster-catalog">
    <header className="catalog-hero monster-hero">
      <div><small>Bestiario local de AscencionRO</small><h1>Monstruos de Midgard</h1><p>Consulta los {catalog.meta.count.toLocaleString("es-ES")} monstruos Pre-Renewal: nivel, elemento, mapas y todo lo que dropean. Las fichas se abren aquí mismo.</p></div>
    </header>
    <div className="catalog-toolbar monster-toolbar">
      <label className="catalog-search"><span>Buscar por nombre, Aegis o ID</span><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(80)}} placeholder="Ej. Poring, Baphomet, 1002…"/></label>
      <label><span>Raza</span><select value={race} onChange={event=>{setRace(event.target.value);setLimit(80)}}><option value="all">Todas las razas</option>{races.map(([name,count])=><option key={name} value={name}>{RACE_LABELS[name]??name} · {count}</option>)}</select></label>
      <label><span>Elemento</span><select value={element} onChange={event=>{setElement(event.target.value);setLimit(80)}}><option value="all">Todos los elementos</option>{elements.map(([name,count])=><option key={name} value={name}>{ELEMENT_LABELS[name]??name} · {count}</option>)}</select></label>
      <label><span>Orden</span><select value={sort} onChange={event=>setSort(event.target.value)}><option value="id">ID</option><option value="name">Nombre</option><option value="level">Nivel</option></select></label>
      <button className={mvpOnly?"catalog-toggle active":"catalog-toggle"} onClick={()=>{setMvpOnly(value=>!value);setLimit(80)}} aria-pressed={mvpOnly}>MVP</button>
    </div>
    <div className="catalog-body">
      <div className="catalog-results">
        <div className="catalog-status"><b>{filtered.length.toLocaleString("es-ES")}</b> coincidencias</div>
        <div className="item-list">{filtered.slice(0,limit).map(item=><button key={item.id} className={selectedMonsterId===item.id?"item-row selected":"item-row"} onClick={()=>onSelectMonster(item.id)}>
          <MonsterSprite monster={item} className="item-sigil"/>
          <span className="item-main"><b>{item.name}{item.mvp&&<span className="mvp">MVP</span>}</b><small>Nv. {item.level??"—"} · {RACE_LABELS[item.race]??item.race} · {ELEMENT_LABELS[item.element]??item.element}{item.elementLevel?` ${item.elementLevel}`:""}</small></span>
          <span className="item-id">#{item.id}</span>
        </button>)}</div>
        {!filtered.length&&<div className="catalog-empty"><b>No encontramos ese monstruo.</b><span>Prueba por ID, nombre en inglés o nombre Aegis.</span></div>}
        {limit<filtered.length&&<button className="load-more" onClick={()=>setLimit(value=>value+80)}>Mostrar 80 más</button>}
      </div>
      <aside className="item-detail">{selectedMonsterId===null?<div className="detail-placeholder"><span>♜</span><h2>Selecciona un monstruo</h2><p>Su ficha se abre desde esta lista o desde cualquier drop de objeto.</p></div>:!activeDetail?<div className="detail-placeholder"><div className="loader"/><p>Cargando ficha…</p></div>:<MonsterDetailCard monster={activeDetail} onOpenItem={onOpenItem}/>}</aside>
    </div>
  </section>;
}

function MonsterDetailCard({monster,onOpenItem}:{monster:MonsterDetail;onOpenItem:(id:number)=>void}){
  const taken=damageTakenFromElements(monster.element,monster.elementLevel);
  const elementLabel=`${ELEMENT_LABELS[monster.element]??monster.element}${monster.elementLevel?` ${monster.elementLevel}`:""}`;
  return <div className="detail-card">
    <div className="detail-title"><MonsterSprite monster={monster} className="detail-sigil" detail/><div><span>#{monster.id}</span><h2>{monster.name}</h2><code>{monster.aegisName}</code></div></div>
    <div className="detail-badges"><span>{RACE_LABELS[monster.race]??monster.race}</span><span>{elementLabel}</span>{monster.size&&<span>{SIZE_LABELS[monster.size]??monster.size}</span>}{monster.mvp&&<span>MVP</span>}</div>
    <dl className="stat-grid">
      <div><dt>Nivel</dt><dd>{stat(monster.level)}</dd></div><div><dt>HP</dt><dd>{stat(monster.hp)}</dd></div>
      <div><dt>Base EXP</dt><dd>{stat(monster.baseExp)}</dd></div><div><dt>Job EXP</dt><dd>{stat(monster.jobExp)}</dd></div>
      <div><dt>ATK</dt><dd>{monster.attack===undefined&&monster.attack2===undefined?"—":`${stat(monster.attack)}–${stat(monster.attack2)}`}</dd></div>
      <div><dt>DEF / MDEF</dt><dd>{stat(monster.defense)} / {stat(monster.magicDefense)}</dd></div>
      <div><dt>Rango</dt><dd>{stat(monster.attackRange)}</dd></div><div><dt>Vel. marcha</dt><dd>{stat(monster.walkSpeed)}</dd></div>
    </dl>
    {taken&&<section className="detail-section elemental-section">
      <h3>Fortalezas y debilidades</h3>
      <p>Daño que recibe como {elementLabel}.</p>
      <ul className="element-table" aria-label="Daño recibido por cada elemento atacante">
        {taken.map(row=><li key={row.element} className={elementModifierClass(row.percent)}><span>{ELEMENT_LABELS[row.element]??row.element}</span><em>{row.percent}%</em></li>)}
      </ul>
    </section>}
    <section className="detail-section"><h3>Atributos</h3><p>STR {stat(monster.str)} · AGI {stat(monster.agi)} · VIT {stat(monster.vit)} · INT {stat(monster.int)} · DEX {stat(monster.dex)} · LUK {stat(monster.luk)}</p></section>
    <section className="detail-section"><h3>Mapas de aparición</h3>{monster.maps.length?<p>{monster.maps.join(" · ")}</p>:<p className="source-empty">No hay spawns publicados en esta instantánea.</p>}</section>
    <section className="detail-section"><h3>Dropea</h3>{monster.drops.length?<div className="source-list">{monster.drops.map(drop=><button type="button" className="source-row source-link" key={`${drop.id}-${drop.mvp?"mvp":"drop"}`} onClick={()=>onOpenItem(drop.id)}><div><b>{drop.name}{drop.mvp&&<span className="mvp">MVP</span>}</b><small>#{drop.id}</small></div><em>{dropRate(drop.rate)}</em></button>)}</div>:<p className="source-empty">No hay drops asociados en el catálogo local.</p>}</section>
  </div>;
}

function MonsterSprite({monster,className,detail=false}:{monster:Pick<MonsterIndex,"name"|"sprite"|"mvp">;className:string;detail?:boolean}){
  const fallback=monster.mvp?"♛":"♜";
  if(!monster.sprite)return <span className={className}>{fallback}</span>;
  return <span className={`${className} item-sprite`}><img src={monster.sprite} alt={detail?`Sprite de ${monster.name}`:""} loading={detail?"eager":"lazy"} onError={event=>event.currentTarget.parentElement?.classList.add("sprite-broken")}/><i aria-hidden="true">{fallback}</i></span>;
}
