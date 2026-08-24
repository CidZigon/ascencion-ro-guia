"use client";

import { useEffect, useMemo, useState } from "react";

export type WorldKind="map"|"monster"|"npc";
export type WorldSelection={kind:WorldKind;id:string};
type MapEntry={id:string;code:string;labels:string[];contexts:string[];topics:number[]};
type MonsterEntry={id:number;name:string;contexts:string[];topics:number[]};
type NpcEntry={id:string;name:string;map:string|null;locations:string[];contexts:string[];topics:number[]};
type WorldPayload={counts:{maps:number;monsters:number;npcs:number};maps:MapEntry[];monsters:MonsterEntry[];npcs:NpcEntry[]};
type Entry=
  |({kind:"map"}&MapEntry)
  |({kind:"monster"}&Omit<MonsterEntry,"id">&{id:string})
  |({kind:"npc"}&NpcEntry);

let worldPromise:Promise<WorldPayload>|null=null;
function loadWorld(){
  worldPromise??=fetch("/data/world-index.json").then(response=>{if(!response.ok)throw new Error("world");return response.json()});
  return worldPromise;
}
function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
const LABELS:Record<WorldKind,string>={map:"Ubicación",monster:"Monstruo",npc:"NPC"};
const ICONS:Record<WorldKind,string>={map:"⌖",monster:"♜",npc:"♙"};

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
  ]:[],[payload]);
  const filtered=useMemo(()=>{
    const term=normalize(query.trim());
    return entries.filter(entry=>{
      if(kind!=="all"&&entry.kind!==kind)return false;
      const searchable=entry.kind==="map"?`${entry.code} ${entry.labels.join(" ")}`:entry.kind==="monster"?`${entry.id} ${entry.name} ${entry.contexts.join(" ")}`:`${entry.name} ${entry.map??""} ${entry.locations.join(" ")}`;
      return !term||normalize(searchable).includes(term);
    }).sort((a,b)=>entryName(a).localeCompare(entryName(b)));
  },[entries,kind,query]);
  const selected=selection?entries.find(entry=>entry.kind===selection.kind&&entry.id===selection.id)??null:null;

  if(error)return <section className="catalog-fatal"><h1>Mundo no disponible</h1><p>No se pudo abrir el índice local. Intenta recargar.</p></section>;
  if(!payload)return <section className="catalog-loading"><div className="loader"/><p>Abriendo el índice de Midgard…</p></section>;

  return <section className="world-catalog">
    <header className="catalog-hero world-hero"><div><h1>Mundo de Midgard</h1><p>Busca ubicaciones, monstruos y NPC sin salir de AscencionRO. Cada resultado nace de las referencias usadas por las guías.</p></div></header>
    <div className="world-toolbar">
      <label><span>Buscar</span><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(100)}} placeholder="Prontera, Poring, Valkyrie…"/></label>
      <label><span>Mostrar</span><select value={kind} onChange={event=>{setKind(event.target.value as WorldKind|"all");setLimit(100)}}><option value="all">Todo el mundo</option><option value="map">Ubicaciones · {payload.counts.maps}</option><option value="monster">Monstruos · {payload.counts.monsters}</option><option value="npc">NPC · {payload.counts.npcs}</option></select></label>
    </div>
    <div className="world-body">
      <div className="world-results"><div className="catalog-status"><b>{filtered.length.toLocaleString("es-ES")}</b> coincidencias</div><div className="world-list">{filtered.slice(0,limit).map(entry=><button key={`${entry.kind}-${entry.id}`} className={selection?.kind===entry.kind&&selection.id===entry.id?"world-row selected":"world-row"} onClick={()=>onSelect({kind:entry.kind,id:entry.id})}><span className="world-icon">{ICONS[entry.kind]}</span><span><b>{entryName(entry)}</b><small>{entrySubtitle(entry)}</small></span><i>→</i></button>)}</div>{!filtered.length&&<div className="catalog-empty"><b>No encontramos esa referencia.</b><span>Prueba con el nombre, código de mapa o ID del monstruo.</span></div>}{limit<filtered.length&&<button className="load-more" onClick={()=>setLimit(value=>value+100)}>Mostrar 100 más</button>}</div>
      <aside className="world-detail">{selected?<WorldDetail entry={selected}/>:<div className="detail-placeholder"><span>⌖</span><h2>Selecciona una referencia</h2><p>Verás sus ubicaciones y el contexto en el que aparece dentro de las guías.</p></div>}</aside>
    </div>
  </section>;
}

function entryName(entry:Entry){
  if(entry.kind!=="map")return entry.name;
  const label=entry.labels[0]||entry.code;
  return label.toLowerCase().startsWith(entry.code.toLowerCase())?(label.slice(entry.code.length).replace(/^[\s·-]+/,"")||entry.code):label;
}
function entrySubtitle(entry:Entry){
  if(entry.kind==="map")return `${LABELS.map} · ${entry.code}`;
  if(entry.kind==="monster")return `${LABELS.monster} · ID ${entry.id}`;
  return `${LABELS.npc}${entry.map?` · ${entry.map}`:""}`;
}
function WorldDetail({entry}:{entry:Entry}){
  const lines=entry.kind==="map"?entry.labels:entry.kind==="npc"?entry.locations:[];
  return <div className="world-detail-card"><div className="world-detail-title"><span>{ICONS[entry.kind]}</span><div><small>{LABELS[entry.kind]}</small><h2>{entryName(entry)}</h2><code>{entry.kind==="map"?entry.code:entry.kind==="monster"?`ID ${entry.id}`:entry.map||"Sin mapa indicado"}</code></div></div>{lines.length>0&&<section><h3>Ubicaciones mencionadas</h3><ul>{lines.map(line=><li key={line}>{line}</li>)}</ul></section>}<section><h3>Aparece en las guías</h3><div className="context-list">{entry.contexts.map((context,index)=><p key={`${context}-${index}`}>{context}</p>)}</div></section></div>;
}
