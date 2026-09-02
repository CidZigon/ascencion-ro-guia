/* Textos de la interfaz en español e inglés.
 *
 * Van compilados dentro del JavaScript, no en archivos aparte: los dos idiomas
 * juntos ocupan unos pocos KB y así cambiar de idioma es instantáneo, sin una
 * petición de red ni un parpadeo. El contenido pesado —catálogos, sprites y
 * módulos de guía— se sigue pidiendo bajo demanda como hasta ahora.
 *
 * Los nombres de objetos y monstruos vienen de rAthena y ya están en inglés,
 * así que no se traducen: un jugador busca «Poring Card» en cualquier idioma.
 */

export type Lang = "es" | "en";
export const LANGS: Lang[] = ["es", "en"];
export const LANG_NAMES: Record<Lang, string> = { es: "Español", en: "English" };
const STORAGE_KEY = "ascencionro-lang";

export const STRINGS = {
  es: {
    tagline: "Guía Pre-Renewal",
    goHome: "Ir al inicio de AscencionRO",
    nav: { home: "Inicio", items: "Objetos", monsters: "Monstruos", world: "Mundo", guides: "Guías" },
    langSwitch: { label: "Cambiar idioma", toEs: "Ver en español", toEn: "View in English" },

    search: {
      placeholder: "Buscar en AscencionRO…",
      aria: "Buscar en toda la guía y el catálogo",
      clear: "Limpiar búsqueda",
      inItems: (q: string) => `Buscar “${q}” entre todos los objetos`,
      inItemsHint: "Por nombre, Aegis o ID",
      inMonsters: (q: string) => `Buscar “${q}” entre todos los monstruos`,
      inWorld: (q: string) => `Buscar “${q}” entre ciudades y mapas`,
      inWorldHint: "Planos locales, NPC y quests relacionadas",
      searching: "BUSCANDO…",
      results: (n: number) => `${n} RESULTADOS EN LAS GUÍAS`,
      empty: "SIN RESULTADOS EN LAS GUÍAS",
    },

    guidesMenu: { title: "¿Qué quieres hacer?", copy: "Elige un tema y abre la guía directamente." },

    loading: { items: "Abriendo el catálogo local…", monsters: "Abriendo el bestiario local…", world: "Abriendo el atlas local…" },

    catalog: {
      heroTitle: "Objetos de Midgard",
      heroCopy: (n: string) => `Encuentra cualquiera de los ${n} objetos por nombre, Aegis o ID. Filtra por categoría y las fichas se abren aquí mismo.`,
      heroFiltered: (n: string) => `${n} resultados. Afina con los filtros o busca por nombre, Aegis o ID.`,
      eyebrow: "Catálogo",
      searchLabel: "Buscar por nombre, Aegis o ID",
      searchPlaceholder: "Ej. Poring Card, Red Potion, 501…",
      sort: "Orden",
      sortId: "ID",
      sortName: "Nombre",
      sortLevel: "Nivel mínimo",
      sortType: "Tipo",
      refineable: "Refinables",
      filterCategory: "Categoría",
      filterSlot: "Parte del cuerpo",
      filterWeapon: "Tipo de arma",
      filterSlots: "Ranuras",
      filterLevel: "Nivel mínimo",
      matches: "coincidencias",
      clearFilters: "Limpiar filtros",
      more: "Mostrar 80 más",
      emptyTitle: "No encontramos ese objeto.",
      emptyHint: "Prueba por ID, nombre en inglés o nombre Aegis, o quita algún filtro.",
      fatalTitle: "Catálogo no disponible",
      fatalCopy: "No se pudo abrir la copia local. Intenta recargar la página.",
      opening: "Abriendo la base local de objetos…",
      pickTitle: "Selecciona un objeto",
      pickCopy: "Su ficha se abre desde esta lista o desde cualquier enlace dentro de las guías.",
      loadingCard: "Cargando ficha…",
      buy: "Compra", sell: "Venta", weight: "Peso", minLevel: "Nivel mínimo",
      slots: "Slots", description: "Descripción", droppedBy: "Lo dropean",
      soldAt: "Dónde se compra", equipLocation: "Ubicación de equipo",
      jobs: "Jobs compatibles", classes: "Clases", mechanics: "Mecánica verificada",
      onEquip: "Al equipar", onUnequip: "Al desequipar",
      noDescription: "Esta instantánea no incluye una descripción de cliente para este objeto.",
      searchingMonsters: "Buscando monstruos…", searchingShops: "Buscando tiendas…",
      noDrops: "Ningún monstruo de la base Pre-Renewal lo deja caer.",
      noShops: "Ninguna tienda NPC lo vende en esta instantánea.",
      viewSpawns: "Ver dónde aparece",
      anyLocation: "Todos / no restringido",
      slotWord: (n: number) => `${n} slot${n === 1 ? "" : "s"}`,
      levelShort: (n: number) => `Nv ${n}`,
      equipment: "Equipo", weapon: "Arma",
    },

    categories: {
      all: "Todo", equipo: "Equipo", armas: "Armas", cartas: "Cartas",
      consumibles: "Consumibles", materiales: "Materiales", municion: "Munición",
      pets: "Pets", cash: "Cash",
    },

    types: {
      Healing: "Curación", Delayconsume: "Consumible diferido", Usable: "Usable",
      Etc: "Material / Etc.", Weapon: "Arma", Ammo: "Munición", Armor: "Armadura",
      Card: "Carta", Petegg: "Huevo de pet", Petarmor: "Accesorio de pet", Cash: "Cash",
    },

    locations: {
      Head_Top: "Casco (superior)", Head_Mid: "Casco (medio)", Head_Low: "Casco (inferior)",
      Armor: "Armadura", Garment: "Capa", Shoes: "Zapatos", Both_Accessory: "Accesorios",
      Left_Hand: "Escudo", Right_Hand: "Mano derecha", Both_Hand: "Dos manos", Ammo: "Munición",
      Costume_Head_Top: "Costume (superior)", Costume_Head_Mid: "Costume (medio)", Costume_Head_Low: "Costume (inferior)",
    },

    weapons: {
      "1hSword": "Espada de una mano", "2hSword": "Espada de dos manos", Dagger: "Daga",
      Katar: "Katar", "1hAxe": "Hacha de una mano", "2hAxe": "Hacha de dos manos",
      "1hSpear": "Lanza de una mano", "2hSpear": "Lanza de dos manos", Staff: "Báculo",
      "2hStaff": "Báculo de dos manos", Mace: "Maza", Book: "Libro", Bow: "Arco",
      Knuckle: "Nudillos", Musical: "Instrumento", Whip: "Látigo", Revolver: "Revólver",
      Rifle: "Rifle", Shotgun: "Escopeta", Gatling: "Gatling", Grenade: "Lanzagranadas",
      Huuma: "Huuma",
    },


    monsters: {
      eyebrow: "Bestiario local de AscencionRO",
      heroTitle: "Monstruos de Midgard",
      heroCopy: (n: string) => `Consulta los ${n} monstruos Pre-Renewal: nivel, elemento, mapas y todo lo que dropean. Las fichas se abren aquí mismo.`,
      searchLabel: "Buscar por nombre, Aegis o ID",
      searchPlaceholder: "Ej. Poring, Baphomet, 1002…",
      race: "Raza", allRaces: "Todas las razas",
      element: "Elemento", allElements: "Todos los elementos",
      sort: "Orden", mvpOnly: "MVP",
      sortEfficiency: "Mejor rendimiento (EXP/HP)",
      matches: "coincidencias", more: "Mostrar 80 más",
      topEfficiencyTitle: (n: number) => `Top ${n} por rendimiento (EXP base / HP)`,
      emptyTitle: "No encontramos ese monstruo.",
      emptyHint: "Prueba por ID, nombre en inglés o nombre Aegis.",
      fatalTitle: "Catálogo no disponible",
      fatalCopy: "No se pudo abrir la copia local de monstruos. Intenta recargar la página.",
      opening: "Abriendo el bestiario local…",
      pickTitle: "Selecciona un monstruo",
      pickCopy: "Su ficha se abre desde esta lista o desde cualquier enlace dentro de las guías.",
      loadingCard: "Cargando ficha…",
      levelShort: "Nv.",
      elementalTitle: "Tabla elemental",
      takesAs: (element: string) => `Daño que recibe como ${element}.`,
      elementalAria: "Daño recibido por cada elemento atacante",
      stats: "Atributos",
      spawnMaps: "Mapas de aparición",
      noSpawns: "No hay spawns publicados en esta instantánea.",
      spawnTopLabel: (n: number) => `Top ${n} por densidad`,
      spawnCount: (n: number) => `x${n}`,
      spawnRespawn: (seconds: number) => `${seconds}s reaparición`,
      viewMapAria: (code: string) => `Ver mapa de ${code}`,
      drops: "Dropea",
      noDrops: "No hay drops asociados en el catálogo local.",
      sortId: "ID", sortName: "Nombre", sortLevel: "Nivel",
      level: "Nivel", baseExp: "Base EXP", jobExp: "Job EXP",
      defMdef: "DEF / MDEF", range: "Rango", walkSpeed: "Vel. marcha",
      strengths: "Fortalezas y debilidades",
      reportIssue: "Reportar un error en esta ficha",
    },

    races: {
      Formless: "Sin forma", Undead: "No muerto", Brute: "Bruto", Plant: "Planta",
      Insect: "Insecto", Fish: "Pez", Demon: "Demonio", Demihuman: "Humanoide",
      Angel: "Ángel", Dragon: "Dragón",
    },
    elements: {
      Neutral: "Neutral", Water: "Agua", Earth: "Tierra", Fire: "Fuego", Wind: "Viento",
      Poison: "Veneno", Holy: "Sagrado", Dark: "Oscuro", Ghost: "Fantasma", Undead: "No muerto",
    },
    sizes: { Small: "Pequeño", Medium: "Mediano", Large: "Grande" },

    world: {
      eyebrow: "Atlas local de AscencionRO",
      heroTitle: "Regiones y mapas de Midgard",
      heroCopy: "Cada ciudad reúne sus campos, interiores y dungeons. Abre un mapa para consultar su plano, los NPC registrados y las quests relacionadas sin perder tu lugar en el recorrido.",
      region: "Región", allRegions: "Todas las regiones",
      regionEyebrow: "REGIÓN",
      maps: "mapas", mapsIn: (n: number) => (n === 1 ? "región" : "regiones"),
      city: "CIUDAD", map: "MAPA",
      npcShort: "NPC", references: "referencias",
      emptyTitle: "No encontramos ese mapa.",
      emptyHint: "Prueba con su código, ciudad, NPC o el nombre de una quest.",
      fatalTitle: "Atlas no disponible",
      fatalCopy: "No se pudo abrir el índice local. Intenta recargar.",
      pickTitle: "Selecciona una ciudad o mapa",
      pickCopy: "Aquí aparecerán el plano local, los NPC con sus sprites y las quests o referencias vinculadas.",
      localMap: "Mapa local",
      npcsHere: "NPC registrados en este mapa",
      noNpcs: "Aún no hay NPC vinculados a este mapa en las guías.",
      noCoordinate: "Ubicación sin coordenada publicada",
      representativeSprite: "Sprite representativo",
      questsHere: "Quests y referencias relacionadas",
      noQuests: "Este mapa está disponible, pero todavía no tiene una quest o referencia asociada.",
      dialogEyebrow: "Referencia rápida",
      dialogTitle: "Consulta sin salir de la guía",
      dialogError: "No se pudo abrir esta referencia.",
      dialogErrorHint: "Intenta cerrar la ventana y abrirla de nuevo.",
      searching: "Buscando en el índice local…",
      notFound: "Referencia no encontrada.",
      notFoundHint: "El enlace existe en la guía, pero aún no tiene una ficha local asociada.",
      noMapGiven: "Sin mapa indicado",
      integratedReference: "Referencia integrada",
      approximateSprite: "Representación visual del rol; el sprite exacto no está publicado.",
      npcLocation: "Ubicación en el mapa",
      mapAndCoords: "Mapa y coordenadas",
      availableHere: "Contenido disponible en AscencionRO",
      appearsIn: "Aparece en las guías",
      noNote: "La referencia está indexada localmente, pero no tiene una nota adicional.",
      spawnTitle: "Mapas de aparición",
      openMapCard: "Abrir ficha del mapa",
      specialSpawn: "Aparición especial",
      noSpawnMaps: "No hay mapas de aparición publicados para este enemigo.",
      kinds: { map: "Mapa", monster: "Monstruo", npc: "NPC", reference: "Guía local" },
      regions: {
        prontera:   { name: "Prontera",                        description: "Capital de Rune-Midgarts, Izlude y Monte Mjolnir" },
        geffen:     { name: "Geffen",                          description: "Campos de Geffen, Orc Dungeon, torre y Glast Heim" },
        payon:      { name: "Payon",                           description: "Ciudad, interiores, bosque, cuevas y campos de Payon" },
        morroc:     { name: "Morroc",                          description: "Desierto de Sograt, interiores, Sphinx y alrededores" },
        alberta:    { name: "Alberta",                         description: "Puerto de Alberta, barcos y Turtle Island" },
        comodo:     { name: "Comodo, Umbala y Niflheim",       description: "Costa, selva de Umbala y reino de los muertos" },
        aldebaran:  { name: "Al De Baran",                     description: "Ciudad del tiempo y Clock Tower" },
        juno:       { name: "Juno",                            description: "Campos de Juno, Magma Dungeon, Juperos y Thanatos" },
        schwartzwald:{ name: "República de Schwarzwald",       description: "Einbroch, Einbech, Lighthalzen, Hugel y Kiel" },
        arunafeltz: { name: "Arunafeltz",                      description: "Rachel, Veins, Thor, Ice Dungeon y Nameless" },
        eastern:    { name: "Naciones lejanas",                description: "Amatsu, Ayothaya, Gonryun, Louyang, Moscovia y Brasilis" },
        "new-world":{ name: "Nuevo Mundo",                     description: "Camp Midgard, Manuk, Splendide y Episode 13" },
        instances:  { name: "Instancias y contenido especial", description: "Mapas privados, torres y escenarios de quest" },
        other:      { name: "Otros territorios",               description: "Mapas sin una capital regional directa" },
      },
      opening: "Preparando los mapas de Midgard…",
      searchLabel: "Buscar mapa, ciudad, NPC o quest",
      mentionedPlaces: "Ubicaciones mencionadas",
      coordinatePlan: "Plano local por coordenadas",
      noExactCoordinates: "Esta referencia no publica coordenadas exactas; el mapa sigue disponible para identificar la zona.",
      mapOf: (code: string) => `Mapa de ${code}`,
      zoomIn: "Acercar", zoomOut: "Alejar", zoomReset: "Restablecer",
      zoomHint: "Arrastra para mover el mapa · rueda del mouse o pellizca para hacer zoom.",
      zonesEyebrow: "RECORRIDO POR ZONAS",
      zonesTitle: "Regiones",
      available: "disponibles",
      allShort: "Todas",
      integratedIn: "Integrada en",
      topicNumber: (n: number) => `Tema ${n}`,
    },

    topics: ["", "Progresión y EXP", "Accesos y dungeons", "Historias y lore", "Aventuras regionales", "Jobs y habilidades", "Equipo y fabricación", "Endless Tower", "Compañeros"],

    library: {
      items: { title: "Busca objetos al instante", copy: "Nombre, Aegis, ID, equipo, precios, scripts y restricciones." },
      monsters: { title: "Consulta el bestiario local", copy: "Nivel, raza, elemento, mapas de aparición y todo lo que dropean." },
      world: { title: "Explora ciudades y mapas", copy: "Planos locales con los NPC y las quests vinculadas a cada zona." },
      explore: "EXPLORAR",
      byTopic: "Explora por tema",
      byTopicCopy: "Ocho caminos claros, sin códigos ni versiones que aprender.",
      open: "Explorar",
    },

    modules: [
      { title: "Progresión y EXP",      description: "Rutas de leveo, cacerías, quests de EXP y progresión eficiente." },
      { title: "Accesos y dungeons",    description: "Prerrequisitos, NPC, coordenadas y desbloqueo de contenido." },
      { title: "Historias y lore",      description: "Arcos narrativos y contexto del mundo para entender cada aventura." },
      { title: "Aventuras regionales",  description: "Quests regionales e independientes organizadas para consulta rápida." },
      { title: "Jobs y habilidades",    description: "Cambios de clase y habilidades especiales explicados paso a paso." },
      { title: "Equipo y fabricación",  description: "Equipo, materiales, refinamiento y fabricación para cada etapa." },
      { title: "Endless Tower",         description: "Pisos, MVP, elementos y estrategia para completar la torre." },
      { title: "Compañeros",            description: "Pets, homúnculos y mercenarios con datos Pre-Renewal." },
    ],

    guide: {
      preparing: "Preparando la guía…",
      loadError: "No se pudo cargar la guía",
      retry: "Intenta recargar la página.",
      externalCopy: "Este enlace no tiene una ficha local equivalente. Puedes regresar a la guía sin perder tu posición o abrir el recurso en una pestaña nueva.",
      back: "Regresar a la guía",
      proceed: "Proceder al sitio externo",
    },

    // Solo se muestra a quien navega en inglés; en español no aparece.
    guideNotice: { title: "", copy: "" },
  },

  en: {
    tagline: "Pre-Renewal Guide",
    goHome: "Back to the AscencionRO home page",
    nav: { home: "Home", items: "Items", monsters: "Monsters", world: "World", guides: "Guides" },
    langSwitch: { label: "Change language", toEs: "Ver en español", toEn: "View in English" },

    search: {
      placeholder: "Search AscencionRO…",
      aria: "Search the whole guide and catalogue",
      clear: "Clear search",
      inItems: (q: string) => `Search “${q}” across all items`,
      inItemsHint: "By name, Aegis name or ID",
      inMonsters: (q: string) => `Search “${q}” across all monsters`,
      inWorld: (q: string) => `Search “${q}” across towns and maps`,
      inWorldHint: "Local maps, NPCs and related quests",
      searching: "SEARCHING…",
      results: (n: number) => `${n} RESULTS IN THE GUIDES`,
      empty: "NO RESULTS IN THE GUIDES",
    },

    guidesMenu: { title: "What do you want to do?", copy: "Pick a topic and open the guide straight away." },

    loading: { items: "Opening the local catalogue…", monsters: "Opening the local bestiary…", world: "Opening the local atlas…" },

    catalog: {
      heroTitle: "Items of Midgard",
      heroCopy: (n: string) => `Find any of the ${n} items by name, Aegis name or ID. Filter by category and item cards open right here.`,
      heroFiltered: (n: string) => `${n} results. Narrow it down with the filters or search by name, Aegis name or ID.`,
      eyebrow: "Catalogue",
      searchLabel: "Search by name, Aegis name or ID",
      searchPlaceholder: "e.g. Poring Card, Red Potion, 501…",
      sort: "Sort",
      sortId: "ID",
      sortName: "Name",
      sortLevel: "Required level",
      sortType: "Type",
      refineable: "Refinable",
      filterCategory: "Category",
      filterSlot: "Body part",
      filterWeapon: "Weapon type",
      filterSlots: "Card slots",
      filterLevel: "Required level",
      matches: "matches",
      clearFilters: "Clear filters",
      more: "Show 80 more",
      emptyTitle: "We couldn't find that item.",
      emptyHint: "Try the ID or the Aegis name, or remove a filter.",
      fatalTitle: "Catalogue unavailable",
      fatalCopy: "The local copy could not be opened. Try reloading the page.",
      opening: "Opening the local item database…",
      pickTitle: "Select an item",
      pickCopy: "Its card opens from this list, or from any link inside the guides.",
      loadingCard: "Loading item…",
      buy: "Buy", sell: "Sell", weight: "Weight", minLevel: "Required level",
      slots: "Slots", description: "Description", droppedBy: "Dropped by",
      soldAt: "Where to buy it", equipLocation: "Equipment slot",
      jobs: "Usable by", classes: "Classes", mechanics: "Verified mechanics",
      onEquip: "On equip", onUnequip: "On unequip",
      noDescription: "This snapshot has no client description for this item.",
      searchingMonsters: "Looking for monsters…", searchingShops: "Looking for shops…",
      noDrops: "No monster in the Pre-Renewal database drops it.",
      noShops: "No NPC shop sells it in this snapshot.",
      viewSpawns: "See where it spawns",
      anyLocation: "All / unrestricted",
      slotWord: (n: number) => `${n} slot${n === 1 ? "" : "s"}`,
      levelShort: (n: number) => `Lv ${n}`,
      equipment: "Equipment", weapon: "Weapon",
    },

    categories: {
      all: "All", equipo: "Equipment", armas: "Weapons", cartas: "Cards",
      consumibles: "Consumables", materiales: "Materials", municion: "Ammo",
      pets: "Pets", cash: "Cash",
    },

    types: {
      Healing: "Healing", Delayconsume: "Delayed consumable", Usable: "Usable",
      Etc: "Material / Etc.", Weapon: "Weapon", Ammo: "Ammo", Armor: "Armor",
      Card: "Card", Petegg: "Pet egg", Petarmor: "Pet accessory", Cash: "Cash",
    },

    locations: {
      Head_Top: "Upper headgear", Head_Mid: "Mid headgear", Head_Low: "Lower headgear",
      Armor: "Armor", Garment: "Garment", Shoes: "Shoes", Both_Accessory: "Accessory",
      Left_Hand: "Shield", Right_Hand: "Right hand", Both_Hand: "Two-handed", Ammo: "Ammo",
      Costume_Head_Top: "Costume (upper)", Costume_Head_Mid: "Costume (mid)", Costume_Head_Low: "Costume (lower)",
    },

    weapons: {
      "1hSword": "One-handed sword", "2hSword": "Two-handed sword", Dagger: "Dagger",
      Katar: "Katar", "1hAxe": "One-handed axe", "2hAxe": "Two-handed axe",
      "1hSpear": "One-handed spear", "2hSpear": "Two-handed spear", Staff: "Staff",
      "2hStaff": "Two-handed staff", Mace: "Mace", Book: "Book", Bow: "Bow",
      Knuckle: "Knuckle", Musical: "Instrument", Whip: "Whip", Revolver: "Revolver",
      Rifle: "Rifle", Shotgun: "Shotgun", Gatling: "Gatling gun", Grenade: "Grenade launcher",
      Huuma: "Huuma shuriken",
    },


    monsters: {
      eyebrow: "AscencionRO local bestiary",
      heroTitle: "Monsters of Midgard",
      heroCopy: (n: string) => `Browse all ${n} Pre-Renewal monsters: level, element, spawn maps and everything they drop. Cards open right here.`,
      searchLabel: "Search by name, Aegis name or ID",
      searchPlaceholder: "e.g. Poring, Baphomet, 1002…",
      race: "Race", allRaces: "All races",
      element: "Element", allElements: "All elements",
      sort: "Sort", mvpOnly: "MVP",
      sortEfficiency: "Best efficiency (EXP/HP)",
      matches: "matches", more: "Show 80 more",
      topEfficiencyTitle: (n: number) => `Top ${n} by efficiency (Base EXP / HP)`,
      emptyTitle: "We couldn't find that monster.",
      emptyHint: "Try the ID or the Aegis name.",
      fatalTitle: "Bestiary unavailable",
      fatalCopy: "The local monster copy could not be opened. Try reloading the page.",
      opening: "Opening the local bestiary…",
      pickTitle: "Select a monster",
      pickCopy: "Its card opens from this list, or from any link inside the guides.",
      loadingCard: "Loading monster…",
      levelShort: "Lv.",
      elementalTitle: "Elemental table",
      takesAs: (element: string) => `Damage it takes as ${element}.`,
      elementalAria: "Damage taken from each attacking element",
      stats: "Stats",
      spawnMaps: "Spawn maps",
      noSpawns: "No spawns published in this snapshot.",
      spawnTopLabel: (n: number) => `Top ${n} by density`,
      spawnCount: (n: number) => `x${n}`,
      spawnRespawn: (seconds: number) => `${seconds}s respawn`,
      viewMapAria: (code: string) => `View map for ${code}`,
      drops: "Drops",
      noDrops: "No drops recorded in the local catalogue.",
      sortId: "ID", sortName: "Name", sortLevel: "Level",
      level: "Level", baseExp: "Base EXP", jobExp: "Job EXP",
      defMdef: "DEF / MDEF", range: "Range", walkSpeed: "Walk speed",
      strengths: "Strengths and weaknesses",
      reportIssue: "Report an issue with this card",
    },

    races: {
      Formless: "Formless", Undead: "Undead", Brute: "Brute", Plant: "Plant",
      Insect: "Insect", Fish: "Fish", Demon: "Demon", Demihuman: "Demi-human",
      Angel: "Angel", Dragon: "Dragon",
    },
    elements: {
      Neutral: "Neutral", Water: "Water", Earth: "Earth", Fire: "Fire", Wind: "Wind",
      Poison: "Poison", Holy: "Holy", Dark: "Shadow", Ghost: "Ghost", Undead: "Undead",
    },
    sizes: { Small: "Small", Medium: "Medium", Large: "Large" },

    world: {
      eyebrow: "AscencionRO local atlas",
      heroTitle: "Regions and maps of Midgard",
      heroCopy: "Every town gathers its fields, interiors and dungeons. Open a map to see its layout, the NPCs on record and the related quests without losing your place.",
      region: "Region", allRegions: "All regions",
      regionEyebrow: "REGION",
      maps: "maps", mapsIn: (n: number) => (n === 1 ? "region" : "regions"),
      city: "TOWN", map: "MAP",
      npcShort: "NPCs", references: "references",
      emptyTitle: "We couldn't find that map.",
      emptyHint: "Try its code, a town, an NPC or a quest name.",
      fatalTitle: "Atlas unavailable",
      fatalCopy: "The local index could not be opened. Try reloading.",
      pickTitle: "Select a town or map",
      pickCopy: "The local layout, the NPCs with their sprites and the linked quests will appear here.",
      localMap: "Local map",
      npcsHere: "NPCs on record for this map",
      noNpcs: "No NPCs are linked to this map in the guides yet.",
      noCoordinate: "Location with no published coordinate",
      representativeSprite: "Representative sprite",
      questsHere: "Related quests and references",
      noQuests: "This map is available, but has no quest or reference attached yet.",
      dialogEyebrow: "Quick reference",
      dialogTitle: "Look it up without leaving the guide",
      dialogError: "This reference could not be opened.",
      dialogErrorHint: "Try closing the window and opening it again.",
      searching: "Searching the local index…",
      notFound: "Reference not found.",
      notFoundHint: "The link exists in the guide, but has no local card attached yet.",
      noMapGiven: "No map given",
      integratedReference: "Integrated reference",
      approximateSprite: "Visual stand-in for the role; the exact sprite is not published.",
      npcLocation: "Location on the map",
      mapAndCoords: "Map and coordinates",
      availableHere: "Available on AscencionRO",
      appearsIn: "Appears in the guides",
      noNote: "The reference is indexed locally, but has no extra note.",
      spawnTitle: "Spawn maps",
      openMapCard: "Open the map card",
      specialSpawn: "Special spawn",
      noSpawnMaps: "No spawn maps published for this enemy.",
      kinds: { map: "Map", monster: "Monster", npc: "NPC", reference: "Local guide" },
      regions: {
        prontera:   { name: "Prontera",                     description: "Capital of Rune-Midgarts, Izlude and Mt. Mjolnir" },
        geffen:     { name: "Geffen",                       description: "Geffen fields, Orc Dungeon, the tower and Glast Heim" },
        payon:      { name: "Payon",                        description: "Payon town, interiors, forest, caves and fields" },
        morroc:     { name: "Morroc",                       description: "Sograt Desert, interiors, the Sphinx and surroundings" },
        alberta:    { name: "Alberta",                      description: "Alberta harbour, ships and Turtle Island" },
        comodo:     { name: "Comodo, Umbala and Niflheim",  description: "The coast, the Umbala jungle and the realm of the dead" },
        aldebaran:  { name: "Al De Baran",                  description: "The city of time and the Clock Tower" },
        juno:       { name: "Juno",                         description: "Juno fields, Magma Dungeon, Juperos and Thanatos" },
        schwartzwald:{ name: "Schwarzwald Republic",        description: "Einbroch, Einbech, Lighthalzen, Hugel and Kiel" },
        arunafeltz: { name: "Arunafeltz",                   description: "Rachel, Veins, Thor, Ice Dungeon and Nameless" },
        eastern:    { name: "Far-off nations",              description: "Amatsu, Ayothaya, Gonryun, Louyang, Moscovia and Brasilis" },
        "new-world":{ name: "New World",                    description: "Camp Midgard, Manuk, Splendide and Episode 13" },
        instances:  { name: "Instances and special content", description: "Private maps, towers and quest scenarios" },
        other:      { name: "Other territories",            description: "Maps without a direct regional capital" },
      },
      opening: "Preparing the maps of Midgard…",
      searchLabel: "Search a map, town, NPC or quest",
      mentionedPlaces: "Places mentioned",
      coordinatePlan: "Local layout by coordinates",
      noExactCoordinates: "This reference publishes no exact coordinates; the map is still there to place the area.",
      mapOf: (code: string) => `Map of ${code}`,
      zoomIn: "Zoom in", zoomOut: "Zoom out", zoomReset: "Reset",
      zoomHint: "Drag to pan the map · scroll or pinch to zoom.",
      zonesEyebrow: "A TOUR BY ZONE",
      zonesTitle: "Regions",
      available: "available",
      allShort: "All",
      integratedIn: "Part of",
      topicNumber: (n: number) => `Topic ${n}`,
    },

    topics: ["", "Leveling and EXP", "Access and dungeons", "Stories and lore", "Regional adventures", "Jobs and skills", "Gear and crafting", "Endless Tower", "Companions"],

    library: {
      items: { title: "Find any item instantly", copy: "Name, Aegis name, ID, gear, prices, scripts and restrictions." },
      monsters: { title: "Browse the local bestiary", copy: "Level, race, element, spawn maps and everything they drop." },
      world: { title: "Explore towns and maps", copy: "Local layouts with the NPCs and quests tied to each area." },
      explore: "EXPLORE",
      byTopic: "Explore by topic",
      byTopicCopy: "Eight clear paths — no codes or versions to learn.",
      open: "Open",
    },

    modules: [
      { title: "Leveling and EXP",      description: "Leveling routes, hunting grounds, EXP quests and efficient progress." },
      { title: "Access and dungeons",   description: "Prerequisites, NPCs, coordinates and how to unlock content." },
      { title: "Stories and lore",      description: "Narrative arcs and world context to make sense of each adventure." },
      { title: "Regional adventures",   description: "Regional and standalone quests, organised for quick reference." },
      { title: "Jobs and skills",       description: "Job changes and special skills explained step by step." },
      { title: "Gear and crafting",     description: "Gear, materials, refining and crafting for every stage." },
      { title: "Endless Tower",         description: "Floors, MVPs, elements and strategy to clear the tower." },
      { title: "Companions",            description: "Pets, homunculi and mercenaries with Pre-Renewal data." },
    ],

    guide: {
      preparing: "Preparing the guide…",
      loadError: "The guide could not be loaded",
      retry: "Try reloading the page.",
      externalCopy: "This link has no local equivalent. You can go back to the guide without losing your place, or open the resource in a new tab.",
      back: "Back to the guide",
      proceed: "Go to the external site",
    },

    guideNotice: {
      title: "This guide has not been translated yet",
      copy: "The interface, the item catalogue, the bestiary and the atlas are in English. The eight written guides are still Spanish-only and are shown below in their original language.",
    },
  },
} as const;

export type Dict = (typeof STRINGS)["es"];

/* Primera visita: se respeta el idioma del navegador. Después manda lo que el
 * jugador haya elegido, que se guarda en este mismo navegador. */
export function detectLang(): Lang {
  if (typeof window === "undefined") return "es";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch { /* almacenamiento bloqueado: se sigue con la detección */ }
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl === "es" || fromUrl === "en") return fromUrl;
  return (navigator.language ?? "es").toLowerCase().startsWith("en") ? "en" : "es";
}

/* El idioma vive en un store externo, no en estado de React.
 * En el servidor siempre es "es", así que el HTML inicial y la hidratación
 * coinciden; en cuanto monta en el navegador se lee la preferencia guardada. */
let current: Lang | null = null;
const listeners = new Set<() => void>();

export function getLang(): Lang {
  current ??= detectLang();
  return current;
}
export function getServerLang(): Lang {
  return "es";
}
export function subscribeLang(onChange: () => void) {
  listeners.add(onChange);
  return () => { listeners.delete(onChange); };
}
export function setLang(lang: Lang) {
  if (current === lang) return;
  current = lang;
  rememberLang(lang);
  for (const listener of listeners) listener();
}

export function rememberLang(lang: Lang) {
  try { window.localStorage.setItem(STORAGE_KEY, lang); } catch { /* sin persistencia, no pasa nada */ }
  const url = new URL(window.location.href);
  if (lang === "es") url.searchParams.delete("lang");
  else url.searchParams.set("lang", lang);
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  document.documentElement.lang = lang;
}
