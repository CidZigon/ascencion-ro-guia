"use client";
/* eslint-disable @next/next/no-img-element -- sprites oficiales pequeños servidos desde la caché local */

import { useCallback, useEffect, useMemo, useState } from "react";
import { EXP_GUIDE, type ExpMapRef, type ExpQuestLike } from "./data/expGuideContent";
import type { ExternalDestination } from "./GuidePortal";
import type { Lang } from "./i18n";
import { ReportIssueLink } from "./report-issue";
import { loadWorld, type WorldSelection } from "./WorldCatalog";

function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function npcSlug(value:string){return normalize(value).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
// Las coordenadas siempre vienen embebidas en el texto ("\ud83d\udccd lighthalzen 337,232");
// se extraen para armar el comando /navi (que exige "x/y", no "x,y" \u2014 ver docs/comandos-cliente-ro.md).
function parseCoords(label:string){
  const match=label.match(/(\d{1,3})\s*,\s*(\d{1,3})/);
  return match?{x:Number(match[1]),y:Number(match[2])}:null;
}

const LEVEL_BANDS=[
  {id:"1-39",label:"1–39",min:1,max:39},
  {id:"40-59",label:"40–59",min:40,max:59},
  {id:"60-69",label:"60–69",min:60,max:69},
  {id:"70+",label:"70+",min:70,max:Infinity},
];

const REPORT_LABEL={es:"Reportar un error en esta guía",en:"Report an issue with this guide"};
const NAVI_LABEL={
  es:{copy:"📋 /navi",copied:"✓ copiado",title:(cmd:string)=>`Copiar ${cmd} (pegalo en el chat del juego)`},
  en:{copy:"📋 /navi",copied:"✓ copied",title:(cmd:string)=>`Copy ${cmd} (paste it into the game chat)`},
};

type Callbacks={onOpenMonster:(options:{id:number})=>void;onOpenWorld:(selection:WorldSelection)=>void;onOpenExternal:(destination:ExternalDestination)=>void};

export function ExpGuide({lang,onOpenMonster,onOpenWorld,onOpenExternal}:Callbacks&{lang:Lang}){
  const data=EXP_GUIDE[lang==="en"?"en":"es"];
  const [levelBand,setLevelBand]=useState<string|null>(null);
  const [npcSprites,setNpcSprites]=useState<Map<string,string>>(new Map());

  // Los sprites de NPC no están en expGuideContent.ts (es contenido curado a
  // mano); se resuelven contra el mismo world-index.json que ya alimenta el
  // catálogo de Mundo, por id "nombre-mapa" — la misma convención que usa
  // knownNpcMaps más abajo.
  useEffect(()=>{
    let live=true;
    loadWorld().then(payload=>{
      if(!live)return;
      setNpcSprites(new Map(payload.npcs.filter(npc=>npc.sprite).map(npc=>[npc.id,npc.sprite as string])));
    }).catch(()=>{/* Sin sprites, los links locales igual funcionan. */});
    return()=>{live=false};
  },[]);

  // Igual que localizeWorldLinks hacía con el HTML: si un nombre de NPC
  // aparece con un único mapa en toda la guía, un paso que lo menciona sin
  // coordenada propia ("Regresa con Vincent.") igual puede enlazar ahí.
  const knownNpcMaps=useMemo(()=>{
    const map=new Map<string,Set<string>>();
    const remember=(name:string,mapCode?:string)=>{
      if(!mapCode)return;
      const key=npcSlug(name);
      const known=map.get(key)??new Set<string>();
      known.add(mapCode);
      map.set(key,known);
    };
    for(const row of[...data.turnins,...data.hunts])remember(row.npc,row.npcLocation.map);
    for(const entry of[...data.quests,...data.cooldowns])for(const step of entry.steps)for(const name of step.npcNames)remember(name,step.map?.map);
    return map;
  },[data]);
  const npcMapFor=(name:string,explicit?:string)=>{
    if(explicit)return explicit;
    const known=knownNpcMaps.get(npcSlug(name));
    return known?.size===1?[...known][0]:undefined;
  };

  const band=levelBand?LEVEL_BANDS.find(entry=>entry.id===levelBand):undefined;
  const inLevel=useCallback((minLevel:number)=>!band||(minLevel>=band.min&&minLevel<=band.max),[band]);

  const turnins=useMemo(()=>data.turnins.filter(row=>inLevel(row.minLevel)),[data,inLevel]);
  const hunts=useMemo(()=>data.hunts.filter(row=>inLevel(row.minLevel)),[data,inLevel]);
  const quests=useMemo(()=>data.quests.filter(entry=>inLevel(entry.minLevel)),[data,inLevel]);
  const cooldowns=useMemo(()=>data.cooldowns.filter(entry=>inLevel(entry.minLevel)),[data,inLevel]);

  return <section className="exp-guide">
    <div className="server-banner exp-hero">
      <span className="mark">⏫</span>
      <div><h1>{data.title}</h1><p>{data.tagline}</p><div className="exp-badges">{data.badges.map(badge=><span key={badge} className="filter-chip slim">{badge}</span>)}</div></div>
    </div>

    <nav className="exp-nav">
      {[["exp-turnins",data.navTurnins],["exp-hunts",data.navHunts],["exp-quests",data.navQuests],["exp-cooldowns",data.navCooldowns],["exp-reglas",data.navReglas]].map(([id,label])=>
        <button key={id} type="button" onClick={()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"})}>{label}</button>
      )}
    </nav>

    <div className="exp-level-toolbar">
      <span className="filter-label">{data.allLevels}</span>
      <div className="chip-set">{LEVEL_BANDS.map(entry=><button key={entry.id} type="button" className={levelBand===entry.id?"filter-chip active":"filter-chip"} aria-pressed={levelBand===entry.id} onClick={()=>setLevelBand(current=>current===entry.id?null:entry.id)}>{entry.label}</button>)}</div>
      {levelBand!==null&&<button type="button" className="clear-filters" onClick={()=>setLevelBand(null)}>{data.clearFilters}</button>}
    </div>

    <section id="exp-turnins" className="exp-section">
      <div className="section-title"><div><h2>{data.turninsTitle}</h2></div><div className="compat-badges">{data.turninsCompatBadges.map(badge=><span key={badge} className="filter-chip slim">{badge}</span>)}</div></div>
      <p className="exp-small">{data.turninsNote}</p>
      <div className="exp-row-list">{turnins.map(row=><div className="exp-row" id={row.id} key={row.id}>
        <span className="exp-row-level">{row.levelRange}</span>
        <div className="exp-row-main"><b>{row.item}</b><span className="exp-row-sub">NPC <NpcLink name={row.npc} map={row.npcLocation.map} coords={parseCoords(row.npcLocation.label)} sprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld}/> · <MapChip mapRef={row.npcLocation} onOpenWorld={onOpenWorld}/></span></div>
        <MobButton mob={row.mob} onOpenMonster={onOpenMonster}/>
        <span className="exp-row-stats">{row.bestMap} · HP {row.hp} · Lv {row.mobLevel}</span>
      </div>)}
      {!turnins.length&&<p className="exp-empty">—</p>}</div>
    </section>

    <section id="exp-hunts" className="exp-section">
      <div className="section-title"><div><h2>{data.huntsTitle}</h2></div><div className="compat-badges">{data.huntsCompatBadges.map(badge=><span key={badge} className="filter-chip slim">{badge}</span>)}</div></div>
      <p className="exp-small">{data.huntsNote}</p>
      <div className="exp-row-list">{hunts.map(row=><div className="exp-row" id={row.id} key={row.id}>
        <span className="exp-row-level">{row.levelRange}</span>
        <MobButton mob={row.mob} onOpenMonster={onOpenMonster}/>
        <span className="exp-row-stats">EXP {row.exp}</span>
        <span className="exp-row-sub">NPC <NpcLink name={row.npc} map={row.npcLocation.map} coords={parseCoords(row.npcLocation.label)} sprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld}/> · <MapChip mapRef={row.npcLocation} onOpenWorld={onOpenWorld}/></span>
        <span className="exp-row-drop">{row.dropNote}</span>
      </div>)}
      {!hunts.length&&<p className="exp-empty">—</p>}</div>
      <p className="exp-small">{data.huntsRule}</p>
    </section>

    <section id="exp-quests" className="exp-section">
      <div className="section-title"><div><h2>{data.questsTitle}</h2></div></div>
      <p className="exp-small">{data.questsIntro}</p>
      {quests.map(entry=><QuestCard key={entry.id} entry={entry} sourceLabel={data.sourceLabel} npcMapFor={npcMapFor} npcSprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld} onOpenExternal={onOpenExternal}/>)}
      {!quests.length&&<p className="exp-empty">—</p>}
    </section>

    <section id="exp-cooldowns" className="exp-section">
      <div className="section-title"><div><h2>{data.cooldownsTitle}</h2></div><div className="compat-badges">{data.cooldownsCompatBadges.map(badge=><span key={badge} className="filter-chip slim">{badge}</span>)}</div></div>
      <p className="exp-small">{data.cooldownsIntro}</p>
      {cooldowns.map(entry=><QuestCard key={entry.id} entry={entry} sourceLabel={data.sourceLabel} npcMapFor={npcMapFor} npcSprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld} onOpenExternal={onOpenExternal}/>)}
      {!cooldowns.length&&<p className="exp-empty">—</p>}
    </section>

    <section id="exp-reglas" className="exp-section">
      <div className="section-title"><div><h2>{data.rulesTitle}</h2></div></div>
      <div className="exp-panel">{data.rulesParagraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
    </section>

    <ReportIssueLink kind="Guía" id={1} name={data.title} label={REPORT_LABEL[lang==="en"?"en":"es"]}/>
  </section>;
}

function MobButton({mob,onOpenMonster}:{mob:{id:number;name:string};onOpenMonster:(options:{id:number})=>void}){
  return <button type="button" className="exp-mob-btn" onClick={()=>onOpenMonster({id:mob.id})}>
    <span className="exp-mob-sprite"><img src={`/world/sprites/${mob.id}.gif`} alt="" loading="lazy" onError={event=>{event.currentTarget.style.display="none"}}/></span>
    <b>{mob.name}</b>
  </button>;
}

function NpcLink({name,map,coords,sprites,lang,onOpenWorld}:{name:string;map?:string;coords?:{x:number;y:number}|null;sprites:Map<string,string>;lang:Lang;onOpenWorld:(selection:WorldSelection)=>void}){
  const [copied,setCopied]=useState(false);
  if(!map)return <b>{name}</b>;
  const id=`${npcSlug(name)}-${map}`;
  const sprite=sprites.get(id);
  const naviCommand=coords?`/navi ${map} ${coords.x}/${coords.y}`:null;
  const labels=NAVI_LABEL[lang==="en"?"en":"es"];
  const copyNavi=async(event:React.MouseEvent)=>{
    event.stopPropagation();
    if(!naviCommand)return;
    try{await navigator.clipboard.writeText(naviCommand);setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{/* Portapapeles no disponible en este navegador. */}
  };
  return <span className="exp-npc">
    {sprite&&<img className="exp-npc-sprite" src={sprite} alt="" loading="lazy" onError={event=>{event.currentTarget.style.display="none"}}/>}
    <button type="button" className="exp-inline-link" onClick={()=>onOpenWorld({kind:"npc",id})}>{name}</button>
    {naviCommand&&<button type="button" className="exp-navi-btn" title={labels.title(naviCommand)} onClick={copyNavi}>{copied?labels.copied:labels.copy}</button>}
  </span>;
}

function MapChip({mapRef,onOpenWorld}:{mapRef:ExpMapRef;onOpenWorld:(selection:WorldSelection)=>void}){
  if(!mapRef.map)return <span className="exp-map-chip">{mapRef.label}</span>;
  return <button type="button" className="exp-map-chip" onClick={()=>onOpenWorld({kind:"map",id:mapRef.map})}>{mapRef.label}</button>;
}

type NpcMapFor=(name:string,explicit?:string)=>string|undefined;

function QuestCard({entry,sourceLabel,npcMapFor,npcSprites,lang,onOpenWorld,onOpenExternal}:{entry:ExpQuestLike;sourceLabel:string;npcMapFor:NpcMapFor;npcSprites:Map<string,string>;lang:Lang;onOpenWorld:(selection:WorldSelection)=>void;onOpenExternal:(destination:ExternalDestination)=>void}){
  const openSource=(href:string,label:string)=>(event:React.MouseEvent)=>{event.preventDefault();onOpenExternal({href,label})};
  return <details className="exp-quest" id={entry.id}>
    <summary>
      <div className="exp-quest-head">
        <div><b className="exp-quest-title">{entry.title}</b><div className="exp-quest-badges">{entry.badges.map(badge=><span key={badge} className="filter-chip slim">{badge}</span>)}</div></div>
        <span className={`exp-effort exp-effort-${entry.effort}`}>{entry.effortLabel}</span>
      </div>
    </summary>
    <div className="exp-quest-body">
      {entry.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}
      <ol>{entry.steps.map((step,index)=><li key={index}>
        {step.text}{" "}
        {step.map&&<MapChip mapRef={step.map} onOpenWorld={onOpenWorld}/>}
        {step.npcNames.map(name=>{const map=npcMapFor(name,step.map?.map);const coords=step.map?parseCoords(step.map.label):null;return map?<NpcLink key={name} name={name} map={map} coords={coords} sprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld}/>:null})}
      </li>)}</ol>
      {entry.prereq&&<details className="exp-prereq">
        <summary>{entry.prereq.title}</summary>
        <div className="exp-prereq-body">
          {entry.prereq.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}
          {entry.prereq.chain.length>0&&<div className="exp-chain">{entry.prereq.chain.map((step,index)=><span key={index}>{step}</span>)}</div>}
          {entry.prereq.sourceHref&&<a href={entry.prereq.sourceHref} onClick={openSource(entry.prereq.sourceHref,entry.prereq.sourceLabel)}>{entry.prereq.sourceLabel}</a>}
        </div>
      </details>}
      {entry.sourceHref&&<a className="exp-source-link" href={entry.sourceHref} onClick={openSource(entry.sourceHref,entry.sourceLabel||sourceLabel)}>{sourceLabel} ↗</a>}
    </div>
  </details>;
}
