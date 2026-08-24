"use client";
/* eslint-disable @next/next/no-img-element -- sprites GIF animados y mapas estáticos ya optimizados en la caché local */

import { useEffect, useMemo, useState } from "react";
import { ModalShell } from "./ModalShell";

export type WorldKind="map"|"monster"|"npc"|"reference";
export type WorldSelection={kind:WorldKind;id:string;point?:{x:number;y:number}};
type WorldPoint={x:number;y:number;label:string;kind:"npc"|"reference"};
type MapEntry={id:string;code:string;labels:string[];points:WorldPoint[];image:string|null;contexts:string[];topics:number[]};
type MonsterLocation={map:string;name:string;spawn:string};
type MonsterEntry={id:number;name:string;sprite:string|null;locations:MonsterLocation[];contexts:string[];topics:number[]};
type NpcEntry={id:string;name:string;map:string|null;sprite:string|null;spriteApproximate?:boolean;locations:string[];points:WorldPoint[];contexts:string[];topics:number[]};
type ReferenceEntry={id:string;name:string;contexts:string[];topics:number[]};
type WorldPayload={counts:{maps:number;monsters:number;npcs:number;references:number};maps:MapEntry[];monsters:MonsterEntry[];npcs:NpcEntry[];references:ReferenceEntry[]};
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

const LABELS:Record<WorldKind,string>={map:"Mapa",monster:"Monstruo",npc:"NPC",reference:"Guía local"};
const ICONS:Record<WorldKind,string>={map:"⌖",monster:"♜",npc:"♙",reference:"◇"};
const TOPICS=["","Progresión y EXP","Accesos y dungeons","Historias y lore","Aventuras regionales","Jobs y habilidades","Equipo y fabricación","Endless Tower","Compañeros"];
const CITY_NAMES:Record<string,string>={
  prontera:"Prontera",izlude:"Izlude",geffen:"Geffen",payon:"Payon",alberta:"Alberta",morocc:"Morroc",aldebaran:"Al De Baran",yuno:"Juno",einbroch:"Einbroch",einbech:"Einbech",lighthalzen:"Lighthalzen",hugel:"Hugel",rachel:"Rachel",veins:"Veins",comodo:"Comodo",umbala:"Umbala",niflheim:"Niflheim",amatsu:"Amatsu",ayothaya:"Ayothaya",gonryun:"Gonryun",louyang:"Louyang",moscovia:"Moscovia",
};

function isCity(map:MapEntry){return Boolean(CITY_NAMES[map.id])}
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

export function WorldCatalog({selection,initialQuery,onSelect}:{selection:WorldSelection|null;initialQuery:string;onSelect:(selection:WorldSelection)=>void}){
  const [payload,setPayload]=useState<WorldPayload|null>(null);
  const [query,setQuery]=useState(initialQuery);
  const [scope,setScope]=useState<"all"|"city"|"area">("all");
  const [limit,setLimit]=useState(80);
  const [error,setError]=useState(false);

  useEffect(()=>{let live=true;loadWorld().then(data=>{if(live)setPayload(data)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[]);
  const npcsByMap=useMemo(()=>{const counts=new Map<string,number>();for(const npc of payload?.npcs??[]){if(npc.map)counts.set(npc.map,(counts.get(npc.map)??0)+1)}return counts},[payload]);
  const filtered=useMemo(()=>{
    if(!payload)return[];
    const term=normalize(query.trim());
    return payload.maps.filter(map=>{
      if(scope==="city"&&!isCity(map))return false;
      if(scope==="area"&&isCity(map))return false;
      if(!term)return true;
      const npcNames=payload.npcs.filter(npc=>npc.map===map.id).map(npc=>npc.name).join(" ");
      return normalize(`${map.code} ${map.labels.join(" ")} ${map.contexts.join(" ")} ${npcNames}`).includes(term);
    }).sort((a,b)=>Number(isCity(b))-Number(isCity(a))||a.code.localeCompare(b.code));
  },[payload,query,scope]);
  const selected=payload?resolveMap(payload,selection):null;

  if(error)return <section className="catalog-fatal"><h1>Atlas no disponible</h1><p>No se pudo abrir el índice local. Intenta recargar.</p></section>;
  if(!payload)return <section className="catalog-loading"><div className="loader"/><p>Preparando los mapas de Midgard…</p></section>;

  const cities=payload.maps.filter(isCity).sort((a,b)=>(CITY_NAMES[a.id]||a.id).localeCompare(CITY_NAMES[b.id]||b.id));
  return <section className="world-catalog">
    <header className="catalog-hero world-hero"><div><small>Atlas local de AscencionRO</small><h1>Ciudades y mapas de Midgard</h1><p>Abre una ciudad, campo o dungeon para ver su mapa, los NPC registrados y las quests relacionadas. El índice técnico permanece detrás de las guías para resolver referencias sin recargar la página.</p></div></header>
    <section className="world-city-section" aria-labelledby="city-title"><div className="world-section-heading"><div><small>DESTINOS PRINCIPALES</small><h2 id="city-title">Ciudades</h2></div><span>{cities.length} disponibles</span></div><div className="world-city-strip">{cities.map(city=><button key={city.id} className={selected?.id===city.id?"active":""} onClick={()=>onSelect({kind:"map",id:city.id})}><span>⌂</span><b>{CITY_NAMES[city.id]}</b><small>{npcsByMap.get(city.id)??0} NPC</small></button>)}</div></section>
    <div className="world-toolbar">
      <label><span>Buscar mapa, ciudad, NPC o quest</span><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(80)}} placeholder="gef_fild07, Geffen, Langry…"/></label>
      <label><span>Tipo de destino</span><select value={scope} onChange={event=>{setScope(event.target.value as "all"|"city"|"area");setLimit(80)}}><option value="all">Todos los mapas · {payload.counts.maps}</option><option value="city">Solo ciudades · {cities.length}</option><option value="area">Campos, interiores y dungeons</option></select></label>
    </div>
    <div className="world-body">
      <div className="world-results"><div className="catalog-status"><b>{filtered.length.toLocaleString("es-ES")}</b> mapas disponibles</div><div className="world-map-list">{filtered.slice(0,limit).map(map=><button key={map.id} className={selected?.id===map.id?"world-map-card selected":"world-map-card"} onClick={()=>onSelect({kind:"map",id:map.id})}><span className="world-map-thumb">{map.image?<img src={map.image} alt="" loading="lazy"/>:<i>⌖</i>}</span><span className="world-map-summary"><small>{isCity(map)?"CIUDAD":"MAPA"}</small><b>{map.code}</b><em>{mapDisplayName(map)}</em><span><i>♙</i> {npcsByMap.get(map.id)??0} NPC <i>◇</i> {map.contexts.length} referencias</span></span><strong>→</strong></button>)}</div>{!filtered.length&&<div className="catalog-empty"><b>No encontramos ese mapa.</b><span>Prueba con su código, ciudad, NPC o el nombre de una quest.</span></div>}{limit<filtered.length&&<button className="load-more" onClick={()=>setLimit(value=>value+80)}>Mostrar 80 mapas más</button>}</div>
      <aside className="world-detail">{selected?<WorldAtlasDetail key={selected.id} map={selected} payload={payload}/>:<div className="detail-placeholder"><span>⌖</span><h2>Selecciona una ciudad o mapa</h2><p>Aquí aparecerán el plano local, los NPC con sus sprites y las quests o referencias vinculadas.</p></div>}</aside>
    </div>
  </section>;
}

function WorldAtlasDetail({map,payload}:{map:MapEntry;payload:WorldPayload}){
  const npcs=payload.npcs.filter(npc=>npc.map===map.id).sort((a,b)=>a.name.localeCompare(b.name));
  const pinsByCoordinate=new Map<string,WorldPoint>();
  for(const point of map.points){if(point.kind==="reference"&&point.x>=0&&point.y>=0&&isMeaningfulMapReference(point.label,map.code))pinsByCoordinate.set(`${point.x}-${point.y}`,point)}
  for(const npc of npcs){for(const point of primaryNpcPoints(npc))pinsByCoordinate.set(`${point.x}-${point.y}`,{...point,kind:"npc",label:npc.name})}
  const notes=uniqueStrings([
    ...map.points.filter(point=>point.kind==="reference").map(point=>cleanMapReference(point.label,map.code)),
    ...map.contexts,
  ]).filter(note=>isMeaningfulMapReference(note,""));
  return <div className="world-detail-card world-atlas-detail">
    <div className="world-detail-title"><span>⌖</span><div><small>{isCity(map)?"Ciudad":"Mapa de Midgard"}</small><h2>{map.code}</h2><code>{mapDisplayName(map)}</code></div></div>
    <section className="map-section"><div className="atlas-map-heading"><h3>Mapa local</h3><span>{npcs.length} NPC · {notes.length} referencias</span></div><MapBoard code={map.code} image={map.image} points={[...pinsByCoordinate.values()]} showCoordinateList={false}/></section>
    <section><div className="atlas-map-heading"><h3>NPC registrados en este mapa</h3><span>{npcs.length}</span></div>{npcs.length?<div className="map-npc-grid">{npcs.map(npc=>{const point=primaryNpcPoints(npc)[0];return <article key={npc.id}><span className="map-npc-sprite">{npc.sprite?<img src={npc.sprite} alt={`Sprite de ${npc.name}`} loading="lazy"/>:<i>♙</i>}</span><div><b>{npc.name}</b><small>{point?`${point.x}, ${point.y}`:"Ubicación sin coordenada publicada"}</small>{npc.spriteApproximate&&<em>Sprite representativo</em>}</div></article>})}</div>:<p className="atlas-empty-note">Aún no hay NPC vinculados a este mapa en las guías.</p>}</section>
    <section><div className="atlas-map-heading"><h3>Quests y referencias relacionadas</h3><span>{notes.length}</span></div>{notes.length?<div className="map-reference-list">{notes.map((note,index)=><article key={`${normalize(note)}-${index}`}><span>◇</span><p>{note}</p></article>)}</div>:<p className="atlas-empty-note">Este mapa está disponible, pero todavía no tiene una quest o referencia asociada.</p>}</section>
  </div>;
}

function cleanMapReference(label:string,code:string){return label.replace(/📍/g,"").replace(new RegExp(`\\b${escapeRegExp(code)}\\b`,"gi"),"").replace(/\bRMS map\b/gi,"").replace(/^[\s·—,-]+|[\s·—,-]+$/g,"").replace(/\s{2,}/g," ").trim()}
function isMeaningfulMapReference(label:string,code:string){return /[a-záéíóúñ]/i.test(cleanMapReference(label,code))}

export function WorldReferenceDialog({selection,onClose}:{selection:WorldSelection;onClose:()=>void}){
  const [payload,setPayload]=useState<WorldPayload|null>(null);
  const [current,setCurrent]=useState(selection);
  const [error,setError]=useState(false);

  useEffect(()=>{let live=true;loadWorld().then(data=>{if(live)setPayload(data)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[]);

  const selected=payload?findEntry(payload,current):null;
  return <ModalShell eyebrow="Referencia rápida" title="Consulta sin salir de la guía" onClose={onClose}>
    {error?<div className="world-dialog-message"><b>No se pudo abrir esta referencia.</b><span>Intenta cerrar la ventana y abrirla de nuevo.</span></div>:!payload?<div className="world-dialog-message"><div className="loader"/><span>Buscando en el índice local…</span></div>:selected?<WorldDetail key={`${selected.kind}-${selected.id}`} entry={selected} maps={payload.maps} onSelect={setCurrent} selectedPoint={current.point}/>:<div className="world-dialog-message"><b>Referencia no encontrada.</b><span>El enlace existe en la guía, pero aún no tiene una ficha local asociada.</span></div>}
  </ModalShell>;
}

function entryName(entry:Entry){return entry.kind==="map"?mapDisplayName(entry):entry.name}
function WorldDetail({entry,maps,onSelect,selectedPoint}:{entry:Entry;maps:MapEntry[];onSelect:(selection:WorldSelection)=>void;selectedPoint?:{x:number;y:number}}){
  const map=entry.kind==="map"?entry:entry.kind==="npc"&&entry.map?maps.find(item=>item.id===entry.map)??null:null;
  const points=entry.kind==="map"?entry.points:entry.kind==="npc"?primaryNpcPoints(entry,selectedPoint):[];
  const lines=entry.kind==="map"?entry.labels:entry.kind==="npc"?entry.locations.slice(0,1):[];
  const image=entry.kind==="map"?entry.image:map?.image??null;
  const portrait=(entry.kind==="monster"||entry.kind==="npc")?entry.sprite:null;
  const portraitName=(entry.kind==="monster"||entry.kind==="npc")?entry.name:"";
  return <div className="world-detail-card">
    <div className="world-detail-title"><span className={portrait?"sprite-detail":""}>{portrait?<img src={portrait} alt={`Sprite de ${portraitName}`}/>:ICONS[entry.kind]}</span><div><small>{LABELS[entry.kind]}</small><h2>{entryName(entry)}</h2><code>{entry.kind==="map"?entry.code:entry.kind==="monster"?`ID ${entry.id}`:entry.kind==="npc"?entry.map||"Sin mapa indicado":"Referencia integrada"}</code>{entry.kind==="npc"&&entry.spriteApproximate&&<em className="sprite-reference-note">Representación visual del rol; el sprite exacto no está publicado.</em>}</div></div>
    {entry.kind==="monster"&&<MonsterLocations key={entry.id} monster={entry} maps={maps} onSelect={onSelect}/>}
    {map&&<section className="map-section"><h3>{entry.kind==="npc"?"Ubicación en el mapa":"Mapa y coordenadas"}</h3><MapBoard code={map.code} image={image} points={points}/></section>}
    {lines.length>0&&<section><h3>Ubicaciones mencionadas</h3><ul>{lines.map(line=><li key={line}>{line}</li>)}</ul></section>}
    {entry.kind==="reference"&&entry.topics.length>0&&<section><h3>Integrada en</h3><div className="topic-chips">{entry.topics.map(topic=><span key={topic}>{TOPICS[topic]||`Tema ${topic}`}</span>)}</div></section>}
    <section><h3>{entry.kind==="reference"?"Contenido disponible en AscencionRO":"Aparece en las guías"}</h3><div className="context-list">{entry.contexts.length?entry.contexts.map((context,index)=><p key={`${context}-${index}`}>{context}</p>):<p>La referencia está indexada localmente, pero no tiene una nota adicional.</p>}</div></section>
  </div>;
}
function primaryNpcPoints(entry:NpcEntry,selectedPoint?:{x:number;y:number}){
  const unique=entry.points.filter((point,index,points)=>points.findIndex(candidate=>candidate.x===point.x&&candidate.y===point.y)===index);
  if(selectedPoint){const selected=unique.find(point=>point.x===selectedPoint.x&&point.y===selectedPoint.y);if(selected)return[selected]}
  const stated=entry.locations.flatMap(location=>{const match=location.match(/(?:^|\D)(\d{1,3})\s*,\s*(\d{1,3})(?:\D|$)/);return match?[{x:Number(match[1]),y:Number(match[2])}]:[]});
  const preferred=unique.find(point=>stated.some(location=>location.x===point.x&&location.y===point.y))??unique[0];
  return preferred?[preferred]:[];
}
function MonsterLocations({monster,maps,onSelect}:{monster:Extract<Entry,{kind:"monster"}>;maps:MapEntry[];onSelect:(selection:WorldSelection)=>void}){
  const [active,setActive]=useState(monster.locations[0]?.map||"");
  const location=monster.locations.find(item=>item.map===active)||monster.locations[0];
  const map=location?maps.find(item=>item.id===location.map)??null:null;
  return <section className="monster-locations"><h3>Mapas de aparición · {monster.locations.length}</h3>{location&&map&&<div className="spawn-map"><MapBoard code={map.code} image={map.image} points={[]} showCoordinateList={false}/><button onClick={()=>onSelect({kind:"map",id:map.id})}>Abrir ficha del mapa <span>→</span></button></div>}<div className="spawn-list">{monster.locations.length?monster.locations.map(item=><button className={item.map===location?.map?"active":""} key={item.map} onClick={()=>setActive(item.map)}><b>{item.map}</b><span>{item.name}</span><small>{item.spawn.replace(item.map,"").replace(/[()]/g,"").trim()||"Aparición especial"}</small></button>):<p>No hay mapas de aparición publicados para este enemigo.</p>}</div></section>;
}
function MapBoard({code,image,points,showCoordinateList=true}:{code:string;image:string|null;points:WorldPoint[];showCoordinateList?:boolean}){
  const [broken,setBroken]=useState(false);
  const max=Math.max(400,...points.flatMap(point=>[point.x,point.y]));
  return <div className="map-view">
    <div className="map-canvas">
      {image&&!broken?<img src={image} alt={`Mapa de ${code}`} onError={()=>setBroken(true)}/>:<div className="map-fallback"><span>⌖</span><b>{code}</b><small>Plano local por coordenadas</small></div>}
      <div className="map-grid" aria-hidden="true"/>
      {points.map((point,index)=><span className={point.kind==="npc"?"map-pin npc-pin":"map-pin"} key={`${point.x}-${point.y}-${point.kind}-${index}`} style={{left:`${Math.min(98,Math.max(2,point.x/max*100))}%`,bottom:`${Math.min(98,Math.max(2,point.y/max*100))}%`}} title={point.label}><i>{index+1}</i></span>)}
    </div>
    {showCoordinateList&&<div className="map-coordinate-list">{points.length?points.map((point,index)=><span key={`${point.label}-${index}`}><i>{index+1}</i><b>{point.x}, {point.y}</b><em>{point.label}</em></span>):<p>Esta referencia no publica coordenadas exactas; el mapa sigue disponible para identificar la zona.</p>}</div>}
  </div>;
}
