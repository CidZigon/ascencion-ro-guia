const modules = [
  { n: "01", icon: "✦", title: "Progresión & EXP", text: "Rutas de leveo, cacerías y quests que realmente valen tu tiempo.", tag: "Empieza aquí" },
  { n: "02", icon: "◇", title: "Accesos & Dungeons", text: "Prerrequisitos, NPC, coordenadas y orden para desbloquear contenido.", tag: "Exploración" },
  { n: "03", icon: "♜", title: "Historias & Lore", text: "El mundo, sus conflictos y las cadenas narrativas más importantes.", tag: "Historia" },
  { n: "04", icon: "⌁", title: "Regional & Standalone", text: "Aventuras independientes organizadas por región y dificultad.", tag: "Quests" },
  { n: "05", icon: "⚔", title: "Jobs & Platinum Skills", text: "Cambios de clase y habilidades especiales, paso a paso.", tag: "Clases" },
  { n: "06", icon: "◆", title: "Equipment & Crafting", text: "Equipo, materiales, refinamiento y fabricación sin perder zeny.", tag: "Progreso" },
  { n: "07", icon: "♛", title: "Endless Tower", text: "Preparación, pisos, MVP y estrategia para llegar más alto.", tag: "Endgame" },
  { n: "08", icon: "♧", title: "Compañeros", text: "Pets, homúnculos y mercenarios con datos Pre-Renewal.", tag: "Sistemas" },
];

const paths = [
  { step: "01", title: "Conoce lo esencial", text: "Empieza con progresión y EXP. Define tu ruta de niveles y evita gastar recursos antes de tiempo.", href: "#modulos" },
  { step: "02", title: "Elige tu camino", text: "Revisa jobs, platinum skills y equipo para tomar decisiones que acompañen tu estilo de juego.", href: "/guia-completa.html" },
  { step: "03", title: "Abre el mundo", text: "Completa accesos y quests regionales; guarda coordenadas y prerrequisitos mientras avanzas.", href: "/guia-completa.html" },
];

export default function Home() {
  return (
    <main>
      <nav className="topbar" aria-label="Navegación principal">
        <a className="brand" href="#inicio" aria-label="Barras Ro, inicio">
          <span className="brand-mark">B</span><span><b>BARRAS</b><small>RAGNAROK ONLINE</small></span>
        </a>
        <div className="navlinks"><a href="#primeros-pasos">Primeros pasos</a><a href="#modulos">Guías</a><a href="#acerca">El servidor</a></div>
        <a className="nav-cta" href="/guia-completa.html">Abrir guía <span>↗</span></a>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
        <div className="hero-copy">
          <span className="eyebrow"><i/> GUÍA OFICIAL · PRE-RENEWAL</span>
          <h1>Tu aventura<br/>empieza <em>aquí.</em></h1>
          <p>Todo lo que necesitas para comenzar, progresar y dominar el mundo de <strong>Barras Ro</strong>, explicado de forma clara y en español.</p>
          <div className="hero-actions">
            <a className="button primary" href="#primeros-pasos">Comenzar mi aventura <span>→</span></a>
            <a className="button ghost" href="/guia-completa.html">Explorar la guía</a>
          </div>
          <div className="trust"><span>✦</span><p><b>8 módulos completos</b><small>Contenido hasta el episodio 13.2</small></p><span>◆</span><p><b>Datos verificados</b><small>Coordenadas, requisitos y rutas</small></p></div>
        </div>
        <div className="hero-art" aria-label="Portal estilizado de Barras Ro">
          <div className="moon"><span className="rune r1">✦</span><span className="rune r2">◇</span><span className="rune r3">⌁</span><div className="portal"><span>BR</span></div></div>
          <div className="land land-left"/><div className="land land-right"/><div className="crystal c1"/><div className="crystal c2"/>
          <div className="float-card fc-one"><span>⚔</span><p><b>Elige tu Job</b><small>Clases y habilidades</small></p></div>
          <div className="float-card fc-two"><span>♜</span><p><b>Explora Midgard</b><small>Quests y dungeons</small></p></div>
        </div>
        <a className="scroll" href="#primeros-pasos"><span>↓</span> DESCUBRE MÁS</a>
      </section>

      <section className="starter" id="primeros-pasos">
        <div className="section-heading"><span className="kicker">NUEVO EN BARRAS RO</span><h2>Una ruta clara para empezar</h2><p>No necesitas saberlo todo desde el primer día. Sigue estos tres pasos y deja que la aventura haga el resto.</p></div>
        <div className="path-grid">{paths.map((item, i) => <a className="path-card" href={item.href} key={item.step}><span className="path-step">PASO {item.step}</span><div className="path-icon">{["✦","⚔","◇"][i]}</div><h3>{item.title}</h3><p>{item.text}</p><b>VER RECOMENDACIONES <span>→</span></b></a>)}</div>
      </section>

      <section className="guide" id="modulos">
        <div className="guide-head"><div><span className="kicker">ENCICLOPEDIA BARRAS RO</span><h2>Todo Midgard, en un solo lugar</h2></div><a href="/guia-completa.html">Ver guía completa <span>↗</span></a></div>
        <div className="module-grid">{modules.map((m) => <a className="module-card" href="/guia-completa.html" key={m.n}><div className="module-top"><span className="module-number">{m.n}</span><span className="module-tag">{m.tag}</span></div><span className="module-icon">{m.icon}</span><h3>{m.title}</h3><p>{m.text}</p><span className="module-arrow">→</span></a>)}</div>
      </section>

      <section className="about" id="acerca"><div><span className="kicker">NUESTRO MUNDO</span><h2>Clásico en sus raíces.<br/><em>Nuevo en cada aventura.</em></h2></div><p>Barras Ro nace para reunir a jugadores nuevos y veteranos alrededor de la experiencia Pre-Renewal. Esta guía es tu mapa: úsala para avanzar a tu ritmo, descubrir secretos y compartir el camino con la comunidad.</p><a className="button primary" href="/guia-completa.html">Entrar a la biblioteca <span>→</span></a></section>

      <footer><a className="brand" href="#inicio"><span className="brand-mark">B</span><span><b>BARRAS</b><small>RAGNAROK ONLINE</small></span></a><p>Guía comunitaria en español · Pre-Renewal ≤ EP 13.2</p><a href="#inicio">Volver arriba ↑</a></footer>
    </main>
  );
}
