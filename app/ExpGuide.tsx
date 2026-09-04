"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EXP_GUIDE, type ExpMapRef, type ExpQuestLike } from "./data/expGuideContent";
import type { ExternalDestination } from "./GuidePortal";
import { MobButton, NpcLink, npcSlug, parseCoords, REPORT_LABEL } from "./guideShared";
import type { Lang } from "./i18n";
import { ReportIssueLink } from "./report-issue";
import { loadWorld, type WorldSelection } from "./WorldCatalog";

const LEVEL_BANDS=[
  {id:"1-39",label:"1–39",min:1,max:39},
  {id:"40-59",label:"40–59",min:40,max:59},
  {id:"60-69",label:"60–69",min:60,max:69},
  {id:"70+",label:"70+",min:70,max:Infinity},
];

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
  // coordenada propia ("Regresa con Vincent.") igual puede enlazar ahí — y
  // ahora también recuerda las coordenadas de la primera vez que se vio ese
  // NPC en ese mapa, para que el botón /navi no desaparezca en las mismas
  // repeticiones que antes se quedaban sin mapa propio.
  const knownNpcMaps=useMemo(()=>{
    const maps=new Map<string,Set<string>>();
    const coords=new Map<string,{x:number;y:number}>();
    const remember=(name:string,mapCode?:string,label?:string)=>{
      if(!mapCode)return;
      const key=npcSlug(name);
      const known=maps.get(key)??new Set<string>();
      known.add(mapCode);
      maps.set(key,known);
      const coordKey=`${key}|${mapCode}`;
      if(label&&!coords.has(coordKey)){
        const parsed=parseCoords(label);
        if(parsed)coords.set(coordKey,parsed);
      }
    };
    for(const row of[...data.turnins,...data.hunts])remember(row.npc,row.npcLocation.map,row.npcLocation.label);
    for(const entry of[...data.quests,...data.cooldowns])for(const step of entry.steps)for(const name of step.npcNames)remember(name,step.map?.map,step.map?.label);
    return {maps,coords};
  },[data]);
  const npcMapFor=(name:string,explicit?:string)=>{
    if(explicit)return explicit;
    const known=knownNpcMaps.maps.get(npcSlug(name));
    return known?.size===1?[...known][0]:undefined;
  };
  const npcCoordsFor=(name:string,map:string|undefined,stepMap?:ExpMapRef|null)=>{
    if(stepMap)return parseCoords(stepMap.label);
    if(!map)return null;
    return knownNpcMaps.coords.get(`${npcSlug(name)}|${map}`)??null;
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
      {quests.map(entry=><QuestCard key={entry.id} entry={entry} sourceLabel={data.sourceLabel} npcMapFor={npcMapFor} npcCoordsFor={npcCoordsFor} npcSprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld} onOpenExternal={onOpenExternal}/>)}
      {!quests.length&&<p className="exp-empty">—</p>}
    </section>

    <section id="exp-cooldowns" className="exp-section">
      <div className="section-title"><div><h2>{data.cooldownsTitle}</h2></div><div className="compat-badges">{data.cooldownsCompatBadges.map(badge=><span key={badge} className="filter-chip slim">{badge}</span>)}</div></div>
      <p className="exp-small">{data.cooldownsIntro}</p>
      {cooldowns.map(entry=><QuestCard key={entry.id} entry={entry} sourceLabel={data.sourceLabel} npcMapFor={npcMapFor} npcCoordsFor={npcCoordsFor} npcSprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld} onOpenExternal={onOpenExternal}/>)}
      {!cooldowns.length&&<p className="exp-empty">—</p>}
    </section>

    <section id="exp-reglas" className="exp-section">
      <div className="section-title"><div><h2>{data.rulesTitle}</h2></div></div>
      <div className="exp-panel">{data.rulesParagraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
    </section>

    <ReportIssueLink kind="Guía" id={1} name={data.title} label={REPORT_LABEL[lang==="en"?"en":"es"]}/>
  </section>;
}

function MapChip({mapRef,onOpenWorld}:{mapRef:ExpMapRef;onOpenWorld:(selection:WorldSelection)=>void}){
  if(!mapRef.map)return <span className="exp-map-chip">{mapRef.label}</span>;
  return <button type="button" className="exp-map-chip" onClick={()=>onOpenWorld({kind:"map",id:mapRef.map})}>{mapRef.label}</button>;
}

type NpcMapFor=(name:string,explicit?:string)=>string|undefined;
type NpcCoordsFor=(name:string,map:string|undefined,stepMap?:ExpMapRef|null)=>{x:number;y:number}|null;

function QuestCard({entry,sourceLabel,npcMapFor,npcCoordsFor,npcSprites,lang,onOpenWorld,onOpenExternal}:{entry:ExpQuestLike;sourceLabel:string;npcMapFor:NpcMapFor;npcCoordsFor:NpcCoordsFor;npcSprites:Map<string,string>;lang:Lang;onOpenWorld:(selection:WorldSelection)=>void;onOpenExternal:(destination:ExternalDestination)=>void}){
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
        {step.npcNames.map(name=>{const map=npcMapFor(name,step.map?.map);const coords=npcCoordsFor(name,map,step.map);return map?<NpcLink key={name} name={name} map={map} coords={coords} sprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld}/>:null})}
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
