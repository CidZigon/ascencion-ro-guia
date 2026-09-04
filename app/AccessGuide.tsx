"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ACCESS_GUIDE, type AccessQuest, type AccessSegment, type AccessZone } from "./data/accessGuideContent";
import type { ExternalDestination } from "./GuidePortal";
import { MapLink, MobButton, NpcLink, parseCoords, REPORT_LABEL } from "./guideShared";
import type { Dict, Lang } from "./i18n";
import { ReportIssueLink } from "./report-issue";
import { loadWorld, type WorldSelection } from "./WorldCatalog";

const LEVEL_BANDS = [
  { id: "1-59", label: { es: "1–59 / sin mínimo", en: "1–59 / no minimum" }, min: 1, max: 59 },
  { id: "60-69", label: { es: "60–69", en: "60–69" }, min: 60, max: 69 },
  { id: "70-79", label: { es: "70–79", en: "70–79" }, min: 70, max: 79 },
  { id: "80+", label: { es: "80+", en: "80+" }, min: 80, max: Infinity },
];

const KIND_TAG: Record<string, string> = {
  server: "Implementación del servidor",
  ep13: "Episodio 13.1–13.2",
};

// "Detardeurus / Detale" y variantes de grafía no siempre coinciden con el
// nombre exacto del bestiario (generado desde mob_db.yml de rAthena, que usa
// su propia romanización); esta lista sólo cubre los casos donde el nombre
// documentado difiere del real y no simplemente separa dos formas del mismo MVP.
const MVP_NAME_ALIASES: Record<string, string> = {
  "nidhoggur's shadow": "nidhoggr's shadow",
};

let monsterNameIndexPromise: Promise<Map<string, number>> | null = null;
function loadMonsterNameIndex() {
  monsterNameIndexPromise ??= fetch("/data/monsters-index.json")
    .then(response => { if (!response.ok) throw new Error("monsters"); return response.json(); })
    .then((data: { items: { id: number; name: string }[] }) => new Map(data.items.map(item => [item.name.toLowerCase(), item.id])));
  return monsterNameIndexPromise;
}

type Callbacks = { onOpenMonster: (options: { id: number }) => void; onOpenWorld: (selection: WorldSelection) => void; onOpenExternal: (destination: ExternalDestination) => void };

export function AccessGuide({ lang, t, onOpenMonster, onOpenWorld, onOpenExternal }: Callbacks & { lang: Lang; t: Dict }) {
  const [levelBand, setLevelBand] = useState<string | null>(null);
  const [npcSprites, setNpcSprites] = useState<Map<string, string>>(new Map());
  const [mvpIndex, setMvpIndex] = useState<Map<string, number>>(new Map());
  const [highlight, setHighlight] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const questRefs = useRef<Map<string, HTMLDetailsElement>>(new Map());
  const backStack = useRef<number[]>([]);

  useEffect(() => {
    let live = true;
    loadWorld().then(payload => { if (live) setNpcSprites(new Map(payload.npcs.filter(npc => npc.sprite).map(npc => [npc.id, npc.sprite as string]))); }).catch(() => { /* Sin sprites, los links locales igual funcionan. */ });
    loadMonsterNameIndex().then(index => { if (live) setMvpIndex(index); }).catch(() => { /* Sin catálogo, los nombres de MVP quedan en texto plano. */ });
    return () => { live = false; };
  }, []);

  const band = levelBand ? LEVEL_BANDS.find(entry => entry.id === levelBand) : undefined;
  const inLevel = (minLevel: number) => !band || (minLevel >= band.min && minLevel <= band.max);

  const registerQuest = (id: string) => (el: HTMLDetailsElement | null) => {
    if (el) questRefs.current.set(id, el);
    else questRefs.current.delete(id);
  };

  // El scroll real ocurre dentro de <section class="workspace"> (overflow-y:auto
  // en globals.css), no en window — a diferencia de scrollIntoView (que ya
  // encuentra el contenedor correcto solo), guardar/restaurar una posición
  // exacta sí necesita apuntar a ese contenedor explícitamente.
  const jumpToQuest = (id: string) => {
    const el = questRefs.current.get(id);
    const workspace = document.querySelector<HTMLElement>(".workspace");
    if (!el) return;
    backStack.current.push(workspace?.scrollTop ?? window.scrollY);
    setShowBack(true);
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlight(id);
    window.setTimeout(() => setHighlight(current => (current === id ? null : current)), 1500);
  };

  const goBack = () => {
    const y = backStack.current.pop();
    if (y !== undefined) {
      const workspace = document.querySelector<HTMLElement>(".workspace");
      if (workspace) workspace.scrollTo({ top: y, behavior: "smooth" });
      else window.scrollTo({ top: y, behavior: "smooth" });
    }
    if (backStack.current.length === 0) setShowBack(false);
  };

  const resolveMvpName = (name: string) => mvpIndex.get(name.toLowerCase()) ?? mvpIndex.get(MVP_NAME_ALIASES[name.toLowerCase()] ?? "");

  return <section className="exp-guide access-guide">
    <div className="server-banner exp-hero">
      <span className="mark">🧭</span>
      <div><h1>{t.access.title}</h1><p>{t.access.tagline}</p><div className="exp-badges">{t.access.badges.map(badge => <span key={badge} className="filter-chip slim">{badge}</span>)}</div></div>
    </div>

    {lang === "en" && <div className="guide-notice"><b>{t.guideNotice.title}</b><span>{t.guideNotice.copy}</span></div>}

    <nav className="exp-nav">
      {ACCESS_GUIDE.zones.map(zone => <button key={zone.id} type="button" onClick={() => document.getElementById(zone.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>{zone.icon} {zone.title.split(":")[0].split(",")[0]}</button>)}
    </nav>

    <div className="exp-panel">
      <strong>{t.access.introTitle}</strong>
      <p>{t.access.introCopy}</p>
    </div>

    <div className="exp-level-toolbar">
      <span className="filter-label">{t.access.allLevels}</span>
      <div className="chip-set">{LEVEL_BANDS.map(entry => <button key={entry.id} type="button" className={levelBand === entry.id ? "filter-chip active" : "filter-chip"} aria-pressed={levelBand === entry.id} onClick={() => setLevelBand(current => (current === entry.id ? null : entry.id))}>{entry.label[lang === "en" ? "en" : "es"]}</button>)}</div>
      {levelBand !== null && <button type="button" className="clear-filters" onClick={() => setLevelBand(null)}>{t.access.clearFilters}</button>}
    </div>

    <section id="mvp-audit" className="exp-section">
      <div className="section-title"><div><h2>{t.access.mvpTitle}</h2></div></div>
      <div className="access-mvp-grid">{ACCESS_GUIDE.mvpItems.map(item => {
        const id = resolveMvpName(item.name);
        return <div key={item.questId + item.name} className="access-mvp-item">
          {id !== undefined ? <MobButton mob={{ id, name: item.name }} onOpenMonster={onOpenMonster} /> : <b>{item.name}</b>}
          <button type="button" className="exp-inline-link" onClick={() => jumpToQuest(item.questId)}>{item.questLabel}</button>
          <span className="filter-chip slim">{item.tag}</span>
        </div>;
      })}</div>
      <p className="exp-small">{ACCESS_GUIDE.mvpFooterNote}</p>
    </section>

    {ACCESS_GUIDE.zones.map(zone => <AccessZoneSection key={zone.id} zone={zone} lang={lang} inLevel={inLevel} npcSprites={npcSprites} registerQuest={registerQuest} highlight={highlight} onJumpToQuest={jumpToQuest} onOpenWorld={onOpenWorld} onOpenExternal={onOpenExternal} onOpenMonster={onOpenMonster} resolveMvpName={resolveMvpName} />)}

    {showBack && <button type="button" className="access-back-btn" onClick={goBack}>{t.access.backButton}</button>}

    <ReportIssueLink kind="Guía" id={2} name={t.access.title} label={REPORT_LABEL[lang === "en" ? "en" : "es"]} />
  </section>;
}

function AccessZoneSection({ zone, lang, inLevel, npcSprites, registerQuest, highlight, onJumpToQuest, onOpenWorld, onOpenExternal, onOpenMonster, resolveMvpName }: {
  zone: AccessZone; lang: Lang; inLevel: (minLevel: number) => boolean; npcSprites: Map<string, string>;
  registerQuest: (id: string) => (el: HTMLDetailsElement | null) => void; highlight: string | null; onJumpToQuest: (id: string) => void;
  onOpenWorld: (selection: WorldSelection) => void; onOpenExternal: (destination: ExternalDestination) => void; onOpenMonster: (options: { id: number }) => void;
  resolveMvpName: (name: string) => number | undefined;
}) {
  const quests = useMemo(() => zone.quests.filter(quest => inLevel(quest.minLevel)), [zone, inLevel]);
  return <section id={zone.id} className="exp-section">
    <div className="exp-panel access-zone-head">
      <div className="eyebrow">Ruta por zona</div>
      <h2>{zone.icon} {zone.title}</h2>
      <p>{zone.goal}</p>
      <div className="access-routebar">{zone.route.map((id, index) => <span key={id} className="access-route-node">
        {index > 0 && <span className="access-route-arrow">→</span>}
        <button type="button" className="exp-inline-link" onClick={() => onJumpToQuest(id)}>{zone.quests.find(quest => quest.id === id)?.title ?? id}</button>
      </span>)}</div>
    </div>
    {quests.map(quest => <AccessQuestCard key={quest.id} quest={quest} lang={lang} npcSprites={npcSprites} registerQuest={registerQuest} highlighted={highlight === quest.id} onJumpToQuest={onJumpToQuest} onOpenWorld={onOpenWorld} onOpenExternal={onOpenExternal} onOpenMonster={onOpenMonster} resolveMvpName={resolveMvpName} />)}
    {!quests.length && <p className="exp-empty">—</p>}
  </section>;
}

function AccessQuestCard({ quest, lang, npcSprites, registerQuest, highlighted, onJumpToQuest, onOpenWorld, onOpenExternal, onOpenMonster, resolveMvpName }: {
  quest: AccessQuest; lang: Lang; npcSprites: Map<string, string>; registerQuest: (id: string) => (el: HTMLDetailsElement | null) => void;
  highlighted: boolean; onJumpToQuest: (id: string) => void; onOpenWorld: (selection: WorldSelection) => void;
  onOpenExternal: (destination: ExternalDestination) => void; onOpenMonster: (options: { id: number }) => void; resolveMvpName: (name: string) => number | undefined;
}) {
  const openSource = (href: string, label: string) => (event: React.MouseEvent) => { event.preventDefault(); onOpenExternal({ href, label }); };
  return <details ref={registerQuest(quest.id)} id={quest.id} className={highlighted ? "exp-quest access-quest highlight" : "exp-quest access-quest"}>
    <summary>
      <div className="exp-quest-head">
        <div>
          <b className="exp-quest-title"><span className="access-quest-no">{quest.questNo}</span>{quest.title}</b>
          <div className="exp-quest-badges">{quest.badges.map(badge => <span key={badge} className="filter-chip slim">{badge}</span>)}{KIND_TAG[quest.kind] && <span className="filter-chip slim access-kind-tag">{KIND_TAG[quest.kind]}</span>}</div>
        </div>
      </div>
    </summary>
    <div className="exp-quest-body">
      <p><b>Inicio:</b> <RichLine segments={quest.intro} lang={lang} npcSprites={npcSprites} onOpenWorld={onOpenWorld} onJumpToQuest={onJumpToQuest} /></p>
      <p><b>Materiales/costo:</b> {quest.materials}</p>
      {quest.unlock.length > 0 && <div className="access-unlock-line">{quest.unlock.map(item => <span key={item} className="filter-chip slim">{item}</span>)}</div>}
      {quest.mvp && <p className="access-mvp-line">👑 <b>MVP desbloqueado / alcanzable:</b> <MvpNames text={quest.mvp} resolveMvpName={resolveMvpName} onOpenMonster={onOpenMonster} /></p>}
      {quest.notice && <div className="access-notice"><strong>⚠️ Atención:</strong> {quest.notice}</div>}
      {quest.note && <p className="access-note"><RichLine segments={quest.note} lang={lang} npcSprites={npcSprites} onOpenWorld={onOpenWorld} onJumpToQuest={onJumpToQuest} /></p>}
      <ol>{quest.steps.map((step, index) => <li key={index}><RichLine segments={step} lang={lang} npcSprites={npcSprites} onOpenWorld={onOpenWorld} onJumpToQuest={onJumpToQuest} /></li>)}</ol>
      {quest.sourceHref && <a className="exp-source-link" href={quest.sourceHref} onClick={openSource(quest.sourceHref, "Guía completa en iRO Wiki Classic")}>Guía completa en iRO Wiki Classic ↗</a>}
    </div>
  </details>;
}

function RichLine({ segments, lang, npcSprites, onOpenWorld, onJumpToQuest }: { segments: AccessSegment[]; lang: Lang; npcSprites: Map<string, string>; onOpenWorld: (selection: WorldSelection) => void; onJumpToQuest: (id: string) => void }) {
  return <>{segments.map((segment, index) => {
    if (segment.type === "text") return <span key={index}>{segment.text} </span>;
    if (segment.type === "bold") return <b key={index}>{segment.text} </b>;
    if (segment.type === "npc") return <span key={index}><NpcLink name={segment.name} map={segment.map} coords={segment.mapLabel ? parseCoords(segment.mapLabel) : null} sprites={npcSprites} lang={lang} onOpenWorld={onOpenWorld} /> </span>;
    if (segment.type === "map") return <span key={index}><MapLink map={segment.map} label={segment.label} coords={parseCoords(segment.label)} lang={lang} onOpenWorld={onOpenWorld} /> </span>;
    return <button key={index} type="button" className="quest-ref-link" onClick={() => onJumpToQuest(segment.id)}>{segment.label}</button>;
  })}</>;
}

function MvpNames({ text, resolveMvpName, onOpenMonster }: { text: string; resolveMvpName: (name: string) => number | undefined; onOpenMonster: (options: { id: number }) => void }) {
  const names = text.split(/\s*[·/]\s*/);
  return <>{names.map((name, index) => {
    const id = resolveMvpName(name);
    return <span key={index}>{index > 0 && " · "}{id !== undefined ? <button type="button" className="exp-inline-link" onClick={() => onOpenMonster({ id })}>{name}</button> : name}</span>;
  })}</>;
}
