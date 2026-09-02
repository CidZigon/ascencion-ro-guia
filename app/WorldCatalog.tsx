"use client";
import type { Dict } from "./i18n";
/* eslint-disable @next/next/no-img-element -- sprites GIF animados y mapas estáticos ya optimizados en la caché local */

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ModalShell } from "./ModalShell";
import { ReportIssueLink } from "./report-issue";

export type WorldKind="map"|"monster"|"npc"|"reference";
export type WorldSelection={kind:WorldKind;id:string;point?:{x:number;y:number}};
type WorldPoint={x:number;y:number;label:string;kind:"npc"|"reference"};
type MapEntry={id:string;code:string;labels:string[];points:WorldPoint[];image:string|null;contexts:string[];topics:number[]};
type MonsterLocation={map:string;name:string;spawn:string};
type MonsterEntry={id:number;name:string;sprite:string|null;locations:MonsterLocation[];contexts:string[];topics:number[]};
type NpcEntry={id:string;name:string;map:string|null;sprite:string|null;spriteApproximate?:boolean;locations:string[];points:WorldPoint[];contexts:string[];topics:number[]};
type ReferenceEntry={id:string;name:string;contexts:string[];topics:number[]};
type WorldPayload={counts:{maps:number;monsters:number;npcs:number;references:number};maps:MapEntry[];monsters:MonsterEntry[];npcs:NpcEntry[];references:ReferenceEntry[]};
type WorldRegion={id:string;name:string;description:string;icon:string;codes?:string[];prefixes?:string[];special?:"instance"|"other"};
type Entry=
  |({kind:"map"}&MapEntry)
  |({kind:"monster"}&Omit<MonsterEntry,"id">&{id:string})
  |({kind:"npc"}&NpcEntry)
  |({kind:"reference"}&ReferenceEntry);

let worldPromise:Promise<WorldPayload>|null=null;
function loadWorld(){
  worldPromise??=fetch("/data/world-index.json").then(response=>{if(!response.ok)throw new Error("world");return response.json()});
  return worldPromise;
}

function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function uniqueStrings(values:string[]){const seen=new Set<string>();return values.filter(value=>{const key=normalize(value.trim());if(!key||seen.has(key))return false;seen.add(key);return true})}
function escapeRegExp(value:string){return value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}

const kindLabel=(t:Dict,kind:WorldKind)=>(t.world.kinds as Record<string,string>)[kind]??kind;
const ICONS:Record<WorldKind,string>={map:"⌖",monster:"♜",npc:"♙",reference:"◇"};

const CITY_NAMES:Record<string,string>={
  prontera:"Prontera",izlude:"Izlude",geffen:"Geffen",payon:"Payon",alberta:"Alberta",morocc:"Morroc",aldebaran:"Al De Baran",yuno:"Juno",einbroch:"Einbroch",einbech:"Einbech",lighthalzen:"Lighthalzen",hugel:"Hugel",rachel:"Rachel",veins:"Veins",comodo:"Comodo",umbala:"Umbala",niflheim:"Niflheim",amatsu:"Amatsu",ayothaya:"Ayothaya",gonryun:"Gonryun",louyang:"Louyang",moscovia:"Moscovia",
};
const REGIONS:WorldRegion[]=[
  {id:"prontera",name:"Prontera",description:"Capital de Rune-Midgarts, Izlude y Monte Mjolnir",icon:"♔",codes:["prontera","izlude"],prefixes:["prt_","iz_","mjolnir_","mjo_"]},
  {id:"geffen",name:"Geffen",description:"Campos de Geffen, Orc Dungeon, torre y Glast Heim",icon:"✦",codes:["geffen","geffen_in"],prefixes:["gef_","gl_","in_orcs"]},
  {id:"payon",name:"Payon",description:"Ciudad, interiores, bosque, cuevas y campos de Payon",icon:"♧",codes:["payon"],prefixes:["pay_","payon_"]},
  {id:"morroc",name:"Morroc",description:"Desierto de Sograt, interiores, Sphinx y alrededores",icon:"☀",codes:["morocc"],prefixes:["moc_","in_moc","morocc_","in_sphinx","in_rogue"]},
  {id:"alberta",name:"Alberta",description:"Puerto de Alberta, barcos y Turtle Island",icon:"⚓",codes:["alberta"],prefixes:["alb_","alberta_","tur_","treasure"]},
  {id:"comodo",name:"Comodo, Umbala y Niflheim",description:"Costa, selva de Umbala y reino de los muertos",icon:"☽",codes:["comodo","umbala","niflheim"],prefixes:["cmd_","um_","nif_","beach_"]},
  {id:"aldebaran",name:"Al De Baran",description:"Ciudad del tiempo y Clock Tower",icon:"◷",codes:["aldebaran"],prefixes:["aldeba_","clock_","c_tower"]},
  {id:"juno",name:"Juno",description:"Campos de Juno, Magma Dungeon, Juperos y Thanatos",icon:"♜",codes:["yuno"],prefixes:["yuno_","mag_","jupe_","tha_"]},
  {id:"schwartzwald",name:"República de Schwarzwald",description:"Einbroch, Einbech, Lighthalzen, Hugel y Kiel",icon:"⚙",codes:["einbroch","einbech","lighthalzen","hugel"],prefixes:["ein_","lhz_","hu_","odin_","abyss_","kh_","schg_"]},
  {id:"arunafeltz",name:"Arunafeltz",description:"Rachel, Veins, Thor, Ice Dungeon y Nameless",icon:"✺",codes:["rachel","veins"],prefixes:["ra_","ve_","ice_","thor_","nameless","abbey"]},
  {id:"eastern",name:"Naciones lejanas",description:"Amatsu, Ayothaya, Gonryun, Louyang, Moscovia y Brasilis",icon:"❀",codes:["amatsu","ayothaya","gonryun","louyang","moscovia"],prefixes:["ama_","ayo_","gon_","lou_","mosk_","bra_"]},
  {id:"new-world",name:"Nuevo Mundo",description:"Camp Midgard, Manuk, Splendide y Episode 13",icon:"◇",codes:["mora","manuk","splendide"],prefixes:["mid_","man_","spl_","nyd_","dic_","bif_","1@nyd"]},
  {id:"instances",name:"Instancias y contenido especial",description:"Mapas privados, torres y escenarios de quest",icon:"⌁",codes:["e_tower","orcs_mem","area-3038","job_star","monk_test","que_job01","que_ng","que_thor","valkyrie"],special:"instance"},
  {id:"other",name:"Otros territorios",description:"Mapas sin una capital regional directa",icon:"⌖",special:"other"},
];

type RegionText={name:string;description:string};
const regionText=(t:Dict,id:string):RegionText=>(t.world.regions as Record<string,RegionText>)[id]??{name:id,description:""};

function isCity(map:MapEntry){return Boolean(CITY_NAMES[map.id])}
function mapRegion(map:MapEntry){
  const code=map.code.toLowerCase();
  for(const region of REGIONS){
    if(region.special)continue;
    if(region.codes?.includes(code)||region.prefixes?.some(prefix=>code.startsWith(prefix)))return region;
  }
  const instances=REGIONS.find(region=>region.special==="instance")!;
  if(code.includes("@")||instances.codes?.includes(code))return instances;
  return REGIONS.find(region=>region.special==="other")!;
}
function mapDisplayName(map:MapEntry){
  if(CITY_NAMES[map.id])return CITY_NAMES[map.id];
  const code=new RegExp(`\\b${escapeRegExp(map.code)}\\b`,"gi");
  const candidates=map.labels.map(label=>label.replace(code," ").replace(/\bRMS map\b/gi," ").replace(/\b(?:centro del mapa|coordenada interior no publicada|coord(?:enada)? exacta no publicada)\b/gi," ").replace(/\b\d{1,3}\s*,\s*\d{1,3}\b/g," ").replace(/[📍·—|]/gu," ").replace(/\s{2,}/g," ").trim()).filter(label=>label.length>2);
  return candidates.sort((a,b)=>b.length-a.length)[0]||"Mapa de Midgard";
}
function findEntry(payload:WorldPayload,selection:WorldSelection):Entry|null{
  if(selection.kind==="map"){const entry=payload.maps.find(item=>item.id===selection.id);return entry?{...entry,kind:"map"}:null}
  if(selection.kind==="monster"){const entry=payload.monsters.find(item=>String(item.id)===selection.id);return entry?{...entry,id:String(entry.id),kind:"monster"}:null}
  if(selection.kind==="npc"){const entry=payload.npcs.find(item=>item.id===selection.id);return entry?{...entry,kind:"npc"}:null}
  const entry=payload.references.find(item=>item.id===selection.id);return entry?{...entry,kind:"reference"}:null;
}
function resolveMap(payload:WorldPayload,selection:WorldSelection|null){
  if(!selection)return null;
  if(selection.kind==="map")return payload.maps.find(map=>map.id===selection.id)??null;
  if(selection.kind==="npc"){const npc=payload.npcs.find(item=>item.id===selection.id);return npc?.map?payload.maps.find(map=>map.id===npc.map)??null:null}
  if(selection.kind==="monster"){const monster=payload.monsters.find(item=>String(item.id)===selection.id);return monster?.locations[0]?payload.maps.find(map=>map.id===monster.locations[0].map)??null:null}
  const reference=payload.references.find(item=>item.id===selection.id);
  return reference?payload.maps.find(map=>map.contexts.some(context=>normalize(context).includes(normalize(reference.name))))??null:null;
}

export function WorldCatalog({selection,initialQuery,onSelect,t}:{selection:WorldSelection|null;initialQuery:string;onSelect:(selection:WorldSelection)=>void;t:Dict}){
  const [payload,setPayload]=useState<WorldPayload|null>(null);
  const [query,setQuery]=useState(initialQuery);
  const [region,setRegion]=useState("all");
  const [error,setError]=useState(false);

  useEffect(()=>{let live=true;loadWorld().then(data=>{if(live)setPayload(data)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[]);
  const npcsByMap=useMemo(()=>{const counts=new Map<string,number>();for(const npc of payload?.npcs??[]){if(npc.map)counts.set(npc.map,(counts.get(npc.map)??0)+1)}return counts},[payload]);
  const filtered=useMemo(()=>{
    if(!payload)return[];
    const term=normalize(query.trim());
    return payload.maps.filter(map=>{
      if(region!=="all"&&mapRegion(map).id!==region)return false;
      if(!term)return true;
      const npcNames=payload.npcs.filter(npc=>npc.map===map.id).map(npc=>npc.name).join(" ");
      return normalize(`${map.code} ${map.labels.join(" ")} ${map.contexts.join(" ")} ${npcNames}`).includes(term);
    }).sort((a,b)=>Number(isCity(b))-Number(isCity(a))||a.code.localeCompare(b.code));
  },[payload,query,region]);
  const selected=payload?resolveMap(payload,selection):null;

  if(error)return <section className="catalog-fatal"><h1>{t.world.fatalTitle}</h1><p>{t.world.fatalCopy}</p></section>;
  if(!payload)return <section className="catalog-loading"><div className="loader"/><p>{t.world.opening}</p></section>;

  const regionCounts=new Map(REGIONS.map(item=>[item.id,payload.maps.filter(map=>mapRegion(map).id===item.id).length]));
  const groups=REGIONS.map(item=>({region:item,maps:filtered.filter(map=>mapRegion(map).id===item.id)})).filter(group=>group.maps.length);
  const selectMap=(map:MapEntry)=>{
    onSelect({kind:"map",id:map.id});
    if(window.matchMedia("(max-width: 800px)").matches)setTimeout(()=>document.querySelector(".world-detail")?.scrollIntoView({behavior:"smooth",block:"start"}),30);
  };
  return <section className="world-catalog">
    <header className="catalog-hero world-hero"><div><small>{t.world.eyebrow}</small><h1>{t.world.heroTitle}</h1><p>{t.world.heroCopy}</p></div></header>
    <section className="world-city-section" aria-labelledby="region-title"><div className="world-section-heading"><div><small>{t.world.zonesEyebrow}</small><h2 id="region-title">{t.world.zonesTitle}</h2></div><span>{REGIONS.filter(item=>(regionCounts.get(item.id)??0)>0).length} {t.world.available}</span></div><div className="world-city-strip"><button className={region==="all"?"active":""} onClick={()=>setRegion("all")}><span>✦</span><b>{t.world.allShort}</b><small>{payload.counts.maps} {t.world.maps}</small></button>{REGIONS.filter(item=>(regionCounts.get(item.id)??0)>0).map(item=><button key={item.id} className={region===item.id?"active":""} onClick={()=>setRegion(item.id)}><span>{item.icon}</span><b>{regionText(t,item.id).name}</b><small>{regionCounts.get(item.id)} {t.world.maps}</small></button>)}</div></section>
    <div className="world-toolbar">
      <label><span>{t.world.searchLabel}</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="prt_fild08, Prontera, Langry…"/></label>
      <label><span>{t.world.region}</span><select value={region} onChange={event=>setRegion(event.target.value)}><option value="all">{t.world.allRegions} · {payload.counts.maps}</option>{REGIONS.filter(item=>(regionCounts.get(item.id)??0)>0).map(item=><option key={item.id} value={item.id}>{regionText(t,item.id).name} · {regionCounts.get(item.id)}</option>)}</select></label>
    </div>
    <div className="world-body">
      <div className="world-results"><div className="catalog-status"><b>{filtered.length.toLocaleString("es-ES")}</b> {t.world.maps} · {groups.length} {t.world.mapsIn(groups.length)}</div>{groups.length?<div className="world-region-list">{groups.map(group=><section className="world-region-group" key={group.region.id}><header className="world-region-heading"><div><small>{t.world.regionEyebrow}</small><h2>{regionText(t,group.region.id).name}</h2><p>{regionText(t,group.region.id).description}</p></div><span>{group.maps.length} {t.world.maps}</span></header><div className="world-map-list">{group.maps.map(map=><button key={map.id} className={selected?.id===map.id?"world-map-card selected":"world-map-card"} onClick={()=>selectMap(map)}><span className="world-map-thumb">{map.image?<img src={map.image} alt="" loading="lazy"/>:<i>⌖</i>}</span><span className="world-map-summary"><small>{isCity(map)?t.world.city:t.world.map}</small><b>{map.code}</b><em>{mapDisplayName(map)}</em><span><i>♙</i> {npcsByMap.get(map.id)??0} {t.world.npcShort} <i>◇</i> {map.contexts.length} {t.world.references}</span></span><strong>→</strong></button>)}</div></section>)}</div>:<div className="catalog-empty"><b>{t.world.emptyTitle}</b><span>{t.world.emptyHint}</span></div>}</div>
      <aside className="world-detail">{selected?<WorldAtlasDetail key={selected.id} map={selected} payload={payload} t={t}/>:<div className="detail-placeholder"><span>⌖</span><h2>{t.world.pickTitle}</h2><p>{t.world.pickCopy}</p></div>}</aside>
    </div>
  </section>;
}

function WorldAtlasDetail({map,payload,t}:{map:MapEntry;payload:WorldPayload;t:Dict}){
  const npcs=payload.npcs.filter(npc=>npc.map===map.id).sort((a,b)=>a.name.localeCompare(b.name));
  const pinsByCoordinate=new Map<string,WorldPoint>();
  for(const point of map.points){if(point.kind==="reference"&&point.x>=0&&point.y>=0&&isMeaningfulMapReference(point.label,map.code))pinsByCoordinate.set(`${point.x}-${point.y}`,point)}
  for(const npc of npcs){for(const point of primaryNpcPoints(npc))pinsByCoordinate.set(`${point.x}-${point.y}`,{...point,kind:"npc",label:npc.name})}
  // Cada punto lleva el mismo número que su pin en el mapa, para que las
  // tarjetas de NPC y las referencias de abajo se puedan emparejar con lo que
  // se ve arriba en vez de ser dos listas sueltas sin relación visible.
  const pinNumber=new Map([...pinsByCoordinate.keys()].map((key,index)=>[key,index+1]));
  const npcPinNumber=(npc:NpcEntry)=>{const point=primaryNpcPoints(npc)[0];return point?pinNumber.get(`${point.x}-${point.y}`):undefined};

  const seenNotes=new Set<string>();
  const referenceNotes=map.points.filter(point=>point.kind==="reference"&&isMeaningfulMapReference(point.label,map.code)).flatMap(point=>{
    const text=cleanMapReference(point.label,map.code);
    const key=normalize(text);
    if(!text||seenNotes.has(key))return[];
    seenNotes.add(key);
    const number=point.x>=0&&point.y>=0?pinNumber.get(`${point.x}-${point.y}`):undefined;
    return[{text,number}];
  });
  const contextNotes=uniqueStrings(map.contexts).filter(note=>isMeaningfulMapReference(note,"")&&!seenNotes.has(normalize(note))).map(text=>({text,number:undefined}));
  const notes=[...referenceNotes,...contextNotes];

  return <div className="world-detail-card world-atlas-detail">
    <div className="world-detail-title"><span>⌖</span><div><small>{isCity(map)?"Ciudad":"Mapa de Midgard"}</small><h2>{map.code}</h2><code>{mapDisplayName(map)}</code></div></div>
    <section className="map-section"><div className="atlas-map-heading"><h3>{t.world.localMap}</h3><span>{npcs.length} {t.world.npcShort} · {notes.length} {t.world.references}</span></div><MapBoard key={map.code} code={map.code} image={map.image} points={[...pinsByCoordinate.values()]} showCoordinateList={false} t={t}/></section>
    <section><div className="atlas-map-heading"><h3>{t.world.npcsHere}</h3><span>{npcs.length}</span></div>{npcs.length?<div className="map-npc-grid">{npcs.map(npc=>{const point=primaryNpcPoints(npc)[0];const number=npcPinNumber(npc);return <article key={npc.id}><span className="map-npc-sprite">{npc.sprite?<img src={npc.sprite} alt={`Sprite de ${npc.name}`} loading="lazy"/>:<i>♙</i>}</span><div><b>{number&&<i className="pin-badge">{number}</i>}{npc.name}</b><small>{point?`${point.x}, ${point.y}`:t.world.noCoordinate}</small>{npc.spriteApproximate&&<em>{t.world.representativeSprite}</em>}</div></article>})}</div>:<p className="atlas-empty-note">{t.world.noNpcs}</p>}</section>
    <section><div className="atlas-map-heading"><h3>{t.world.questsHere}</h3><span>{notes.length}</span></div>{notes.length?<div className="map-reference-list">{notes.map((note,index)=><article key={`${normalize(note.text)}-${index}`}>{note.number?<i className="pin-badge">{note.number}</i>:<span>◇</span>}<p>{note.text}</p></article>)}</div>:<p className="atlas-empty-note">{t.world.noQuests}</p>}</section>
    <ReportIssueLink kind="Mapa" id={map.code} name={mapDisplayName(map)} label={t.world.reportIssue}/>
  </div>;
}

function cleanMapReference(label:string,code:string){return label.replace(/📍/g,"").replace(new RegExp(`\\b${escapeRegExp(code)}\\b`,"gi"),"").replace(/\bRMS map\b/gi,"").replace(/^[\s·—,-]+|[\s·—,-]+$/g,"").replace(/\s{2,}/g," ").trim()}
function isMeaningfulMapReference(label:string,code:string){return /[a-záéíóúñ]/i.test(cleanMapReference(label,code))}

export function WorldReferenceDialog({selection,onClose,t}:{selection:WorldSelection;onClose:()=>void;t:Dict}){
  const [payload,setPayload]=useState<WorldPayload|null>(null);
  const [current,setCurrent]=useState(selection);
  const [error,setError]=useState(false);

  useEffect(()=>{let live=true;loadWorld().then(data=>{if(live)setPayload(data)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[]);

  const selected=payload?findEntry(payload,current):null;
  return <ModalShell eyebrow={t.world.dialogEyebrow} title={t.world.dialogTitle} onClose={onClose}>
    {error?<div className="world-dialog-message"><b>{t.world.dialogError}</b><span>{t.world.dialogErrorHint}</span></div>:!payload?<div className="world-dialog-message"><div className="loader"/><span>{t.world.searching}</span></div>:selected?<WorldDetail key={`${selected.kind}-${selected.id}`} entry={selected} maps={payload.maps} onSelect={setCurrent} selectedPoint={current.point} t={t}/>:<div className="world-dialog-message"><b>{t.world.notFound}</b><span>{t.world.notFoundHint}</span></div>}
  </ModalShell>;
}

export function MonsterSpawnDialog({monsterId,monsterName,mvp,maps,onClose,t}:{monsterId:number;monsterName:string;mvp?:boolean;maps:string[];onClose:()=>void;t:Dict}){
  const [world,setWorld]=useState<WorldPayload|null>(null);
  const [active,setActive]=useState<string|null>(maps[0]??null);

  // Los mapas de aparición vienen del bestiario completo, no del catálogo
  // curado de Mundo (que solo cubre lo mencionado en las guías). Por eso la
  // imagen se pide directamente por convención de ruta — cache-spawn-map-media.mjs
  // la cachea para casi todos los mapas — y solo se consulta world-index.json
  // para el nombre amistoso cuando el mapa también aparece ahí.
  useEffect(()=>{let live=true;loadWorld().then(data=>{if(live)setWorld(data)}).catch(()=>{});return()=>{live=false}},[]);

  // Varios monstruos de rAthena comparten el mismo nombre visible con AegisName
  // e ID distintos (variantes de instancia, guild dungeon, episodio, etc.), así
  // que el ID va siempre en el título para no confundirlos entre sí.
  const title=`#${monsterId} · ${monsterName}${mvp?" · MVP":""}`;
  return <ModalShell eyebrow={kindLabel(t,"monster")} title={title} onClose={onClose}>
    <div className="world-detail-card">
      {!maps.length?<section className="monster-locations"><h3>{t.world.spawnTitle}</h3><p className="atlas-empty-note">{t.world.noSpawnMaps}</p></section>
        :<section className="monster-locations">
          <h3>{t.world.spawnTitle} · {maps.length}</h3>
          <div className="spawn-map"><MapBoard key={active??""} code={active??""} image={active?`/world/maps/${active}.gif`:null} points={[]} showCoordinateList={false} t={t}/></div>
          <div className="spawn-list">{maps.map(code=>{
            const entry=world?.maps.find(map=>map.code.toLowerCase()===code.toLowerCase());
            return <button key={code} type="button" className={active===code?"active":""} onClick={()=>setActive(code)}><b>{code}</b>{entry&&<span>{mapDisplayName(entry)}</span>}</button>;
          })}</div>
        </section>}
    </div>
  </ModalShell>;
}

function entryName(entry:Entry){return entry.kind==="map"?mapDisplayName(entry):entry.name}
function WorldDetail({entry,maps,onSelect,selectedPoint,t}:{entry:Entry;maps:MapEntry[];onSelect:(selection:WorldSelection)=>void;selectedPoint?:{x:number;y:number};t:Dict}){
  const map=entry.kind==="map"?entry:entry.kind==="npc"&&entry.map?maps.find(item=>item.id===entry.map)??null:null;
  const points=entry.kind==="map"?entry.points:entry.kind==="npc"?primaryNpcPoints(entry,selectedPoint):[];
  const lines=entry.kind==="map"?entry.labels:entry.kind==="npc"?entry.locations.slice(0,1):[];
  const image=entry.kind==="map"?entry.image:map?.image??null;
  const portrait=(entry.kind==="monster"||entry.kind==="npc")?entry.sprite:null;
  const portraitName=(entry.kind==="monster"||entry.kind==="npc")?entry.name:"";
  return <div className="world-detail-card">
    <div className="world-detail-title"><span className={portrait?"sprite-detail":""}>{portrait?<img src={portrait} alt={`Sprite de ${portraitName}`}/>:ICONS[entry.kind]}</span><div><small>{kindLabel(t,entry.kind)}</small><h2>{entryName(entry)}</h2><code>{entry.kind==="map"?entry.code:entry.kind==="monster"?`ID ${entry.id}`:entry.kind==="npc"?entry.map||t.world.noMapGiven:t.world.integratedReference}</code>{entry.kind==="npc"&&entry.spriteApproximate&&<em className="sprite-reference-note">{t.world.approximateSprite}</em>}</div></div>
    {entry.kind==="monster"&&<MonsterLocations key={entry.id} monster={entry} maps={maps} onSelect={onSelect} t={t}/>}
    {map&&<section className="map-section"><h3>{entry.kind==="npc"?t.world.npcLocation:t.world.mapAndCoords}</h3><MapBoard key={map.code} code={map.code} image={image} points={points} t={t}/></section>}
    {lines.length>0&&<section><h3>{t.world.mentionedPlaces}</h3><ul>{lines.map(line=><li key={line}>{line}</li>)}</ul></section>}
    {entry.kind==="reference"&&entry.topics.length>0&&<section><h3>{t.world.integratedIn}</h3><div className="topic-chips">{entry.topics.map(topic=><span key={topic}>{t.topics[topic]||t.world.topicNumber(topic)}</span>)}</div></section>}
    <section><h3>{entry.kind==="reference"?t.world.availableHere:t.world.appearsIn}</h3><div className="context-list">{entry.contexts.length?entry.contexts.map((context,index)=><p key={`${context}-${index}`}>{context}</p>):<p>{t.world.noNote}</p>}</div></section>
    <ReportIssueLink kind={kindLabel(t,entry.kind)} id={entry.id} name={entryName(entry)} label={t.world.reportIssue}/>
  </div>;
}
function primaryNpcPoints(entry:NpcEntry,selectedPoint?:{x:number;y:number}){
  const unique=entry.points.filter((point,index,points)=>points.findIndex(candidate=>candidate.x===point.x&&candidate.y===point.y)===index);
  if(selectedPoint){const selected=unique.find(point=>point.x===selectedPoint.x&&point.y===selectedPoint.y);if(selected)return[selected]}
  const stated=entry.locations.flatMap(location=>{const match=location.match(/(?:^|\D)(\d{1,3})\s*,\s*(\d{1,3})(?:\D|$)/);return match?[{x:Number(match[1]),y:Number(match[2])}]:[]});
  const preferred=unique.find(point=>stated.some(location=>location.x===point.x&&location.y===point.y))??unique[0];
  return preferred?[preferred]:[];
}
function MonsterLocations({monster,maps,onSelect,t}:{monster:Extract<Entry,{kind:"monster"}>;maps:MapEntry[];onSelect:(selection:WorldSelection)=>void;t:Dict}){
  const [active,setActive]=useState(monster.locations[0]?.map||"");
  const location=monster.locations.find(item=>item.map===active)||monster.locations[0];
  const map=location?maps.find(item=>item.id===location.map)??null:null;
  return <section className="monster-locations"><h3>{t.world.spawnTitle} · {monster.locations.length}</h3>{location&&map&&<div className="spawn-map"><MapBoard key={map.code} code={map.code} image={map.image} points={[]} showCoordinateList={false} t={t}/><button onClick={()=>onSelect({kind:"map",id:map.id})}>{t.world.openMapCard} <span>→</span></button></div>}<div className="spawn-list">{monster.locations.length?monster.locations.map(item=><button className={item.map===location?.map?"active":""} key={item.map} onClick={()=>setActive(item.map)}><b>{item.map}</b><span>{item.name}</span><small>{item.spawn.replace(item.map,"").replace(/[()]/g,"").trim()||t.world.specialSpawn}</small></button>):<p>{t.world.noSpawnMaps}</p>}</div></section>;
}
const ZOOM_MIN=1;
const ZOOM_MAX=4;
function clampTo(value:number,limit:number){return Math.min(limit,Math.max(-limit,value))}
function pointerDistance(a:{x:number;y:number},b:{x:number;y:number}){return Math.hypot(a.x-b.x,a.y-b.y)}

// Los mapas oficiales son imágenes fijas de resolución modesta; sin zoom, los
// nombres de zonas y los pines quedan ilegibles en pantallas de celular. El
// arrastre y el zoom (rueda, botones o pellizco) viven en un contenedor
// interno transformado con translate+scale para que la imagen y los pines
// se muevan como una sola unidad, mientras .map-canvas recorta la vista.
function MapBoard({code,image,points,showCoordinateList=true,t}:{code:string;image:string|null;points:WorldPoint[];showCoordinateList?:boolean;t:Dict}){
  const [broken,setBroken]=useState(false);
  const [scale,setScale]=useState(1);
  const [offset,setOffset]=useState({x:0,y:0});
  const [dragging,setDragging]=useState(false);
  const canvasRef=useRef<HTMLDivElement>(null);
  const dragStart=useRef<{x:number;y:number;offsetX:number;offsetY:number}|null>(null);
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const pinchStart=useRef<{distance:number;scale:number}|null>(null);
  const max=Math.max(400,...points.flatMap(point=>[point.x,point.y]));
  const canZoom=Boolean(image)&&!broken;

  function zoomTo(cx:number,cy:number,targetScale:number){
    const canvas=canvasRef.current;
    if(!canvas)return;
    const size=canvas.getBoundingClientRect().width;
    const nextScale=Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,targetScale));
    const pointX=(cx-offset.x)/scale;
    const pointY=(cy-offset.y)/scale;
    const bound=(nextScale-1)/2*size;
    setScale(nextScale);
    setOffset({x:clampTo(cx-pointX*nextScale,bound),y:clampTo(cy-pointY*nextScale,bound)});
  }
  function centerOffset(event:{clientX:number;clientY:number}){
    const rect=canvasRef.current!.getBoundingClientRect();
    return {x:event.clientX-rect.left-rect.width/2,y:event.clientY-rect.top-rect.height/2};
  }
  function handleWheel(event:React.WheelEvent){
    if(!canZoom)return;
    event.preventDefault();
    const {x,y}=centerOffset(event);
    zoomTo(x,y,scale*(event.deltaY<0?1.2:1/1.2));
  }
  function handleDoubleClick(event:React.MouseEvent){
    if(!canZoom)return;
    const {x,y}=centerOffset(event);
    zoomTo(x,y,scale>1.05?1:2.5);
  }
  function handlePointerDown(event:React.PointerEvent){
    if(!canZoom)return;
    // Un pointerId recién creado por un dedo/mouse siempre está "activo" para
    // el navegador, pero por si algún gesto raro llega tarde (el dedo ya se
    // levantó, el navegador no soporta el pointer capture, etc.) esto no debe
    // tumbar el resto del gesto.
    try{canvasRef.current?.setPointerCapture(event.pointerId)}catch{/* pointer ya no activo */}
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.current.size===1){
      dragStart.current={x:event.clientX,y:event.clientY,offsetX:offset.x,offsetY:offset.y};
      setDragging(true);
    }else if(pointers.current.size===2){
      dragStart.current=null;
      const [a,b]=[...pointers.current.values()];
      pinchStart.current={distance:pointerDistance(a,b),scale};
    }
  }
  function handlePointerMove(event:React.PointerEvent){
    if(!pointers.current.has(event.pointerId))return;
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.current.size===2&&pinchStart.current){
      const [a,b]=[...pointers.current.values()];
      const factor=pointerDistance(a,b)/pinchStart.current.distance;
      const rect=canvasRef.current!.getBoundingClientRect();
      const midX=(a.x+b.x)/2-rect.left-rect.width/2;
      const midY=(a.y+b.y)/2-rect.top-rect.height/2;
      zoomTo(midX,midY,pinchStart.current.scale*factor);
    }else if(dragStart.current){
      const size=canvasRef.current!.getBoundingClientRect().width;
      const bound=(scale-1)/2*size;
      setOffset({
        x:clampTo(dragStart.current.offsetX+(event.clientX-dragStart.current.x),bound),
        y:clampTo(dragStart.current.offsetY+(event.clientY-dragStart.current.y),bound),
      });
    }
  }
  function endPointer(event:React.PointerEvent){
    pointers.current.delete(event.pointerId);
    if(pointers.current.size===1){
      const [,point]=[...pointers.current.entries()][0];
      dragStart.current={x:point.x,y:point.y,offsetX:offset.x,offsetY:offset.y};
      pinchStart.current=null;
    }else if(pointers.current.size===0){
      dragStart.current=null;
      pinchStart.current=null;
      setDragging(false);
    }
  }

  return <div className="map-view">
    <div className={dragging?"map-canvas dragging":"map-canvas"} ref={canvasRef} onWheel={handleWheel} onDoubleClick={handleDoubleClick} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endPointer} onPointerCancel={endPointer}>
      {image&&!broken?<>
        <div className="map-canvas-inner" style={{transform:`translate(${offset.x}px,${offset.y}px) scale(${scale})`}}>
          <img src={image} alt={t.world.mapOf(code)} onError={()=>setBroken(true)} draggable={false}/>
          <div className="map-grid" aria-hidden="true"/>
          {points.map((point,index)=><span className={point.kind==="npc"?"map-pin npc-pin":"map-pin"} key={`${point.x}-${point.y}-${point.kind}-${index}`} style={{left:`${Math.min(98,Math.max(2,point.x/max*100))}%`,bottom:`${Math.min(98,Math.max(2,point.y/max*100))}%`,transform:`translate(-50%,50%) scale(${1/scale})`}} aria-label={point.label}><i data-tooltip={point.label}>{index+1}</i></span>)}
        </div>
        <div className="map-zoom-controls">
          <button type="button" onClick={()=>zoomTo(0,0,scale*1.4)} aria-label={t.world.zoomIn}>+</button>
          <button type="button" onClick={()=>zoomTo(0,0,scale/1.4)} aria-label={t.world.zoomOut}>−</button>
          {scale>1.02&&<button type="button" className="map-zoom-reset" onClick={()=>{setScale(1);setOffset({x:0,y:0})}}>{t.world.zoomReset}</button>}
        </div>
      </>:<div className="map-fallback"><span>⌖</span><b>{code}</b><small>{t.world.coordinatePlan}</small></div>}
    </div>
    {canZoom&&<p className="map-zoom-hint">{t.world.zoomHint}</p>}
    {showCoordinateList&&<div className="map-coordinate-list">{points.length?points.map((point,index)=><span key={`${point.label}-${index}`}><i>{index+1}</i><b>{point.x}, {point.y}</b><em>{point.label}</em></span>):<p>{t.world.noExactCoordinates}</p>}</div>}
  </div>;
}
