"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ModuleInfo = { id:number; icon:string; title:string; description:string; tag:string; version:string };
type SearchEntry = { module:number; anchor:string; title:string; text:string; moduleTitle:string; icon:string };

const MODULES: ModuleInfo[] = [
  { id:1, icon:"🧭", title:"Progresión & EXP", description:"Rutas de leveo, cacerías, quests de EXP y progresión eficiente.", tag:"Empieza aquí", version:"v1.11" },
  { id:2, icon:"🗺️", title:"Accesos & Dungeons", description:"Prerrequisitos, NPC, coordenadas y desbloqueo de contenido.", tag:"Exploración", version:"v2.4" },
  { id:3, icon:"📖", title:"Historias & Lore", description:"Arcos narrativos y contexto del mundo para entender cada aventura.", tag:"Historia", version:"v3.4" },
  { id:4, icon:"🧩", title:"Regional & Standalone", description:"Quests regionales e independientes organizadas para consulta rápida.", tag:"Quests", version:"v4.1" },
  { id:5, icon:"⚔️", title:"Jobs & Platinum Skills", description:"Cambios de clase y habilidades especiales explicados paso a paso.", tag:"Clases", version:"v5.4" },
  { id:6, icon:"🔨", title:"Equipment & Crafting", description:"Equipo, materiales, refinamiento y fabricación para cada etapa.", tag:"Progreso", version:"v6.2" },
  { id:7, icon:"🏰", title:"Endless Tower", description:"Pisos, MVP, elementos y estrategia para completar la torre.", tag:"Endgame", version:"v8.1" },
  { id:8, icon:"🐾", title:"Compañeros", description:"Pets, homúnculos y mercenarios con datos Pre-Renewal.", tag:"Sistemas", version:"v10.2" },
];

function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function decodeModule(value:string){const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));return new TextDecoder("utf-8").decode(bytes)}
function excerpt(text:string,query:string){const i=Math.max(0,normalize(text).indexOf(normalize(query)));const start=Math.max(0,i-65);const end=Math.min(text.length,i+query.length+115);return `${start?"…":""}${text.slice(start,end)}${end<text.length?"…":""}`}

export function GuidePortal(){
  const [moduleData,setModuleData]=useState<Record<string,string>|null>(null);
  const [searchIndex,setSearchIndex]=useState<SearchEntry[]>([]);
  const [active,setActive]=useState<number|null>(null);
  const [query,setQuery]=useState("");
  const [loadError,setLoadError]=useState(false);
  const hostRef=useRef<HTMLDivElement>(null);
  const shadowRef=useRef<ShadowRoot|null>(null);
  const pendingAnchor=useRef("");

  const openModule=useCallback((id:number,anchor="")=>{
    pendingAnchor.current=anchor;
    setActive(previous=>{
      if(previous===id&&anchor)setTimeout(()=>{if(shadowRef.current)scrollInside(shadowRef.current,anchor)},30);
      return id;
    });
    setQuery("");
    history.replaceState(null,"",`#modulo-${id}${anchor||""}`);
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const showLibrary=useCallback(()=>{
    setActive(null);
    setQuery("");
    history.replaceState(null,"","#inicio");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  useEffect(()=>{
    const applyHash=()=>{const match=location.hash.match(/^#modulo-(\d+)(#.*)?$/);if(match){pendingAnchor.current=match[2]||"";setActive(Number(match[1]))}else setActive(null)};
    applyHash();
    window.addEventListener("hashchange",applyHash);
    return()=>window.removeEventListener("hashchange",applyHash);
  },[]);

  useEffect(()=>{
    let live=true;
    fetch("/content.bundle").then(r=>{if(!r.ok)throw new Error("content");return r.text()}).then(text=>{
      const dataKey="const MODULE_DATA=",metaKey=";const MODULE_META=",searchKey="const SEARCH_INDEX=";
      const dataStart=text.indexOf(dataKey)+dataKey.length,dataEnd=text.indexOf(metaKey,dataStart);
      const searchStart=text.indexOf(searchKey)+searchKey.length;
      const searchTail=text.slice(searchStart).match(/^(\[.*\]);\s*let currentModule=/s);
      if(dataStart<dataKey.length||dataEnd<0||searchStart<searchKey.length||!searchTail)throw new Error("parse");
      if(live){setModuleData(JSON.parse(text.slice(dataStart,dataEnd)));setSearchIndex(JSON.parse(searchTail[1]))}
    }).catch(()=>{if(live)setLoadError(true)});
    return()=>{live=false};
  },[]);

  useEffect(()=>{
    if(!hostRef.current)return;
    shadowRef.current=hostRef.current.shadowRoot??hostRef.current.attachShadow({mode:"open"});
  },[active]);

  useEffect(()=>{
    const shadow=shadowRef.current;
    if(!shadow)return;
    if(active===null){shadow.innerHTML="";return}
    if(!moduleData?.[active])return;
    shadow.innerHTML=decodeModule(moduleData[active])+"<link rel=\"stylesheet\" href=\"/modern-modules.css\">";
    bindModule(shadow,active,openModule);
    const anchor=pendingAnchor.current;
    pendingAnchor.current="";
    if(anchor)setTimeout(()=>scrollInside(shadow,anchor),80);
  },[active,moduleData,openModule]);

  const results=useMemo(()=>{
    const term=query.trim();
    if(term.length<2)return[];
    const key=normalize(term);
    return searchIndex.filter(item=>normalize(`${item.title} ${item.text}`).includes(key)).slice(0,50);
  },[query,searchIndex]);

  const current=active?MODULES[active-1]:null;
  return <main className="portal">
    <aside className="sidebar">
      <button className="brand" onClick={showLibrary} aria-label="Abrir biblioteca de BarrasRO"><span className="brand-mark">B</span><span><b>BarrasRO</b><small>ENCICLOPEDIA PRE-RENEWAL</small></span></button>
      <button className={`library-button ${active===null?"active":""}`} onClick={showLibrary}>⌂ Biblioteca completa</button>
      <nav className="module-nav" aria-label="Módulos de la guía">{MODULES.map(m=><button key={m.id} className={`module-tab ${active===m.id?"active":""}`} onClick={()=>openModule(m.id)}><span className="tab-icon">{m.icon}</span><strong>M{m.id}</strong><span>{m.title}</span></button>)}</nav>
      <div className="side-note"><b>BarrasRO · 8 MÓDULOS</b><br/>Todo el contenido se consulta dentro de esta misma biblioteca.</div>
    </aside>
    <section className="workspace">
      <header className="topbar">
        <div className="current">{current?`Módulo ${current.id} · ${current.title}`:"BarrasRO · Biblioteca"}</div>
        <div className="search-wrap">
          <div className="search-field"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar quests, NPC, mapas, jobs, equipo…" aria-label="Buscar en todos los módulos"/><button onClick={()=>setQuery("")}>Limpiar</button></div>
          {query.trim().length>=2&&<div className="search-panel"><div className="search-label">{results.length?`${results.length} RESULTADOS VISIBLES`:"SIN RESULTADOS"}</div>{results.map((r,i)=><button className="search-result" key={`${r.module}-${r.anchor}-${i}`} onClick={()=>openModule(r.module,r.anchor)}><b>{r.icon} {r.title}</b><small>Módulo {r.module} · {excerpt(r.text,query)}</small></button>)}</div>}
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Módulos"><button className={active===null?"active":""} onClick={showLibrary}>⌂ Inicio</button>{MODULES.map(m=><button key={m.id} className={active===m.id?"active":""} onClick={()=>openModule(m.id)}>{m.icon} M{m.id}</button>)}</nav>
      <div className="content">
        {active===null&&<Library openModule={openModule}/>} 
        {active!==null&&<section className="module-view">{loadError?<div className="fatal"><h2>No se pudo cargar la biblioteca</h2><p>Intenta recargar la página.</p></div>:!moduleData?<div className="module-loading"><div className="loader"/><p>Preparando el módulo completo…</p></div>:null}<div ref={hostRef} className="shadow-host"/></section>}
      </div>
    </section>
  </main>;
}

function Library({openModule}:{openModule:(id:number)=>void}){
  return <section className="library">
    <div className="library-head">
      <div className="library-intro">
        <div className="library-crest" aria-hidden="true"><span>BR</span></div>
        <span className="kicker">BarrasRO · ARCHIVO DE MIDGARD</span>
        <h1>Biblioteca<br/>Pre-Renewal</h1>
        <div className="ornament" aria-hidden="true"><i/><b>◆</b><i/></div>
        <p>Todo el conocimiento del servidor reunido en un solo lugar. Explora rutas, accesos, historias, jobs y sistemas sin abandonar esta biblioteca.</p>
      </div>
      <div className="library-stats"><div><b>8</b><span>Módulos completos</span></div><div><b>13.2</b><span>Episodio máximo</span></div></div>
    </div>
    <div className="section-title"><div><span className="kicker">ELIGE TU CAMINO</span><h2>Explora por tema</h2></div><span>Selecciona un módulo para abrirlo aquí mismo</span></div>
    <div className="module-grid">{MODULES.map(m=><button className="module-card" key={m.id} onClick={()=>openModule(m.id)}><div className="card-top"><span className="card-number">MÓDULO {m.id} · {m.version}</span><span className="card-tag">{m.tag}</span></div><span className="card-icon">{m.icon}</span><h3>{m.title}</h3><p>{m.description}</p><span className="card-open">ABRIR <b>→</b></span></button>)}</div>
  </section>
}

function openDetailsTo(element:HTMLElement){let current:HTMLElement|null=element;while(current){if(current.tagName==="DETAILS")(current as HTMLDetailsElement).open=true;current=current.parentElement}}
function scrollInside(shadow:ShadowRoot,anchor:string){const el=shadow.getElementById(anchor.replace(/^#/,""));if(el){openDetailsTo(el);setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),30)}}

function bindModule(shadow:ShadowRoot,module:number,openModule:(id:number,anchor?:string)=>void){
  shadow.onclick=(event)=>{
    const target=event.target as HTMLElement;
    const portal=target.closest<HTMLElement>("[data-portal-module]");
    if(portal){event.preventDefault();openModule(Number(portal.dataset.portalModule),portal.dataset.portalAnchor||"");return}
    const link=target.closest<HTMLAnchorElement>("a[href]");
    if(link){
      const href=link.getAttribute("href")||"";
      const crossModule=href.match(/^#module-(\d+)(#.*)?$/);
      if(crossModule){event.preventDefault();openModule(Number(crossModule[1]),crossModule[2]||"");return}
      if(href.startsWith("#")){event.preventDefault();scrollInside(shadow,href);return}
      if(/^https?:\/\//i.test(href)){event.preventDefault();window.open(href,"_blank","noopener,noreferrer");return}
    }
    const button=target.closest<HTMLElement>("[data-module-action]");
    if(!button)return;
    const action=button.dataset.moduleAction,state=button.dataset.moduleState==="1",id=button.dataset.moduleTarget||"";
    if(action==="set-details")shadow.querySelectorAll<HTMLDetailsElement>(`#${CSS.escape(id)} details.accordion:not([hidden]),#${CSS.escape(id)} details.searchable:not([hidden])`).forEach(d=>d.open=state);
    if(action==="set-prereqs")shadow.querySelectorAll<HTMLDetailsElement>(`#${CSS.escape(id)} details.prereq`).forEach(d=>d.open=state);
    if(action==="toggle-id"){const d=shadow.getElementById(id) as HTMLDetailsElement|null;if(d)d.open=state}
    if(action==="toggle-section")button.closest(".item-section")?.querySelectorAll<HTMLDetailsElement>(".item-card:not(.hidden-item)").forEach(d=>d.open=state);
    if(action==="expand-bosses")shadow.querySelectorAll<HTMLDetailsElement>(".floor.boss").forEach(d=>d.open=true);
    if(action==="collapse-all")shadow.querySelectorAll<HTMLDetailsElement>(".floor").forEach(d=>d.open=false);
  };
  if(module===1)bindM1(shadow);
  if(module===2)bindM2(shadow);
  if(module===4||module===5)bindM4or5(shadow,module);
  if(module===6)bindM6(shadow);
  if(module===7)bindM7(shadow);
  if(module===8)bindM8(shadow);
}

function bindM1(shadow:ShadowRoot){
  const q=shadow.getElementById("q") as HTMLInputElement|null,lv=shadow.getElementById("lv") as HTMLSelectElement|null,clear=shadow.getElementById("clearFilters"),status=shadow.getElementById("filterStatus");
  const matches=(min:number,f:string)=>!f||(f==="1-39"&&min<40)||(f==="40-59"&&min>=40&&min<60)||(f==="60-69"&&min>=60&&min<70)||(f==="70+"&&min>=70);
  const apply=()=>{const term=(q?.value||"").toLowerCase().trim(),filter=lv?.value||"";let visible=0;shadow.querySelectorAll<HTMLTableRowElement>(".searchable tbody tr").forEach(row=>{const min=Number(row.dataset.min||row.cells[0]?.innerText.match(/\d+/)?.[0]||0),ok=(!term||row.innerText.toLowerCase().includes(term))&&matches(min,filter);row.hidden=!ok;if(ok)visible++});shadow.querySelectorAll<HTMLDetailsElement>("details.accordion.searchable").forEach(card=>{if(card.id==="huntDetails")return;const ok=(!term||card.innerText.toLowerCase().includes(term))&&matches(Number(card.dataset.min||0),filter);card.hidden=!ok;if(ok)visible++});if(status)status.textContent=(term||filter)?`Coincidencias visibles: ${visible}`:""};
  q?.addEventListener("input",apply);lv?.addEventListener("change",apply);clear?.addEventListener("click",()=>{if(q)q.value="";if(lv)lv.value="";apply();q?.focus()});
}
function bindM2(shadow:ShadowRoot){
  const q=shadow.getElementById("q") as HTMLInputElement|null,lv=shadow.getElementById("lv") as HTMLSelectElement|null,clear=shadow.getElementById("clearFilters"),status=shadow.getElementById("filterStatus");
  const matches=(min:number,f:string)=>!f||(f==="1-59"&&min<60)||(f==="60-69"&&min>=60&&min<70)||(f==="70-79"&&min>=70&&min<80)||(f==="80+"&&min>=80);
  const apply=()=>{const term=(q?.value||"").toLowerCase().trim(),filter=lv?.value||"";let visible=0;shadow.querySelectorAll<HTMLDetailsElement>("details.accordion.searchable").forEach(card=>{const ok=(!term||card.innerText.toLowerCase().includes(term))&&matches(Number(card.dataset.min||0),filter);card.hidden=!ok;if(ok)visible++});shadow.querySelectorAll<HTMLElement>("section.zone").forEach(zone=>{const cards=[...zone.querySelectorAll<HTMLDetailsElement>("details.accordion.searchable")];zone.hidden=cards.length>0&&cards.every(c=>c.hidden)});if(status)status.textContent=(term||filter)?`Quests/accesos visibles: ${visible}`:""};
  q?.addEventListener("input",apply);lv?.addEventListener("change",apply);clear?.addEventListener("click",()=>{if(q)q.value="";if(lv)lv.value="";apply();q?.focus()});
}
function bindM4or5(shadow:ShadowRoot,module:number){const q=shadow.getElementById("q") as HTMLInputElement|null,clear=shadow.getElementById("clearFilters"),status=shadow.getElementById("filterStatus");const apply=()=>{const term=(q?.value||"").toLowerCase().trim();let visible=0;shadow.querySelectorAll<HTMLDetailsElement>("details.searchable").forEach(card=>{const ok=!term||card.innerText.toLowerCase().includes(term);card.hidden=!ok;if(ok)visible++});shadow.querySelectorAll<HTMLElement>(module===4?"section.region":"section.path").forEach(section=>{const cards=[...section.querySelectorAll<HTMLDetailsElement>("details.searchable")];section.hidden=cards.length>0&&cards.every(c=>c.hidden)});if(status)status.textContent=term?`${module===4?"Quests":"Cambios"} visibles: ${visible}`:""};q?.addEventListener("input",apply);clear?.addEventListener("click",()=>{if(q)q.value="";apply();q?.focus()})}
function bindM6(shadow:ShadowRoot){let category="all",custom=false,refine=false;const search=shadow.getElementById("search") as HTMLInputElement|null,status=shadow.getElementById("status");const apply=()=>{const term=(search?.value||"").trim().toLowerCase();let visible=0;shadow.querySelectorAll<HTMLElement>(".item-card").forEach(card=>{const ok=(category==="all"||card.dataset.category===category)&&(!custom||card.dataset.custom==="1")&&(!refine||card.dataset.refine==="1")&&(!term||(card.dataset.search||"").includes(term));card.classList.toggle("hidden-item",!ok);if(ok)visible++});shadow.querySelectorAll<HTMLElement>(".item-section[data-section-category]").forEach(section=>section.style.display=[...section.querySelectorAll(".item-card")].some(card=>!card.classList.contains("hidden-item"))?"":"none");if(status)status.textContent=`Ítems visibles: ${visible} / 290`};shadow.querySelectorAll<HTMLElement>("#categoryFilters [data-cat]").forEach(button=>button.addEventListener("click",()=>{category=button.dataset.cat||"all";shadow.querySelectorAll("#categoryFilters .filter-btn").forEach(item=>item.classList.toggle("active",item===button));apply()}));shadow.getElementById("customOnly")?.addEventListener("click",e=>{custom=!custom;(e.currentTarget as HTMLElement).classList.toggle("active",custom);apply()});shadow.getElementById("refineOnly")?.addEventListener("click",e=>{refine=!refine;(e.currentTarget as HTMLElement).classList.toggle("active",refine);apply()});shadow.getElementById("expandAll")?.addEventListener("click",()=>shadow.querySelectorAll<HTMLDetailsElement>(".item-card:not(.hidden-item)").forEach(d=>d.open=true));shadow.getElementById("collapseAll")?.addEventListener("click",()=>shadow.querySelectorAll<HTMLDetailsElement>(".item-card").forEach(d=>d.open=false));shadow.getElementById("clear")?.addEventListener("click",()=>{if(search)search.value="";category="all";custom=false;refine=false;shadow.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));shadow.querySelector('[data-cat="all"]')?.classList.add("active");apply()});search?.addEventListener("input",apply);apply()}
function bindM7(shadow:ShadowRoot){const q=shadow.getElementById("q") as HTMLInputElement|null;q?.addEventListener("input",()=>{const term=q.value.toLowerCase().trim();shadow.querySelectorAll<HTMLElement>(".floor").forEach(floor=>{const haystack=`${floor.innerText} ${floor.dataset.search||""}`.toLowerCase();floor.style.display=!term||haystack.includes(term)?"":"none"})})}
function bindM8(shadow:ShadowRoot){let mode="all";const search=shadow.getElementById("search") as HTMLInputElement|null,rows=[...shadow.querySelectorAll<HTMLTableRowElement>("#petTable tbody tr")];const apply=()=>{const term=(search?.value||"").trim().toLowerCase();rows.forEach(row=>{const hit=!term||row.innerText.toLowerCase().includes(term)||(row.dataset.search||"").includes(term),kind=row.dataset.bonus||"none",ok=mode==="all"||(mode==="bonus"&&kind!=="none")||(mode==="none"&&kind==="none");row.classList.toggle("hidden",!(hit&&ok))})};search?.addEventListener("input",apply);shadow.getElementById("withBonus")?.addEventListener("click",()=>{mode=mode==="bonus"?"all":"bonus";apply()});shadow.getElementById("noBonus")?.addEventListener("click",()=>{mode=mode==="none"?"all":"none";apply()});shadow.getElementById("clear")?.addEventListener("click",()=>{if(search)search.value="";mode="all";apply()})}
