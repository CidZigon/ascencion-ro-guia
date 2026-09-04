/* Contenido curado de la guía "Accesos y dungeons" (módulo 2).
   Migrado una sola vez desde public/data/modules/module-2.html vía un
   script de extracción de un solo uso (no forma parte de data:build) —
   de acá en adelante este archivo se edita a mano, como app/i18n.ts.
   module-2.html se deja intacto en disco porque build-world-catalog.mjs,
   audit-module-links.mjs y split-content-bundle.mjs siguen escaneándolo
   para NPCs/mapas, auditoría de enlaces y el índice de búsqueda global.
   No existe module-2.en.html: esta guía se muestra en español también
   cuando lang="en", igual que el resto de los módulos sin traducir. */

export type AccessSegment =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "npc"; name: string; map?: string; mapLabel?: string }
  | { type: "map"; map?: string; label: string }
  | { type: "quest"; id: string; label: string };

export type AccessQuestKind = "core" | "server" | "ep13";

export type AccessQuest = {
  id: string;
  questNo: string;
  title: string;
  kind: AccessQuestKind;
  minLevel: number;
  badges: string[];
  intro: AccessSegment[];
  materials: string;
  unlock: string[];
  mvp?: string;
  notice?: string;
  note?: AccessSegment[];
  steps: AccessSegment[][];
  sourceHref: string;
};

export type AccessZone = {
  id: string;
  icon: string;
  title: string;
  goal: string;
  route: string[];
  quests: AccessQuest[];
};

export type AccessMvpItem = { name: string; questId: string; questLabel: string; tag: string };

export type AccessGuideData = {
  mvpItems: AccessMvpItem[];
  mvpFooterNote: string;
  zones: AccessZone[];
};

export const ACCESS_GUIDE: AccessGuideData = {
  "mvpItems": [
    {
      "name": "Golden Thief Bug",
      "questId": "q-culverts",
      "questLabel": "Prontera Culverts",
      "tag": "Quest permanente"
    },
    {
      "name": "Turtle General",
      "questId": "q-turtle",
      "questLabel": "Turtle Island",
      "tag": "Viaje habilitado"
    },
    {
      "name": "Endless Tower",
      "questId": "q-endless-tower",
      "questLabel": "Endless Tower",
      "tag": "Instancia con numerosos MVPs"
    },
    {
      "name": "Orc Hero",
      "questId": "q-orc-memory",
      "questLabel": "Orc Memory Dungeon",
      "tag": "Instancia privada"
    },
    {
      "name": "Great Demon Baphomet",
      "questId": "q-sealed-shrine",
      "questLabel": "Sealed Shrine",
      "tag": "Instancia"
    },
    {
      "name": "Samurai Specter",
      "questId": "q-amatsu",
      "questLabel": "Amatsu Dungeon",
      "tag": "Quest permanente"
    },
    {
      "name": "Lady Tanee",
      "questId": "q-ayothaya",
      "questLabel": "Ayothaya Dungeon",
      "tag": "Quest en 2 etapas"
    },
    {
      "name": "Biolabs MVPs",
      "questId": "q-biolabs",
      "questLabel": "Biolabs Entrance",
      "tag": "Quest + nivel para 3F"
    },
    {
      "name": "Kiel D-01",
      "questId": "q-kiel",
      "questLabel": "Kiel Hyre",
      "tag": "Cadena Kiel"
    },
    {
      "name": "Vesper",
      "questId": "q-juperos",
      "questLabel": "Juperos Quest",
      "tag": "Puerta interna"
    },
    {
      "name": "Memory of Thanatos",
      "questId": "q-thanatos",
      "questLabel": "Thanatos Tower",
      "tag": "Puertas + quest interna"
    },
    {
      "name": "Detardeurus / Detale",
      "questId": "q-abyss",
      "questLabel": "Abyss Lake",
      "tag": "Mecanismo recurrente"
    },
    {
      "name": "Gloom Under Night",
      "questId": "q-rachel-sanctuary",
      "questLabel": "Rachel Sanctuary",
      "tag": "Quest permanente"
    },
    {
      "name": "Fallen Bishop Hibram / Beelzebub",
      "questId": "q-nameless",
      "questLabel": "Nameless Island",
      "tag": "Cadena larga"
    },
    {
      "name": "Ktullanux",
      "questId": "q-ice-necklace",
      "questLabel": "Ice Necklace",
      "tag": "Quest para invocarlo"
    },
    {
      "name": "Gopinich",
      "questId": "q-moscovia",
      "questLabel": "Finding the Moving Island",
      "tag": "Quest permanente"
    },
    {
      "name": "Injured Satan Morroc",
      "questId": "q-continental-guard",
      "questLabel": "Continental Guard",
      "tag": "Implementación del servidor"
    },
    {
      "name": "Nidhoggur’s Shadow",
      "questId": "q-guardian-yggdrasil",
      "questLabel": "Guardian of Yggdrasil",
      "tag": "Cadena 13.2"
    }
  ],
  "mvpFooterNote": "MVPs de acceso libre como Ifrit, Valkyrie Randgris, Tao Gunka, Drake y Osiris no requieren una quest previa. Endless Tower reúne numerosos MVPs, pero su acceso se explica como una instancia independiente.",
  "zones": [
    {
      "id": "zona-rune",
      "icon": "🏰",
      "title": "Rune-Midgarts, Alberta & Orc Region",
      "goal": "Accesos clásicos y dos instancias MVP que una lista de dungeons normal suele olvidar.",
      "route": [
        "q-culverts",
        "q-turtle",
        "q-endless-tower",
        "q-orc-memory",
        "q-sealed-shrine"
      ],
      "quests": [
        {
          "id": "q-culverts",
          "questNo": "1",
          "title": "Prontera Culverts",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Sin nivel mínimo",
            "Muy rápido"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Recruiter",
              "map": "prt_in",
              "mapLabel": "📍 prt_in 88,105 · Knight Guild"
            }
          ],
          "materials": "Ninguno.",
          "unlock": [
            "Prontera Culverts"
          ],
          "mvp": "Golden Thief Bug",
          "steps": [
            [
              {
                "type": "text",
                "text": "Entra al Knight Guild por"
              },
              {
                "type": "map",
                "map": "prontera",
                "label": "📍 prontera 45,346"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Recruiter",
                "map": "prt_in",
                "mapLabel": "📍 prt_in 88,105 · Knight Guild"
              },
              {
                "type": "text",
                "text": "y elige"
              },
              {
                "type": "bold",
                "text": "Volunteer"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Desde ese momento el"
              },
              {
                "type": "npc",
                "name": "Culvert Guardian",
                "map": "prt_fild05",
                "mapLabel": "📍 prt_fild05 · entrada de Prontera Culverts; coordenada exacta no publicada"
              },
              {
                "type": "text",
                "text": "permite utilizar la entrada a los Culverts."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Prontera_Culverts_Entrance_Quest"
        },
        {
          "id": "q-turtle",
          "questNo": "2",
          "title": "Turtle Island",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Sin nivel mínimo",
            "10,000z por viaje"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Turtle Grampa",
              "map": "alberta",
              "mapLabel": "📍 alberta · Inn de Alberta; habitación derecha, coordenada interior no publicada"
            }
          ],
          "materials": "10,000 zeny por cada viaje.",
          "unlock": [
            "Turtle Island Dungeon"
          ],
          "mvp": "Turtle General",
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Turtle Grampa",
                "map": "alberta",
                "mapLabel": "📍 alberta · Inn de Alberta; habitación derecha"
              },
              {
                "type": "text",
                "text": "y pregunta cómo llegar."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve con"
              },
              {
                "type": "npc",
                "name": "Sailor",
                "map": "alberta",
                "mapLabel": "📍 alberta 247,122"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Paga 10,000z y viaja a la isla."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Turtle_Island_Entrance_Quest"
        },
        {
          "id": "q-endless-tower",
          "questNo": "3",
          "title": "Endless Tower",
          "kind": "core",
          "minLevel": 50,
          "badges": [
            "Lv 50+",
            "Party",
            "10,000z por persona",
            "6d 20h cooldown"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Captain Janssen",
              "map": "alberta",
              "mapLabel": "📍 alberta 214,77"
            }
          ],
          "materials": "10,000 zeny por personaje.",
          "unlock": [
            "Endless Tower",
            "100 pisos",
            "Muchos MVPs"
          ],
          "mvp": "la torre contiene numerosos MVPs clásicos y culmina con los encuentros especiales Entweihen Knothen / Naght Sieger.",
          "note": [
            {
              "type": "text",
              "text": "Su"
            },
            {
              "type": "bold",
              "text": "acceso está restringido por una quest/instancia"
            },
            {
              "type": "text",
              "text": ". Esta sección explica cómo entrar correctamente; la estrategia piso por piso está disponible en Endless Tower."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Captain Janssen",
                "map": "alberta",
                "mapLabel": "📍 alberta 214,77"
              },
              {
                "type": "text",
                "text": "y dona 10,000z."
              }
            ],
            [
              {
                "type": "text",
                "text": "Viaja con él a Misty Island."
              }
            ],
            [
              {
                "type": "text",
                "text": "El líder de party habla con"
              },
              {
                "type": "npc",
                "name": "Tower Protection Stone",
                "map": "e_tower",
                "mapLabel": "📍 e_tower · Misty Island; coordenada exacta no publicada"
              },
              {
                "type": "text",
                "text": "y genera la instancia."
              }
            ],
            [
              {
                "type": "text",
                "text": "La party tiene 5 minutos para entrar y 4 horas para completar la torre."
              }
            ],
            [
              {
                "type": "text",
                "text": "Al terminar/expirar aplica el cooldown documentado de 6 días y 20 horas."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Endless_Tower"
        },
        {
          "id": "q-orc-memory",
          "questNo": "4",
          "title": "Orc Memory Dungeon",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 30–80",
            "Party 2+",
            "2 h cooldown"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Dimensional Gorge Piece",
              "map": "gef_fild10",
              "mapLabel": "📍 gef_fild10 242,202"
            }
          ],
          "materials": "Sin materiales de entrada.",
          "unlock": [
            "Instancia privada",
            "Orc Hero"
          ],
          "mvp": "Orc Hero (batalla privada)",
          "note": [
            {
              "type": "text",
              "text": "Es una forma privada/instanciada de enfrentar Orc Hero; no sustituye el spawn normal del MVP."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "El líder de party reserva la instancia con"
              },
              {
                "type": "npc",
                "name": "Dimensional Gorge Piece",
                "map": "gef_fild10",
                "mapLabel": "📍 gef_fild10 242,202"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Dentro, inicia con"
              },
              {
                "type": "npc",
                "name": "Kruger",
                "map": "1@orcs",
                "mapLabel": "📍 1@orcs 180,29"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "En 1F elimina únicamente los Enchanted Orc de cada zona si quieres una ruta limpia; matar orcos comunes genera enemigos extra."
              }
            ],
            [
              {
                "type": "text",
                "text": "En 2F vuelve a hablar con"
              },
              {
                "type": "npc",
                "name": "Kruger",
                "map": "2@orcs",
                "mapLabel": "📍 2@orcs 35,169"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Activa los braziers por zonas, derrota los guardianes y avanza hasta Depraved Orc Hero + Shaman Cargalache."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Orc_Memory_Dungeon"
        },
        {
          "id": "q-sealed-shrine",
          "questNo": "5",
          "title": "Sealed Shrine",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 75+",
            "Party 2+",
            "12 h cooldown"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Friar Patrick",
              "map": "monk_test",
              "mapLabel": "📍 monk_test 309,146 · entra por prt_monk 192,170"
            }
          ],
          "materials": "Para entrar: ninguno. Dentro: 10 Essence of Fire + Token of Apostle para progresar.",
          "unlock": [
            "Sealed Shrine",
            "Great Demon Baphomet"
          ],
          "mvp": "Great Demon Baphomet / Unsealed Baphomet",
          "steps": [
            [
              {
                "type": "text",
                "text": "En St. Capitolina entra por"
              },
              {
                "type": "map",
                "map": "prt_monk",
                "label": "📍 prt_monk 192,170"
              },
              {
                "type": "text",
                "text": "y el líder habla con"
              },
              {
                "type": "npc",
                "name": "Friar Patrick",
                "map": "monk_test",
                "mapLabel": "📍 monk_test 309,146"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Dentro inicia con"
              },
              {
                "type": "npc",
                "name": "Falling Grave",
                "map": "1@cata",
                "mapLabel": "📍 1@cata 141,221"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega el Pendant of Spirit y continúa con"
              },
              {
                "type": "npc",
                "name": "Soul of Ancient Hero",
                "map": "1@cata",
                "mapLabel": "📍 1@cata · centro del mapa"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Reúne 10 Essence of Fire y Token of Apostle."
              }
            ],
            [
              {
                "type": "text",
                "text": "El"
              },
              {
                "type": "npc",
                "name": "Soul of Ancient Hero",
                "map": "1@cata",
                "mapLabel": "📍 1@cata · centro del mapa"
              },
              {
                "type": "text",
                "text": "abre el portal a 2F."
              }
            ],
            [
              {
                "type": "text",
                "text": "En 2F activa"
              },
              {
                "type": "npc",
                "name": "The Main Altar",
                "map": "2@cata",
                "mapLabel": "📍 2@cata · centro del mapa"
              },
              {
                "type": "text",
                "text": "para invocar Great Demon Baphomet."
              }
            ],
            [
              {
                "type": "text",
                "text": "Baphomet es invulnerable hasta que la party utiliza los seals indicados para abrir ventanas de daño."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Sealed_Shrine_Quest"
        }
      ]
    },
    {
      "id": "zona-oriente",
      "icon": "🌸",
      "title": "Amatsu & Ayothaya",
      "goal": "Dos regiones donde la quest de entrada y el acceso al MVP forman parte natural de la exploración.",
      "route": [
        "q-amatsu",
        "q-ayothaya"
      ],
      "quests": [
        {
          "id": "q-amatsu",
          "questNo": "1",
          "title": "Amatsu Dungeon",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Sin nivel mínimo",
            "Permiso permanente"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Guard Soldiers",
              "map": "amatsu",
              "mapLabel": "📍 amatsu 164,174 · casa de la Old Lady"
            }
          ],
          "materials": "Sin materiales previos.",
          "unlock": [
            "Tatami Maze",
            "Underground Shrine"
          ],
          "mvp": "Samurai Specter",
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Guard Soldiers",
                "map": "amatsu",
                "mapLabel": "📍 amatsu 164,174 · junto a la casa"
              },
              {
                "type": "text",
                "text": "y pregunta por la madre enferma."
              }
            ],
            [
              {
                "type": "text",
                "text": "Visita"
              },
              {
                "type": "npc",
                "name": "Lord of Palace",
                "map": "ama_in02",
                "mapLabel": "📍 ama_in02 200,176 · Lakeside Castle"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Kouji",
                "map": "amatsu",
                "mapLabel": "📍 amatsu 189,165"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve al shrine y habla con"
              },
              {
                "type": "npc",
                "name": "Kitsune Mask",
                "map": "ama_in01",
                "mapLabel": "📍 ama_in01 179,173"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Regresa con"
              },
              {
                "type": "npc",
                "name": "Old Lady",
                "map": "amatsu",
                "mapLabel": "📍 amatsu 164,174 · interior de la casa; coordenada interior no publicada"
              },
              {
                "type": "text",
                "text": "hasta expulsar el espíritu."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega el Nine Tails a"
              },
              {
                "type": "npc",
                "name": "Lord of Palace",
                "map": "ama_in02",
                "mapLabel": "📍 ama_in02 200,176"
              },
              {
                "type": "text",
                "text": "y recibe Feudal Lord Permit."
              }
            ],
            [
              {
                "type": "text",
                "text": "Con el permiso, el guardia de la parte alta del castillo habilita el dungeon."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Amatsu_Dungeon_Entrance_Quest"
        },
        {
          "id": "q-ayothaya",
          "questNo": "2",
          "title": "Ayothaya Ancient Shrine",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Sin nivel mínimo",
            "Acceso en 2 etapas"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Dusit",
              "map": "ayothaya",
              "mapLabel": "📍 ayothaya 82,132"
            }
          ],
          "materials": "3 Spool · 1 Solid Husk · 3 Holy Water · 3 Needle Packet · 1 Yggdrasil Leaf.",
          "unlock": [
            "1F con Holy Threads",
            "2F con Holier Threads"
          ],
          "mvp": "Lady Tanee",
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Dusit",
                "map": "ayothaya",
                "mapLabel": "📍 ayothaya 82,132"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Visita a"
              },
              {
                "type": "npc",
                "name": "Boonthon",
                "map": "ayothaya",
                "mapLabel": "📍 ayothaya 65,104 · dentro de la casa; coord interior no publicada"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega el primer set para recibir Holy Threads: abre Field 2 y Dungeon 1F."
              }
            ],
            [
              {
                "type": "text",
                "text": "Usa el acceso del field en"
              },
              {
                "type": "map",
                "map": "ayo_fild01",
                "label": "📍 ayo_fild01 128,197"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Completa los seis puntos del laberinto."
              }
            ],
            [
              {
                "type": "text",
                "text": "Vuelve con"
              },
              {
                "type": "npc",
                "name": "Boonthon",
                "map": "ayothaya",
                "mapLabel": "📍 ayothaya 65,104 · dentro de la casa"
              },
              {
                "type": "text",
                "text": "y entrega el segundo set."
              }
            ],
            [
              {
                "type": "text",
                "text": "Holier Threads abre Dungeon 2F."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Ayothaya_Dungeon_Entrance_Quest"
        }
      ]
    },
    {
      "id": "zona-schwartz",
      "icon": "⚙️",
      "title": "Schwartzvald: Lighthalzen, Juno & Hugel",
      "goal": "La región tecnológica concentra varios de los accesos MVP más importantes del Pre-Renewal.",
      "route": [
        "q-friendship",
        "q-biolabs",
        "q-kiel",
        "q-juperos",
        "q-thanatos",
        "q-abyss"
      ],
      "quests": [
        {
          "id": "q-friendship",
          "questNo": "1",
          "title": "Friendship Quest",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 50+",
            "Recomendada, no obligatoria"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Maku",
              "map": "lighthalzen",
              "mapLabel": "📍 lighthalzen 337,232 · Slums"
            }
          ],
          "materials": "Ninguno.",
          "unlock": [
            "Pass para Slums",
            "Facilita Biolabs"
          ],
          "note": [
            {
              "type": "text",
              "text": "No es prerequisito obligatorio de"
            },
            {
              "type": "quest",
              "id": "q-biolabs",
              "label": "Biolabs Entrance"
            },
            {
              "type": "text",
              "text": ", pero hace mucho más cómodo entrar a los Slums."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Maku",
                "map": "lighthalzen",
                "mapLabel": "📍 lighthalzen 337,232"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Visita a"
              },
              {
                "type": "npc",
                "name": "Digotz",
                "map": "lhz_in02",
                "mapLabel": "📍 lhz_in02 201,210 · Hotel"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Juno Library habla con"
              },
              {
                "type": "npc",
                "name": "Student",
                "map": "yuno_in04",
                "mapLabel": "📍 yuno_in04 107,14"
              },
              {
                "type": "text",
                "text": "y luego con"
              },
              {
                "type": "npc",
                "name": "Benkaistein",
                "map": "yuno_in04",
                "mapLabel": "📍 yuno_in04 96,106"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Recoge Friend’s Diary en"
              },
              {
                "type": "map",
                "map": "yuno_in04",
                "label": "📍 yuno_in04 167,115"
              },
              {
                "type": "text",
                "text": ", vuelve con"
              },
              {
                "type": "npc",
                "name": "Digotz",
                "map": "lhz_in02",
                "mapLabel": "📍 lhz_in02 201,210 · Hotel"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Maku",
                "map": "lighthalzen",
                "mapLabel": "📍 lighthalzen 337,232 · Slums"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Cierra con"
              },
              {
                "type": "npc",
                "name": "Benkaistein",
                "map": "yuno_in04",
                "mapLabel": "📍 yuno_in04 96,106"
              },
              {
                "type": "text",
                "text": "y recibe el Pass."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Friendship_Quest"
        },
        {
          "id": "q-biolabs",
          "questNo": "2",
          "title": "Biolabs Entrance",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 60+",
            "20 Jellopy"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Fishbone",
              "map": "lighthalzen",
              "mapLabel": "📍 lighthalzen 340,224 · Slums"
            }
          ],
          "materials": "20 Jellopy.",
          "unlock": [
            "Biolabs 1F/2F",
            "3F con restricción de nivel"
          ],
          "mvp": "Assassin Cross Eremes · High Priest Margaretha · High Wizard Kathryne · Lord Knight Seyren · Mastersmith Howard · Sniper Cecil",
          "notice": "Biolabs 4F es posterior a Episode 13.2 y queda fuera de esta guía.",
          "steps": [
            [
              {
                "type": "text",
                "text": "Si quieres acceso cómodo a Slums, haz primero"
              },
              {
                "type": "quest",
                "id": "q-friendship",
                "label": "Friendship Quest"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla repetidamente con"
              },
              {
                "type": "npc",
                "name": "Fishbone",
                "map": "lighthalzen",
                "mapLabel": "📍 lighthalzen 340,224"
              },
              {
                "type": "text",
                "text": "y paga 20 Jellopy."
              }
            ],
            [
              {
                "type": "text",
                "text": "Completa el cuberoom maze; /where ayuda a identificar la sala."
              }
            ],
            [
              {
                "type": "text",
                "text": "Resuelve el puzzle del laboratorio hasta obtener Laboratory Permit."
              }
            ],
            [
              {
                "type": "text",
                "text": "Usa el Experiment Tube para salir hacia Biolabs."
              }
            ],
            [
              {
                "type": "text",
                "text": "2F también puede alcanzarse por el Underwater Tunnel en"
              },
              {
                "type": "map",
                "map": "lighthalzen",
                "label": "📍 lighthalzen 311,302"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "3F no exige una segunda quest, pero Classic restringe el acceso a Lv95+ no-Trans o Lv90+ Trans."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Biolabs_Entrance_Quest"
        },
        {
          "id": "q-kiel",
          "questNo": "3",
          "title": "Kiel Hyre Dungeon",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 70+",
            "Cadena larga"
          ],
          "intro": [
            {
              "type": "text",
              "text": "Juno Bar —"
            },
            {
              "type": "map",
              "map": "yuno",
              "label": "📍 entrada del Bar"
            }
          ],
          "materials": "7 Milk · 5 Cacao · 2 Cheese · 1 Pet Food · 10 Raw Fish · 4 Solid Iron Piece.",
          "unlock": [
            "Kiel Dungeon 1F",
            "Kiel Dungeon 2F"
          ],
          "mvp": "Kiel D-01",
          "steps": [
            [
              {
                "type": "text",
                "text": "Acepta la entrega en Juno Bar y ve a Kiel Hyre Academy."
              }
            ],
            [
              {
                "type": "text",
                "text": "La Academy está en"
              },
              {
                "type": "map",
                "map": "yuno_fild08",
                "label": "📍 yuno_fild08 159,189"
              },
              {
                "type": "text",
                "text": "; localiza a"
              },
              {
                "type": "npc",
                "name": "Elly",
                "map": "kh_school",
                "mapLabel": "📍 kh_school · interior de Kiel Hyre Academy; coord exacta no publicada"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ayuda a"
              },
              {
                "type": "npc",
                "name": "Elly",
                "map": "kh_school",
                "mapLabel": "📍 kh_school · interior de Kiel Hyre Academy; coord exacta no publicada"
              },
              {
                "type": "text",
                "text": "y reúne los ingredientes de cocina."
              }
            ],
            [
              {
                "type": "text",
                "text": "Sigue la investigación entre Academy, Juno, Lighthalzen y la mansión."
              }
            ],
            [
              {
                "type": "text",
                "text": "En la parte avanzada usa Yellow Keycard y código 4772961 para abrir 1F."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Allysia",
                "map": "kh_dun01",
                "mapLabel": "📍 kh_dun01 · área restringida; coord exacta no publicada"
              },
              {
                "type": "text",
                "text": "y continúa con Blue/Red Keycards."
              }
            ],
            [
              {
                "type": "text",
                "text": "Termina la cadena para consolidar acceso a 2F."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Kiel_Hyre_Quest"
        },
        {
          "id": "q-juperos",
          "questNo": "4",
          "title": "Juperos Level 3",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Acceso interno",
            "4 Crest Pieces"
          ],
          "intro": [
            {
              "type": "text",
              "text": "Desde Juperos Level 2."
            }
          ],
          "materials": "1 Crest Piece de cada color.",
          "unlock": [
            "Juperos Level 3",
            "Vesper"
          ],
          "mvp": "Vesper",
          "steps": [
            [
              {
                "type": "text",
                "text": "Destruye los tres Gate Switches de Level 2."
              }
            ],
            [
              {
                "type": "text",
                "text": "Corre al portal central activado."
              }
            ],
            [
              {
                "type": "text",
                "text": "Inserta los Crest Pieces en los pedestales."
              }
            ],
            [
              {
                "type": "text",
                "text": "Supera las salas de seguridad y las oleadas del elevador."
              }
            ],
            [
              {
                "type": "text",
                "text": "La salida del elevador conduce a Juperos Level 3."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Juperos_Quest"
        },
        {
          "id": "q-thanatos",
          "questNo": "5",
          "title": "Thanatos Tower",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "5 personas para 3F",
            "Trans/Expanded 95+ para 7F+"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Representative",
              "map": "tha_t01",
              "mapLabel": "📍 tha_t01 149,78"
            }
          ],
          "materials": "Para la quest final: arma Lv4 equipable + los 4 Fragments.",
          "unlock": [
            "Thanatos 3F+",
            "Memory of Thanatos"
          ],
          "mvp": "Memory of Thanatos",
          "steps": [
            [
              {
                "type": "text",
                "text": "Firma el contrato con"
              },
              {
                "type": "npc",
                "name": "Representative",
                "map": "tha_t01",
                "mapLabel": "📍 tha_t01 149,78"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "En 2F habla con"
              },
              {
                "type": "npc",
                "name": "Guide",
                "map": "tha_t02",
                "mapLabel": "📍 tha_t02 231,161"
              },
              {
                "type": "text",
                "text": "; deben estar presentes al menos 5 jugadores."
              }
            ],
            [
              {
                "type": "text",
                "text": "Por encima de 6F, Classic exige Transcendent o Expanded Class Lv95+."
              }
            ],
            [
              {
                "type": "text",
                "text": "La progresión final usa Fragment of Misery, Agony, Hatred y Despair para llegar al summon."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Thanatos_Tower_Quest"
        },
        {
          "id": "q-abyss",
          "questNo": "6",
          "title": "Abyss Lake",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Acceso por mecanismo",
            "No permanente"
          ],
          "intro": [
            {
              "type": "bold",
              "text": "Column"
            },
            {
              "type": "map",
              "map": "hu_fild05",
              "label": "📍 hu_fild05 168,303"
            }
          ],
          "materials": "1 Dragon Canine + 1 Dragon Scale + 1 Dragon Tail por apertura.",
          "unlock": [
            "Abyss Lake"
          ],
          "mvp": "Detardeurus / Detale",
          "note": [
            {
              "type": "text",
              "text": "No es una quest permanente: funciona como una barrera real de acceso."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Entrega las tres piezas al"
              },
              {
                "type": "bold",
                "text": "Column"
              },
              {
                "type": "map",
                "map": "hu_fild05",
                "label": "📍 hu_fild05 168,303"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Serás transportado a la isla central."
              }
            ],
            [
              {
                "type": "text",
                "text": "El portal al dungeon se abre durante aproximadamente 30 segundos."
              }
            ],
            [
              {
                "type": "text",
                "text": "Una party puede aprovechar una sola apertura."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Abyss_Lake_Entrance_Guide"
        }
      ]
    },
    {
      "id": "zona-arunafeltz",
      "icon": "☀️",
      "title": "Arunafeltz: Rachel, Veins & Nameless Island",
      "goal": "Aquí los prerrequisitos forman una sola campaña. La guía los muestra en orden y nunca vuelve a decir solo «completa X».",
      "route": [
        "q-lost-child",
        "q-rachel-sanctuary",
        "q-veins-siblings",
        "q-curse-gaebolg",
        "q-nameless",
        "q-ice-necklace"
      ],
      "quests": [
        {
          "id": "q-lost-child",
          "questNo": "1",
          "title": "Lost Child",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 60+",
            "Primer eslabón"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Vincent",
              "map": "ra_in01",
              "mapLabel": "📍 ra_in01 384,246 · mansión, entrada rachel 100,240"
            }
          ],
          "materials": "Ninguno.",
          "unlock": [
            "Prepara Rachel Sanctuary"
          ],
          "note": [
            {
              "type": "text",
              "text": "Esta quest enlaza directamente con"
            },
            {
              "type": "quest",
              "id": "q-rachel-sanctuary",
              "label": "Rachel Sanctuary"
            },
            {
              "type": "text",
              "text": "."
            }
          ],
          "steps": [
            [
              {
                "type": "npc",
                "name": "Vincent",
                "map": "ra_in01",
                "mapLabel": "📍 ra_in01 384,246"
              },
              {
                "type": "text",
                "text": "→"
              },
              {
                "type": "npc",
                "name": "Logan",
                "map": "rachel",
                "mapLabel": "📍 rachel 114,232"
              },
              {
                "type": "text",
                "text": "→"
              },
              {
                "type": "npc",
                "name": "Mr. Manson",
                "map": "ra_in01",
                "mapLabel": "📍 ra_in01 372,200"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Jenny",
                "map": "rachel",
                "mapLabel": "📍 rachel 48,236"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Pregunta a"
              },
              {
                "type": "npc",
                "name": "Idle Merchant",
                "map": "rachel",
                "mapLabel": "📍 rachel 138,73"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Idle Merchant",
                "map": "rachel",
                "mapLabel": "📍 rachel 120,47"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve con"
              },
              {
                "type": "npc",
                "name": "Suspicious Man",
                "map": "ra_fild01",
                "mapLabel": "📍 ra_fild01 245,325"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Encuentra a"
              },
              {
                "type": "npc",
                "name": "Kid / Phoebe",
                "map": "rachel",
                "mapLabel": "📍 rachel 263,32"
              },
              {
                "type": "text",
                "text": "y devuelve la joya."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega la carta final a"
              },
              {
                "type": "npc",
                "name": "High Priest Zhed",
                "map": "ra_temin",
                "mapLabel": "📍 ra_temin 277,159"
              },
              {
                "type": "text",
                "text": "."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Lost_Child_Quest"
        },
        {
          "id": "q-rachel-sanctuary",
          "questNo": "2",
          "title": "Rachel Sanctuary",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 60+",
            "Dungeon principal"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Nemma",
              "map": "ra_temple",
              "mapLabel": "📍 ra_temple 116,174"
            }
          ],
          "materials": "20 Firecracker + 40 Glacial Heart.",
          "unlock": [
            "Rachel Sanctuary ra_san01–05"
          ],
          "mvp": "Gloom Under Night",
          "notice": "En la implementación Classic, el estado del templo depende del progreso global de donaciones del servidor.",
          "steps": [
            [
              {
                "type": "text",
                "text": "Completa primero"
              },
              {
                "type": "quest",
                "id": "q-lost-child",
                "label": "Lost Child"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Nemma",
                "map": "ra_temple",
                "mapLabel": "📍 ra_temple 116,174"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Investiga el acceso al templo y localiza a"
              },
              {
                "type": "npc",
                "name": "Panno",
                "map": "ra_temin",
                "mapLabel": "📍 ra_temin · interior del Sanctuary; coord exacta no publicada"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Visita a"
              },
              {
                "type": "npc",
                "name": "Pope",
                "map": "ra_temin",
                "mapLabel": "📍 ra_temin 134,134"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Trabaja con"
              },
              {
                "type": "npc",
                "name": "High Priest Zhed",
                "map": "ra_temin",
                "mapLabel": "📍 ra_temin 277,159"
              },
              {
                "type": "text",
                "text": "y consigue la llave."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entra al área del Sanctuary, completa la investigación y cierra la quest."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Rachel_Sanctuary_Quest"
        },
        {
          "id": "q-veins-siblings",
          "questNo": "3",
          "title": "Veins Siblings",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Después de Rachel",
            "Materiales variables"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Karyn",
              "map": "veins",
              "mapLabel": "📍 veins 327,185"
            }
          ],
          "materials": "100+ Green Herb · 5 Monster's Feed · 1 Unripe Apple · 2 Yellow Potion · 10+ Milk · 50+ Jellopy · 6 Empty Bottle; 1 Steel no consumido.",
          "unlock": [
            "Prerequisito de Nameless Island"
          ],
          "note": [
            {
              "type": "text",
              "text": "Necesaria, junto con"
            },
            {
              "type": "quest",
              "id": "q-rachel-sanctuary",
              "label": "Rachel Sanctuary"
            },
            {
              "type": "text",
              "text": "y"
            },
            {
              "type": "quest",
              "id": "q-curse-gaebolg",
              "label": "Curse of Gaebolg"
            },
            {
              "type": "text",
              "text": ", para"
            },
            {
              "type": "quest",
              "id": "q-nameless",
              "label": "Nameless Island"
            },
            {
              "type": "text",
              "text": "."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Requiere"
              },
              {
                "type": "quest",
                "id": "q-rachel-sanctuary",
                "label": "Rachel Sanctuary"
              },
              {
                "type": "text",
                "text": "terminada."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Karyn",
                "map": "veins",
                "mapLabel": "📍 veins 327,185"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Busca a"
              },
              {
                "type": "npc",
                "name": "Young Town Native",
                "map": "veins",
                "mapLabel": "📍 veins 221,120"
              },
              {
                "type": "text",
                "text": "y luego a"
              },
              {
                "type": "npc",
                "name": "Lockenlock",
                "map": "veins",
                "mapLabel": "📍 veins 181,166"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Visita a"
              },
              {
                "type": "npc",
                "name": "Organic Soap Maker Ivory",
                "map": "veins",
                "mapLabel": "📍 veins 227,127"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Camel Farmer",
                "map": "veins",
                "mapLabel": "📍 veins 115,59"
              },
              {
                "type": "text",
                "text": "y ve al"
              },
              {
                "type": "npc",
                "name": "Silky Camel",
                "map": "ve_fild07",
                "mapLabel": "📍 ve_fild07 235,42"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Resuelve la parte aleatoria del camel; puede consumir muchos más Green Herb/Jellopy/Milk que el mínimo."
              }
            ],
            [
              {
                "type": "text",
                "text": "Continúa hasta encontrar a"
              },
              {
                "type": "npc",
                "name": "Little Curdie",
                "map": "que_thor",
                "mapLabel": "📍 que_thor 32,64"
              },
              {
                "type": "text",
                "text": "y termina la cadena."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Veins_Siblings_Quest"
        },
        {
          "id": "q-curse-gaebolg",
          "questNo": "4",
          "title": "Curse of Gaebolg",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 60+",
            "Puente hacia Nameless"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Busy Looking Boy",
              "map": "prontera",
              "mapLabel": "📍 prontera 248,212"
            }
          ],
          "materials": "1 Green Potion + 1 Yellow Gemstone + 1,000 zeny.",
          "unlock": [
            "Prerequisito de Nameless Island"
          ],
          "note": [
            {
              "type": "text",
              "text": "Esta quest es un requisito de"
            },
            {
              "type": "quest",
              "id": "q-nameless",
              "label": "Nameless Island"
            },
            {
              "type": "text",
              "text": "."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Empieza con"
              },
              {
                "type": "npc",
                "name": "Busy Looking Boy",
                "map": "prontera",
                "mapLabel": "📍 prontera 248,212"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve con"
              },
              {
                "type": "npc",
                "name": "Historian Karlomoff",
                "map": "yuno",
                "mapLabel": "📍 yuno 311,195"
              },
              {
                "type": "text",
                "text": "y después con"
              },
              {
                "type": "npc",
                "name": "Historian Rodafrian",
                "map": "morocc_in",
                "mapLabel": "📍 morocc_in 45,126"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Historian Mondo",
                "map": "mjolnir_01",
                "mapLabel": "📍 mjolnir_01 135,168"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Bonnie Imbullea",
                "map": "mjolnir_01",
                "mapLabel": "📍 mjolnir_01 316,268"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Consulta a"
              },
              {
                "type": "npc",
                "name": "Father Bamph",
                "map": "prt_church",
                "mapLabel": "📍 prt_church 185,106"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve con"
              },
              {
                "type": "npc",
                "name": "Assassin Guildsman",
                "map": "moc_fild16",
                "mapLabel": "📍 moc_fild16 201,295"
              },
              {
                "type": "text",
                "text": "y después con"
              },
              {
                "type": "npc",
                "name": "Marjana",
                "map": "que_job01",
                "mapLabel": "📍 que_job01 10,16"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Para asegurar la EXP, vuelve primero con"
              },
              {
                "type": "npc",
                "name": "Father Bamph",
                "map": "prt_church",
                "mapLabel": "📍 prt_church 185,106"
              },
              {
                "type": "text",
                "text": "y termina la rama correcta."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Curse_of_Gaebolg_%28Founding_of_the_Nation_Myth_Quest%29"
        },
        {
          "id": "q-nameless",
          "questNo": "5",
          "title": "Nameless Island & Cursed Monastery",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 80+",
            "Gran acceso"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Agent",
              "map": "airplane",
              "mapLabel": "📍 airplane · International Airship, piso inferior; coord exacta no publicada"
            }
          ],
          "materials": "3,000 zeny.",
          "unlock": [
            "nameless_n",
            "abbey01–03"
          ],
          "mvp": "Fallen Bishop Hibram · Beelzebub",
          "steps": [
            [
              {
                "type": "text",
                "text": "Antes de empezar, termina"
              },
              {
                "type": "quest",
                "id": "q-rachel-sanctuary",
                "label": "Rachel Sanctuary"
              },
              {
                "type": "text",
                "text": ","
              },
              {
                "type": "quest",
                "id": "q-veins-siblings",
                "label": "Veins Siblings"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "quest",
                "id": "q-curse-gaebolg",
                "label": "Curse of Gaebolg"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Agent",
                "map": "airplane",
                "mapLabel": "📍 airplane · International Airship, piso inferior"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Continúa con"
              },
              {
                "type": "npc",
                "name": "Father Bamph",
                "map": "prt_church",
                "mapLabel": "📍 prt_church 185,106"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Busca a"
              },
              {
                "type": "npc",
                "name": "Larjes",
                "map": "cmd_in02",
                "mapLabel": "📍 cmd_in02 174,89 · Comodo Casino"
              },
              {
                "type": "text",
                "text": "y sigue la investigación."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Rachel habla con"
              },
              {
                "type": "npc",
                "name": "Waiter",
                "map": "ra_in01",
                "mapLabel": "📍 ra_in01 308,59 · Inn"
              },
              {
                "type": "text",
                "text": ","
              },
              {
                "type": "npc",
                "name": "High Priest Zhed",
                "map": "ra_temin",
                "mapLabel": "📍 ra_temin 277,159"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "High Priest Niren",
                "map": "ra_temple",
                "mapLabel": "📍 ra_temple 165,57"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Regresa a Veins y localiza a"
              },
              {
                "type": "npc",
                "name": "Karyn",
                "map": "veins",
                "mapLabel": "📍 veins 327,185"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Viaja con"
              },
              {
                "type": "npc",
                "name": "Larjes",
                "map": "ve_fild07",
                "mapLabel": "📍 ve_fild07 128,131 · barco"
              },
              {
                "type": "text",
                "text": "hacia la isla."
              }
            ],
            [
              {
                "type": "text",
                "text": "Investiga"
              },
              {
                "type": "bold",
                "text": "Dead Crow"
              },
              {
                "type": "map",
                "map": "nameless_i",
                "label": "📍 nameless_i 125,205"
              },
              {
                "type": "text",
                "text": "; tras la parte de la casa se abre el acceso libre a nameless_n ."
              }
            ],
            [
              {
                "type": "text",
                "text": "Dentro del Monastery investiga los"
              },
              {
                "type": "bold",
                "text": "Books"
              },
              {
                "type": "map",
                "map": "abbey02",
                "label": "📍 abbey02 223,68"
              },
              {
                "type": "text",
                "text": "y continúa hasta cerrar la cadena."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Nameless_Island_Entrance_Quest"
        },
        {
          "id": "q-ice-necklace",
          "questNo": "6",
          "title": "Ice Necklace / Ktullanux",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Boss unlock",
            "Ice Dungeon 3"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Urstia",
              "map": "rachel",
              "mapLabel": "📍 rachel 157,183"
            }
          ],
          "materials": "5 Rough Wind + 1 Hammer + 1 Blank Scroll.",
          "unlock": [
            "Invocar Ktullanux"
          ],
          "mvp": "Ktullanux",
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Urstia",
                "map": "rachel",
                "mapLabel": "📍 rachel 157,183"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Busca a"
              },
              {
                "type": "npc",
                "name": "Maheo",
                "map": "ice_dun02",
                "mapLabel": "📍 ice_dun02 120,105"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Visita a"
              },
              {
                "type": "npc",
                "name": "Hamion",
                "map": "rachel",
                "mapLabel": "📍 rachel 264,98"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Consigue Hammer y Blank Scroll; completa la liberación de"
              },
              {
                "type": "npc",
                "name": "Maheo",
                "map": "ice_dun02",
                "mapLabel": "📍 ice_dun02 120,105"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Recibes 4 Freezing Snow Powder."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Ice Dungeon 3 apaga los cuatro fuegos sagrados alrededor del sello."
              }
            ],
            [
              {
                "type": "text",
                "text": "Esto invoca a Ktullanux; después de derrotarlo existe cooldown antes de otra invocación."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Ice_Necklace_Quest"
        }
      ]
    },
    {
      "id": "zona-geffen",
      "icon": "🌑",
      "title": "Geffen, Umbala & Nifflheim",
      "goal": "Una gran cadena de aventura cuyo premio es Geffenia; los corequisitos están delante de The Sign y enlazados.",
      "route": [
        "q-umbala-language",
        "q-piano-keys",
        "q-sign"
      ],
      "quests": [
        {
          "id": "q-umbala-language",
          "questNo": "1",
          "title": "Umbala Language",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Corequisito de The Sign"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Utan Chief",
              "map": "um_in",
              "mapLabel": "📍 um_in 39,122 · hut de Umbala; entrada aprox. umbala 68,251"
            }
          ],
          "materials": "10 Oil Paper · 5 Slick Paper · 1 Feather of Birds · 1 Squid Ink · Mr. Smile.",
          "unlock": [
            "Idioma de Umbala"
          ],
          "note": [
            {
              "type": "text",
              "text": "Necesaria para la parte de Umbala/Nifflheim de"
            },
            {
              "type": "quest",
              "id": "q-sign",
              "label": "The Sign"
            },
            {
              "type": "text",
              "text": "."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Entra a la hut y habla con"
              },
              {
                "type": "npc",
                "name": "Utan Chief",
                "map": "um_in",
                "mapLabel": "📍 um_in 39,122"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Lleva Mr. Smile equipado y entrega los materiales."
              }
            ],
            [
              {
                "type": "text",
                "text": "Completa el aprendizaje del idioma."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Language_Quest"
        },
        {
          "id": "q-piano-keys",
          "questNo": "2",
          "title": "Piano Keys",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Corequisito de The Sign"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Alreg",
              "map": "niflheim",
              "mapLabel": "📍 niflheim 224,243"
            }
          ],
          "materials": "Sin materiales importantes.",
          "unlock": [
            "Piano/Nifflheim"
          ],
          "note": [
            {
              "type": "text",
              "text": "Conviene terminarla antes de empezar la parte Nifflheim de"
            },
            {
              "type": "quest",
              "id": "q-sign",
              "label": "The Sign"
            },
            {
              "type": "text",
              "text": "."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Alreg",
                "map": "niflheim",
                "mapLabel": "📍 niflheim 224,243"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Continúa con"
              },
              {
                "type": "npc",
                "name": "Crayu",
                "map": "nif_in",
                "mapLabel": "📍 nif_in 105,81"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Kuzkahina",
                "map": "nif_in",
                "mapLabel": "📍 nif_in 31,20"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Investiga las tumbas en"
              },
              {
                "type": "map",
                "map": "niflheim",
                "label": "📍 niflheim 208,103"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "map",
                "map": "niflheim",
                "label": "📍 niflheim 169,71"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve a Witch Tower por"
              },
              {
                "type": "map",
                "map": "niflheim",
                "label": "📍 niflheim 254,191"
              },
              {
                "type": "text",
                "text": "y habla con"
              },
              {
                "type": "npc",
                "name": "Witch",
                "map": "nif_in",
                "mapLabel": "📍 nif_in 188,168"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Completa la secuencia de piano."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Piano_Keys_Quest"
        },
        {
          "id": "q-sign",
          "questNo": "3",
          "title": "The Sign → Geffenia",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Lv 50+",
            "Muy larga",
            "Horarios"
          ],
          "intro": [
            {
              "type": "text",
              "text": "Announcement → Metz en Prontera."
            }
          ],
          "materials": "Gran lista de materiales + 100,000z + arma Lv4 no consumida.",
          "unlock": [
            "Lucifer’s Lament",
            "Geffenia"
          ],
          "notice": "Por duración y horarios, esta quest se debe preparar antes de empezarla. El enlace completo es especialmente recomendable.",
          "steps": [
            [
              {
                "type": "text",
                "text": "Antes de avanzar por Umbala/Nifflheim, termina"
              },
              {
                "type": "quest",
                "id": "q-umbala-language",
                "label": "Umbala Language"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "quest",
                "id": "q-piano-keys",
                "label": "Piano Keys"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Completa las pruebas de Sobbing Starlight."
              }
            ],
            [
              {
                "type": "text",
                "text": "En la fase de reparación visita a"
              },
              {
                "type": "npc",
                "name": "Engel Howard",
                "map": "mjo_dun02",
                "mapLabel": "📍 mjo_dun02 88,295"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Geffen Tower habla con"
              },
              {
                "type": "npc",
                "name": "Dhota",
                "map": "gef_tower",
                "mapLabel": "📍 gef_tower 118,36"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Umbala/Nifflheim continúa con"
              },
              {
                "type": "npc",
                "name": "Laotan",
                "map": "umbala",
                "mapLabel": "📍 umbala 163,256"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Serin",
                "map": "niflheim",
                "mapLabel": "📍 niflheim 313,70"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Obtén The Sign y respeta las ventanas horarias de entrega/reparación."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega Sobbing Starlight a"
              },
              {
                "type": "npc",
                "name": "Lady Hell"
              },
              {
                "type": "text",
                "text": "; la guía Classic sitúa esta parte en un área especial sin coordenada de mapa normal."
              }
            ],
            [
              {
                "type": "text",
                "text": "Recibe Lucifer’s Lament y úsalo en la fuente de Geffen para abrir temporalmente el portal a Geffenia."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Sign_Quest"
        }
      ]
    },
    {
      "id": "zona-moscovia",
      "icon": "❄️",
      "title": "Moscovia",
      "goal": "El viaje en barco y el dungeon forman una sola aventura; el MVP queda detrás de esta ruta.",
      "route": [
        "q-moscovia"
      ],
      "quests": [
        {
          "id": "q-moscovia",
          "questNo": "1",
          "title": "Finding the Moving Island",
          "kind": "core",
          "minLevel": 1,
          "badges": [
            "Acceso permanente",
            "Moscovia"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Berbayeff",
              "map": "moscovia",
              "mapLabel": "📍 moscovia 171,71"
            }
          ],
          "materials": "10 Rusty Screws · 10 Jubilees · 10 Strange Steel Pieces · 5 Flexible Tubes · 30 Logs · 20 Tough Vines · 20 Antelope Horns · 10 Sea-otter Furs.",
          "unlock": [
            "Moscovia Dungeon"
          ],
          "mvp": "Gopinich",
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Berbayeff",
                "map": "moscovia",
                "mapLabel": "📍 moscovia 171,71"
              },
              {
                "type": "text",
                "text": "y luego con"
              },
              {
                "type": "npc",
                "name": "Mr. Ibanoff",
                "map": "moscovia",
                "mapLabel": "📍 moscovia 135,49"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega el primer set para reparar el barco."
              }
            ],
            [
              {
                "type": "text",
                "text": "Durante el viaje sigue las órdenes del timón y derrota los monstruos."
              }
            ],
            [
              {
                "type": "text",
                "text": "En la isla habla con"
              },
              {
                "type": "npc",
                "name": "Aged Stranger",
                "map": "mosk_fild01",
                "mapLabel": "📍 mosk_fild01 86,104"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Reporta al palacio y reúne los materiales restantes."
              }
            ],
            [
              {
                "type": "text",
                "text": "Cierra la cadena para consolidar el acceso."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Finding_The_Moving_Island_Quest"
        }
      ]
    },
    {
      "id": "zona-morroc",
      "icon": "🔥",
      "title": "Morroc & Dimensional Gorge",
      "goal": "Esta zona puede usar dos implementaciones históricas según el servidor. Revisa cuál está habilitada antes de comenzar.",
      "route": [
        "q-dandelion",
        "q-continental-guard"
      ],
      "quests": [
        {
          "id": "q-dandelion",
          "questNo": "1",
          "title": "Dandelion’s Request — ruta iRO Classic",
          "kind": "server",
          "minLevel": 1,
          "badges": [
            "Lv 60+",
            "Ruta iRO",
            "Cadena larga"
          ],
          "intro": [
            {
              "type": "text",
              "text": "Inicio depende de tu clase; el contacto inicial te dirige hacia Morroc."
            }
          ],
          "materials": "1 Flame Heart · 1 Great Nature · 1 Rough Wind · 1 Mystic Frozen; además requiere progreso en Thanatos Tower .",
          "unlock": [
            "Dimensional Gorge"
          ],
          "note": [
            {
              "type": "text",
              "text": "iRO Classic utilizó esta ruta para Dimensional Gorge. Si tu rAthena privado usa la variante"
            },
            {
              "type": "quest",
              "id": "q-continental-guard",
              "label": "Continental Guard"
            },
            {
              "type": "text",
              "text": ", sigue la tarjeta siguiente."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "La cadena utiliza progreso de"
              },
              {
                "type": "quest",
                "id": "q-thanatos",
                "label": "Thanatos Tower"
              },
              {
                "type": "text",
                "text": "hasta la sección de la Yellow Key."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Morroc busca a"
              },
              {
                "type": "npc",
                "name": "Sharp-Looking Kid",
                "map": "morocc",
                "mapLabel": "📍 morocc 43,108"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Continúa con"
              },
              {
                "type": "npc",
                "name": "Bar Master",
                "map": "que_job01",
                "mapLabel": "📍 que_job01 82,95"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Valdes",
                "map": "que_job01",
                "mapLabel": "📍 que_job01 16,21"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "La investigación también lleva a"
              },
              {
                "type": "npc",
                "name": "Yunia",
                "map": "yuno_in04",
                "mapLabel": "📍 yuno_in04 180,106"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Termina la rama correspondiente para obtener el acceso al Dimensional Gorge."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Dandelion%27s_Request"
        },
        {
          "id": "q-continental-guard",
          "questNo": "2",
          "title": "Continental Guard — variante común de servidores privados",
          "kind": "server",
          "minLevel": 80,
          "badges": [
            "Lv 80+",
            "Party 2+",
            "Verificar servidor"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Continental Official",
              "map": "morocc",
              "mapLabel": "📍 morocc 176,103"
            }
          ],
          "materials": "30 Live Coal + 50 Glacial Heart.",
          "unlock": [
            "Dimensional Gorge",
            "Injured Satan Morroc"
          ],
          "mvp": "Injured Satan Morroc",
          "notice": "La propia iRO Classic marca esta implementación como no usada allí. En rAthena/private 13.2 debes confirmar cuál de las dos rutas está habilitada.",
          "steps": [
            [
              {
                "type": "text",
                "text": "Regístrate con"
              },
              {
                "type": "npc",
                "name": "Continental Official",
                "map": "morocc",
                "mapLabel": "📍 morocc 176,103"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega materiales a"
              },
              {
                "type": "npc",
                "name": "Chief Balrog",
                "map": "morocc",
                "mapLabel": "📍 morocc 159,113"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Con party de 2+, entra mediante"
              },
              {
                "type": "npc",
                "name": "Continental Guard",
                "map": "moc_fild20",
                "mapLabel": "📍 moc_fild20 38,174"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Localiza"
              },
              {
                "type": "npc",
                "name": "Group of Evil",
                "map": "moc_fild21",
                "mapLabel": "📍 moc_fild21 171,227"
              },
              {
                "type": "text",
                "text": "y participa en la batalla."
              }
            ],
            [
              {
                "type": "text",
                "text": "Obtén Piece of Morocc Skin y completa el reporte."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Continental_Guard_Quest_%28Resurrection_of_Satan_Morroc%29"
        }
      ]
    },
    {
      "id": "zona-newworld",
      "icon": "🌌",
      "title": "New World — Episode 13.1 → 13.2",
      "goal": "Esta es la ruta de acceso más larga. Todas las quests necesarias están dentro de esta zona y cada referencia es clicable.",
      "route": [
        "q-new-world",
        "q-new-surroundings",
        "q-attitude",
        "q-finding-fairy",
        "q-report-new-world",
        "q-ring-wise-king",
        "q-two-tribes",
        "q-guardian-yggdrasil"
      ],
      "quests": [
        {
          "id": "q-new-world",
          "questNo": "1",
          "title": "Onward to the New World",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Lv 70+",
            "Episode 13.1"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Recruiter for the Brave",
              "map": "prt_castle",
              "mapLabel": "📍 prt_castle 83,67"
            }
          ],
          "materials": "300 Jellopy + 1 Emerald + 1 Ruby; matar 50 Mobsters.",
          "unlock": [
            "Midgard Camp",
            "Ash-Vacuum"
          ],
          "notice": "La página iRO Classic archivada indica que esta quest no estuvo disponible allí en ese momento; en rAthena 13.2 privado confirma el script.",
          "steps": [
            [
              {
                "type": "text",
                "text": "Empieza con"
              },
              {
                "type": "npc",
                "name": "Recruiter for the Brave",
                "map": "prt_castle",
                "mapLabel": "📍 prt_castle 83,67"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega 300 Jellopy a"
              },
              {
                "type": "npc",
                "name": "Promotional Staff",
                "map": "aldebaran",
                "mapLabel": "📍 aldebaran 127,138"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega Emerald + Ruby a"
              },
              {
                "type": "npc",
                "name": "Promotional Staff",
                "map": "geffen",
                "mapLabel": "📍 geffen 90,67"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Promotional Staff",
                "map": "izlude",
                "mapLabel": "📍 izlude 99,136"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Rekenber HQ pasa por"
              },
              {
                "type": "npc",
                "name": "Guards",
                "map": "lhz_in01",
                "mapLabel": "📍 lhz_in01 124,234"
              },
              {
                "type": "text",
                "text": "y continúa con"
              },
              {
                "type": "npc",
                "name": "Sikaiz",
                "map": "lhz_in01",
                "mapLabel": "📍 lhz_in01 · frente del lecture hall; coord exacta no publicada"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Informa a"
              },
              {
                "type": "npc",
                "name": "Rune-Midgards Alliance Manager",
                "map": "prt_castle",
                "mapLabel": "📍 prt_castle 121,51"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Arunafeltz Alliance Manager",
                "map": "ra_temple",
                "mapLabel": "📍 ra_temple 119,113"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve al Gorge con"
              },
              {
                "type": "npc",
                "name": "Rift Guard",
                "map": "moc_fild20",
                "mapLabel": "📍 moc_fild20 349,179"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Munkenro",
                "map": "moc_fild22b",
                "mapLabel": "📍 moc_fild22b 230,197"
              },
              {
                "type": "text",
                "text": ", mata 50 Mobsters y vuelve con él."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Onward_to_the_New_World_Quest"
        },
        {
          "id": "q-new-surroundings",
          "questNo": "2",
          "title": "New Surroundings — recomendada",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Cuenta para Report",
            "Ruta simple"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Marian",
              "map": "mid_camp",
              "mapLabel": "📍 mid_camp 222,283"
            }
          ],
          "materials": "20 Ordinary Branch + 20 Strong Vine.",
          "unlock": [
            "1 de 2 quests para Report"
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Requiere acceso de"
              },
              {
                "type": "quest",
                "id": "q-new-world",
                "label": "Onward to the New World"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Marian",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 222,283"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Repórtate con"
              },
              {
                "type": "npc",
                "name": "Instructor Lugen",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 261,284"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Continúa con"
              },
              {
                "type": "npc",
                "name": "Diego",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 264,263"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Reporta a"
              },
              {
                "type": "npc",
                "name": "Jan",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 162,298"
              },
              {
                "type": "text",
                "text": "y completa la cadena."
              }
            ],
            [
              {
                "type": "text",
                "text": "Reúne los 20 Ordinary Branch + 20 Strong Vine cuando corresponda."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/New_Surroundings"
        },
        {
          "id": "q-attitude",
          "questNo": "3",
          "title": "Attitude to the New World — recomendada",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Cuenta para Report",
            "Ruta simple"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Rumis Block",
              "map": "mid_camp",
              "mapLabel": "📍 mid_camp 188,254"
            }
          ],
          "materials": "1 Empty Bottle + 1 Strong Vine + 5 Holy Water + 30 Sticky Mucus + 20 Horn of Hillslion; la ruta final puede pedir Horn of Tendrilion.",
          "unlock": [
            "2 de 2 quests para Report"
          ],
          "note": [
            {
              "type": "text",
              "text": "Con"
            },
            {
              "type": "quest",
              "id": "q-new-surroundings",
              "label": "New Surroundings"
            },
            {
              "type": "text",
              "text": "+ esta quest ya tienes las 2 necesarias para"
            },
            {
              "type": "quest",
              "id": "q-report-new-world",
              "label": "Report from the New World"
            },
            {
              "type": "text",
              "text": "."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Requiere acceso de"
              },
              {
                "type": "quest",
                "id": "q-new-world",
                "label": "Onward to the New World"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Rumis Block",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 188,254"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Continúa con"
              },
              {
                "type": "npc",
                "name": "Camp Guard",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 336,171"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Reporta a"
              },
              {
                "type": "npc",
                "name": "Terris Block",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 240,270"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Completa la investigación y entrega los materiales."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Attitude_to_the_New_World"
        },
        {
          "id": "q-tripatriate",
          "questNo": "3A",
          "title": "Tripatriate Union’s Feud — alternativa",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Opcional",
            "Cuenta para Report"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "United Research Official",
              "map": "mid_campin",
              "mapLabel": "📍 mid_campin 376,120 · entra por mid_camp 163,234"
            }
          ],
          "materials": "1 Folding Fan of Cat Ghost + 1 Flame Stone + 1 Old Frying Pan + 1 Squid Ink.",
          "unlock": [
            "Alternativa para Report"
          ],
          "note": [
            {
              "type": "text",
              "text": "Es una alternativa válida a"
            },
            {
              "type": "quest",
              "id": "q-new-surroundings",
              "label": "New Surroundings"
            },
            {
              "type": "text",
              "text": "o"
            },
            {
              "type": "quest",
              "id": "q-attitude",
              "label": "Attitude to the New World"
            },
            {
              "type": "text",
              "text": "para cumplir el requisito de 2/4 de"
            },
            {
              "type": "quest",
              "id": "q-report-new-world",
              "label": "Report from the New World"
            },
            {
              "type": "text",
              "text": "."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Requiere acceso de"
              },
              {
                "type": "quest",
                "id": "q-new-world",
                "label": "Onward to the New World"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "United Research Official",
                "map": "mid_campin",
                "mapLabel": "📍 mid_campin 376,120"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Continúa con"
              },
              {
                "type": "npc",
                "name": "Ryosen",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 165,245"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Hue",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 247,255"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Completa la disputa entre los tres grupos del campamento."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Tripatriate_Union%27s_Feud"
        },
        {
          "id": "q-rayan-moore",
          "questNo": "3B",
          "title": "Pursuing Rayan Moore — alternativa",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Opcional",
            "Cuenta para Report"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Rin",
              "map": "que_job01",
              "mapLabel": "📍 que_job01 84,17"
            }
          ],
          "materials": "Consulta la página completa: es una cadena de investigación más larga.",
          "unlock": [
            "Alternativa para Report"
          ],
          "note": [
            {
              "type": "text",
              "text": "También cuenta para el 2/4 de"
            },
            {
              "type": "quest",
              "id": "q-report-new-world",
              "label": "Report from the New World"
            },
            {
              "type": "text",
              "text": "; no es la ruta preferida para un jugador nuevo porque es más larga."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Requiere acceso de"
              },
              {
                "type": "quest",
                "id": "q-new-world",
                "label": "Onward to the New World"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Empieza con"
              },
              {
                "type": "npc",
                "name": "Rin",
                "map": "que_job01",
                "mapLabel": "📍 que_job01 84,17"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Investiga la tierra en"
              },
              {
                "type": "map",
                "map": "hu_fild04",
                "label": "📍 hu_fild04 235,103"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Midgard Camp continúa con"
              },
              {
                "type": "npc",
                "name": "Defaria",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 256,272"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Manager",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 191,206"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Sigue la investigación de Rayan Moore hasta cerrar la quest."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Pursuing_Rayan_Moore"
        },
        {
          "id": "q-finding-fairy",
          "questNo": "4",
          "title": "Finding a Fairy",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Obligatoria para Ring",
            "Corta"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Small Fairy",
              "map": "spl_fild02",
              "mapLabel": "📍 spl_fild02 34,223"
            }
          ],
          "materials": "Sin set principal de materiales.",
          "unlock": [
            "Prerequisito de Ring"
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Requiere acceso de"
              },
              {
                "type": "quest",
                "id": "q-new-world",
                "label": "Onward to the New World"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Small Fairy",
                "map": "spl_fild02",
                "mapLabel": "📍 spl_fild02 34,223"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Reporta a"
              },
              {
                "type": "npc",
                "name": "Camp Guard Captain",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 212,237"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Busca a"
              },
              {
                "type": "npc",
                "name": "Tree Giant",
                "map": "man_fild03",
                "mapLabel": "📍 man_fild03 236,105"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Regresa con"
              },
              {
                "type": "npc",
                "name": "Camp Guard Captain",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 212,237"
              },
              {
                "type": "text",
                "text": "y termina."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Finding_a_Fairy"
        },
        {
          "id": "q-report-new-world",
          "questNo": "5",
          "title": "Report from the New World",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "2 de 4 quests previas",
            "2.5M Base"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Hibba Agip",
              "map": "mid_campin",
              "mapLabel": "📍 mid_campin 90,114"
            }
          ],
          "materials": "Antes de iniciar: completa 2 de 4 — New Surroundings , Attitude to the New World , Tripatriate Union’s Feud , Pursuing Rayan Moore .",
          "unlock": [
            "Necesaria para Guardian",
            "Ring exige al menos haberla iniciado"
          ],
          "note": [
            {
              "type": "text",
              "text": "Para una ruta limpia recomendamos terminar"
            },
            {
              "type": "quest",
              "id": "q-report-new-world",
              "label": "Report from the New World"
            },
            {
              "type": "text",
              "text": "antes de"
            },
            {
              "type": "quest",
              "id": "q-ring-wise-king",
              "label": "Ring of the Wise King"
            },
            {
              "type": "text",
              "text": ", aunque Ring técnicamente solo exige que Report esté iniciado."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Hibba Agip",
                "map": "mid_campin",
                "mapLabel": "📍 mid_campin 90,114"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega el documento a"
              },
              {
                "type": "npc",
                "name": "Expedition Messenger",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 206,286"
              },
              {
                "type": "text",
                "text": "; se destruirá."
              }
            ],
            [
              {
                "type": "text",
                "text": "Recolecta páginas y reconstruye cuatro volúmenes; guarda volúmenes completos en storage para evitar duplicados."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega copias a"
              },
              {
                "type": "npc",
                "name": "Laur",
                "map": "prt_castle",
                "mapLabel": "📍 prt_castle 88,165"
              },
              {
                "type": "text",
                "text": ","
              },
              {
                "type": "npc",
                "name": "Nuria",
                "map": "ra_temple",
                "mapLabel": "📍 ra_temple 122,174"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Gerhart",
                "map": "lhz_in01",
                "mapLabel": "📍 lhz_in01 110,174"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Regresa con"
              },
              {
                "type": "npc",
                "name": "Hibba Agip",
                "map": "mid_campin",
                "mapLabel": "📍 mid_campin 90,114"
              },
              {
                "type": "text",
                "text": "y termina."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Report_from_the_New_World"
        },
        {
          "id": "q-ring-wise-king",
          "questNo": "6",
          "title": "Ring of the Wise King",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Episode 13.2",
            "1 hora de espera"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Schwartzvalt Mechanic",
              "map": "mid_camp",
              "mapLabel": "📍 mid_camp 197,237"
            }
          ],
          "materials": "Finding a Fairy completada + Report from the New World iniciado; 1 Unidentified Mineral durante la quest.",
          "unlock": [
            "Ring of the Wise Ancient King",
            "Desbloquea Two Tribes"
          ],
          "note": [
            {
              "type": "text",
              "text": "Esta tarjeta existe precisamente para que nunca tengas que leer “completa"
            },
            {
              "type": "quest",
              "id": "q-ring-wise-king",
              "label": "Ring of the Wise King"
            },
            {
              "type": "text",
              "text": "” sin saber cómo."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Schwartzvalt Mechanic",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 197,237"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve con"
              },
              {
                "type": "npc",
                "name": "Arunafeltz Linguist",
                "map": "mid_campin",
                "mapLabel": "📍 mid_campin 168,82 · Alliance HQ 2F"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Rune Midgart’s Magician",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 147,256"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Extrae Red Jewel del"
              },
              {
                "type": "bold",
                "text": "Gem"
              },
              {
                "type": "map",
                "map": "spl_fild02",
                "label": "📍 spl_fild02 26,218"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Extrae Blue Jewel del"
              },
              {
                "type": "bold",
                "text": "Gem"
              },
              {
                "type": "map",
                "map": "man_fild03",
                "label": "📍 man_fild03 227,109"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Regresa con"
              },
              {
                "type": "npc",
                "name": "Rune Midgart’s Magician",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 147,256"
              },
              {
                "type": "text",
                "text": "→"
              },
              {
                "type": "npc",
                "name": "Arunafeltz Linguist",
                "map": "mid_campin",
                "mapLabel": "📍 mid_campin 168,82 · Alliance HQ 2F"
              },
              {
                "type": "text",
                "text": "→"
              },
              {
                "type": "npc",
                "name": "Schwartzvalt Mechanic",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 197,237"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "El"
              },
              {
                "type": "npc",
                "name": "Schwartzvalt Mechanic",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 197,237"
              },
              {
                "type": "text",
                "text": "pedirá un medio para guardar la información; vuelve con"
              },
              {
                "type": "npc",
                "name": "Rune Midgart’s Magician",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 147,256"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Obtén 1 Unidentified Mineral de Mysterious Rock en cualquiera de los Manuk Fields."
              }
            ],
            [
              {
                "type": "text",
                "text": "Entrega mineral al"
              },
              {
                "type": "npc",
                "name": "Rune Midgart’s Magician",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 147,256"
              },
              {
                "type": "text",
                "text": "; habla otra vez para recibir la gema preparada."
              }
            ],
            [
              {
                "type": "text",
                "text": "Llévala a"
              },
              {
                "type": "npc",
                "name": "Schwartzvalt Mechanic",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 197,237"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "bold",
                "text": "Espera 1 hora."
              }
            ],
            [
              {
                "type": "text",
                "text": "Vuelve con"
              },
              {
                "type": "npc",
                "name": "Schwartzvalt Mechanic",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 197,237"
              },
              {
                "type": "text",
                "text": "y recibe el Ring."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Ring_of_the_Wise_King"
        },
        {
          "id": "q-two-tribes",
          "questNo": "7",
          "title": "Two Tribes",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Episode 13.2",
            "Yggdrasil en paso 7"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Arc",
              "map": "spl_in01",
              "mapLabel": "📍 spl_in01 32,306 · entra por splendide 228,162"
            }
          ],
          "materials": "Ring of the Wise King terminada y Ring equipado.",
          "unlock": [
            "Yggdrasil Dungeon",
            "Monedas de Manuk/Splendide"
          ],
          "note": [
            {
              "type": "text",
              "text": "Para iniciar"
            },
            {
              "type": "quest",
              "id": "q-guardian-yggdrasil",
              "label": "Guardian of Yggdrasil"
            },
            {
              "type": "text",
              "text": "basta con haber avanzado hasta entrar al dungeon."
            }
          ],
          "steps": [
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Arc",
                "map": "spl_in01",
                "mapLabel": "📍 spl_in01 32,306"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Sigue weeds:"
              },
              {
                "type": "map",
                "map": "spl_fild02",
                "label": "📍 spl_fild02 44,214"
              },
              {
                "type": "text",
                "text": "→ 123,106 → 330,192."
              }
            ],
            [
              {
                "type": "text",
                "text": "Sigue footprints:"
              },
              {
                "type": "map",
                "map": "spl_fild02",
                "label": "📍 spl_fild02 328,322"
              },
              {
                "type": "text",
                "text": "→"
              },
              {
                "type": "map",
                "map": "spl_fild01",
                "label": "📍 spl_fild01 343,109"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "bold",
                "text": "Paso 7:"
              },
              {
                "type": "text",
                "text": "entra a Yggdrasil Dungeon por"
              },
              {
                "type": "map",
                "map": "spl_fild01",
                "label": "📍 spl_fild01 368,112"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Petrified Sapha",
                "map": "nyd_dun01",
                "mapLabel": "📍 nyd_dun01 57,222"
              },
              {
                "type": "text",
                "text": "y vuelve con"
              },
              {
                "type": "npc",
                "name": "Arc",
                "map": "spl_in01",
                "mapLabel": "📍 spl_in01 32,306 · entra por splendide 228,162"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "En Manuk localiza a los"
              },
              {
                "type": "npc",
                "name": "Villagers",
                "map": "manuk",
                "mapLabel": "📍 manuk 278,177"
              },
              {
                "type": "text",
                "text": "y luego a"
              },
              {
                "type": "npc",
                "name": "Snorren",
                "map": "manuk",
                "mapLabel": "📍 manuk 252,110 · interior del edificio; coord exacta no publicada"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Continúa la búsqueda de frutas/Yggdrasil Berries y la investigación de"
              },
              {
                "type": "npc",
                "name": "Petrified Sapha",
                "map": "nyd_dun01",
                "mapLabel": "📍 nyd_dun01 57,222"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Cierra la cadena regresando con"
              },
              {
                "type": "npc",
                "name": "Arc",
                "map": "spl_in01",
                "mapLabel": "📍 spl_in01 32,306"
              },
              {
                "type": "text",
                "text": "y los líderes correspondientes."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Two_Tribes"
        },
        {
          "id": "q-guardian-yggdrasil",
          "questNo": "8",
          "title": "Guardian of Yggdrasil → Nidhoggur",
          "kind": "ep13",
          "minLevel": 70,
          "badges": [
            "Episode 13.2",
            "Nest en paso 9"
          ],
          "intro": [
            {
              "type": "npc",
              "name": "Yggdrasil Gatekeeper",
              "map": "nyd_dun02",
              "mapLabel": "📍 nyd_dun02 99,199"
            }
          ],
          "materials": "Report from the New World terminada + Two Tribes iniciada hasta entrar a Yggdrasil Dungeon.",
          "unlock": [
            "Nidhoggur’s Nest"
          ],
          "mvp": "Nidhoggur’s Shadow",
          "notice": "iRO Classic documenta un problema histórico al cerrar la instancia; valida esta parte con el script concreto de tu servidor.",
          "steps": [
            [
              {
                "type": "text",
                "text": "Entra al dungeon por"
              },
              {
                "type": "map",
                "map": "spl_fild01",
                "label": "📍 spl_fild01 368,112"
              },
              {
                "type": "text",
                "text": "y usa el portal de"
              },
              {
                "type": "map",
                "map": "nyd_dun01",
                "label": "📍 nyd_dun01 252,144"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Cruza con"
              },
              {
                "type": "bold",
                "text": "Strange Device"
              },
              {
                "type": "map",
                "map": "nyd_dun02",
                "label": "📍 nyd_dun02 137,274"
              },
              {
                "type": "text",
                "text": "y habla con"
              },
              {
                "type": "npc",
                "name": "Yggdrasil Gatekeeper",
                "map": "nyd_dun02",
                "mapLabel": "📍 nyd_dun02 99,199"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Reporta a"
              },
              {
                "type": "npc",
                "name": "Commander Agip",
                "map": "mid_campin",
                "mapLabel": "📍 mid_campin 90,121"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Habla con"
              },
              {
                "type": "npc",
                "name": "Historian Magnifier",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 271,299"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Ve a Prontera Library y habla con"
              },
              {
                "type": "npc",
                "name": "Assistant Naomi",
                "map": "prt_in",
                "mapLabel": "📍 prt_in 171,94"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Para la rama Laphine:"
              },
              {
                "type": "npc",
                "name": "Grumbling Soldier",
                "map": "splendide",
                "mapLabel": "📍 splendide 198,178"
              },
              {
                "type": "text",
                "text": "→"
              },
              {
                "type": "npc",
                "name": "Laphine Commander",
                "map": "spl_in01",
                "mapLabel": "📍 spl_in01 110,60"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Para la rama Sapha:"
              },
              {
                "type": "npc",
                "name": "Laphine Prisoner",
                "map": "man_in01",
                "mapLabel": "📍 man_in01 291,62"
              },
              {
                "type": "text",
                "text": "→"
              },
              {
                "type": "npc",
                "name": "Neat Etorr",
                "map": "man_in01",
                "mapLabel": "📍 man_in01 311,57"
              },
              {
                "type": "text",
                "text": "."
              }
            ],
            [
              {
                "type": "text",
                "text": "Regresa con"
              },
              {
                "type": "npc",
                "name": "Historian Magnifier",
                "map": "mid_camp",
                "mapLabel": "📍 mid_camp 271,299"
              },
              {
                "type": "text",
                "text": "y"
              },
              {
                "type": "npc",
                "name": "Commander Agip",
                "map": "mid_campin",
                "mapLabel": "📍 mid_campin 90,121"
              },
              {
                "type": "text",
                "text": "y obtén la cooperación de una tribu."
              }
            ],
            [
              {
                "type": "bold",
                "text": "Paso 9:"
              },
              {
                "type": "text",
                "text": "desde aquí queda disponible Nidhoggur’s Nest."
              }
            ]
          ],
          "sourceHref": "https://irowiki.org/classic/Guardian_of_Yggdrasil"
        }
      ]
    }
  ]
};
