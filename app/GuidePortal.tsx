"use client";

import { Suspense, lazy, type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { EQUIP_HASH, WEAPON_HASH, equipSlotById, weaponKindById } from "./gear";
import { STRINGS, getLang, getServerLang, setLang, subscribeLang, type Dict, type Lang } from "./i18n";
import { ModalShell } from "./ModalShell";
import type { WorldKind, WorldSelection } from "./WorldCatalog";

type NavMenu = "guides";
type ActiveView = number | "items" | "world" | "equipment" | "weapons" | "monsters" | null;

const ItemCatalog=lazy(async()=>({default:(await import("./ItemCatalog")).ItemCatalog}));
const MonsterCatalog=lazy(async()=>({default:(await import("./MonsterCatalog")).MonsterCatalog}));
const WorldCatalog=lazy(async()=>({default:(await import("./WorldCatalog")).WorldCatalog}));
const WorldReferenceDialog=lazy(async()=>({default:(await import("./WorldCatalog")).WorldReferenceDialog}));
const MonsterSpawnDialog=lazy(async()=>({default:(await import("./WorldCatalog")).MonsterSpawnDialog}));

let moduleStylePromise:Promise<string>|null=null;
function loadModuleStyle(){
  moduleStylePromise??=fetch("/modern-modules.css").then(response=>{if(!response.ok)throw new Error("module-style");return response.text()});
  return moduleStylePromise;
}

type ModuleInfo = { id:number; icon:string; title:string; description:string };
type SearchEntry = { module:number; anchor:string; title:string; text:string; moduleTitle:string; icon:string };
type ExternalDestination = { href:string; label:string };

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

// Un tinte por gu\u00eda: la misma idea que en el resto del sitio \u2014 el color es luz
// sobre el cristal, no relleno, as\u00ed que van con alfa baja.
const MODULE_TINTS=["#e0b04d4d","#3ec2c94d","#8f68a54d","#7fae4d4d","#c94d5a4d","#d2b0714d","#6fb0e04d","#d97fae4d"];

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
  const [moduleData,setModuleData]=useState<Record<string,{html:string;style:string;translated:boolean}>>({});
  const [searchIndex,setSearchIndex]=useState<Partial<Record<Lang,SearchEntry[]>>>({});
  const [active,setActive]=useState<ActiveView>(null);
  const [query,setQuery]=useState("");
  const [loadError,setLoadError]=useState(false);
  const [selectedItemId,setSelectedItemId]=useState<number|null>(null);
  const [catalogQuery,setCatalogQuery]=useState("");
  const [equipmentSlot,setEquipmentSlot]=useState<string|null>(null);
  const [weaponType,setWeaponType]=useState<string|null>(null);
  const [selectedMonsterId,setSelectedMonsterId]=useState<number|null>(null);
  const [monsterQuery,setMonsterQuery]=useState("");
  const [worldQuery,setWorldQuery]=useState("");
  const [worldSelection,setWorldSelection]=useState<WorldSelection|null>(null);
  const [worldPreview,setWorldPreview]=useState<WorldSelection|null>(null);
  const [monsterSpawnPreview,setMonsterSpawnPreview]=useState<{id:number;name:string;mvp?:boolean;maps:string[]}|null>(null);
  const [externalLink,setExternalLink]=useState<ExternalDestination|null>(null);
  const [navMenu,setNavMenu]=useState<NavMenu|null>(null);
  const headerRef=useRef<HTMLElement>(null);
  const railRef=useRef<HTMLElement>(null);
  const navTimer=useRef(0);
  const hostRef=useRef<HTMLDivElement>(null);
  const shadowRef=useRef<ShadowRoot|null>(null);
  const preparedModules=useRef<Record<string,string>>({});
  const pendingAnchor=useRef("");

  const openModule=useCallback((id:number,anchor="")=>{
    setWorldPreview(null);
    setExternalLink(null);
    pendingAnchor.current=anchor;
    setLoadError(false);
    setActive(previous=>{
      if(previous===id&&anchor)setTimeout(()=>{if(shadowRef.current)scrollInside(shadowRef.current,anchor)},30);
      return id;
    });
    setQuery("");
    setNavMenu(null);
    setEquipmentSlot(null);
    setWeaponType(null);
    setSelectedMonsterId(null);
    history.replaceState(null,"",`#modulo-${id}${anchor||""}`);
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const openCatalog=useCallback((options:{id?:number;query?:string}={})=>{
    setWorldPreview(null);
    setExternalLink(null);
    setActive("items");
    setSelectedItemId(options.id??null);
    setCatalogQuery(options.query??"");
    setQuery("");
    setNavMenu(null);
    setEquipmentSlot(null);
    setWeaponType(null);
    setSelectedMonsterId(null);
    history.replaceState(null,"",options.id?`#objeto-${options.id}`:"#objetos");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const selectItem=useCallback((id:number)=>{
    setSelectedItemId(id);
    if(active==="equipment"&&equipmentSlot)history.replaceState(null,"",`#equipo-${equipmentSlot}-objeto-${id}`);
    else if(active==="weapons"&&weaponType)history.replaceState(null,"",`#arma-${weaponType}-objeto-${id}`);
    else history.replaceState(null,"",`#objeto-${id}`);
  },[active,equipmentSlot,weaponType]);

  const openMonster=useCallback((options:{id?:number;query?:string}={})=>{
    setWorldPreview(null);
    setExternalLink(null);
    setActive("monsters");
    setSelectedMonsterId(options.id??null);
    setMonsterQuery(options.query??"");
    setQuery("");
    setNavMenu(null);
    setEquipmentSlot(null);
    setWeaponType(null);
    history.replaceState(null,"",options.id?`#monstruo-${options.id}`:"#monstruos");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const selectMonster=useCallback((id:number)=>{
    setSelectedMonsterId(id);
    history.replaceState(null,"",`#monstruo-${id}`);
  },[]);

  const openWorld=useCallback((options:{kind?:WorldKind;id?:string;query?:string}={})=>{
    setWorldPreview(null);
    setExternalLink(null);
    setActive("world");
    setWorldSelection(options.kind&&options.id?{kind:options.kind,id:options.id}:null);
    setWorldQuery(options.query??"");
    setQuery("");
    setNavMenu(null);
    setEquipmentSlot(null);
    setWeaponType(null);
    setSelectedMonsterId(null);
    const prefix=options.kind==="map"?"mapa":options.kind==="npc"?"npc":options.kind==="reference"?"referencia":"mundo";
    history.replaceState(null,"",options.id?`#${prefix}-${options.id}`:"#mundo");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const selectWorld=useCallback((selection:WorldSelection)=>{
    setWorldSelection(selection);
    const prefix=selection.kind==="map"?"mapa":selection.kind==="npc"?"npc":"referencia";
    history.replaceState(null,"",`#${prefix}-${selection.id}`);
  },[]);

  const showLibrary=useCallback(()=>{
    setWorldPreview(null);
    setExternalLink(null);
    setActive(null);
    setQuery("");
    setNavMenu(null);
    setEquipmentSlot(null);
    setWeaponType(null);
    setSelectedMonsterId(null);
    history.replaceState(null,"","#inicio");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);

  const lang=useSyncExternalStore(subscribeLang,getLang,getServerLang);
  useEffect(()=>{document.documentElement.lang=lang},[lang]);
  const switchLang=useCallback((next:Lang)=>setLang(next),[]);
  const t=STRINGS[lang];

  const openNavMenu=useCallback((menu:NavMenu)=>{window.clearTimeout(navTimer.current);setNavMenu(menu)},[]);
  const closeNavMenu=useCallback(()=>{window.clearTimeout(navTimer.current);setNavMenu(null)},[]);

  useEffect(()=>{
    const close=(event:PointerEvent)=>{if(railRef.current&&!railRef.current.contains(event.target as Node))closeNavMenu()};
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")closeNavMenu()};
    document.addEventListener("pointerdown",close);
    document.addEventListener("keydown",escape);
    return()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",escape)};
  },[closeNavMenu]);

  const openWorldPreview=useCallback((selection:WorldSelection)=>{setExternalLink(null);setWorldPreview(selection)},[]);
  const openExternalLink=useCallback((destination:ExternalDestination)=>{setWorldPreview(null);setExternalLink(destination)},[]);
  const previewMonster=useCallback((id:number,name:string,maps:string[],mvp?:boolean)=>{setExternalLink(null);setWorldPreview(null);setMonsterSpawnPreview({id,name,mvp,maps})},[]);

  useEffect(()=>{
    const applyHash=()=>{
      const item=location.hash.match(/^#objeto-(\d+)$/),monster=location.hash.match(/^#monstruo-(\d+)$/),moduleMatch=location.hash.match(/^#modulo-(\d+)(#.*)?$/),world=location.hash.match(/^#(mapa|npc|referencia)-(.+)$/),equipment=location.hash.match(EQUIP_HASH),weapon=location.hash.match(WEAPON_HASH);
      if(item){setSelectedItemId(Number(item[1]));setEquipmentSlot(null);setWeaponType(null);setSelectedMonsterId(null);setActive("items")}
      else if(location.hash==="#objetos"){setSelectedItemId(null);setEquipmentSlot(null);setWeaponType(null);setSelectedMonsterId(null);setActive("items")}
      else if(equipment){setEquipmentSlot(equipment[1]);setWeaponType(null);setSelectedItemId(equipment[2]?Number(equipment[2]):null);setSelectedMonsterId(null);setActive("equipment")}
      else if(weapon){setWeaponType(weapon[1]);setEquipmentSlot(null);setSelectedItemId(weapon[2]?Number(weapon[2]):null);setSelectedMonsterId(null);setActive("weapons")}
      else if(monster){setSelectedMonsterId(Number(monster[1]));setEquipmentSlot(null);setWeaponType(null);setActive("monsters")}
      else if(location.hash==="#monstruos"){setSelectedMonsterId(null);setEquipmentSlot(null);setWeaponType(null);setActive("monsters")}
      else if(world){const kind:WorldKind=world[1]==="mapa"?"map":world[1]==="npc"?"npc":"reference";setWorldSelection({kind,id:world[2]});setEquipmentSlot(null);setWeaponType(null);setSelectedMonsterId(null);setActive("world")}
      else if(location.hash==="#mundo"){setWorldSelection(null);setEquipmentSlot(null);setWeaponType(null);setSelectedMonsterId(null);setActive("world")}
      else if(moduleMatch){pendingAnchor.current=moduleMatch[2]||"";setEquipmentSlot(null);setWeaponType(null);setSelectedMonsterId(null);setActive(Number(moduleMatch[1]))}
      else {setEquipmentSlot(null);setWeaponType(null);setSelectedMonsterId(null);setActive(null)}
    };
    applyHash();
    window.addEventListener("hashchange",applyHash);
    return()=>window.removeEventListener("hashchange",applyHash);
  },[]);

  useEffect(()=>{
    if(typeof active!=="number")return;
    const key=`${active}:${lang}`;
    if(moduleData[key])return;
    let live=true;
    const fetchModule=lang==="en"
      ?fetch(`/data/modules/module-${active}.en.html`).then(response=>{
          if(response.ok)return response.text().then(html=>({html,translated:true}));
          return fetch(`/data/modules/module-${active}.html`).then(fallback=>{if(!fallback.ok)throw new Error("module");return fallback.text()}).then(html=>({html,translated:false}));
        })
      :fetch(`/data/modules/module-${active}.html`).then(response=>{if(!response.ok)throw new Error("module");return response.text()}).then(html=>({html,translated:false}));
    Promise.all([fetchModule,loadModuleStyle()])
      .then(([{html,translated},style])=>{if(live)setModuleData(current=>({...current,[key]:{html,style,translated}}))})
      .catch(()=>{if(live)setLoadError(true)});
    return()=>{live=false};
  },[active,lang,moduleData]);

  useEffect(()=>{
    if(query.trim().length<2||searchIndex[lang])return;
    let live=true;
    const path=lang==="en"?"/data/guide-search.en.json":"/data/guide-search.json";
    fetch(path).then(response=>{if(!response.ok)throw new Error("search");return response.json()}).then(data=>{if(live)setSearchIndex(current=>({...current,[lang]:data}))}).catch(()=>{if(live)setSearchIndex(current=>({...current,[lang]:[]}))});
    return()=>{live=false};
  },[query,searchIndex,lang]);

  useEffect(()=>{
    if(!hostRef.current)return;
    shadowRef.current=hostRef.current.shadowRoot??hostRef.current.attachShadow({mode:"open"});
  },[active]);

  useEffect(()=>{
    const shadow=shadowRef.current;
    if(!shadow)return;
    if(typeof active!=="number"){shadow.innerHTML="";return}
    const key=`${active}:${lang}`;
    const entry=moduleData?.[key];
    if(!entry){shadow.innerHTML="";return}
    const prepared=preparedModules.current[key];
    if(prepared)shadow.innerHTML=prepared;
    else{
      shadow.innerHTML=`${entry.html}<style data-ascencion-theme>${entry.style}</style>`;
      prepareGuideNavigation(shadow,t.guide.exploreGuide);
      localizeItemLinks(shadow);
      localizeWorldLinks(shadow);
      preparedModules.current[key]=shadow.innerHTML;
    }
    bindModule(shadow,active,openModule,openCatalog,openMonster,openWorldPreview,openExternalLink);
    const anchor=pendingAnchor.current;
    pendingAnchor.current="";
    if(anchor)setTimeout(()=>scrollInside(shadow,anchor),80);
  },[active,lang,moduleData,openModule,openCatalog,openMonster,openWorldPreview,openExternalLink,t.guide.exploreGuide]);

  const results=useMemo(()=>{
    const term=query.trim();
    if(term.length<2)return[];
    const key=normalize(term);
    return (searchIndex[lang]??[]).filter(item=>normalize(`${item.title} ${item.text}`).includes(key)).slice(0,50);
  },[query,searchIndex,lang]);

  const selectedEquip=equipmentSlot?equipSlotById(equipmentSlot):undefined;
  const selectedWeapon=weaponType?weaponKindById(weaponType):undefined;

  return <main className={active===null?"portal portal-home":"portal"}>
    <div className="portal-backdrop" aria-hidden="true"/>
    <aside className="side-rail" ref={railRef}>
      <button className="brand" onClick={showLibrary} aria-label={t.goHome}><span className="brand-mark">A</span><span><b>AscencionRO</b><small>{t.tagline}</small></span></button>
      <nav className="side-rail-nav" aria-label="Navegación principal">
        <button className={active===null?"active":""} onClick={showLibrary}><RailIcon name="home"/>{t.nav.home}</button>
        <button className={active==="items"?"active":""} onClick={()=>openCatalog()}><RailIcon name="items"/>{t.nav.items}</button>
        <button className={active==="monsters"?"active":""} onClick={()=>openMonster()}><RailIcon name="monsters"/>{t.nav.monsters}</button>
        <button className={active==="world"?"active":""} onClick={()=>openWorld()}><RailIcon name="world"/>{t.nav.world}</button>
        <div className="rail-menu-wrap">
          <button className={typeof active==="number"?"active":""} aria-expanded={navMenu==="guides"} aria-controls="guide-menu" onClick={()=>navMenu==="guides"?closeNavMenu():openNavMenu("guides")}><RailIcon name="guides"/>{t.nav.guides}</button>
          {navMenu==="guides"&&<div className="rail-menu" id="guide-menu">
            <div className="rail-menu-intro"><b>{t.guidesMenu.title}</b><span>{t.guidesMenu.copy}</span></div>
            <div className="rail-menu-grid">{MODULES.map(topic=><button key={topic.id} className={active===topic.id?"active":""} onClick={()=>{closeNavMenu();openModule(topic.id)}}><span>{topic.icon}</span><span><b>{t.modules[topic.id-1].title}</b><small>{t.modules[topic.id-1].description}</small></span><i aria-hidden="true">→</i></button>)}</div>
          </div>}
        </div>
      </nav>
    </aside>
    <header className="site-header" ref={headerRef}>
      <div className="nav-shell">
        <div className="search-wrap">
          <div className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search.placeholder} aria-label={t.search.aria}/>{query&&<button onClick={()=>setQuery("")} aria-label={t.search.clear}>×</button>}</div>
          {query.trim().length>=2&&<div className="search-panel"><button className="search-result catalog-search-result" onClick={()=>openCatalog({query})}><b>◆ {t.search.inItems(query)}</b><small>{t.search.inItemsHint}</small></button><button className="search-result monster-search-result" onClick={()=>openMonster({query})}><b>♜ {t.search.inMonsters(query)}</b><small>{t.search.inItemsHint}</small></button><button className="search-result world-search-result" onClick={()=>openWorld({query})}><b>⌖ {t.search.inWorld(query)}</b><small>{t.search.inWorldHint}</small></button><div className="search-label">{searchIndex===null?t.search.searching:results.length?t.search.results(results.length):t.search.empty}</div>{results.map((r,i)=><button className="search-result" key={`${r.module}-${r.anchor}-${i}`} onClick={()=>openModule(r.module,r.anchor)}><b>{r.icon} {cleanUserText(r.title)}</b><small>{t.modules[r.module-1]?.title} · {cleanUserText(excerpt(r.text,query))}</small></button>)}</div>}
        </div>
        <div className="lang-switch" role="group" aria-label={t.langSwitch.label}>
          <button type="button" className={lang==="es"?"active":""} aria-pressed={lang==="es"} onClick={()=>switchLang("es")} title={t.langSwitch.toEs} lang="es">ES</button>
          <button type="button" className={lang==="en"?"active":""} aria-pressed={lang==="en"} onClick={()=>switchLang("en")} title={t.langSwitch.toEn} lang="en">EN</button>
        </div>
      </div>
    </header>
    <section className="workspace">
      <div className="content">
        {active===null&&<Library openModule={openModule} t={t}/>}
        {active==="items"&&<Suspense fallback={<SurfaceLoading label={t.loading.items}/>}><ItemCatalog key={`items-${catalogQuery}`} selectedItemId={selectedItemId} initialQuery={catalogQuery} onSelectItem={selectItem} onOpenMonster={openMonster} onPreviewMonster={previewMonster} t={t}/></Suspense>}
        {active==="equipment"&&selectedEquip&&<Suspense fallback={<SurfaceLoading label={t.loading.items}/>}><ItemCatalog key={`equipo-${selectedEquip.id}`} selectedItemId={selectedItemId} initialQuery="" onSelectItem={selectItem} onOpenMonster={openMonster} onPreviewMonster={previewMonster} t={t} scope={{kind:"slot",location:selectedEquip.location,eyebrow:"Equipo",title:selectedEquip.title,description:selectedEquip.description}}/></Suspense>}
        {active==="weapons"&&selectedWeapon&&<Suspense fallback={<SurfaceLoading label={t.loading.items}/>}><ItemCatalog key={`arma-${selectedWeapon.id}`} selectedItemId={selectedItemId} initialQuery="" onSelectItem={selectItem} onOpenMonster={openMonster} onPreviewMonster={previewMonster} t={t} scope={{kind:"weapon",subType:selectedWeapon.subType,eyebrow:"Armas",title:selectedWeapon.title,description:`Todas las armas de tipo ${selectedWeapon.title.toLowerCase()}. Las fichas se abren aquí mismo.`}}/></Suspense>}
        {active==="monsters"&&<Suspense fallback={<SurfaceLoading label={t.loading.monsters}/>}><MonsterCatalog key={`monsters-${monsterQuery}`} selectedMonsterId={selectedMonsterId} initialQuery={monsterQuery} onSelectMonster={selectMonster} onOpenItem={id=>openCatalog({id})} onPreviewMonster={previewMonster} t={t}/></Suspense>}
        {active==="world"&&<Suspense fallback={<SurfaceLoading label={t.loading.world}/>}><WorldCatalog key={worldQuery} selection={worldSelection} initialQuery={worldQuery} onSelect={selectWorld} t={t}/></Suspense>}
        {typeof active==="number"&&<section className="module-view">{lang==="en"&&!moduleData[`${active}:${lang}`]?.translated&&<div className="guide-notice"><b>{t.guideNotice.title}</b><span>{t.guideNotice.copy}</span></div>}{loadError?<div className="fatal"><h2>{t.guide.loadError}</h2><p>{t.guide.retry}</p></div>:!moduleData[`${active}:${lang}`]?<div className="module-loading"><div className="loader"/><p>{t.guide.preparing}</p></div>:null}<div ref={hostRef} className="shadow-host"/></section>}
      </div>
    </section>
    {worldPreview&&<Suspense fallback={<ModalShell eyebrow={t.world.dialogEyebrow} title={t.world.dialogTitle} onClose={()=>setWorldPreview(null)}><div className="world-dialog-message"><div className="loader"/><span>{t.world.searching}</span></div></ModalShell>}><WorldReferenceDialog key={`${worldPreview.kind}-${worldPreview.id}`} selection={worldPreview} onClose={()=>setWorldPreview(null)} t={t}/></Suspense>}
    {monsterSpawnPreview&&<Suspense fallback={<ModalShell eyebrow={t.world.dialogEyebrow} title={t.world.dialogTitle} onClose={()=>setMonsterSpawnPreview(null)}><div className="world-dialog-message"><div className="loader"/><span>{t.world.searching}</span></div></ModalShell>}><MonsterSpawnDialog key={`spawn-${monsterSpawnPreview.id}`} monsterId={monsterSpawnPreview.id} monsterName={monsterSpawnPreview.name} mvp={monsterSpawnPreview.mvp} maps={monsterSpawnPreview.maps} onClose={()=>setMonsterSpawnPreview(null)} t={t}/></Suspense>}
    {externalLink&&<ExternalLinkDialog destination={externalLink} onClose={()=>setExternalLink(null)}/>}
    <NeonCursor/>
  </main>;
}

function SurfaceLoading({label}:{label:string}){return <div className="catalog-loading"><div className="loader"/><p>{label}</p></div>}

const RAIL_ICONS:Record<string,ReactNode>={
  home:<><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
  items:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  monsters:<><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/><circle cx="12" cy="8" r="4"/></>,
  world:<><path d="M9 20l-6-3V4l6 3 6-3 6 3v13l-6-3-6 3z"/><path d="M9 4v13"/><path d="M15 7v13"/></>,
  guides:<><path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
};

function RailIcon({name}:{name:keyof typeof RAIL_ICONS}){
  return <svg viewBox="0 0 24 24" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">{RAIL_ICONS[name]}</svg>;
}

function ExternalLinkDialog({destination,onClose}:{destination:ExternalDestination;onClose:()=>void}){
  let host="sitio externo";
  try{host=new URL(destination.href).hostname.replace(/^www\./,"")}catch{/* El destino ya fue validado al crear el enlace. */}
  return <ModalShell eyebrow="Recurso externo" title="Este contenido está fuera de AscencionRO" className="external-dialog" onClose={onClose}>
    <div className="external-link-card"><span className="external-link-sigil" aria-hidden="true">↗</span><div><h2>{destination.label||"Abrir recurso complementario"}</h2><code>{host}</code><p>{t.guide.externalCopy}</p></div><div className="external-link-actions"><button onClick={onClose}>{t.guide.back}</button><a href={destination.href} target="_blank" rel="noopener noreferrer" onClick={onClose}>{t.guide.proceed} <span>↗</span></a></div></div>
  </ModalShell>;
}

function NeonCursor(){
  const cursorRef=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    const cursor=cursorRef.current,media=window.matchMedia("(pointer:fine)");
    if(!cursor||!media.matches)return;
    const root=document.documentElement;
    let frame=0,x=-60,y=-60,interactive=false;
    const paint=()=>{cursor.style.setProperty("--cursor-x",`${x}px`);cursor.style.setProperty("--cursor-y",`${y}px`);cursor.classList.toggle("is-interactive",interactive);cursor.classList.add("is-visible");frame=0};
    const move=(event:PointerEvent)=>{x=event.clientX;y=event.clientY;interactive=event.composedPath().some(node=>node instanceof Element&&node.matches('a,button,summary,input,select,textarea,label,[role="button"]'));if(!frame)frame=requestAnimationFrame(paint)};
    const down=()=>cursor.classList.add("is-pressed"),up=()=>cursor.classList.remove("is-pressed"),hide=()=>cursor.classList.remove("is-visible");
    root.classList.add("cursor-neon-active");
    document.addEventListener("pointermove",move,{passive:true});document.addEventListener("pointerdown",down,{passive:true});document.addEventListener("pointerup",up,{passive:true});root.addEventListener("pointerleave",hide);window.addEventListener("blur",hide);
    return()=>{root.classList.remove("cursor-neon-active");document.removeEventListener("pointermove",move);document.removeEventListener("pointerdown",down);document.removeEventListener("pointerup",up);root.removeEventListener("pointerleave",hide);window.removeEventListener("blur",hide);if(frame)cancelAnimationFrame(frame)};
  },[]);
  return <span ref={cursorRef} className="neon-cursor" aria-hidden="true"/>;
}

function Library({openModule,t}:{openModule:(id:number)=>void;t:Dict}){
  return <section className="library">
    <div className="server-banner"><span className="mark">A</span><div><h1>AscencionRO</h1><p>{t.tagline}</p></div></div>
    <div className="section-title"><div><h2>{t.library.byTopic}</h2></div></div>
    <div className="module-grid">{MODULES.map(topic=><button className="module-card" key={topic.id} style={{"--tint":MODULE_TINTS[topic.id-1]} as CSSProperties} onClick={()=>openModule(topic.id)}><span className="card-icon">{topic.icon}</span><span className="card-open">{t.library.open}<b>→</b></span><span className="card-copy"><h3>{t.modules[topic.id-1].title}</h3><p>{t.modules[topic.id-1].description}</p></span></button>)}</div>
  </section>
}

function prepareGuideNavigation(shadow:ShadowRoot,exploreLabel:string){
  const navigation=shadow.querySelector<HTMLElement>("nav");
  if(!navigation||navigation.closest(".section-navigation"))return;
  const menu=document.createElement("details");
  const summary=document.createElement("summary");
  menu.className="section-navigation";
  summary.textContent=exploreLabel;
  navigation.classList.add("section-navigation-links");
  navigation.replaceWith(menu);
  menu.append(summary,navigation);
}

function openDetailsTo(element:HTMLElement){let current:HTMLElement|null=element;while(current){if(current.tagName==="DETAILS")(current as HTMLDetailsElement).open=true;current=current.parentElement}}
function scrollInside(shadow:ShadowRoot,anchor:string){const el=shadow.getElementById(anchor.replace(/^#/,""));if(el){openDetailsTo(el);setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),30)}}

function localizeItemLinks(shadow:ShadowRoot){
  shadow.querySelectorAll<HTMLAnchorElement>('a[href^="#item-"]').forEach(link=>{
    const id=(link.getAttribute("href")||"").match(/^#item-(\d+)$/)?.[1];
    if(id)setLocalLink(link,`#objeto-${id}`,`Abrir ficha local del objeto #${id}`);
  });
  shadow.querySelectorAll<HTMLAnchorElement>('a[href*="ratemyserver.net"][href*="item_id="]').forEach(link=>{
    const id=(link.getAttribute("href")||"").match(/[?&]item_id=(\d+)/)?.[1];
    if(!id)return;
    setLocalLink(link,`#objeto-${id}`,`Abrir ficha local del objeto #${id}`);
    link.dataset.localItem=id;
  });
}

function setLocalLink(link:HTMLAnchorElement,href:string,title:string){link.setAttribute("href",href);link.title=title;link.removeAttribute("target");link.removeAttribute("rel");delete link.dataset.external}

function worldSlug(value:string){return normalize(value).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function localizeWorldLinks(shadow:ShadowRoot){
  shadow.querySelectorAll<HTMLAnchorElement>('a[href*="ratemyserver.net"]').forEach(link=>{
    const href=(link.getAttribute("href")||"").replaceAll("&amp;","&");
    try{
      const url=new URL(href),map=url.searchParams.get("map")||(url.searchParams.get("area")?`area-${url.searchParams.get("area")}`:null),monster=url.searchParams.get("mob_id");
      if(map){setLocalLink(link,`#mapa-${map}`,`Abrir ubicación local: ${map}`);link.dataset.localWorld="map"}
      else if(monster){setLocalLink(link,`#monstruo-${monster}`,`Abrir ficha local del monstruo #${monster}`);link.dataset.localWorld="monster"}
    }catch{return}
  });
  const npcLinks=[...shadow.querySelectorAll<HTMLAnchorElement>("a.npclink")];
  const directNpcMaps=new WeakMap<HTMLAnchorElement,string>(),mapsByName=new Map<string,Set<string>>();
  for(const link of npcLinks){
    const wrapper=link.closest(".npcref")??link.closest("tr")??link.closest("p")??link.parentElement,mapLink=wrapper?.querySelector<HTMLAnchorElement>("a.maplink"),mapHref=mapLink?.getAttribute("href")||"";
    const map=mapHref.match(/[?&]map=([^&]+)/)?.[1]||mapHref.match(/^#mapa-(.+)$/)?.[1]||"";
    if(!map)continue;
    directNpcMaps.set(link,map);
    const name=worldSlug(link.textContent||"npc"),known=mapsByName.get(name)??new Set<string>();
    known.add(map);mapsByName.set(name,known);
  }
  npcLinks.forEach(link=>{
    const name=worldSlug(link.textContent||"npc"),known=mapsByName.get(name),map=directNpcMaps.get(link)||(known?.size===1?[...known][0]:"");
    if(!map)return;
    const id=`${name}-${map}`;
    setLocalLink(link,`#npc-${id}`,"Abrir ficha local del NPC");
    link.dataset.localWorld="npc";
    const point=(link.closest(".npcref")??link.closest("tr")??link.closest("p")??link.parentElement)?.querySelector<HTMLAnchorElement>("a.maplink")?.textContent?.match(/(?:^|\D)(\d{1,3})\s*,\s*(\d{1,3})(?:\D|$)/);
    if(point){link.dataset.worldX=point[1];link.dataset.worldY=point[2]}
  });
  shadow.querySelectorAll<HTMLAnchorElement>('a[href*="irowiki.org/classic/"]').forEach(link=>{
    try{
      const url=new URL((link.getAttribute("href")||"").replaceAll("&amp;","&"));
      const raw=url.pathname.split("/").filter(Boolean).at(-1)||"referencia";
      let name=raw;
      try{name=decodeURIComponent(raw)}catch{/* La ruta ya está en texto utilizable. */}
      const id=worldSlug(name.replaceAll("_"," "))||"referencia";
      setLocalLink(link,`#referencia-${id}`,`Abrir referencia local: ${name.replaceAll("_"," ")}`);
      link.dataset.localWorld="reference";
    }catch{return}
  });
}

function bindModule(shadow:ShadowRoot,module:number,openModule:(id:number,anchor?:string)=>void,openCatalog:(options?:{id?:number;query?:string})=>void,openMonster:(options?:{id?:number;query?:string})=>void,openWorldReference:(selection:WorldSelection)=>void,openExternalLink:(destination:ExternalDestination)=>void){
  const boundShadow=shadow as ShadowRoot&{_portalClickHandler?:EventListener};
  if(boundShadow._portalClickHandler)boundShadow.removeEventListener("click",boundShadow._portalClickHandler);
  const handleClick:EventListener=(rawEvent)=>{
    const event=rawEvent as MouseEvent;
    const target=event.target as HTMLElement;
    const portal=target.closest<HTMLElement>("[data-portal-module]");
    if(portal){event.preventDefault();openModule(Number(portal.dataset.portalModule),portal.dataset.portalAnchor||"");return}
    const link=target.closest<HTMLAnchorElement>("a[href]");
    if(link){
      const sectionMenu=link.closest<HTMLDetailsElement>(".section-navigation");
      if(sectionMenu)sectionMenu.open=false;
      const href=link.getAttribute("href")||"";
      const localItem=href.match(/^#objeto-(\d+)$/);
      if(localItem){event.preventDefault();openCatalog({id:Number(localItem[1])});return}
      const localMonster=href.match(/^#monstruo-(\d+)$/);
      if(localMonster){event.preventDefault();openMonster({id:Number(localMonster[1])});return}
      const localWorld=href.match(/^#(mapa|npc|referencia)-(.+)$/);
      if(localWorld){event.preventDefault();const kind:WorldKind=localWorld[1]==="mapa"?"map":localWorld[1]==="npc"?"npc":"reference";const x=Number(link.dataset.worldX),y=Number(link.dataset.worldY),point=kind==="npc"&&Number.isFinite(x)&&Number.isFinite(y)?{x,y}:undefined;openWorldReference({kind,id:localWorld[2],point});return}
      const crossModule=href.match(/^#module-(\d+)(#.*)?$/);
      if(crossModule){event.preventDefault();openModule(Number(crossModule[1]),crossModule[2]||"");return}
      if(href.startsWith("#")){event.preventDefault();scrollInside(shadow,href);return}
      if(/^https?:\/\//i.test(href)){event.preventDefault();openExternalLink({href,label:cleanUserText(link.textContent||"Recurso complementario")});return}
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
