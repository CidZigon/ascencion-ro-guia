"use client";
/* eslint-disable @next/next/no-img-element -- sprites oficiales pequeños servidos desde la caché local */

/* Piezas compartidas entre las guías reconstruidas como componentes React
   (ExpGuide, AccessGuide, y las que sigan el mismo patrón): resolución de
   NPC → sprite/mapa, el botón /navi copiable y el enlace a la ficha de
   monstruo. Antes vivían duplicadas dentro de ExpGuide.tsx. */

import { useState } from "react";
import type { Lang } from "./i18n";
import type { WorldSelection } from "./WorldCatalog";

export function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"")}
export function npcSlug(value:string){return normalize(value).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
// Las coordenadas siempre vienen embebidas en el texto ("📍 lighthalzen 337,232");
// se extraen para armar el comando /navi (que exige "x/y", no "x,y" — ver docs/comandos-cliente-ro.md).
export function parseCoords(label:string){
  const match=label.match(/(\d{1,3})\s*,\s*(\d{1,3})/);
  return match?{x:Number(match[1]),y:Number(match[2])}:null;
}

export const REPORT_LABEL={es:"Reportar un error en esta guía",en:"Report an issue with this guide"};
export const NAVI_LABEL={
  es:{copy:"📋 /navi",copied:"✓ copiado",title:(cmd:string)=>`Copiar ${cmd} (pegalo en el chat del juego)`},
  en:{copy:"📋 /navi",copied:"✓ copied",title:(cmd:string)=>`Copy ${cmd} (paste it into the game chat)`},
};

export function MobButton({mob,onOpenMonster}:{mob:{id:number;name:string};onOpenMonster:(options:{id:number})=>void}){
  return <button type="button" className="exp-mob-btn" onClick={()=>onOpenMonster({id:mob.id})}>
    <span className="exp-mob-sprite"><img src={`/world/sprites/${mob.id}.gif`} alt="" loading="lazy" onError={event=>{event.currentTarget.style.display="none"}}/></span>
    <b>{mob.name}</b>
  </button>;
}

export function NpcLink({name,map,coords,sprites,lang,onOpenWorld}:{name:string;map?:string;coords?:{x:number;y:number}|null;sprites:Map<string,string>;lang:Lang;onOpenWorld:(selection:WorldSelection)=>void}){
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

export function MapLink({map,label,coords,lang,onOpenWorld}:{map?:string;label:string;coords?:{x:number;y:number}|null;lang:Lang;onOpenWorld:(selection:WorldSelection)=>void}){
  const [copied,setCopied]=useState(false);
  if(!map)return <span className="exp-map-chip">{label}</span>;
  const naviCommand=coords?`/navi ${map} ${coords.x}/${coords.y}`:null;
  const labels=NAVI_LABEL[lang==="en"?"en":"es"];
  const copyNavi=async(event:React.MouseEvent)=>{
    event.stopPropagation();
    if(!naviCommand)return;
    try{await navigator.clipboard.writeText(naviCommand);setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{/* Portapapeles no disponible en este navegador. */}
  };
  return <span className="exp-npc">
    <button type="button" className="exp-map-chip" onClick={()=>onOpenWorld({kind:"map",id:map})}>{label}</button>
    {naviCommand&&<button type="button" className="exp-navi-btn" title={labels.title(naviCommand)} onClick={copyNavi}>{copied?labels.copied:labels.copy}</button>}
  </span>;
}
