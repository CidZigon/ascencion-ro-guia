"use client";
/* eslint-disable @next/next/no-img-element -- sprites oficiales pequeños servidos desde la caché local */

import { useEffect, useMemo, useState } from "react";
import type { Dict } from "./i18n";
import { damageTakenFromElements } from "./attr-fix";
import { ReportIssueLink } from "./report-issue";

type CatalogMeta = {
  count:number; revision:string; snapshotDate:string; source:string; sourceUrl:string;
  chunks:number; raceCounts:Record<string,number>; elementCounts:Record<string,number>;
};
type MonsterIndex = {
  id:number; name:string; aegisName:string; sprite?:string; level?:number; hp?:number;
  baseExp?:number; jobExp?:number;
  race:string; element:string; elementLevel?:number; size?:string; mvp?:boolean; miniboss?:boolean;
  maps:number; drops:number; chunk:number;
};
type MonsterDrop = { id:number; name:string; rate:number; mvp?:boolean };
type MonsterSpawn = { map:string; count?:number; delay?:number };
type MonsterDetail = Omit<MonsterIndex,"maps"|"drops"> & {
  mvpExp?:number; attack?:number; attack2?:number;
  defense?:number; magicDefense?:number; str?:number; agi?:number; vit?:number; int?:number;
  dex?:number; luk?:number; attackRange?:number; walkSpeed?:number; className?:string;
  maps:MonsterSpawn[]; drops:MonsterDrop[];
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
/* rAthena expone las tasas de drop a 1x; AscencionRO corre a 10x. El excedente
   por encima de 100% no puede dropear varias veces en un solo evento, así que
   se recorta ahí. */
const SERVER_DROP_MULTIPLIER=10;
function dropRate(rate:number){
  const scaled=Math.min(rate*SERVER_DROP_MULTIPLIER,10000);
  return `${(scaled/100).toLocaleString("es-ES",{minimumFractionDigits:scaled%100===0?0:2,maximumFractionDigits:2})}%`;
}
/* Tres criterios de "mejor rendimiento", todos EXP por punto de HP (a más
   HP, más golpes/tiempo cuesta cada muerte, así que HP es el costo real de
   farmear). "Óptimo" sencillamente suma ambas EXP; los otros dos sirven para
   quien está subiendo solo base o solo job. */
function efficiencyBase(item:MonsterIndex){return item.baseExp&&item.hp?item.baseExp/item.hp:-1}
function efficiencyJob(item:MonsterIndex){return item.jobExp&&item.hp?item.jobExp/item.hp:-1}
function efficiencyCombined(item:MonsterIndex){return item.hp?((item.baseExp??0)+(item.jobExp??0))/item.hp:-1}
const EFFICIENCY_SORTS={efficiency:efficiencyCombined,"efficiency-base":efficiencyBase,"efficiency-job":efficiencyJob} as const;
function isEfficiencySortKey(value:string):value is keyof typeof EFFICIENCY_SORTS{return value in EFFICIENCY_SORTS}
function elementModifierClass(percent:number){
  if(percent===0)return "ele-immune";
  if(percent<0)return "ele-absorb";
  if(percent<100)return "ele-resist";
  if(percent>100)return "ele-weak";
  return "ele-flat";
}
const raceLabel=(t:Dict,value:string)=>(t.races as Record<string,string>)[value]??value;
const elementLabel=(t:Dict,value:string)=>(t.elements as Record<string,string>)[value]??value;
const sizeLabel=(t:Dict,value:string)=>(t.sizes as Record<string,string>)[value]??value;

export function MonsterCatalog({selectedMonsterId,initialQuery,onSelectMonster,onOpenItem,onPreviewMonster,t}:{selectedMonsterId:number|null;initialQuery:string;onSelectMonster:(id:number)=>void;onOpenItem:(id:number)=>void;onPreviewMonster:(id:number,name:string,maps:string[],mvp?:boolean)=>void;t:Dict}){
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
    return result.sort((left,right)=>{
      if(sort==="name")return left.name.localeCompare(right.name);
      if(sort==="level")return (left.level??0)-(right.level??0)||left.id-right.id;
      if(isEfficiencySortKey(sort)){const score=EFFICIENCY_SORTS[sort];return score(right)-score(left)||left.id-right.id}
      return left.id-right.id;
    });
  },[catalog,query,race,element,mvpOnly,sort]);
  const activeDetail=detail?.id===selectedMonsterId?detail:null;
  const isEfficiencySort=isEfficiencySortKey(sort);
  // El farmeo real evita MVP y mini boss (Class: Boss en rAthena) porque no
  // son algo que la mayoría de jugadores repita en serie; el top se calcula
  // solo sobre monstruos de campo normales.
  const shown=isEfficiencySort?filtered.filter(item=>!item.mvp&&!item.miniboss).slice(0,50):filtered.slice(0,limit);

  if(error)return <section className="catalog-fatal"><h1>{t.monsters.fatalTitle}</h1><p>{t.monsters.fatalCopy}</p></section>;
  if(!catalog)return <section className="catalog-loading"><div className="loader"/><p>{t.monsters.opening}</p></section>;

  return <section className="item-catalog monster-catalog">
    <header className="catalog-head monster-hero">
      <div><small>{t.monsters.eyebrow}</small><h1>{t.monsters.heroTitle}</h1></div>
      <p>Consulta los {catalog.meta.count.toLocaleString("es-ES")} monstruos Pre-Renewal: nivel, elemento, mapas y todo lo que dropean.</p>
    </header>
    <div className="catalog-toolbar monster-toolbar">
      <label className="catalog-search"><span>{t.monsters.searchLabel}</span><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(80)}} placeholder={t.monsters.searchPlaceholder}/></label>
      <label><span>{t.monsters.race}</span><select value={race} onChange={event=>{setRace(event.target.value);setLimit(80)}}><option value="all">{t.monsters.allRaces}</option>{races.map(([name,count])=><option key={name} value={name}>{raceLabel(t,name)} · {count}</option>)}</select></label>
      <label><span>{t.monsters.element}</span><select value={element} onChange={event=>{setElement(event.target.value);setLimit(80)}}><option value="all">{t.monsters.allElements}</option>{elements.map(([name,count])=><option key={name} value={name}>{elementLabel(t,name)} · {count}</option>)}</select></label>
      <label><span>{t.monsters.sort}</span><select value={sort} onChange={event=>setSort(event.target.value)}><option value="id">{t.monsters.sortId}</option><option value="name">{t.monsters.sortName}</option><option value="level">{t.monsters.sortLevel}</option><option value="efficiency">{t.monsters.sortEfficiency}</option><option value="efficiency-base">{t.monsters.sortEfficiencyBase}</option><option value="efficiency-job">{t.monsters.sortEfficiencyJob}</option></select></label>
      <button className={mvpOnly?"catalog-toggle active":"catalog-toggle"} onClick={()=>{setMvpOnly(value=>!value);setLimit(80)}} aria-pressed={mvpOnly}>MVP</button>
    </div>
    <div className="catalog-body">
      <div className="catalog-results">
        <div className="catalog-status">{isEfficiencySort?<b>{sort==="efficiency-base"?t.monsters.topEfficiencyTitleBase(shown.length):sort==="efficiency-job"?t.monsters.topEfficiencyTitleJob(shown.length):t.monsters.topEfficiencyTitle(shown.length)}</b>:<><b>{filtered.length.toLocaleString("es-ES")}</b> coincidencias</>}</div>
        <div className="item-list">
          {shown.map(item=><button key={item.id} className={selectedMonsterId===item.id?"item-row selected":"item-row"} onClick={()=>onSelectMonster(item.id)}>
            <MonsterSprite monster={item} className="item-sigil"/>
            <span className="item-main"><b>{item.name}{item.mvp&&<span className="mvp">MVP</span>}</b><small>{t.monsters.levelShort} {item.level??"—"} · {raceLabel(t,item.race)} · {elementLabel(t,item.element)}{item.elementLevel?` ${item.elementLevel}`:""}</small></span>
            <span className="item-id">#{item.id}</span>
          </button>)}
          {!filtered.length&&<div className="catalog-empty"><b>{t.monsters.emptyTitle}</b><span>{t.monsters.emptyHint}</span></div>}
          {!isEfficiencySort&&limit<filtered.length&&<button className="load-more" onClick={()=>setLimit(value=>value+80)}>{t.monsters.more}</button>}
        </div>
      </div>
      <aside className="item-detail">{selectedMonsterId===null?<div className="detail-placeholder"><span>♜</span><h2>{t.monsters.pickTitle}</h2><p>{t.monsters.pickCopy}</p></div>:!activeDetail?<div className="detail-placeholder"><div className="loader"/><p>{t.monsters.loadingCard}</p></div>:<MonsterDetailCard key={activeDetail.id} monster={activeDetail} onOpenItem={onOpenItem} onPreviewMonster={onPreviewMonster} t={t}/>}</aside>
    </div>
  </section>;
}

const TOP_MAPS=4;
function MonsterDetailCard({monster,onOpenItem,onPreviewMonster,t}:{monster:MonsterDetail;onOpenItem:(id:number)=>void;onPreviewMonster:(id:number,name:string,maps:string[],mvp?:boolean)=>void;t:Dict}){
  const taken=damageTakenFromElements(monster.element,monster.elementLevel);
  const elementText=`${elementLabel(t,monster.element)}${monster.elementLevel?` ${monster.elementLevel}`:""}`;
  const topMaps=monster.maps.slice(0,TOP_MAPS);
  const mapCodes=monster.maps.map(spot=>spot.map);
  const viewMap=(code:string)=>onPreviewMonster(monster.id,monster.name,[code,...mapCodes.filter(candidate=>candidate!==code)],monster.mvp);
  return <div className="detail-card">
    <div className="detail-title"><MonsterSprite monster={monster} className="detail-sigil" detail/><div><span>#{monster.id}</span><h2>{monster.name}</h2><code>{monster.aegisName}</code></div></div>
    <div className="detail-badges"><span>{raceLabel(t,monster.race)}</span><span>{elementText}</span>{monster.size&&<span>{sizeLabel(t,monster.size)}</span>}{monster.mvp&&<span>MVP</span>}</div>
    <dl className="stat-grid">
      <div><dt>{t.monsters.level}</dt><dd>{stat(monster.level)}</dd></div><div><dt>HP</dt><dd>{stat(monster.hp)}</dd></div>
      <div><dt>{t.monsters.baseExp}</dt><dd>{stat(monster.baseExp)}</dd></div><div><dt>{t.monsters.jobExp}</dt><dd>{stat(monster.jobExp)}</dd></div>
      <div><dt>ATK</dt><dd>{monster.attack===undefined&&monster.attack2===undefined?"—":`${stat(monster.attack)}–${stat(monster.attack2)}`}</dd></div>
      <div><dt>{t.monsters.defMdef}</dt><dd>{stat(monster.defense)} / {stat(monster.magicDefense)}</dd></div>
      <div><dt>{t.monsters.range}</dt><dd>{stat(monster.attackRange)}</dd></div><div><dt>{t.monsters.walkSpeed}</dt><dd>{stat(monster.walkSpeed)}</dd></div>
    </dl>
    {taken&&<section className="detail-section elemental-section">
      <h3>{t.monsters.strengths}</h3>
      <p>{t.monsters.takesAs(elementText)}</p>
      <ul className="element-table" aria-label={t.monsters.elementalAria}>
        {taken.map(row=><li key={row.element} className={elementModifierClass(row.percent)}><span>{elementLabel(t,row.element)}</span><em>{row.percent}%</em></li>)}
      </ul>
    </section>}
    <section className="detail-section"><h3>{t.monsters.stats}</h3><p>STR {stat(monster.str)} · AGI {stat(monster.agi)} · VIT {stat(monster.vit)} · INT {stat(monster.int)} · DEX {stat(monster.dex)} · LUK {stat(monster.luk)}</p></section>
    <section className="detail-section"><h3>{t.monsters.spawnMaps}{topMaps.length>1&&<span className="section-tag">{t.monsters.spawnTopLabel(topMaps.length)}</span>}</h3>{topMaps.length?
      <div className="map-chip-grid">{topMaps.map(spot=><button type="button" className="map-chip" key={spot.map} onClick={()=>viewMap(spot.map)} aria-label={t.monsters.viewMapAria(spot.map)}>
        {spot.count?<strong className="map-chip-count">{t.monsters.spawnCount(spot.count)}</strong>:null}
        <b>{spot.map}</b>
        {spot.delay?<small>{t.monsters.spawnRespawn(Math.round(spot.delay/1000))}</small>:null}
      </button>)}</div>
    :<p className="source-empty">{t.monsters.noSpawns}</p>}</section>
    <section className="detail-section"><h3>{t.monsters.drops}</h3>{monster.drops.length?<div className="source-list">{monster.drops.map(drop=><button type="button" className="source-row source-link" key={`${drop.id}-${drop.mvp?"mvp":"drop"}`} onClick={()=>onOpenItem(drop.id)}><div><b>{drop.name}{drop.mvp&&<span className="mvp">MVP</span>}</b><small>#{drop.id}</small></div><em>{dropRate(drop.rate)}</em></button>)}</div>:<p className="source-empty">{t.monsters.noDrops}</p>}</section>
    <ReportIssueLink kind="Monstruo" id={monster.id} name={monster.name} label={t.monsters.reportIssue}/>
  </div>;
}

function MonsterSprite({monster,className,detail=false}:{monster:Pick<MonsterIndex,"name"|"sprite"|"mvp">;className:string;detail?:boolean}){
  const fallback=monster.mvp?"♛":"♜";
  if(!monster.sprite)return <span className={className}>{fallback}</span>;
  return <span className={`${className} item-sprite`}><img src={monster.sprite} alt={detail?`Sprite de ${monster.name}`:""} loading={detail?"eager":"lazy"} onError={event=>event.currentTarget.parentElement?.classList.add("sprite-broken")}/><i aria-hidden="true">{fallback}</i></span>;
}
