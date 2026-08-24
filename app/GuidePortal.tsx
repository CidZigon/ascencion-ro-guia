"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ItemCatalog } from "./ItemCatalog";
import { WorldCatalog, type WorldKind, type WorldSelection } from "./WorldCatalog";

type ModuleInfo = { id:number; icon:string; title:string; description:string };
type SearchEntry = { module:number; anchor:string; title:string; text:string; moduleTitle:string; icon:string };

const MODULES: ModuleInfo[] = [
  { id:1, icon:"🧭", title:"Progresión y EXP", description:"Rutas de leveo, cacerías, quests de EXP y progresión eficiente." },
  { id:2, icon:"🗺️", title:"Accesos y dungeons", description:"Prerrequisitos, NPC, coordenadas y desbloqueo de contenido." },
  { id:3, icon:"📖", title:"Historias y lore", description:"Arcos narrativos y contexto del mundo para entender cada aventura." },
  { id:4, icon:"🧩", title:"Aventuras regionales", description:"Quests regionales e independientes organizadas para consulta rápida." },
  { id:5, icon:"⚔️", title:"Jobs y habilidades", description:"Cambios de clase y habilidades especiales explicados paso a paso." },
  { id:6, icon:"🔨", title:"Equipo y fabricación", description:"Equipo, materiales, refinamiento y fabricación para cada etapa." },
  { id:7, icon:"🏰", title:"Endless Tower", description:"Pisos, MVP, elementos y estrategia para completar la torre." },
  { id:8, icon:"🐾", title:"Compañeros", description:"Pets, homúnculos y mercenarios con datos Pre-Renewal." },
];

function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function excerpt(text:string,query:string){const i=Math.max(0,normalize(text).indexOf(normalize(query)));const start=Math.max(0,i-65);const end=Math.min(text.length,i+query.length+115);return `${start?"…":""}${text.slice(start,end)}${end<text.length?"…":""}`}
function cleanUserText(value:string){
  let result=value;
  for(const topic of MODULES)result=result.replace(new RegExp(`m[oó]dulo\\s*0?${topic.id}`,"gi"),topic.title);
  return result
    .replace(/\bm[oó]dulos\b/gi,"secciones")
    .replace(/\bm[oó]dulo\b/gi,"sección")
    .replace(/\s*[·—-]?\s*(?:release\s+estable|release)(?:\s*[·—-]\s*\d{4}-\d{2}-\d{2})?/gi,"")
    .replace(/\s*[·—-]?\s*v\d+(?:\.\d+)+/gi,"")
    .replace(/\s{2,}/g," ")
    .trim();
}

export function GuidePortal(){
  const [moduleData,setModuleData]=useState<Record<number,string>>({});
  const [searchIndex,setSearchIndex]=useState<SearchEntry[]|null>(null);
  const [active,setActive]=useState<number|"items"|"world"|null>(null);
  const [query,setQuery]=useState("");
  const [loadError,setLoadError]=useState(false);
  const [selectedItemId,setSelectedItemId]=useState<number|null>(null);
  const [catalogQuery,setCatalogQuery]=useState("");
  const [worldQuery,setWorldQuery]=useState("");
  const [worldSelection,setWorldSelection]=useState<WorldSelection|null>(null);
  const [guidesOpen,setGuidesOpen]=useState(false);
  const headerRef=useRef<HTMLElement>(null);
  const hostRef=useRef<HTMLDivElement>(null);
  const shadowRef=useRef<ShadowRoot|null>(null);
  const pendingAnchor=useRef("");

  const openModule=useCallback((id:number,anchor="")=>{
    pendingAnchor.current=anchor;
    setLoadError(false);
    setActive(previous=>{
      if(previous===id&&anchor)setTimeout(()=>{if(shadowRef.current)scrollInside(shadowRef.current,anchor)},30);
      return id;
    });
    setQuery("");
    setGuidesOpen(false);
    history.replaceState(null,"",`#modulo-${id}${anchor||""}`);
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const openCatalog=useCallback((options:{id?:number;query?:string}={})=>{
    setActive("items");
    setSelectedItemId(options.id??null);
    setCatalogQuery(options.query??"");
    setQuery("");
    setGuidesOpen(false);
    history.replaceState(null,"",options.id?`#objeto-${options.id}`:"#objetos");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const selectItem=useCallback((id:number)=>{
    setSelectedItemId(id);
    history.replaceState(null,"",`#objeto-${id}`);
  },[]);

  const openWorld=useCallback((options:{kind?:WorldKind;id?:string;query?:string}={})=>{
    setActive("world");
    setWorldSelection(options.kind&&options.id?{kind:options.kind,id:options.id}:null);
    setWorldQuery(options.query??"");
    setQuery("");
    setGuidesOpen(false);
    const prefix=options.kind==="map"?"mapa":options.kind==="monster"?"monstruo":options.kind==="npc"?"npc":"mundo";
    history.replaceState(null,"",options.id?`#${prefix}-${options.id}`:"#mundo");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const selectWorld=useCallback((selection:WorldSelection)=>{
    setWorldSelection(selection);
    const prefix=selection.kind==="map"?"mapa":selection.kind==="monster"?"monstruo":"npc";
    history.replaceState(null,"",`#${prefix}-${selection.id}`);
  },[]);

  const showLibrary=useCallback(()=>{
    setActive(null);
    setQuery("");
    setGuidesOpen(false);
    history.replaceState(null,"","#inicio");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  useEffect(()=>{
    const close=(event:PointerEvent)=>{if(headerRef.current&&!headerRef.current.contains(event.target as Node))setGuidesOpen(false)};
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")setGuidesOpen(false)};
    document.addEventListener("pointerdown",close);
    document.addEventListener("keydown",escape);
    return()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",escape)};
  },[]);

  useEffect(()=>{
    const applyHash=()=>{
      const item=location.hash.match(/^#objeto-(\d+)$/),moduleMatch=location.hash.match(/^#modulo-(\d+)(#.*)?$/),world=location.hash.match(/^#(mapa|monstruo|npc)-(.+)$/);
      if(item){setSelectedItemId(Number(item[1]));setActive("items")}
      else if(location.hash==="#objetos"){setSelectedItemId(null);setActive("items")}
      else if(world){const kind:WorldKind=world[1]==="mapa"?"map":world[1]==="monstruo"?"monster":"npc";setWorldSelection({kind,id:world[2]});setActive("world")}
      else if(location.hash==="#mundo"){setWorldSelection(null);setActive("world")}
      else if(moduleMatch){pendingAnchor.current=moduleMatch[2]||"";setActive(Number(moduleMatch[1]))}
      else setActive(null);
    };
    applyHash();
    window.addEventListener("hashchange",applyHash);
    return()=>window.removeEventListener("hashchange",applyHash);
  },[]);

  useEffect(()=>{
    if(typeof active!=="number"||moduleData[active])return;
    let live=true;
    fetch(`/data/modules/module-${active}.html`).then(response=>{if(!response.ok)throw new Error("module");return response.text()}).then(html=>{if(live)setModuleData(current=>({...current,[active]:html}))}).catch(()=>{if(live)setLoadError(true)});
    return()=>{live=false};
  },[active,moduleData]);

  useEffect(()=>{
    if(query.trim().length<2||searchIndex)return;
    let live=true;
    fetch("/data/guide-search.json").then(response=>{if(!response.ok)throw new Error("search");return response.json()}).then(data=>{if(live)setSearchIndex(data)}).catch(()=>{if(live)setSearchIndex([])});
    return()=>{live=false};
  },[query,searchIndex]);

  useEffect(()=>{
    if(!hostRef.current)return;
    shadowRef.current=hostRef.current.shadowRoot??hostRef.current.attachShadow({mode:"open"});
  },[active]);

  useEffect(()=>{
    const shadow=shadowRef.current;
    if(!shadow)return;
    if(typeof active!=="number"){shadow.innerHTML="";return}
    if(!moduleData?.[active])return;
    shadow.innerHTML=moduleData[active]+"<link rel=\"stylesheet\" href=\"/modern-modules.css\">";
    cleanVisibleGuideMetadata(shadow);
    localizeItemLinks(shadow);
    localizeWorldLinks(shadow);
    bindModule(shadow,active,openModule,openCatalog,openWorld);
    const anchor=pendingAnchor.current;
    pendingAnchor.current="";
    if(anchor)setTimeout(()=>scrollInside(shadow,anchor),80);
  },[active,moduleData,openModule,openCatalog,openWorld]);

  const results=useMemo(()=>{
    const term=query.trim();
    if(term.length<2)return[];
    const key=normalize(term);
    return (searchIndex??[]).filter(item=>normalize(`${item.title} ${item.text}`).includes(key)).slice(0,50);
  },[query,searchIndex]);

  return <main className="portal">
    <header className="site-header" ref={headerRef}>
      <div className="nav-shell">
        <button className="brand" onClick={showLibrary} aria-label="Ir al inicio de BarrasRO"><span className="brand-mark">B</span><span><b>BarrasRO</b><small>Guía Pre-Renewal</small></span></button>
        <nav className="primary-nav" aria-label="Navegación principal">
          <button className={active===null?"active":""} onClick={showLibrary}>Inicio</button>
          <button className={active==="items"?"active":""} onClick={()=>openCatalog()}>Objetos</button>
          <button className={active==="world"?"active":""} onClick={()=>openWorld()}>Mundo</button>
          <div className="guide-menu-wrap">
            <button className={typeof active==="number"?"active":""} onClick={()=>setGuidesOpen(value=>!value)} aria-expanded={guidesOpen} aria-controls="guide-menu">Guías <span aria-hidden="true">⌄</span></button>
            {guidesOpen&&<div className="guide-menu" id="guide-menu">
              <div className="guide-menu-intro"><b>¿Qué quieres hacer?</b><span>Elige un tema y abre la guía directamente.</span></div>
              <div className="guide-menu-grid">{MODULES.map(topic=><button key={topic.id} className={active===topic.id?"active":""} onClick={()=>openModule(topic.id)}><span>{topic.icon}</span><span><b>{topic.title}</b><small>{topic.description}</small></span><i aria-hidden="true">→</i></button>)}</div>
            </div>}
          </div>
        </nav>
        <div className="search-wrap">
          <div className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar en BarrasRO…" aria-label="Buscar en toda la guía y el catálogo"/>{query&&<button onClick={()=>setQuery("")} aria-label="Limpiar búsqueda">×</button>}</div>
          {query.trim().length>=2&&<div className="search-panel"><button className="search-result catalog-search-result" onClick={()=>openCatalog({query})}><b>◆ Buscar “{query}” entre todos los objetos</b><small>Por nombre, Aegis o ID</small></button><button className="search-result world-search-result" onClick={()=>openWorld({query})}><b>⌖ Buscar “{query}” en el mundo</b><small>Ubicaciones, monstruos y NPC</small></button><div className="search-label">{searchIndex===null?"BUSCANDO…":results.length?`${results.length} RESULTADOS EN LAS GUÍAS`:"SIN RESULTADOS EN LAS GUÍAS"}</div>{results.map((r,i)=><button className="search-result" key={`${r.module}-${r.anchor}-${i}`} onClick={()=>openModule(r.module,r.anchor)}><b>{r.icon} {cleanUserText(r.title)}</b><small>{MODULES[r.module-1]?.title} · {cleanUserText(excerpt(r.text,query))}</small></button>)}</div>}
        </div>
      </div>
    </header>
    <section className="workspace">
      <div className="content">
        {active===null&&<Library openModule={openModule} openCatalog={openCatalog} openWorld={openWorld}/>}
        {active==="items"&&<ItemCatalog key={catalogQuery} selectedItemId={selectedItemId} initialQuery={catalogQuery} onSelectItem={selectItem}/>}
        {active==="world"&&<WorldCatalog key={worldQuery} selection={worldSelection} initialQuery={worldQuery} onSelect={selectWorld}/>}
        {typeof active==="number"&&<section className="module-view">{loadError?<div className="fatal"><h2>No se pudo cargar la guía</h2><p>Intenta recargar la página.</p></div>:!moduleData[active]?<div className="module-loading"><div className="loader"/><p>Preparando la guía…</p></div>:null}<div ref={hostRef} className="shadow-host"/></section>}
      </div>
    </section>
  </main>;
}

function Library({openModule,openCatalog,openWorld}:{openModule:(id:number)=>void;openCatalog:(options?:{id?:number;query?:string})=>void;openWorld:(options?:{kind?:WorldKind;id?:string;query?:string})=>void}){
  return <section className="library">
    <div className="library-head">
      <div className="library-intro">
        <h1>Todo Midgard,<br/><span>a un clic.</span></h1>
        <p>Encuentra una ruta de leveo, desbloquea un dungeon o consulta un objeto sin salir de BarrasRO.</p>
        <div className="hero-actions"><button className="primary-action" onClick={()=>openCatalog()}>Buscar un objeto <span>→</span></button><button className="secondary-action" onClick={()=>openModule(1)}>Comenzar a progresar</button></div>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-gem"><span>6.169</span><small>objetos listos</small></div><div className="hero-card hero-card-one">Busca por nombre</div><div className="hero-card hero-card-two">Abre cualquier guía</div></div>
    </div>
    <div className="database-links"><button className="catalog-teaser" onClick={()=>openCatalog()}><span className="teaser-sigil">◆</span><span><b>Busca objetos al instante</b><em>Nombre, Aegis, ID, equipo, precios, scripts y restricciones.</em></span><strong>EXPLORAR <span>→</span></strong></button><button className="catalog-teaser world-teaser" onClick={()=>openWorld()}><span className="teaser-sigil">⌖</span><span><b>Recorre el mundo sin salir</b><em>Ubicaciones, monstruos y NPC enlazados desde las guías.</em></span><strong>EXPLORAR <span>→</span></strong></button></div>
    <div className="section-title"><div><h2>Explora por tema</h2><p>Ocho caminos claros, sin códigos ni versiones que aprender.</p></div></div>
    <div className="module-grid">{MODULES.map(topic=><button className="module-card" key={topic.id} onClick={()=>openModule(topic.id)}><span className="card-icon">{topic.icon}</span><h3>{topic.title}</h3><p>{topic.description}</p><span className="card-open">Explorar <b>→</b></span></button>)}</div>
  </section>
}

function cleanVisibleGuideMetadata(shadow:ShadowRoot){
  shadow.querySelectorAll<HTMLElement>('[id="fuentes"], footer').forEach(element=>element.remove());
  shadow.querySelectorAll<HTMLAnchorElement>('nav a[href="#fuentes"]').forEach(element=>element.remove());
  shadow.querySelectorAll<HTMLElement>('.badge,.release-badge,.release-note,.eyebrow,.recommended,.audit').forEach(element=>{
    if(/m[oó]dulo|release|versi[oó]n|versionado|auditor[ií]a|entregable|\b\d{2}\s+[a-z]{3}\s+\d{4}\b/i.test(element.textContent||""))element.remove();
  });
  const walker=document.createTreeWalker(shadow,NodeFilter.SHOW_TEXT);
  const nodes:Text[]=[];
  while(walker.nextNode())nodes.push(walker.currentNode as Text);
  for(const node of nodes){
    const cleaned=cleanUserText(node.data);
    if(cleaned!==node.data.trim())node.data=cleaned;
  }
  const navigation=shadow.querySelector<HTMLElement>("nav");
  if(navigation){
    const menu=document.createElement("details");
    const summary=document.createElement("summary");
    menu.className="section-navigation";
    summary.textContent="Explorar esta guía";
    navigation.classList.add("section-navigation-links");
    navigation.replaceWith(menu);
    menu.append(summary,navigation);
    navigation.addEventListener("click",event=>{if((event.target as HTMLElement).closest("a"))menu.open=false});
  }
}

function openDetailsTo(element:HTMLElement){let current:HTMLElement|null=element;while(current){if(current.tagName==="DETAILS")(current as HTMLDetailsElement).open=true;current=current.parentElement}}
function scrollInside(shadow:ShadowRoot,anchor:string){const el=shadow.getElementById(anchor.replace(/^#/,""));if(el){openDetailsTo(el);setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),30)}}

function localizeItemLinks(shadow:ShadowRoot){
  shadow.querySelectorAll<HTMLAnchorElement>('a[href*="ratemyserver.net"][href*="item_id="]').forEach(link=>{
    const id=(link.getAttribute("href")||"").match(/[?&]item_id=(\d+)/)?.[1];
    if(!id)return;
    link.setAttribute("href",`#objeto-${id}`);
    link.dataset.localItem=id;
    link.title=`Abrir ficha local del objeto #${id}`;
  });
}

function worldSlug(value:string){return normalize(value).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function localizeWorldLinks(shadow:ShadowRoot){
  shadow.querySelectorAll<HTMLAnchorElement>('a[href*="ratemyserver.net"]').forEach(link=>{
    const href=(link.getAttribute("href")||"").replaceAll("&amp;","&");
    try{
      const url=new URL(href),map=url.searchParams.get("map")||(url.searchParams.get("area")?`area-${url.searchParams.get("area")}`:null),monster=url.searchParams.get("mob_id");
      if(map){link.setAttribute("href",`#mapa-${map}`);link.dataset.localWorld="map";link.title=`Abrir ubicación local: ${map}`}
      else if(monster){link.setAttribute("href",`#monstruo-${monster}`);link.dataset.localWorld="monster";link.title=`Abrir ficha local del monstruo #${monster}`}
    }catch{return}
  });
  shadow.querySelectorAll<HTMLAnchorElement>("a.npclink").forEach(link=>{
    const wrapper=link.closest(".npcref"),mapLink=wrapper?.querySelector<HTMLAnchorElement>("a.maplink"),mapHref=mapLink?.getAttribute("href")||"";
    const map=mapHref.match(/[?&]map=([^&]+)/)?.[1]||mapHref.match(/^#mapa-(.+)$/)?.[1]||"";
    const id=`${worldSlug(link.textContent||"npc")}${map?`-${map}`:""}`;
    link.setAttribute("href",`#npc-${id}`);
    link.dataset.localWorld="npc";
    link.title="Abrir ficha local del NPC";
  });
}

function bindModule(shadow:ShadowRoot,module:number,openModule:(id:number,anchor?:string)=>void,openCatalog:(options?:{id?:number;query?:string})=>void,openWorld:(options?:{kind?:WorldKind;id?:string;query?:string})=>void){
  const boundShadow=shadow as ShadowRoot&{_portalClickHandler?:EventListener};
  if(boundShadow._portalClickHandler)boundShadow.removeEventListener("click",boundShadow._portalClickHandler);
  const handleClick:EventListener=(rawEvent)=>{
    const event=rawEvent as MouseEvent;
    const target=event.target as HTMLElement;
    const portal=target.closest<HTMLElement>("[data-portal-module]");
    if(portal){event.preventDefault();openModule(Number(portal.dataset.portalModule),portal.dataset.portalAnchor||"");return}
    const link=target.closest<HTMLAnchorElement>("a[href]");
    if(link){
      const href=link.getAttribute("href")||"";
      const localItem=href.match(/^#objeto-(\d+)$/);
      if(localItem){event.preventDefault();openCatalog({id:Number(localItem[1])});return}
      const localWorld=href.match(/^#(mapa|monstruo|npc)-(.+)$/);
      if(localWorld){event.preventDefault();const kind:WorldKind=localWorld[1]==="mapa"?"map":localWorld[1]==="monstruo"?"monster":"npc";openWorld({kind,id:localWorld[2]});return}
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
  boundShadow.addEventListener("click",handleClick);
  boundShadow._portalClickHandler=handleClick;
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
