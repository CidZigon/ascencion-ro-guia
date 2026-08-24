"use client";
/* eslint-disable @next/next/no-img-element -- sprites GIF animados y mapas estáticos ya optimizados en la caché local */

import { useEffect, useMemo, useState } from "react";

export type WorldKind="map"|"monster"|"npc"|"reference";
export type WorldSelection={kind:WorldKind;id:string};
type WorldPoint={x:number;y:number;label:string;kind:"npc"|"reference"};
type MapEntry={id:string;code:string;labels:string[];points:WorldPoint[];image:string|null;contexts:string[];topics:number[]};
type MonsterLocation={map:string;name:string;spawn:string};
type MonsterEntry={id:number;name:string;sprite:string|null;locations:MonsterLocation[];contexts:string[];topics:number[]};
type NpcEntry={id:string;name:string;map:string|null;sprite:string|null;locations:string[];points:WorldPoint[];contexts:string[];topics:number[]};
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
const LABELS:Record<WorldKind,string>={map:"Mapa",monster:"Monstruo",npc:"NPC",reference:"Guía local"};
const ICONS:Record<WorldKind,string>={map:"⌖",monster:"♜",npc:"♙",reference:"◇"};
const TOPICS=["","Progresión y EXP","Accesos y dungeons","Historias y lore","Aventuras regionales","Jobs y habilidades","Equipo y fabricación","Endless Tower","Compañeros"];

export function WorldCatalog({selection,initialQuery,onSelect}:{selection:WorldSelection|null;initialQuery:string;onSelect:(selection:WorldSelection)=>void}){
  const [payload,setPayload]=useState<WorldPayload|null>(null);
  const [query,setQuery]=useState(initialQuery);
  const [kind,setKind]=useState<WorldKind|"all">("all");
  const [limit,setLimit]=useState(100);
  const [error,setError]=useState(false);

  useEffect(()=>{let live=true;loadWorld().then(data=>{if(live)setPayload(data)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[]);
  const entries=useMemo<Entry[]>(()=>payload?[
    ...payload.maps.map(entry=>({...entry,kind:"map" as const})),
    ...payload.monsters.map(entry=>({...entry,id:String(entry.id),kind:"monster" as const})),
    ...payload.npcs.map(entry=>({...entry,kind:"npc" as const})),
    ...payload.references.map(entry=>({...entry,kind:"reference" as const})),
  ]:[],[payload]);
  const filtered=useMemo(()=>{
    const term=normalize(query.trim());
    return entries.filter(entry=>{
      if(kind!=="all"&&entry.kind!==kind)return false;
      const searchable=entry.kind==="map"?`${entry.code} ${entry.labels.join(" ")} ${entry.contexts.join(" ")}`:entry.kind==="monster"?`${entry.id} ${entry.name} ${entry.locations.map(location=>`${location.map} ${location.name}`).join(" ")} ${entry.contexts.join(" ")}`:entry.kind==="npc"?`${entry.name} ${entry.map??""} ${entry.locations.join(" ")} ${entry.contexts.join(" ")}`:`${entry.name} ${entry.contexts.join(" ")}`;
      return !term||normalize(searchable).includes(term);
    }).sort((a,b)=>entryName(a).localeCompare(entryName(b)));
  },[entries,kind,query]);
  const selected=selection?entries.find(entry=>entry.kind===selection.kind&&entry.id===selection.id)??null:null;

  if(error)return <section className="catalog-fatal"><h1>Mundo no disponible</h1><p>No se pudo abrir el índice local. Intenta recargar.</p></section>;
  if(!payload)return <section className="catalog-loading"><div className="loader"/><p>Abriendo el índice de Midgard…</p></section>;

  return <section className="world-catalog">
    <header className="catalog-hero world-hero"><div><h1>Mundo de Midgard</h1><p>Mapas con coordenadas, sprites de monstruos, NPC y referencias de las guías. Todo se abre aquí y los recursos visuales quedan guardados en AscencionRO.</p></div></header>
    <div className="world-toolbar">
      <label><span>Buscar</span><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(100)}} placeholder="Prontera, Poring, Valkyrie…"/></label>
      <label><span>Mostrar</span><select value={kind} onChange={event=>{setKind(event.target.value as WorldKind|"all");setLimit(100)}}><option value="all">Todo el mundo</option><option value="map">Mapas · {payload.counts.maps}</option><option value="monster">Monstruos · {payload.counts.monsters}</option><option value="npc">NPC · {payload.counts.npcs}</option><option value="reference">Guías locales · {payload.counts.references}</option></select></label>
    </div>
    <div className="world-body">
      <div className="world-results"><div className="catalog-status"><b>{filtered.length.toLocaleString("es-ES")}</b> coincidencias</div><div className="world-list">{filtered.slice(0,limit).map(entry=><button key={`${entry.kind}-${entry.id}`} className={selection?.kind===entry.kind&&selection.id===entry.id?"world-row selected":"world-row"} onClick={()=>onSelect({kind:entry.kind,id:entry.id})}><EntryIcon entry={entry}/><span><b>{entryName(entry)}</b><small>{entrySubtitle(entry)}</small></span><i>→</i></button>)}</div>{!filtered.length&&<div className="catalog-empty"><b>No encontramos esa referencia.</b><span>Prueba con el nombre, código de mapa, coordenada o ID del monstruo.</span></div>}{limit<filtered.length&&<button className="load-more" onClick={()=>setLimit(value=>value+100)}>Mostrar 100 más</button>}</div>
      <aside className="world-detail">{selected?<WorldDetail entry={selected} maps={payload.maps} onSelect={onSelect}/>:<div className="detail-placeholder"><span>⌖</span><h2>Selecciona una referencia</h2><p>Verás el mapa, los puntos mencionados, sprites y el contexto de la guía sin abandonar el sitio.</p></div>}</aside>
    </div>
  </section>;
}

function EntryIcon({entry}:{entry:Entry}){
  if((entry.kind==="monster"||entry.kind==="npc")&&entry.sprite)return <span className="world-icon sprite-icon"><img src={entry.sprite} alt="" loading="lazy"/></span>;
  return <span className="world-icon">{ICONS[entry.kind]}</span>;
}
function entryName(entry:Entry){
  if(entry.kind!=="map")return entry.name;
  const label=entry.labels[0]||entry.code;
  return label.toLowerCase().startsWith(entry.code.toLowerCase())?(label.slice(entry.code.length).replace(/^[\s·-]+/,"")||entry.code):label;
}
function entrySubtitle(entry:Entry){
  if(entry.kind==="map")return `${LABELS.map} · ${entry.code}${entry.points.length?` · ${entry.points.length} puntos`:""}`;
  if(entry.kind==="monster")return `${LABELS.monster} · ID ${entry.id} · ${entry.locations.length} mapas`;
  if(entry.kind==="npc")return `${LABELS.npc}${entry.map?` · ${entry.map}`:""}`;
  return `${LABELS.reference} · ${entry.topics.length} ${entry.topics.length===1?"tema":"temas"}`;
}
function WorldDetail({entry,maps,onSelect}:{entry:Entry;maps:MapEntry[];onSelect:(selection:WorldSelection)=>void}){
  const map=entry.kind==="map"?entry:entry.kind==="npc"&&entry.map?maps.find(item=>item.id===entry.map)??null:null;
  const points=entry.kind==="map"?entry.points:entry.kind==="npc"?entry.points:[];
  const lines=entry.kind==="map"?entry.labels:entry.kind==="npc"?entry.locations:[];
  const image=entry.kind==="map"?entry.image:map?.image??null;
  const portrait=(entry.kind==="monster"||entry.kind==="npc")?entry.sprite:null;
  const portraitName=(entry.kind==="monster"||entry.kind==="npc")?entry.name:"";
  return <div className="world-detail-card">
    <div className="world-detail-title"><span className={portrait?"sprite-detail":""}>{portrait?<img src={portrait} alt={`Sprite de ${portraitName}`}/>:ICONS[entry.kind]}</span><div><small>{LABELS[entry.kind]}</small><h2>{entryName(entry)}</h2><code>{entry.kind==="map"?entry.code:entry.kind==="monster"?`ID ${entry.id}`:entry.kind==="npc"?entry.map||"Sin mapa indicado":"Referencia integrada"}</code></div></div>
    {entry.kind==="monster"&&<MonsterLocations key={entry.id} monster={entry} maps={maps} onSelect={onSelect}/>}
    {map&&<section className="map-section"><h3>{entry.kind==="npc"?"Ubicación en el mapa":"Mapa y coordenadas"}</h3><MapBoard code={map.code} image={image} points={points}/></section>}
    {lines.length>0&&<section><h3>Ubicaciones mencionadas</h3><ul>{lines.map(line=><li key={line}>{line}</li>)}</ul></section>}
    {entry.kind==="reference"&&entry.topics.length>0&&<section><h3>Integrada en</h3><div className="topic-chips">{entry.topics.map(topic=><span key={topic}>{TOPICS[topic]||`Tema ${topic}`}</span>)}</div></section>}
    <section><h3>{entry.kind==="reference"?"Contenido disponible en AscencionRO":"Aparece en las guías"}</h3><div className="context-list">{entry.contexts.length?entry.contexts.map((context,index)=><p key={`${context}-${index}`}>{context}</p>):<p>La referencia está indexada localmente, pero no tiene una nota adicional.</p>}</div></section>
  </div>;
}
function MonsterLocations({monster,maps,onSelect}:{monster:Extract<Entry,{kind:"monster"}>;maps:MapEntry[];onSelect:(selection:WorldSelection)=>void}){
  const [active,setActive]=useState(monster.locations[0]?.map||"");
  const location=monster.locations.find(item=>item.map===active)||monster.locations[0];
  const map=location?maps.find(item=>item.id===location.map)??null:null;
  return <section className="monster-locations"><h3>Mapas de aparición · {monster.locations.length}</h3>{location&&map&&<div className="spawn-map"><MapBoard code={map.code} image={map.image} points={[]}/><button onClick={()=>onSelect({kind:"map",id:map.id})}>Abrir ficha del mapa <span>→</span></button></div>}<div className="spawn-list">{monster.locations.length?monster.locations.map(item=><button className={item.map===location?.map?"active":""} key={item.map} onClick={()=>setActive(item.map)}><b>{item.map}</b><span>{item.name}</span><small>{item.spawn.replace(item.map,"").replace(/[()]/g,"").trim()||"Aparición especial"}</small></button>):<p>No hay mapas de aparición publicados para este enemigo.</p>}</div></section>;
}
function MapBoard({code,image,points}:{code:string;image:string|null;points:WorldPoint[]}){
  const [broken,setBroken]=useState(false);
  const max=Math.max(400,...points.flatMap(point=>[point.x,point.y]));
  const visible=points.slice(0,24);
  return <div className="map-view">
    <div className="map-canvas">
      {image&&!broken?<img src={image} alt={`Mapa de ${code}`} onError={()=>setBroken(true)}/>:<div className="map-fallback"><span>⌖</span><b>{code}</b><small>Plano local por coordenadas</small></div>}
      <div className="map-grid" aria-hidden="true"/>
      {visible.map((point,index)=><span className={point.kind==="npc"?"map-pin npc-pin":"map-pin"} key={`${point.x}-${point.y}-${index}`} style={{left:`${Math.min(98,Math.max(2,point.x/max*100))}%`,bottom:`${Math.min(98,Math.max(2,point.y/max*100))}%`}} title={point.label}><i>{index+1}</i></span>)}
    </div>
    <div className="map-coordinate-list">{visible.length?visible.map((point,index)=><span key={`${point.label}-${index}`}><i>{index+1}</i><b>{point.x}, {point.y}</b><em>{point.label}</em></span>):<p>Esta referencia no publica coordenadas exactas; el mapa sigue disponible para identificar la zona.</p>}</div>
  </div>;
}
