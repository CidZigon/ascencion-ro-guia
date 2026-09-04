/* Contenido curado de la guía "Progresión y EXP" (módulo 1).
   Migrado una sola vez desde public/data/modules/module-1.html y
   module-1.en.html vía un script de extracción de un solo uso
   (no forma parte de data:build) — de acá en adelante este archivo
   se edita a mano, como app/i18n.ts. module-1.html se deja intacto
   en disco porque build-world-catalog.mjs, audit-module-links.mjs y
   split-content-bundle.mjs siguen escaneándolo para NPCs/mapas,
   auditoría de enlaces y el índice de búsqueda global. */

export type ExpLang = "es" | "en";
export type ExpMapRef = { map: string; label: string };
export type ExpMobRef = { id: number; name: string };
export type ExpTurnIn = { id: string; minLevel: number; levelRange: string; item: string; npc: string; npcLocation: ExpMapRef; mob: ExpMobRef; bestMap: string; hp: string; mobLevel: string };
export type ExpHunt = { id: string; minLevel: number; levelRange: string; mob: ExpMobRef; exp: string; npc: string; npcLocation: ExpMapRef; prereq: string; dropNote: string };
export type ExpStep = { text: string; npcNames: string[]; map: ExpMapRef | null };
export type ExpPrereq = { id: string; title: string; paragraphs: string[]; chain: string[]; sourceHref: string; sourceLabel: string };
export type ExpQuestLike = { id: string; minLevel: number; title: string; badges: string[]; effort: string; effortLabel: string; paragraphs: string[]; steps: ExpStep[]; prereq: ExpPrereq | null; sourceHref: string; sourceLabel: string };
export type ExpGuideText = {
  title: string; tagline: string; badges: string[];
  searchPlaceholder: string; clearFilters: string; allLevels: string;
  turninsTitle: string; turninsCompatBadges: string[]; turninsNote: string;
  huntsTitle: string; huntsCompatBadges: string[]; huntsNote: string; huntsRule: string; huntsDropDisclaimer: string;
  questsTitle: string; questsIntro: string;
  cooldownsTitle: string; cooldownsCompatBadges: string[]; cooldownsIntro: string;
  rulesTitle: string; rulesParagraphs: string[];
  startLabel: string; prereqLabel: string; sourceLabel: string;
  navResumen: string; navTurnins: string; navHunts: string; navQuests: string; navCooldowns: string; navReglas: string;
  turnins: ExpTurnIn[]; hunts: ExpHunt[]; quests: ExpQuestLike[]; cooldowns: ExpQuestLike[];
};

export const EXP_GUIDE: Record<ExpLang, ExpGuideText> = {
  "es": {
    "title": "EXP & Leveling",
    "tagline": "Ragnarok Online Pre-Renewal. Catálogo de quests de experiencia, repetibles de entrega, cacerías y cooldowns. Base documental: iRO Wiki Classic; recomendaciones de farmeo contrastadas con RateMyServer Pre-Re y experiencia comunitaria.",
    "badges": [
      "PRE-RENEWAL",
      "EPISODIO 13.2",
      "rAthena / Pre-Re"
    ],
    "searchPlaceholder": "Buscar quest, item, mob, NPC o mapa…",
    "clearFilters": "Limpiar filtros",
    "allLevels": "Todos los niveles",
    "turninsTitle": "📦 Item Turn-In",
    "turninsCompatBadges": [
      "Confirmar script en tu servidor",
      "RMS Pre-Re 1×"
    ],
    "turninsNote": "NPC y cantidad pertenecen al sistema Repeatable EXP de iRO Classic. El mob recomendado es el más seguro entre todos los que dropean ese item (menos HP), no necesariamente el más citado en guías externas — en AscencionRO (10x) cualquier rate base de RMS de 10% o más ya cae garantizado en cada kill, así que la única diferencia real entre alternativas es qué tan peligroso es matarlas. Toca el nombre del mob para abrir su ficha local.",
    "huntsTitle": "⚔️ Monster Hunting",
    "huntsCompatBadges": [
      "Confirmar script en tu servidor",
      "50 / 100 / 150 kills"
    ],
    "huntsNote": "La recompensa mostrada es para 50 kills; las opciones de 100 y 150 multiplican la EXP por 2 y 3. No existe una cadena previa adicional: basta estar dentro del rango de nivel y que el NPC/script esté habilitado.",
    "huntsRule": "Regla de conteo: las muertes hechas por Homúnculos o Mercenarios no aumentan el contador. Las kills pueden compartirse con miembros de party cercanos bajo las reglas documentadas por iRO Classic.",
    "huntsDropDisclaimer": "El valor en zeny depende de la economía del servidor. Esta columna destaca cartas, equipo o materiales con utilidad clara; no pretende ser una lista completa de drops.",
    "questsTitle": "📜 Quests con mejor salto de EXP / esfuerzo",
    "questsIntro": "Por defecto se muestra solo lo esencial. Abre únicamente la quest que te interese o usa el buscador.",
    "cooldownsTitle": "⏱️ Cooldowns recomendados",
    "cooldownsCompatBadges": [
      "Contenido 13.2",
      "Rutina New World"
    ],
    "cooldownsIntro": "Estas fichas muestran el inicio exacto, qué haces, qué consume la quest y qué prerrequisito abre el contenido. El detalle largo queda plegado.",
    "rulesTitle": "🧠 Reglas de EXP que evitan desperdicios",
    "rulesParagraphs": [
      "En Pre-Renewal Classic, el nivel del personaje no modifica por sí mismo la EXP base del monstruo. Para las recompensas de quest existe un límite por “bucket” de EXP: una recompensa individual no puede saltar arbitrariamente muchos niveles. Por eso conviene entregar recompensas grandes cuando estás cerca de 0% del nivel actual.",
      "En Monster Hunting, 50 kills tiene un máximo de 1 Base Level y 1 Job Level; 100 y 150 permiten hasta 2 y 3 respectivamente según la documentación Classic."
    ],
    "startLabel": "Empieza",
    "prereqLabel": "Ver prerrequisito",
    "sourceLabel": "Ver fuente en iRO Wiki Classic",
    "navResumen": "Resumen",
    "navTurnins": "Item Turn-In",
    "navHunts": "Monster Hunting",
    "navQuests": "EXP Quests",
    "navCooldowns": "Cooldowns",
    "navReglas": "Reglas EXP",
    "turnins": [
      {
        "id": "portal-f1-1",
        "minLevel": 2,
        "levelRange": "2–20",
        "item": "Fluff ×25",
        "npc": "Langry",
        "npcLocation": {
          "map": "gef_fild07",
          "label": "📍 gef_fild07 · 321,193"
        },
        "mob": {
          "id": 1007,
          "name": "Fabre"
        },
        "bestMap": "gef_fild07",
        "hp": "63",
        "mobLevel": "2"
      },
      {
        "id": "portal-f1-2",
        "minLevel": 2,
        "levelRange": "2–20",
        "item": "Chrysalis ×25",
        "npc": "Halgus",
        "npcLocation": {
          "map": "gef_fild04",
          "label": "📍 gef_fild04 · 191,54"
        },
        "mob": {
          "id": 1048,
          "name": "Thief Bug Egg"
        },
        "bestMap": "ein_fild09",
        "hp": "48",
        "mobLevel": "4"
      },
      {
        "id": "portal-f1-3",
        "minLevel": 15,
        "levelRange": "15–45",
        "item": "Powder of Butterfly ×25",
        "npc": "Laertes",
        "npcLocation": {
          "map": "prt_fild04",
          "label": "📍 prt_fild04 · 356,148"
        },
        "mob": {
          "id": 1018,
          "name": "Creamy"
        },
        "bestMap": "prt_fild04",
        "hp": "595",
        "mobLevel": "16"
      },
      {
        "id": "portal-f1-4",
        "minLevel": 24,
        "levelRange": "24–60",
        "item": "Porcupine Quill ×25",
        "npc": "Yullo",
        "npcLocation": {
          "map": "mjolnir_01",
          "label": "📍 mjolnir_01 · 296,29"
        },
        "mob": {
          "id": 1103,
          "name": "Caramel"
        },
        "bestMap": "mjolnir_01",
        "hp": "1,424",
        "mobLevel": "23"
      },
      {
        "id": "portal-f1-5",
        "minLevel": 25,
        "levelRange": "25–60",
        "item": "Stone Heart ×25",
        "npc": "Private Jeremy",
        "npcLocation": {
          "map": "moc_fild11",
          "label": "📍 moc_fild11 · 57,138"
        },
        "mob": {
          "id": 1129,
          "name": "Horong"
        },
        "bestMap": "ama_dun02",
        "hp": "1,939",
        "mobLevel": "34"
      },
      {
        "id": "portal-f1-6",
        "minLevel": 25,
        "levelRange": "25–60",
        "item": "Earthworm Peeling ×25",
        "npc": "Shone",
        "npcLocation": {
          "map": "moc_fild17",
          "label": "📍 moc_fild17 · 208,346"
        },
        "mob": {
          "id": 1127,
          "name": "Hode"
        },
        "bestMap": "moc_fild17",
        "hp": "2,282",
        "mobLevel": "26"
      },
      {
        "id": "portal-f1-7",
        "minLevel": 30,
        "levelRange": "30–65",
        "item": "Frill ×25",
        "npc": "Lemly",
        "npcLocation": {
          "map": "moc_fild17",
          "label": "📍 moc_fild17 · 66,273"
        },
        "mob": {
          "id": 1119,
          "name": "Frilldora"
        },
        "bestMap": "moc_fild17",
        "hp": "2,023",
        "mobLevel": "30"
      },
      {
        "id": "portal-f1-8",
        "minLevel": 35,
        "levelRange": "35–70",
        "item": "Dokebi Horn ×50",
        "npc": "Li",
        "npcLocation": {
          "map": "pay_fild10",
          "label": "📍 pay_fild10 · 108,357"
        },
        "mob": {
          "id": 1110,
          "name": "Dokebi"
        },
        "bestMap": "pay_fild10",
        "hp": "2,697",
        "mobLevel": "33"
      },
      {
        "id": "portal-f1-9",
        "minLevel": 36,
        "levelRange": "36–65",
        "item": "Huge Leaf ×50",
        "npc": "Lella",
        "npcLocation": {
          "map": "ayo_fild01",
          "label": "📍 ayo_fild01 · 44,241"
        },
        "mob": {
          "id": 1586,
          "name": "Leaf Cat"
        },
        "bestMap": "ayo_fild01",
        "hp": "2,396",
        "mobLevel": "38"
      },
      {
        "id": "portal-f1-10",
        "minLevel": 45,
        "levelRange": "45–80",
        "item": "Anolian Skin ×20",
        "npc": "Cuir",
        "npcLocation": {
          "map": "cmd_fild01",
          "label": "📍 cmd_fild01 · 362,256"
        },
        "mob": {
          "id": 1271,
          "name": "Alligator"
        },
        "bestMap": "cmd_fild01",
        "hp": "6,962",
        "mobLevel": "42"
      },
      {
        "id": "portal-f1-11",
        "minLevel": 60,
        "levelRange": "60–74",
        "item": "Bacillus ×50",
        "npc": "Local Villager",
        "npcLocation": {
          "map": "ein_fild01",
          "label": "📍 ein_fild01 · 43,249"
        },
        "mob": {
          "id": 1378,
          "name": "Demon Pungus"
        },
        "bestMap": "ein_fild01",
        "hp": "7,259",
        "mobLevel": "56"
      },
      {
        "id": "portal-f1-12",
        "minLevel": 60,
        "levelRange": "60–85",
        "item": "Sharp Leaf ×50",
        "npc": "Lilla",
        "npcLocation": {
          "map": "um_fild01",
          "label": "📍 um_fild01 · 35,281"
        },
        "mob": {
          "id": 1881,
          "name": "Les"
        },
        "bestMap": "mosk_dun01",
        "hp": "3,080",
        "mobLevel": "39"
      },
      {
        "id": "portal-f1-13",
        "minLevel": 70,
        "levelRange": "70–85",
        "item": "Antelope Horn ×50",
        "npc": "Vegetable Farmer",
        "npcLocation": {
          "map": "ein_fild06",
          "label": "📍 ein_fild06 · 82,171"
        },
        "mob": {
          "id": 1372,
          "name": "Goat"
        },
        "bestMap": "ein_fild06",
        "hp": "11,077",
        "mobLevel": "69"
      }
    ],
    "hunts": [
      {
        "id": "portal-f1-14",
        "minLevel": 2,
        "levelRange": "2–20",
        "mob": {
          "id": 1007,
          "name": "Fabre"
        },
        "exp": "770 / 60",
        "npc": "Langry",
        "npcLocation": {
          "map": "gef_fild07",
          "label": "📍 gef_fild07 · 321,193"
        },
        "prereq": "Ninguno",
        "dropNote": "Fluff 65% · Fabre Card 0.01%"
      },
      {
        "id": "portal-f1-15",
        "minLevel": 2,
        "levelRange": "2–20",
        "mob": {
          "id": 1008,
          "name": "Pupa"
        },
        "exp": "770 / 60",
        "npc": "Halgus",
        "npcLocation": {
          "map": "gef_fild04",
          "label": "📍 gef_fild04 · 191,54"
        },
        "prereq": "Ninguno",
        "dropNote": "Chrysalis 55% · Pupa Card 0.01%"
      },
      {
        "id": "portal-f1-16",
        "minLevel": 10,
        "levelRange": "10–30",
        "mob": {
          "id": 1019,
          "name": "Peco Peco"
        },
        "exp": "8,000 / 4,000",
        "npc": "Gregor",
        "npcLocation": {
          "map": "moc_fild02",
          "label": "📍 moc_fild02 · 74,329"
        },
        "prereq": "Ninguno",
        "dropNote": "Peco Peco Card 0.01% (+10% Max HP)"
      },
      {
        "id": "portal-f1-17",
        "minLevel": 15,
        "levelRange": "15–45",
        "mob": {
          "id": 1018,
          "name": "Creamy"
        },
        "exp": "5,900 / 2,250",
        "npc": "Laertes",
        "npcLocation": {
          "map": "prt_fild04",
          "label": "📍 prt_fild04 · 356,148"
        },
        "prereq": "Ninguno",
        "dropNote": "Powder of Butterfly 90% · Creamy Card 0.01% (Teleport Lv1)"
      },
      {
        "id": "portal-f1-18",
        "minLevel": 18,
        "levelRange": "18–60",
        "mob": {
          "id": 1104,
          "name": "Coco"
        },
        "exp": "7,200 / 7,810",
        "npc": "Nutters",
        "npcLocation": {
          "map": "mjolnir_01",
          "label": "📍 mjolnir_01 · 293,20"
        },
        "prereq": "Ninguno",
        "dropNote": "Coco Card 0.01%"
      },
      {
        "id": "portal-f1-19",
        "minLevel": 24,
        "levelRange": "24–60",
        "mob": {
          "id": 1103,
          "name": "Caramel"
        },
        "exp": "20,850 / 12,544",
        "npc": "Yullo",
        "npcLocation": {
          "map": "mjolnir_01",
          "label": "📍 mjolnir_01 · 296,29"
        },
        "prereq": "Ninguno",
        "dropNote": "Porcupine Quill 90% · Caramel Card 0.01% (+20% vs Insect)"
      },
      {
        "id": "portal-f1-20",
        "minLevel": 25,
        "levelRange": "25–60",
        "mob": {
          "id": 1040,
          "name": "Golem"
        },
        "exp": "28,000 / 18,000",
        "npc": "Private Jeremy",
        "npcLocation": {
          "map": "moc_fild11",
          "label": "📍 moc_fild11 · 57,138"
        },
        "prereq": "Ninguno",
        "dropNote": "Stone Heart 90% · Golem Card 0.01% (arma indestructible + ATK 5)"
      },
      {
        "id": "portal-f1-21",
        "minLevel": 25,
        "levelRange": "25–60",
        "mob": {
          "id": 1127,
          "name": "Hode"
        },
        "exp": "31,550 / 22,500",
        "npc": "Shone",
        "npcLocation": {
          "map": "moc_fild17",
          "label": "📍 moc_fild17 · 208,346"
        },
        "prereq": "Ninguno",
        "dropNote": "Earthworm Peeling 90% · Hode Card 0.01%"
      },
      {
        "id": "portal-f1-22",
        "minLevel": 30,
        "levelRange": "30–65",
        "mob": {
          "id": 1119,
          "name": "Frilldora"
        },
        "exp": "60,000 / 46,000",
        "npc": "Lemly",
        "npcLocation": {
          "map": "moc_fild17",
          "label": "📍 moc_fild17 · 66,273"
        },
        "prereq": "Ninguno",
        "dropNote": "Frill 55% · Frilldora Card 0.01% (Cloaking Lv1)"
      },
      {
        "id": "portal-f1-23",
        "minLevel": 35,
        "levelRange": "35–70",
        "mob": {
          "id": 1110,
          "name": "Dokebi"
        },
        "exp": "42,000 / 36,000",
        "npc": "Li",
        "npcLocation": {
          "map": "pay_fild10",
          "label": "📍 pay_fild10 · 108,357"
        },
        "prereq": "Ninguno",
        "dropNote": "Dokebi Horn 90% · Dokebi Card 0.01%"
      },
      {
        "id": "portal-f1-24",
        "minLevel": 36,
        "levelRange": "36–65",
        "mob": {
          "id": 1586,
          "name": "Leaf Cat"
        },
        "exp": "25,740 / 31,512",
        "npc": "Lella",
        "npcLocation": {
          "map": "ayo_fild01",
          "label": "📍 ayo_fild01 · 44,241"
        },
        "prereq": "Ninguno",
        "dropNote": "Huge Leaf 43.65% · Fig Leaf 53.35% · Card 0.01%"
      },
      {
        "id": "portal-f1-25",
        "minLevel": 45,
        "levelRange": "45–80",
        "mob": {
          "id": 1271,
          "name": "Alligator"
        },
        "exp": "172,375 / 108,250",
        "npc": "Cuir",
        "npcLocation": {
          "map": "cmd_fild01",
          "label": "📍 cmd_fild01 · 362,256"
        },
        "prereq": "Ninguno",
        "dropNote": "Yggdrasil Seed 0.5% · Rough Oridecon 1.29% · Card 0.01%"
      },
      {
        "id": "portal-f1-26",
        "minLevel": 60,
        "levelRange": "60–74",
        "mob": {
          "id": 1378,
          "name": "Demon Pungus"
        },
        "exp": "250,266 / 144,452",
        "npc": "Local Villager",
        "npcLocation": {
          "map": "ein_fild01",
          "label": "📍 ein_fild01 · 43,249"
        },
        "prereq": "Ninguno",
        "dropNote": "Witched Starsand 50% · Yellow Gemstone 38.8% · Bacillus 40.74%"
      },
      {
        "id": "portal-f1-27",
        "minLevel": 60,
        "levelRange": "60–85",
        "mob": {
          "id": 1493,
          "name": "Dryad"
        },
        "exp": "234,855 / 126,905",
        "npc": "Lilla",
        "npcLocation": {
          "map": "um_fild01",
          "label": "📍 um_fild01 · 35,281"
        },
        "prereq": "Ninguno",
        "dropNote": "Dryad Card 0.01%"
      },
      {
        "id": "portal-f1-28",
        "minLevel": 70,
        "levelRange": "70–85",
        "mob": {
          "id": 1372,
          "name": "Goat"
        },
        "exp": "258,489 / 155,155",
        "npc": "Vegetable Farmer",
        "npcLocation": {
          "map": "ein_fild06",
          "label": "📍 ein_fild06 · 82,171"
        },
        "prereq": "Ninguno",
        "dropNote": "Antelope Horn 45.59% · Goat Card 0.01%"
      },
      {
        "id": "portal-f1-29",
        "minLevel": 75,
        "levelRange": "75–95",
        "mob": {
          "id": 1148,
          "name": "Medusa"
        },
        "exp": "515,700 / 352,275",
        "npc": "Miner",
        "npcLocation": {
          "map": "beach_dun",
          "label": "📍 beach_dun · 269,71"
        },
        "prereq": "Ninguno",
        "dropNote": "Red Flame Whip 2.5% · Medusa Card 0.01%"
      },
      {
        "id": "portal-f1-30",
        "minLevel": 75,
        "levelRange": "75–95",
        "mob": {
          "id": 1366,
          "name": "Lava Golem"
        },
        "exp": "484,800 / 290,700",
        "npc": "Jotun Tribesman",
        "npcLocation": {
          "map": "mag_dun01",
          "label": "📍 mag_dun01 · 127,71"
        },
        "prereq": "Ninguno",
        "dropNote": "Lava Golem Card 0.01%"
      },
      {
        "id": "portal-f1-31",
        "minLevel": 75,
        "levelRange": "75–95",
        "mob": {
          "id": 1385,
          "name": "Deleter"
        },
        "exp": "387,734 / 232,733",
        "npc": "Coal Miner",
        "npcLocation": {
          "map": "mag_dun02",
          "label": "📍 mag_dun02 · 46,40"
        },
        "prereq": "Ninguno",
        "dropNote": "Earth/Sky Deleter Cards 0.01% (efectos distintos)"
      }
    ],
    "quests": [
      {
        "id": "portal-f1-32",
        "minLevel": 50,
        "title": "Friendship Quest",
        "badges": [
          "Lv 50+",
          "400k–1.4M Base total",
          "2 pagos de EXP",
          "Sin materiales"
        ],
        "effort": "easy",
        "effortLabel": "Esfuerzo bajo",
        "paragraphs": [
          "Empieza: Maku 📍 lighthalzen 337,232.",
          "Por qué conviene: es principalmente una cadena de diálogo entre Lighthalzen y Juno. La EXP total depende de tu nivel y se entrega en dos partes iguales: una con Maku y otra al cerrar con Benkaistein.",
          "Entrada a Juno Library: 📍 yuno 340,203 Entrada al Hotel de Lighthalzen: 📍 lighthalzen 158,131"
        ],
        "steps": [
          {
            "text": "Habla con Maku. 📍 lighthalzen 337,232",
            "npcNames": [
              "Maku"
            ],
            "map": {
              "map": "lighthalzen",
              "label": "📍 lighthalzen 337,232"
            }
          },
          {
            "text": "Visita a Digotz en el Hotel. 📍 lhz_in02 201,210 · Hotel",
            "npcNames": [
              "Digotz"
            ],
            "map": {
              "map": "lhz_in02",
              "label": "📍 lhz_in02 201,210 · Hotel"
            }
          },
          {
            "text": "En Juno Library pregunta al Student por Benkaistein. 📍 yuno_in04 107,14",
            "npcNames": [
              "Student",
              "Benkaistein"
            ],
            "map": {
              "map": "yuno_in04",
              "label": "📍 yuno_in04 107,14"
            }
          },
          {
            "text": "Habla con Benkaistein / Passionate Student. 📍 yuno_in04 96,106",
            "npcNames": [
              "Benkaistein / Passionate Student"
            ],
            "map": {
              "map": "yuno_in04",
              "label": "📍 yuno_in04 96,106"
            }
          },
          {
            "text": "Recoge Friend’s Diary de la mesa. 📍 yuno_in04 167,115",
            "npcNames": [],
            "map": {
              "map": "yuno_in04",
              "label": "📍 yuno_in04 167,115"
            }
          },
          {
            "text": "Muestra el diario a Digotz y luego a Maku; aquí llega la primera mitad de EXP.",
            "npcNames": [
              "Digotz",
              "Maku"
            ],
            "map": null
          },
          {
            "text": "Regresa con Digotz y completa la escena.",
            "npcNames": [
              "Digotz"
            ],
            "map": null
          },
          {
            "text": "Vuelve con Benkaistein para la segunda mitad de EXP y el Pass. 📍 yuno_in04 96,106",
            "npcNames": [
              "Benkaistein"
            ],
            "map": {
              "map": "yuno_in04",
              "label": "📍 yuno_in04 96,106"
            }
          }
        ],
        "prereq": null,
        "sourceHref": "https://irowiki.org/classic/Friendship_Quest",
        "sourceLabel": "Guía completa en iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-33",
        "minLevel": 60,
        "title": "Lost Child Quest",
        "badges": [
          "Lv 60+",
          "900k Base",
          "Old Purple Box"
        ],
        "effort": "easy",
        "effortLabel": "Esfuerzo bajo",
        "paragraphs": [
          "Empieza: Vincent ra_in01 384,246.",
          "Corequisito: Lost Child y Rachel Sanctuary se cruzan. Si el templo ya fue cerrado por el progreso global del servidor, necesitarás avanzar los pasos iniciales de Rachel Sanctuary para poder hablar con High Priest Zhed y cerrar Lost Child."
        ],
        "steps": [
          {
            "text": "Habla con Vincent. 📍 ra_in01 384,246 · mansión",
            "npcNames": [
              "Vincent"
            ],
            "map": {
              "map": "ra_in01",
              "label": "📍 ra_in01 384,246 · mansión"
            }
          },
          {
            "text": "Habla con Logan. 📍 rachel 114,232",
            "npcNames": [
              "Logan"
            ],
            "map": {
              "map": "rachel",
              "label": "📍 rachel 114,232"
            }
          },
          {
            "text": "Vuelve dentro con Mr. Manson. 📍 ra_in01 372,200",
            "npcNames": [
              "Mr. Manson"
            ],
            "map": {
              "map": "ra_in01",
              "label": "📍 ra_in01 372,200"
            }
          },
          {
            "text": "Habla con Jenny. 📍 rachel 48,236",
            "npcNames": [
              "Jenny"
            ],
            "map": {
              "map": "rachel",
              "label": "📍 rachel 48,236"
            }
          },
          {
            "text": "Pregunta a los dos Idle Merchants. 📍 rachel 138,73 / 📍 rachel 120,47",
            "npcNames": [
              "Idle Merchants"
            ],
            "map": {
              "map": "rachel",
              "label": "📍 rachel 138,73"
            }
          },
          {
            "text": "Ve hacia Ice Cave y habla con Suspicious Man. 📍 ra_fild01 245,325",
            "npcNames": [
              "Suspicious Man"
            ],
            "map": {
              "map": "ra_fild01",
              "label": "📍 ra_fild01 245,325"
            }
          },
          {
            "text": "Regresa con Vincent.",
            "npcNames": [
              "Vincent"
            ],
            "map": null
          },
          {
            "text": "Encuentra al Kid / Phoebe. 📍 rachel 263,32",
            "npcNames": [
              "Kid / Phoebe"
            ],
            "map": {
              "map": "rachel",
              "label": "📍 rachel 263,32"
            }
          },
          {
            "text": "Devuelve la joya a Vincent y habla después con Jenny.",
            "npcNames": [
              "Vincent",
              "Jenny"
            ],
            "map": null
          },
          {
            "text": "Regresa a Vincent por Old Purple Box y la carta.",
            "npcNames": [
              "Vincent"
            ],
            "map": null
          },
          {
            "text": "Entrega la carta a High Priest Zhed para recibir la EXP. 📍 ra_temin 277,159",
            "npcNames": [
              "High Priest Zhed"
            ],
            "map": {
              "map": "ra_temin",
              "label": "📍 ra_temin 277,159"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-34",
          "title": "🔗 Ver prerrequisito / corequisito",
          "paragraphs": [
            "Rachel Sanctuary: es un corequisito, no una simple quest anterior. Si el templo está cerrado por el progreso global del servidor, avanza su apertura inicial hasta poder acceder a High Priest Zhed; después podrás cerrar Lost Child.",
            "Inicio de Rachel Sanctuary: Nemma 📍 ra_temple 116,174."
          ],
          "chain": [
            "Rachel",
            "→",
            "Nema / Temple",
            "→",
            "High Priest Zhed",
            "→",
            "Lost Child final"
          ],
          "sourceHref": "https://irowiki.org/classic/Rachel_Sanctuary_Quest",
          "sourceLabel": "Abrir Rachel Sanctuary Quest →"
        },
        "sourceHref": "https://irowiki.org/classic/Lost_Child_Quest",
        "sourceLabel": "Guía completa en iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-35",
        "minLevel": 60,
        "title": "Crow of Destiny",
        "badges": [
          "Lv 60+",
          "900k Base + 900k Job",
          "Sin materiales clave"
        ],
        "effort": "medium",
        "effortLabel": "Esfuerzo medio",
        "paragraphs": [
          "Empieza: Book-Loving Man Morroc Ruins 136,70.",
          "Por qué conviene: 1.8M EXP combinada y sin boss obligatorio.",
          "Cuando iRO solo da una descripción interior y no una coordenada, esta guía lo marca explícitamente en vez de inventarla."
        ],
        "steps": [
          {
            "text": "Empieza con Benjamin / Book-Loving Man. 📍 moc_ruins 136,70",
            "npcNames": [
              "Benjamin / Book-Loving Man"
            ],
            "map": {
              "map": "moc_ruins",
              "label": "📍 moc_ruins 136,70"
            }
          },
          {
            "text": "Busca el libro con el Curator en Prontera Library. 📍 Prontera Library · prontera 120,264",
            "npcNames": [
              "Curator"
            ],
            "map": {
              "map": "prontera",
              "label": "📍 Prontera Library · prontera 120,264"
            }
          },
          {
            "text": "Ve a Juno Library; habla con el Library Curator y luego con la Library Part-Timer. 📍 Juno Library · yuno 338,204",
            "npcNames": [
              "Library Curator",
              "Library Part-Timer"
            ],
            "map": {
              "map": "yuno",
              "label": "📍 Juno Library · yuno 338,204"
            }
          },
          {
            "text": "Investiga Hot Bestseller Corner y después Old News Scrapbook dentro de Juno Library.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Entra a la cueva desde Einbroch Field 1. 📍 ein_fild01 28,258",
            "npcNames": [],
            "map": {
              "map": "ein_fild01",
              "label": "📍 ein_fild01 28,258"
            }
          },
          {
            "text": "En el poblado interior habla con Cave Settler (82,97); iRO no publica el nombre de mapa interior en esa guía.",
            "npcNames": [
              "Cave Settler"
            ],
            "map": null
          },
          {
            "text": "Sigue el túnel hasta Zid / Monsterous Man; la guía no publica coordenada exacta para él.",
            "npcNames": [
              "Zid / Monsterous Man"
            ],
            "map": null
          },
          {
            "text": "Regresa con Benjamin. 📍 moc_ruins 136,70",
            "npcNames": [
              "Benjamin"
            ],
            "map": {
              "map": "moc_ruins",
              "label": "📍 moc_ruins 136,70"
            }
          },
          {
            "text": "Vuelve a Juno Library, continúa con la Library Part-Timer y encuentra a Oliver al final del hall.",
            "npcNames": [
              "Library Part-Timer",
              "Oliver"
            ],
            "map": null
          },
          {
            "text": "Regresa finalmente con Benjamin para Base + Job EXP. 📍 moc_ruins 136,70",
            "npcNames": [
              "Benjamin"
            ],
            "map": {
              "map": "moc_ruins",
              "label": "📍 moc_ruins 136,70"
            }
          }
        ],
        "prereq": null,
        "sourceHref": "https://irowiki.org/classic/Crow_of_Destiny_Quest",
        "sourceLabel": "Guía completa en iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-36",
        "minLevel": 60,
        "title": "Curse of Gaebolg",
        "badges": [
          "Lv 60+",
          "1.6M Base",
          "Green Potion + Yellow Gemstone + 1,000z"
        ],
        "effort": "medium",
        "effortLabel": "Esfuerzo medio",
        "paragraphs": [
          "Empieza: Busy Looking Boy Prontera 248,212.",
          "Advertencia: sigue la rama de Father Bamph; otra ruta puede cerrar la quest sin la EXP principal.",
          "Ruta recomendada: Father Bamph primero. La rama equivocada puede cerrar la quest sin la EXP principal."
        ],
        "steps": [
          {
            "text": "Entrega los libros a Historian Karlomoff. 📍 yuno 311,195",
            "npcNames": [
              "Historian Karlomoff"
            ],
            "map": {
              "map": "yuno",
              "label": "📍 yuno 311,195"
            }
          },
          {
            "text": "Lleva el reporte a Historian Rodafrian. 📍 morocc_in 45,126 · edificio entra por morocc 198,63",
            "npcNames": [
              "Historian Rodafrian"
            ],
            "map": {
              "map": "morocc_in",
              "label": "📍 morocc_in 45,126 · edificio entra por morocc 198,63"
            }
          },
          {
            "text": "Habla con Historian Mondo. 📍 mjolnir_01 135,168",
            "npcNames": [
              "Historian Mondo"
            ],
            "map": {
              "map": "mjolnir_01",
              "label": "📍 mjolnir_01 135,168"
            }
          },
          {
            "text": "Habla con Absent-Minded Boy y Bonnie Imbullea. 📍 Boy 313,269 / 📍 Bonnie 316,268",
            "npcNames": [
              "Absent-Minded Boy",
              "Bonnie Imbullea"
            ],
            "map": {
              "map": "mjolnir_01",
              "label": "📍 Boy 313,269"
            }
          },
          {
            "text": "Consulta a Father Bamph. 📍 prt_church 185,106",
            "npcNames": [
              "Father Bamph"
            ],
            "map": {
              "map": "prt_church",
              "label": "📍 prt_church 185,106"
            }
          },
          {
            "text": "Investiga los cuerpos en el mausoleo por el pasadizo secreto del gabinete de Father Bamph.",
            "npcNames": [
              "Father Bamph"
            ],
            "map": null
          },
          {
            "text": "Habla con Assassin Guildsman. 📍 moc_fild16 201,295",
            "npcNames": [
              "Assassin Guildsman"
            ],
            "map": {
              "map": "moc_fild16",
              "label": "📍 moc_fild16 201,295"
            }
          },
          {
            "text": "Entra al Assassin’s Secret Inn pagando 1,000z en el acceso secreto. 📍 morocc 47,108 · entrada secreta",
            "npcNames": [],
            "map": {
              "map": "morocc",
              "label": "📍 morocc 47,108 · entrada secreta"
            }
          },
          {
            "text": "Habla con Marjana y aprende el método de identificación. 📍 que_job01 10,16",
            "npcNames": [
              "Marjana"
            ],
            "map": {
              "map": "que_job01",
              "label": "📍 que_job01 10,16"
            }
          },
          {
            "text": "Para asegurar la EXP, vuelve primero con Father Bamph antes de reportar a Rodafrian. 📍 prt_church 185,106",
            "npcNames": [
              "Father Bamph",
              "Rodafrian"
            ],
            "map": {
              "map": "prt_church",
              "label": "📍 prt_church 185,106"
            }
          }
        ],
        "prereq": null,
        "sourceHref": "https://irowiki.org/classic/Curse_of_Gaebolg_%28Founding_of_the_Nation_Myth_Quest%29",
        "sourceLabel": "Guía completa en iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-37",
        "minLevel": 60,
        "title": "Eye of Hellion",
        "badges": [
          "Lv 60+",
          "1.0M–1.2M Base",
          "Blue Gemstone + 10,000z"
        ],
        "effort": "medium",
        "effortLabel": "Esfuerzo medio",
        "paragraphs": [
          "Empieza: Old Scholar Tyus morocc_in 116,101.",
          "Ventaja: el boss final es opcional; sin matarlo aún puedes recibir 1.0M Base EXP."
        ],
        "steps": [
          {
            "text": "Empieza con Old Scholar Tyus. 📍 morocc_in 116,101 · Inn",
            "npcNames": [
              "Old Scholar Tyus"
            ],
            "map": {
              "map": "morocc_in",
              "label": "📍 morocc_in 116,101 · Inn"
            }
          },
          {
            "text": "Busca a Clanux Heffron detrás de la iglesia de Prontera. 📍 prontera 269,326",
            "npcNames": [
              "Clanux Heffron"
            ],
            "map": {
              "map": "prontera",
              "label": "📍 prontera 269,326"
            }
          },
          {
            "text": "Resuelve la pista del Training Puppet y la máquina del Item Shop en Prontera.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Regresa con Tyus y después busca a Grout’he Tuccok. 📍 payon 182,132",
            "npcNames": [
              "Tyus",
              "Grout’he Tuccok"
            ],
            "map": {
              "map": "payon",
              "label": "📍 payon 182,132"
            }
          },
          {
            "text": "Completa las pistas de Payon y el Buddha Statue. 📍 pay_arche 135,31",
            "npcNames": [],
            "map": {
              "map": "pay_arche",
              "label": "📍 pay_arche 135,31"
            }
          },
          {
            "text": "Regresa con Tyus y luego habla con Sage Welshyun. 📍 geffen 110,200",
            "npcNames": [
              "Tyus",
              "Sage Welshyun"
            ],
            "map": {
              "map": "geffen",
              "label": "📍 geffen 110,200"
            }
          },
          {
            "text": "Sube Geffen Tower y habla con Enoz. 📍 gef_tower 116,37",
            "npcNames": [
              "Enoz"
            ],
            "map": {
              "map": "gef_tower",
              "label": "📍 gef_tower 116,37"
            }
          },
          {
            "text": "Vuelve con Welshyun para completar las tablets. 📍 geffen 110,200",
            "npcNames": [
              "Welshyun"
            ],
            "map": {
              "map": "geffen",
              "label": "📍 geffen 110,200"
            }
          },
          {
            "text": "Opcional: entra a Sealed Cave / Geffen Dungeon y derrota Hellion Revenant; puedes omitir el boss y aún recibir 1.0M Base EXP.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Regresa con Tyus para cerrar la quest. 📍 morocc_in 116,101",
            "npcNames": [
              "Tyus"
            ],
            "map": {
              "map": "morocc_in",
              "label": "📍 morocc_in 116,101"
            }
          }
        ],
        "prereq": null,
        "sourceHref": "https://irowiki.org/classic/Eye_of_Hellion_Quest",
        "sourceLabel": "Guía completa en iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-38",
        "minLevel": 70,
        "title": "Onward to the New World",
        "badges": [
          "13.1 → base de 13.2",
          "Lv 70+",
          "1.32M Base + 420k Job",
          "300 Jellopy + Emerald + Ruby"
        ],
        "effort": "medium",
        "effortLabel": "Esfuerzo medio",
        "paragraphs": [
          "Empieza: Recruiter for the Brave Prontera Castle 83,67.",
          "Además: desbloquea New World. En servidores privados Pre-Re depende del episodio implementado."
        ],
        "steps": [
          {
            "text": "Empieza con Recruiter for the Brave. 📍 prt_castle 83,67",
            "npcNames": [
              "Recruiter for the Brave"
            ],
            "map": {
              "map": "prt_castle",
              "label": "📍 prt_castle 83,67"
            }
          },
          {
            "text": "Ve con Promotional Staff — Aldebaran y entrega 300 Jellopy. 📍 aldebaran 127,138",
            "npcNames": [
              "Promotional Staff — Aldebaran"
            ],
            "map": {
              "map": "aldebaran",
              "label": "📍 aldebaran 127,138"
            }
          },
          {
            "text": "Ve con Promotional Staff — Geffen y entrega 1 Emerald + 1 Ruby. 📍 geffen 90,67",
            "npcNames": [
              "Promotional Staff — Geffen"
            ],
            "map": {
              "map": "geffen",
              "label": "📍 geffen 90,67"
            }
          },
          {
            "text": "Habla con Promotional Staff — Izlude. 📍 izlude 99,136",
            "npcNames": [
              "Promotional Staff — Izlude"
            ],
            "map": {
              "map": "izlude",
              "label": "📍 izlude 99,136"
            }
          },
          {
            "text": "Regresa con Recruiter for the Brave para la primera EXP. 📍 prt_castle 83,67",
            "npcNames": [
              "Recruiter for the Brave"
            ],
            "map": {
              "map": "prt_castle",
              "label": "📍 prt_castle 83,67"
            }
          },
          {
            "text": "Entra a Rekenber HQ y habla con los Guards. 📍 lhz_in01 124,234 · HQ entra por lighthalzen 101,246",
            "npcNames": [],
            "map": {
              "map": "lhz_in01",
              "label": "📍 lhz_in01 124,234 · HQ entra por lighthalzen 101,246"
            }
          },
          {
            "text": "Habla con Sikaiz al frente de la sala; iRO no publica una coordenada separada del NPC en esa página.",
            "npcNames": [
              "Sikaiz"
            ],
            "map": null
          },
          {
            "text": "Informa al Rune-Midgards Alliance Manager. 📍 prt_castle 121,51",
            "npcNames": [
              "Rune-Midgards Alliance Manager"
            ],
            "map": {
              "map": "prt_castle",
              "label": "📍 prt_castle 121,51"
            }
          },
          {
            "text": "Entrega el mensaje a Arunafeltz Alliance Manager. 📍 ra_temple 119,113",
            "npcNames": [
              "Arunafeltz Alliance Manager"
            ],
            "map": {
              "map": "ra_temple",
              "label": "📍 ra_temple 119,113"
            }
          },
          {
            "text": "Regresa a Sikaiz; luego habla con el Guard fuera del lecture hall. 📍 lhz_in01 130,231",
            "npcNames": [
              "Sikaiz",
              "Guard"
            ],
            "map": {
              "map": "lhz_in01",
              "label": "📍 lhz_in01 130,231"
            }
          },
          {
            "text": "Habla con Rift Guard para ir al Dimensional Gorge. 📍 moc_fild20 349,179",
            "npcNames": [
              "Rift Guard"
            ],
            "map": {
              "map": "moc_fild20",
              "label": "📍 moc_fild20 349,179"
            }
          },
          {
            "text": "Encuentra a Munkenro y mata 50 Mobsters. 📍 moc_fild22b 230,197",
            "npcNames": [
              "Munkenro"
            ],
            "map": {
              "map": "moc_fild22b",
              "label": "📍 moc_fild22b 230,197"
            }
          },
          {
            "text": "Habla otra vez con Munkenro para entrar a Ash-Vacuum y recibir la segunda EXP.",
            "npcNames": [
              "Munkenro"
            ],
            "map": null
          }
        ],
        "prereq": {
          "id": "portal-f1-39",
          "title": "🔗 Contexto de episodio / acceso",
          "paragraphs": [
            "Esta quest inicia la cadena New World. En la progresión Classic documentada, Onward to the New World es contenido 13.1 y sirve como base para las quests 13.2 posteriores."
          ],
          "chain": [
            "Onward to the New World 13.1",
            "→",
            "New World quests",
            "→",
            "Ring of the Wise King 13.2",
            "→",
            "Two Tribes 13.2"
          ],
          "sourceHref": "",
          "sourceLabel": ""
        },
        "sourceHref": "https://irowiki.org/classic/Onward_to_the_New_World_Quest",
        "sourceLabel": "Guía completa en iRO Wiki Classic →"
      }
    ],
    "cooldowns": [
      {
        "id": "portal-f1-40",
        "minLevel": 70,
        "title": "Alfheim Perfume",
        "badges": [
          "700k Job",
          "18 h",
          "2 Splendide Coins"
        ],
        "effort": "easy",
        "effortLabel": "Muy rentable",
        "paragraphs": [
          "Inicio: High Laphine Grenouille 📍 splendide 228,162 → 📍 spl_in01 30,324.",
          "Materiales: no requiere una lista de drops previa; la quest te da el sprout y haces la ruta dentro de Splendide.",
          "Purifiers documentados por iRO: 260,187 · 163,83 · 169,117 · 161,266 · 135,280 · 161,365 · 259,187 · 228,162. Soldados: 205,139 · 196,153 · 181,135 · 139,178 · 164,188 · 177,257."
        ],
        "steps": [
          {
            "text": "Habla con High Laphine Grenouille. 📍 spl_in01 30,324 · entra por splendide 228,162",
            "npcNames": [
              "High Laphine Grenouille"
            ],
            "map": {
              "map": "spl_in01",
              "label": "📍 spl_in01 30,324 · entra por splendide 228,162"
            }
          },
          {
            "text": "Obtén el sprout de Middle-ranked Laphine dentro de la cabaña. 📍 splendide 284,228",
            "npcNames": [
              "Middle-ranked Laphine"
            ],
            "map": {
              "map": "splendide",
              "label": "📍 splendide 284,228"
            }
          },
          {
            "text": "Coloca el Sprout en cualquiera de los purifiers alrededor del centro de Splendide. 📍 ej. purifier 260,187",
            "npcNames": [],
            "map": {
              "map": "splendide",
              "label": "📍 ej. purifier 260,187"
            }
          },
          {
            "text": "Regresa con Grenouille para fabricar el perfume.",
            "npcNames": [
              "Grenouille"
            ],
            "map": null
          },
          {
            "text": "Usa el perfume en los soldados agotados; hay seis posiciones válidas. 📍 ej. soldado 205,139",
            "npcNames": [],
            "map": {
              "map": "splendide",
              "label": "📍 ej. soldado 205,139"
            }
          },
          {
            "text": "Regresa con Grenouille por 700k Job EXP + 2 Splendide Coins. 📍 spl_in01 30,324",
            "npcNames": [
              "Grenouille"
            ],
            "map": {
              "map": "spl_in01",
              "label": "📍 spl_in01 30,324"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-41",
          "title": "🔗 Prerrequisito: Ring of the Wise King",
          "paragraphs": [
            "Inicio: Schwartzvalt Mechanic 📍 mid_camp 197,237.",
            "Necesitas: Lv 70, Finding a Fairy completada y Report from the New World iniciado.",
            "Finding a Fairy: inicia con Small Fairy 📍 spl_fild02 34,223.",
            "Report from the New World: inicia con Hibba Agip 📍 mid_campin 90,114 y requiere completar 2 de 4 quests previas indicadas en su guía."
          ],
          "chain": [
            "Onward to the New World",
            "→",
            "Finding a Fairy",
            "+",
            "Report iniciado",
            "→",
            "Ring of the Wise King"
          ],
          "sourceHref": "https://irowiki.org/classic/Ring_of_the_Wise_King",
          "sourceLabel": "Ring of the Wise King → Finding a Fairy → Report from the New World →"
        },
        "sourceHref": "https://irowiki.org/classic/Alfheim_Perfume",
        "sourceLabel": "Guía completa →"
      },
      {
        "id": "portal-f1-42",
        "minLevel": 70,
        "title": "Midgard Ore",
        "badges": [
          "700k Job",
          "18 h",
          "2 Manuk Coins"
        ],
        "effort": "easy",
        "effortLabel": "Muy rentable",
        "paragraphs": [
          "Inicio: Scientist 📍 man_in01 372,221, sótano de la fábrica que entra por 📍 manuk 310,199.",
          "Materiales: la quest entrega una Portable Toolbox; debes recolectar Rough Ore en una de tres regiones asignadas."
        ],
        "steps": [
          {
            "text": "Habla con Scientist y recibe Portable Toolbox. 📍 man_in01 372,221 · fábrica entra por manuk 310,199",
            "npcNames": [
              "Scientist"
            ],
            "map": {
              "map": "man_in01",
              "label": "📍 man_in01 372,221 · fábrica entra por manuk 310,199"
            }
          },
          {
            "text": "Ve a la región asignada por el Scientist; la Toolbox marca los puntos cercanos al portal.",
            "npcNames": [
              "Scientist"
            ],
            "map": null
          },
          {
            "text": "Recolecta la cantidad de Rough Ore solicitada según la ruta asignada.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Vuelve con Scientist por 700k Job EXP + 2 Manuk Coins. 📍 man_in01 372,221",
            "npcNames": [
              "Scientist"
            ],
            "map": {
              "map": "man_in01",
              "label": "📍 man_in01 372,221"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-43",
          "title": "🔗 Prerrequisito: Ring of the Wise King",
          "paragraphs": [
            "Inicio: Schwartzvalt Mechanic 📍 mid_camp 197,237.",
            "Necesitas: Lv 70, Finding a Fairy completada y Report from the New World iniciado.",
            "Finding a Fairy: inicia con Small Fairy 📍 spl_fild02 34,223.",
            "Report from the New World: inicia con Hibba Agip 📍 mid_campin 90,114 y requiere completar 2 de 4 quests previas indicadas en su guía."
          ],
          "chain": [
            "Onward to the New World",
            "→",
            "Finding a Fairy",
            "+",
            "Report iniciado",
            "→",
            "Ring of the Wise King"
          ],
          "sourceHref": "https://irowiki.org/classic/Ring_of_the_Wise_King",
          "sourceLabel": "Ring of the Wise King → Finding a Fairy → Report from the New World →"
        },
        "sourceHref": "https://irowiki.org/classic/Midgard_Ore",
        "sourceLabel": "Guía completa →"
      },
      {
        "id": "portal-f1-44",
        "minLevel": 70,
        "title": "Bradium Collection",
        "badges": [
          "40k Base + 40k Job",
          "24 h",
          "3 Manuk Coins"
        ],
        "effort": "easy",
        "effortLabel": "Esfuerzo bajo",
        "paragraphs": [
          "Inicio: Manuk Engineer edificio de Manuk 📍 manuk 309,322, última habitación.",
          "Materiales: la cabecera Classic indica 20 Bradium Fragments. La misma página tiene una inconsistencia histórica en el paso final, donde dice “Refined Bradium”; por eso conviene confirmar el script del servidor antes de farmear."
        ],
        "steps": [
          {
            "text": "Habla con Manuk Engineer en la última habitación del edificio. 📍 manuk 309,322",
            "npcNames": [
              "Manuk Engineer"
            ],
            "map": {
              "map": "manuk",
              "label": "📍 manuk 309,322"
            }
          },
          {
            "text": "Consigue los 20 materiales de Bradium que solicite el script de tu servidor.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Regresa con Manuk Engineer por 40k Base + 40k Job + 3 Manuk Coins. 📍 manuk 309,322",
            "npcNames": [
              "Manuk Engineer"
            ],
            "map": {
              "map": "manuk",
              "label": "📍 manuk 309,322"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-45",
          "title": "🔗 Prerrequisito: Ring of the Wise King",
          "paragraphs": [
            "Inicio: Schwartzvalt Mechanic 📍 mid_camp 197,237.",
            "Necesitas: Lv 70, Finding a Fairy completada y Report from the New World iniciado.",
            "Finding a Fairy: inicia con Small Fairy 📍 spl_fild02 34,223.",
            "Report from the New World: inicia con Hibba Agip 📍 mid_campin 90,114 y requiere completar 2 de 4 quests previas indicadas en su guía."
          ],
          "chain": [
            "Onward to the New World",
            "→",
            "Finding a Fairy",
            "+",
            "Report iniciado",
            "→",
            "Ring of the Wise King"
          ],
          "sourceHref": "https://irowiki.org/classic/Ring_of_the_Wise_King",
          "sourceLabel": "Ring of the Wise King → Finding a Fairy → Report from the New World →"
        },
        "sourceHref": "https://irowiki.org/classic/Bradium_Collection",
        "sourceLabel": "Guía completa →"
      },
      {
        "id": "portal-f1-46",
        "minLevel": 70,
        "title": "Collecting Draco Eggs",
        "badges": [
          "40k Base + 40k Job",
          "24 h",
          "10 Draco's Egg"
        ],
        "effort": "easy",
        "effortLabel": "Esfuerzo bajo",
        "paragraphs": [
          "Inicio: Pinedel 📍 mid_camp 146,306.",
          "Materiales: 10 Draco's Egg, obtenidos en los pisos 1–2 de Yggdrasil Dungeon."
        ],
        "steps": [
          {
            "text": "Habla con Pinedel. 📍 mid_camp 146,306",
            "npcNames": [
              "Pinedel"
            ],
            "map": {
              "map": "mid_camp",
              "label": "📍 mid_camp 146,306"
            }
          },
          {
            "text": "Recolecta 10 Draco’s Egg en los mapas 1–2 de Yggdrasil Dungeon.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Regresa con Pinedel por la recompensa. 📍 mid_camp 146,306",
            "npcNames": [
              "Pinedel"
            ],
            "map": {
              "map": "mid_camp",
              "label": "📍 mid_camp 146,306"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-47",
          "title": "🔗 Prerrequisito: Two Tribes iniciado / acceso a Yggdrasil Dungeon",
          "paragraphs": [
            "Inicio: Arc 📍 splendide 228,162 → 📍 spl_in01 32,306, con Ring of the Ancient Wise King equipado.",
            "Necesitas: Ring of the Wise King. Para estas dailies basta avanzar Two Tribes hasta obtener acceso a Yggdrasil Dungeon."
          ],
          "chain": [
            "Ring of the Wise King",
            "→",
            "Arc",
            "→",
            "Two Tribes iniciado",
            "→",
            "Yggdrasil Dungeon"
          ],
          "sourceHref": "https://irowiki.org/classic/Two_Tribes",
          "sourceLabel": "Guía de Two Tribes →"
        },
        "sourceHref": "https://irowiki.org/classic/Collecting_Draco_Eggs",
        "sourceLabel": "Guía completa →"
      },
      {
        "id": "portal-f1-48",
        "minLevel": 70,
        "title": "Laphine Craftsman",
        "badges": [
          "30k Base + 30k Job",
          "24 h",
          "3 Splendide Coins"
        ],
        "effort": "medium",
        "effortLabel": "Situacional",
        "paragraphs": [
          "Inicio: Laphine entra por 📍 splendide 198,238 y habla en 📍 spl_in 97,313.",
          "Materiales: 15 Crystallized Teardrop + 15 Florescent Liquid. Los Crystallized Teardrops son character-bound en la documentación Classic."
        ],
        "steps": [
          {
            "text": "Habla con Laphine. 📍 spl_in 97,313 · edificio entra por splendide 198,238",
            "npcNames": [
              "Laphine"
            ],
            "map": {
              "map": "spl_in",
              "label": "📍 spl_in 97,313 · edificio entra por splendide 198,238"
            }
          },
          {
            "text": "Entrega 15 Crystallized Teardrop + 15 Florescent Liquid.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Vuelve con Laphine por 30k Base + 30k Job + 3 Splendide Coins. 📍 spl_in 97,313",
            "npcNames": [
              "Laphine"
            ],
            "map": {
              "map": "spl_in",
              "label": "📍 spl_in 97,313"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-49",
          "title": "🔗 Prerrequisito: Two Tribes iniciado / acceso a Yggdrasil Dungeon",
          "paragraphs": [
            "Inicio: Arc 📍 splendide 228,162 → 📍 spl_in01 32,306, con Ring of the Ancient Wise King equipado.",
            "Necesitas: Ring of the Wise King. Para estas dailies basta avanzar Two Tribes hasta obtener acceso a Yggdrasil Dungeon."
          ],
          "chain": [
            "Ring of the Wise King",
            "→",
            "Arc",
            "→",
            "Two Tribes iniciado",
            "→",
            "Yggdrasil Dungeon"
          ],
          "sourceHref": "https://irowiki.org/classic/Two_Tribes",
          "sourceLabel": "Guía de Two Tribes →"
        },
        "sourceHref": "https://irowiki.org/classic/Laphine_Craftsman",
        "sourceLabel": "Guía completa →"
      }
    ]
  },
  "en": {
    "title": "EXP & Leveling",
    "tagline": "Ragnarok Online Pre-Renewal. A catalog of EXP quests, repeatable turn-ins, hunting grounds, and cooldowns. Documented from iRO Wiki Classic; farming recommendations cross-checked against RateMyServer Pre-Re and community experience.",
    "badges": [
      "PRE-RENEWAL",
      "EPISODE 13.2",
      "rAthena / Pre-Re"
    ],
    "searchPlaceholder": "Search quest, item, mob, NPC, or map…",
    "clearFilters": "Clear filters",
    "allLevels": "All levels",
    "turninsTitle": "📦 Item Turn-In",
    "turninsCompatBadges": [
      "Confirm the script on your server",
      "RMS Pre-Re 1×"
    ],
    "turninsNote": "NPC and quantity belong to iRO Classic's Repeatable EXP system. The recommended mob is the safest among every monster that drops that item (lowest HP), not necessarily the one most often cited in outside guides — on AscencionRO (10x) any RMS base rate of 10% or more already drops on every kill, so the only real difference between options is how dangerous they are to fight. Tap the mob's name to open its local card.",
    "huntsTitle": "⚔️ Monster Hunting",
    "huntsCompatBadges": [
      "Confirm the script on your server",
      "50 / 100 / 150 kills"
    ],
    "huntsNote": "The reward shown is for 50 kills; the 100 and 150 options multiply the EXP by 2 and 3. There's no additional prerequisite chain: you just need to be within the level range and have the NPC/script enabled.",
    "huntsRule": "Counting rule: kills made by Homunculus or Mercenaries don't increase the counter. Kills can be shared with nearby party members under the rules documented by iRO Classic.",
    "huntsDropDisclaimer": "The zeny value depends on the server's economy. This column highlights cards, gear, or materials with clear utility; it isn't meant to be a complete drop list.",
    "questsTitle": "📜 Quests with the best EXP-per-effort payoff",
    "questsIntro": "Only the essentials show by default. Open just the quest you're interested in, or use the search box.",
    "cooldownsTitle": "⏱️ Recommended cooldowns",
    "cooldownsCompatBadges": [
      "13.2 content",
      "New World routine"
    ],
    "cooldownsIntro": "These cards show the exact start, what you do, what the quest consumes, and what prerequisite unlocks it. The long detail stays collapsed.",
    "rulesTitle": "🧠 EXP rules that prevent waste",
    "rulesParagraphs": [
      "In Pre-Renewal Classic, character level doesn't by itself change a monster's base EXP. For quest rewards there's a per-“bucket” EXP cap: a single reward can't arbitrarily jump many levels' worth. That's why it's best to turn in large rewards when you're close to 0% of your current level.",
      "In Monster Hunting, 50 kills caps out at 1 Base Level and 1 Job Level; 100 and 150 allow up to 2 and 3 respectively, according to the Classic documentation."
    ],
    "startLabel": "Starts",
    "prereqLabel": "See prerequisite",
    "sourceLabel": "See source on iRO Wiki Classic",
    "navResumen": "Overview",
    "navTurnins": "Item Turn-In",
    "navHunts": "Monster Hunting",
    "navQuests": "EXP Quests",
    "navCooldowns": "Cooldowns",
    "navReglas": "EXP Rules",
    "turnins": [
      {
        "id": "portal-f1-1",
        "minLevel": 2,
        "levelRange": "2–20",
        "item": "Fluff ×25",
        "npc": "Langry",
        "npcLocation": {
          "map": "gef_fild07",
          "label": "📍 gef_fild07 · 321,193"
        },
        "mob": {
          "id": 1007,
          "name": "Fabre"
        },
        "bestMap": "gef_fild07",
        "hp": "63",
        "mobLevel": "2"
      },
      {
        "id": "portal-f1-2",
        "minLevel": 2,
        "levelRange": "2–20",
        "item": "Chrysalis ×25",
        "npc": "Halgus",
        "npcLocation": {
          "map": "gef_fild04",
          "label": "📍 gef_fild04 · 191,54"
        },
        "mob": {
          "id": 1048,
          "name": "Thief Bug Egg"
        },
        "bestMap": "ein_fild09",
        "hp": "48",
        "mobLevel": "4"
      },
      {
        "id": "portal-f1-3",
        "minLevel": 15,
        "levelRange": "15–45",
        "item": "Powder of Butterfly ×25",
        "npc": "Laertes",
        "npcLocation": {
          "map": "prt_fild04",
          "label": "📍 prt_fild04 · 356,148"
        },
        "mob": {
          "id": 1018,
          "name": "Creamy"
        },
        "bestMap": "prt_fild04",
        "hp": "595",
        "mobLevel": "16"
      },
      {
        "id": "portal-f1-4",
        "minLevel": 24,
        "levelRange": "24–60",
        "item": "Porcupine Quill ×25",
        "npc": "Yullo",
        "npcLocation": {
          "map": "mjolnir_01",
          "label": "📍 mjolnir_01 · 296,29"
        },
        "mob": {
          "id": 1103,
          "name": "Caramel"
        },
        "bestMap": "mjolnir_01",
        "hp": "1,424",
        "mobLevel": "23"
      },
      {
        "id": "portal-f1-5",
        "minLevel": 25,
        "levelRange": "25–60",
        "item": "Stone Heart ×25",
        "npc": "Private Jeremy",
        "npcLocation": {
          "map": "moc_fild11",
          "label": "📍 moc_fild11 · 57,138"
        },
        "mob": {
          "id": 1129,
          "name": "Horong"
        },
        "bestMap": "ama_dun02",
        "hp": "1,939",
        "mobLevel": "34"
      },
      {
        "id": "portal-f1-6",
        "minLevel": 25,
        "levelRange": "25–60",
        "item": "Earthworm Peeling ×25",
        "npc": "Shone",
        "npcLocation": {
          "map": "moc_fild17",
          "label": "📍 moc_fild17 · 208,346"
        },
        "mob": {
          "id": 1127,
          "name": "Hode"
        },
        "bestMap": "moc_fild17",
        "hp": "2,282",
        "mobLevel": "26"
      },
      {
        "id": "portal-f1-7",
        "minLevel": 30,
        "levelRange": "30–65",
        "item": "Frill ×25",
        "npc": "Lemly",
        "npcLocation": {
          "map": "moc_fild17",
          "label": "📍 moc_fild17 · 66,273"
        },
        "mob": {
          "id": 1119,
          "name": "Frilldora"
        },
        "bestMap": "moc_fild17",
        "hp": "2,023",
        "mobLevel": "30"
      },
      {
        "id": "portal-f1-8",
        "minLevel": 35,
        "levelRange": "35–70",
        "item": "Dokebi Horn ×50",
        "npc": "Li",
        "npcLocation": {
          "map": "pay_fild10",
          "label": "📍 pay_fild10 · 108,357"
        },
        "mob": {
          "id": 1110,
          "name": "Dokebi"
        },
        "bestMap": "pay_fild10",
        "hp": "2,697",
        "mobLevel": "33"
      },
      {
        "id": "portal-f1-9",
        "minLevel": 36,
        "levelRange": "36–65",
        "item": "Huge Leaf ×50",
        "npc": "Lella",
        "npcLocation": {
          "map": "ayo_fild01",
          "label": "📍 ayo_fild01 · 44,241"
        },
        "mob": {
          "id": 1586,
          "name": "Leaf Cat"
        },
        "bestMap": "ayo_fild01",
        "hp": "2,396",
        "mobLevel": "38"
      },
      {
        "id": "portal-f1-10",
        "minLevel": 45,
        "levelRange": "45–80",
        "item": "Anolian Skin ×20",
        "npc": "Cuir",
        "npcLocation": {
          "map": "cmd_fild01",
          "label": "📍 cmd_fild01 · 362,256"
        },
        "mob": {
          "id": 1271,
          "name": "Alligator"
        },
        "bestMap": "cmd_fild01",
        "hp": "6,962",
        "mobLevel": "42"
      },
      {
        "id": "portal-f1-11",
        "minLevel": 60,
        "levelRange": "60–74",
        "item": "Bacillus ×50",
        "npc": "Local Villager",
        "npcLocation": {
          "map": "ein_fild01",
          "label": "📍 ein_fild01 · 43,249"
        },
        "mob": {
          "id": 1378,
          "name": "Demon Pungus"
        },
        "bestMap": "ein_fild01",
        "hp": "7,259",
        "mobLevel": "56"
      },
      {
        "id": "portal-f1-12",
        "minLevel": 60,
        "levelRange": "60–85",
        "item": "Sharp Leaf ×50",
        "npc": "Lilla",
        "npcLocation": {
          "map": "um_fild01",
          "label": "📍 um_fild01 · 35,281"
        },
        "mob": {
          "id": 1881,
          "name": "Les"
        },
        "bestMap": "mosk_dun01",
        "hp": "3,080",
        "mobLevel": "39"
      },
      {
        "id": "portal-f1-13",
        "minLevel": 70,
        "levelRange": "70–85",
        "item": "Antelope Horn ×50",
        "npc": "Vegetable Farmer",
        "npcLocation": {
          "map": "ein_fild06",
          "label": "📍 ein_fild06 · 82,171"
        },
        "mob": {
          "id": 1372,
          "name": "Goat"
        },
        "bestMap": "ein_fild06",
        "hp": "11,077",
        "mobLevel": "69"
      }
    ],
    "hunts": [
      {
        "id": "portal-f1-14",
        "minLevel": 2,
        "levelRange": "2–20",
        "mob": {
          "id": 1007,
          "name": "Fabre"
        },
        "exp": "770 / 60",
        "npc": "Langry",
        "npcLocation": {
          "map": "gef_fild07",
          "label": "📍 gef_fild07 · 321,193"
        },
        "prereq": "None",
        "dropNote": "Fluff 65% · Fabre Card 0.01%"
      },
      {
        "id": "portal-f1-15",
        "minLevel": 2,
        "levelRange": "2–20",
        "mob": {
          "id": 1008,
          "name": "Pupa"
        },
        "exp": "770 / 60",
        "npc": "Halgus",
        "npcLocation": {
          "map": "gef_fild04",
          "label": "📍 gef_fild04 · 191,54"
        },
        "prereq": "None",
        "dropNote": "Chrysalis 55% · Pupa Card 0.01%"
      },
      {
        "id": "portal-f1-16",
        "minLevel": 10,
        "levelRange": "10–30",
        "mob": {
          "id": 1019,
          "name": "Peco Peco"
        },
        "exp": "8,000 / 4,000",
        "npc": "Gregor",
        "npcLocation": {
          "map": "moc_fild02",
          "label": "📍 moc_fild02 · 74,329"
        },
        "prereq": "None",
        "dropNote": "Peco Peco Card 0.01% (+10% Max HP)"
      },
      {
        "id": "portal-f1-17",
        "minLevel": 15,
        "levelRange": "15–45",
        "mob": {
          "id": 1018,
          "name": "Creamy"
        },
        "exp": "5,900 / 2,250",
        "npc": "Laertes",
        "npcLocation": {
          "map": "prt_fild04",
          "label": "📍 prt_fild04 · 356,148"
        },
        "prereq": "None",
        "dropNote": "Powder of Butterfly 90% · Creamy Card 0.01% (Teleport Lv1)"
      },
      {
        "id": "portal-f1-18",
        "minLevel": 18,
        "levelRange": "18–60",
        "mob": {
          "id": 1104,
          "name": "Coco"
        },
        "exp": "7,200 / 7,810",
        "npc": "Nutters",
        "npcLocation": {
          "map": "mjolnir_01",
          "label": "📍 mjolnir_01 · 293,20"
        },
        "prereq": "None",
        "dropNote": "Coco Card 0.01%"
      },
      {
        "id": "portal-f1-19",
        "minLevel": 24,
        "levelRange": "24–60",
        "mob": {
          "id": 1103,
          "name": "Caramel"
        },
        "exp": "20,850 / 12,544",
        "npc": "Yullo",
        "npcLocation": {
          "map": "mjolnir_01",
          "label": "📍 mjolnir_01 · 296,29"
        },
        "prereq": "None",
        "dropNote": "Porcupine Quill 90% · Caramel Card 0.01% (+20% vs Insect)"
      },
      {
        "id": "portal-f1-20",
        "minLevel": 25,
        "levelRange": "25–60",
        "mob": {
          "id": 1040,
          "name": "Golem"
        },
        "exp": "28,000 / 18,000",
        "npc": "Private Jeremy",
        "npcLocation": {
          "map": "moc_fild11",
          "label": "📍 moc_fild11 · 57,138"
        },
        "prereq": "None",
        "dropNote": "Stone Heart 90% · Golem Card 0.01% (arma indestructible + ATK 5)"
      },
      {
        "id": "portal-f1-21",
        "minLevel": 25,
        "levelRange": "25–60",
        "mob": {
          "id": 1127,
          "name": "Hode"
        },
        "exp": "31,550 / 22,500",
        "npc": "Shone",
        "npcLocation": {
          "map": "moc_fild17",
          "label": "📍 moc_fild17 · 208,346"
        },
        "prereq": "None",
        "dropNote": "Earthworm Peeling 90% · Hode Card 0.01%"
      },
      {
        "id": "portal-f1-22",
        "minLevel": 30,
        "levelRange": "30–65",
        "mob": {
          "id": 1119,
          "name": "Frilldora"
        },
        "exp": "60,000 / 46,000",
        "npc": "Lemly",
        "npcLocation": {
          "map": "moc_fild17",
          "label": "📍 moc_fild17 · 66,273"
        },
        "prereq": "None",
        "dropNote": "Frill 55% · Frilldora Card 0.01% (Cloaking Lv1)"
      },
      {
        "id": "portal-f1-23",
        "minLevel": 35,
        "levelRange": "35–70",
        "mob": {
          "id": 1110,
          "name": "Dokebi"
        },
        "exp": "42,000 / 36,000",
        "npc": "Li",
        "npcLocation": {
          "map": "pay_fild10",
          "label": "📍 pay_fild10 · 108,357"
        },
        "prereq": "None",
        "dropNote": "Dokebi Horn 90% · Dokebi Card 0.01%"
      },
      {
        "id": "portal-f1-24",
        "minLevel": 36,
        "levelRange": "36–65",
        "mob": {
          "id": 1586,
          "name": "Leaf Cat"
        },
        "exp": "25,740 / 31,512",
        "npc": "Lella",
        "npcLocation": {
          "map": "ayo_fild01",
          "label": "📍 ayo_fild01 · 44,241"
        },
        "prereq": "None",
        "dropNote": "Huge Leaf 43.65% · Fig Leaf 53.35% · Card 0.01%"
      },
      {
        "id": "portal-f1-25",
        "minLevel": 45,
        "levelRange": "45–80",
        "mob": {
          "id": 1271,
          "name": "Alligator"
        },
        "exp": "172,375 / 108,250",
        "npc": "Cuir",
        "npcLocation": {
          "map": "cmd_fild01",
          "label": "📍 cmd_fild01 · 362,256"
        },
        "prereq": "None",
        "dropNote": "Yggdrasil Seed 0.5% · Rough Oridecon 1.29% · Card 0.01%"
      },
      {
        "id": "portal-f1-26",
        "minLevel": 60,
        "levelRange": "60–74",
        "mob": {
          "id": 1378,
          "name": "Demon Pungus"
        },
        "exp": "250,266 / 144,452",
        "npc": "Local Villager",
        "npcLocation": {
          "map": "ein_fild01",
          "label": "📍 ein_fild01 · 43,249"
        },
        "prereq": "None",
        "dropNote": "Witched Starsand 50% · Yellow Gemstone 38.8% · Bacillus 40.74%"
      },
      {
        "id": "portal-f1-27",
        "minLevel": 60,
        "levelRange": "60–85",
        "mob": {
          "id": 1493,
          "name": "Dryad"
        },
        "exp": "234,855 / 126,905",
        "npc": "Lilla",
        "npcLocation": {
          "map": "um_fild01",
          "label": "📍 um_fild01 · 35,281"
        },
        "prereq": "None",
        "dropNote": "Dryad Card 0.01%"
      },
      {
        "id": "portal-f1-28",
        "minLevel": 70,
        "levelRange": "70–85",
        "mob": {
          "id": 1372,
          "name": "Goat"
        },
        "exp": "258,489 / 155,155",
        "npc": "Vegetable Farmer",
        "npcLocation": {
          "map": "ein_fild06",
          "label": "📍 ein_fild06 · 82,171"
        },
        "prereq": "None",
        "dropNote": "Antelope Horn 45.59% · Goat Card 0.01%"
      },
      {
        "id": "portal-f1-29",
        "minLevel": 75,
        "levelRange": "75–95",
        "mob": {
          "id": 1148,
          "name": "Medusa"
        },
        "exp": "515,700 / 352,275",
        "npc": "Miner",
        "npcLocation": {
          "map": "beach_dun",
          "label": "📍 beach_dun · 269,71"
        },
        "prereq": "None",
        "dropNote": "Red Flame Whip 2.5% · Medusa Card 0.01%"
      },
      {
        "id": "portal-f1-30",
        "minLevel": 75,
        "levelRange": "75–95",
        "mob": {
          "id": 1366,
          "name": "Lava Golem"
        },
        "exp": "484,800 / 290,700",
        "npc": "Jotun Tribesman",
        "npcLocation": {
          "map": "mag_dun01",
          "label": "📍 mag_dun01 · 127,71"
        },
        "prereq": "None",
        "dropNote": "Lava Golem Card 0.01%"
      },
      {
        "id": "portal-f1-31",
        "minLevel": 75,
        "levelRange": "75–95",
        "mob": {
          "id": 1385,
          "name": "Deleter"
        },
        "exp": "387,734 / 232,733",
        "npc": "Coal Miner",
        "npcLocation": {
          "map": "mag_dun02",
          "label": "📍 mag_dun02 · 46,40"
        },
        "prereq": "None",
        "dropNote": "Earth/Sky Deleter Cards 0.01% (efectos distintos)"
      }
    ],
    "quests": [
      {
        "id": "portal-f1-32",
        "minLevel": 50,
        "title": "Friendship Quest",
        "badges": [
          "Lv 50+",
          "400k–1.4M Base total",
          "2 EXP payouts",
          "No materials"
        ],
        "effort": "easy",
        "effortLabel": "Low effort",
        "paragraphs": [
          "Starts: Maku 📍 lighthalzen 337,232.",
          "Why it’s worth it: it’s mostly a dialogue chain between Lighthalzen and Juno. Total EXP depends on your level and is paid out in two equal parts: one with Maku and the other when you close it out with Benkaistein.",
          "Juno Library entrance: 📍 yuno 340,203 Lighthalzen Hotel entrance: 📍 lighthalzen 158,131"
        ],
        "steps": [
          {
            "text": "Talk to Maku. 📍 lighthalzen 337,232",
            "npcNames": [
              "Maku"
            ],
            "map": {
              "map": "lighthalzen",
              "label": "📍 lighthalzen 337,232"
            }
          },
          {
            "text": "Visit Digotz at the Hotel. 📍 lhz_in02 201,210 · Hotel",
            "npcNames": [
              "Digotz"
            ],
            "map": {
              "map": "lhz_in02",
              "label": "📍 lhz_in02 201,210 · Hotel"
            }
          },
          {
            "text": "At Juno Library, ask the Student about Benkaistein. 📍 yuno_in04 107,14",
            "npcNames": [
              "Student",
              "Benkaistein"
            ],
            "map": {
              "map": "yuno_in04",
              "label": "📍 yuno_in04 107,14"
            }
          },
          {
            "text": "Talk to Benkaistein / Passionate Student. 📍 yuno_in04 96,106",
            "npcNames": [
              "Benkaistein / Passionate Student"
            ],
            "map": {
              "map": "yuno_in04",
              "label": "📍 yuno_in04 96,106"
            }
          },
          {
            "text": "Pick up the Friend’s Diary from the table. 📍 yuno_in04 167,115",
            "npcNames": [],
            "map": {
              "map": "yuno_in04",
              "label": "📍 yuno_in04 167,115"
            }
          },
          {
            "text": "Show the diary to Digotz and then to Maku; this is when the first half of the EXP arrives.",
            "npcNames": [
              "Digotz",
              "Maku"
            ],
            "map": null
          },
          {
            "text": "Go back to Digotz and finish the scene.",
            "npcNames": [
              "Digotz"
            ],
            "map": null
          },
          {
            "text": "Return to Benkaistein for the second half of the EXP and the Pass. 📍 yuno_in04 96,106",
            "npcNames": [
              "Benkaistein"
            ],
            "map": {
              "map": "yuno_in04",
              "label": "📍 yuno_in04 96,106"
            }
          }
        ],
        "prereq": null,
        "sourceHref": "https://irowiki.org/classic/Friendship_Quest",
        "sourceLabel": "Full guide on iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-33",
        "minLevel": 60,
        "title": "Lost Child Quest",
        "badges": [
          "Lv 60+",
          "900k Base",
          "Old Purple Box"
        ],
        "effort": "easy",
        "effortLabel": "Low effort",
        "paragraphs": [
          "Starts: Vincent ra_in01 384,246.",
          "Co-requisite: Lost Child and Rachel Sanctuary intersect. If the temple has already been closed by the server’s global progress, you’ll need to advance the initial steps of Rachel Sanctuary to be able to talk to High Priest Zhed and close out Lost Child."
        ],
        "steps": [
          {
            "text": "Talk to Vincent. 📍 ra_in01 384,246 · mansion",
            "npcNames": [
              "Vincent"
            ],
            "map": {
              "map": "ra_in01",
              "label": "📍 ra_in01 384,246 · mansion"
            }
          },
          {
            "text": "Talk to Logan. 📍 rachel 114,232",
            "npcNames": [
              "Logan"
            ],
            "map": {
              "map": "rachel",
              "label": "📍 rachel 114,232"
            }
          },
          {
            "text": "Go back inside to Mr. Manson. 📍 ra_in01 372,200",
            "npcNames": [
              "Mr. Manson"
            ],
            "map": {
              "map": "ra_in01",
              "label": "📍 ra_in01 372,200"
            }
          },
          {
            "text": "Talk to Jenny. 📍 rachel 48,236",
            "npcNames": [
              "Jenny"
            ],
            "map": {
              "map": "rachel",
              "label": "📍 rachel 48,236"
            }
          },
          {
            "text": "Ask both Idle Merchants. 📍 rachel 138,73 / 📍 rachel 120,47",
            "npcNames": [
              "Idle Merchants"
            ],
            "map": {
              "map": "rachel",
              "label": "📍 rachel 138,73"
            }
          },
          {
            "text": "Head to Ice Cave and talk to the Suspicious Man. 📍 ra_fild01 245,325",
            "npcNames": [
              "Suspicious Man"
            ],
            "map": {
              "map": "ra_fild01",
              "label": "📍 ra_fild01 245,325"
            }
          },
          {
            "text": "Go back to Vincent.",
            "npcNames": [
              "Vincent"
            ],
            "map": null
          },
          {
            "text": "Find the Kid / Phoebe. 📍 rachel 263,32",
            "npcNames": [
              "Kid / Phoebe"
            ],
            "map": {
              "map": "rachel",
              "label": "📍 rachel 263,32"
            }
          },
          {
            "text": "Return the gem to Vincent and then talk to Jenny.",
            "npcNames": [
              "Vincent",
              "Jenny"
            ],
            "map": null
          },
          {
            "text": "Go back to Vincent for the Old Purple Box and the letter.",
            "npcNames": [
              "Vincent"
            ],
            "map": null
          },
          {
            "text": "Deliver the letter to High Priest Zhed to receive the EXP. 📍 ra_temin 277,159",
            "npcNames": [
              "High Priest Zhed"
            ],
            "map": {
              "map": "ra_temin",
              "label": "📍 ra_temin 277,159"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-34",
          "title": "🔗 View prerequisite / co-requisite",
          "paragraphs": [
            "Rachel Sanctuary: it’s a co-requisite, not just a quest you need to finish beforehand. If the temple is closed due to the server’s global progress, advance its initial opening until you can reach High Priest Zhed; after that you’ll be able to close out Lost Child.",
            "Rachel Sanctuary start: Nemma 📍 ra_temple 116,174."
          ],
          "chain": [
            "Rachel",
            "→",
            "Nema / Temple",
            "→",
            "High Priest Zhed",
            "→",
            "Lost Child final"
          ],
          "sourceHref": "https://irowiki.org/classic/Rachel_Sanctuary_Quest",
          "sourceLabel": "Open Rachel Sanctuary Quest →"
        },
        "sourceHref": "https://irowiki.org/classic/Lost_Child_Quest",
        "sourceLabel": "Full guide on iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-35",
        "minLevel": 60,
        "title": "Crow of Destiny",
        "badges": [
          "Lv 60+",
          "900k Base + 900k Job",
          "No key materials"
        ],
        "effort": "medium",
        "effortLabel": "Medium effort",
        "paragraphs": [
          "Starts: Book-Loving Man Morroc Ruins 136,70.",
          "Why it’s worth it: 1.8M combined EXP and no mandatory boss.",
          "When iRO only gives an interior description and no coordinate, this guide flags it explicitly instead of making one up."
        ],
        "steps": [
          {
            "text": "Start with Benjamin / Book-Loving Man. 📍 moc_ruins 136,70",
            "npcNames": [
              "Benjamin / Book-Loving Man"
            ],
            "map": {
              "map": "moc_ruins",
              "label": "📍 moc_ruins 136,70"
            }
          },
          {
            "text": "Look for the book with the Curator at Prontera Library. 📍 Prontera Library · prontera 120,264",
            "npcNames": [
              "Curator"
            ],
            "map": {
              "map": "prontera",
              "label": "📍 Prontera Library · prontera 120,264"
            }
          },
          {
            "text": "Go to Juno Library; talk to the Library Curator and then the Library Part-Timer. 📍 Juno Library · yuno 338,204",
            "npcNames": [
              "Library Curator",
              "Library Part-Timer"
            ],
            "map": {
              "map": "yuno",
              "label": "📍 Juno Library · yuno 338,204"
            }
          },
          {
            "text": "Check out the Hot Bestseller Corner and then the Old News Scrapbook inside Juno Library.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Enter the cave from Einbroch Field 1. 📍 ein_fild01 28,258",
            "npcNames": [],
            "map": {
              "map": "ein_fild01",
              "label": "📍 ein_fild01 28,258"
            }
          },
          {
            "text": "In the inner settlement, talk to the Cave Settler (82,97); iRO doesn’t publish the interior map name in that guide.",
            "npcNames": [
              "Cave Settler"
            ],
            "map": null
          },
          {
            "text": "Follow the tunnel to Zid / Monsterous Man; the guide doesn’t publish an exact coordinate for him.",
            "npcNames": [
              "Zid / Monsterous Man"
            ],
            "map": null
          },
          {
            "text": "Go back to Benjamin. 📍 moc_ruins 136,70",
            "npcNames": [
              "Benjamin"
            ],
            "map": {
              "map": "moc_ruins",
              "label": "📍 moc_ruins 136,70"
            }
          },
          {
            "text": "Return to Juno Library, continue with the Library Part-Timer, and find Oliver at the end of the hall.",
            "npcNames": [
              "Library Part-Timer",
              "Oliver"
            ],
            "map": null
          },
          {
            "text": "Finally go back to Benjamin for Base + Job EXP. 📍 moc_ruins 136,70",
            "npcNames": [
              "Benjamin"
            ],
            "map": {
              "map": "moc_ruins",
              "label": "📍 moc_ruins 136,70"
            }
          }
        ],
        "prereq": null,
        "sourceHref": "https://irowiki.org/classic/Crow_of_Destiny_Quest",
        "sourceLabel": "Full guide on iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-36",
        "minLevel": 60,
        "title": "Curse of Gaebolg",
        "badges": [
          "Lv 60+",
          "1.6M Base",
          "Green Potion + Yellow Gemstone + 1,000z"
        ],
        "effort": "medium",
        "effortLabel": "Medium effort",
        "paragraphs": [
          "Starts: Busy Looking Boy Prontera 248,212.",
          "Warning: follow Father Bamph’s branch; another route can close the quest without the main EXP.",
          "Recommended route: Father Bamph first. The wrong branch can close the quest without the main EXP."
        ],
        "steps": [
          {
            "text": "Deliver the books to Historian Karlomoff. 📍 yuno 311,195",
            "npcNames": [
              "Historian Karlomoff"
            ],
            "map": {
              "map": "yuno",
              "label": "📍 yuno 311,195"
            }
          },
          {
            "text": "Bring the report to Historian Rodafrian. 📍 morocc_in 45,126 · building entered via morocc 198,63",
            "npcNames": [
              "Historian Rodafrian"
            ],
            "map": {
              "map": "morocc_in",
              "label": "📍 morocc_in 45,126 · building entered via morocc 198,63"
            }
          },
          {
            "text": "Talk to Historian Mondo. 📍 mjolnir_01 135,168",
            "npcNames": [
              "Historian Mondo"
            ],
            "map": {
              "map": "mjolnir_01",
              "label": "📍 mjolnir_01 135,168"
            }
          },
          {
            "text": "Talk to Absent-Minded Boy and Bonnie Imbullea. 📍 Boy 313,269 / 📍 Bonnie 316,268",
            "npcNames": [
              "Absent-Minded Boy",
              "Bonnie Imbullea"
            ],
            "map": {
              "map": "mjolnir_01",
              "label": "📍 Boy 313,269"
            }
          },
          {
            "text": "Consult Father Bamph. 📍 prt_church 185,106",
            "npcNames": [
              "Father Bamph"
            ],
            "map": {
              "map": "prt_church",
              "label": "📍 prt_church 185,106"
            }
          },
          {
            "text": "Investigate the bodies in the mausoleum through the secret passage in Father Bamph’s cabinet.",
            "npcNames": [
              "Father Bamph"
            ],
            "map": null
          },
          {
            "text": "Talk to the Assassin Guildsman. 📍 moc_fild16 201,295",
            "npcNames": [
              "Assassin Guildsman"
            ],
            "map": {
              "map": "moc_fild16",
              "label": "📍 moc_fild16 201,295"
            }
          },
          {
            "text": "Enter the Assassin’s Secret Inn by paying 1,000z at the secret entrance. 📍 morocc 47,108 · secret entrance",
            "npcNames": [],
            "map": {
              "map": "morocc",
              "label": "📍 morocc 47,108 · secret entrance"
            }
          },
          {
            "text": "Talk to Marjana and learn the identification method. 📍 que_job01 10,16",
            "npcNames": [
              "Marjana"
            ],
            "map": {
              "map": "que_job01",
              "label": "📍 que_job01 10,16"
            }
          },
          {
            "text": "To secure the EXP, go back to Father Bamph first before reporting to Rodafrian. 📍 prt_church 185,106",
            "npcNames": [
              "Father Bamph",
              "Rodafrian"
            ],
            "map": {
              "map": "prt_church",
              "label": "📍 prt_church 185,106"
            }
          }
        ],
        "prereq": null,
        "sourceHref": "https://irowiki.org/classic/Curse_of_Gaebolg_%28Founding_of_the_Nation_Myth_Quest%29",
        "sourceLabel": "Full guide on iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-37",
        "minLevel": 60,
        "title": "Eye of Hellion",
        "badges": [
          "Lv 60+",
          "1.0M–1.2M Base",
          "Blue Gemstone + 10,000z"
        ],
        "effort": "medium",
        "effortLabel": "Medium effort",
        "paragraphs": [
          "Starts: Old Scholar Tyus morocc_in 116,101.",
          "Advantage: the final boss is optional; you can still get 1.0M Base EXP without killing it."
        ],
        "steps": [
          {
            "text": "Start with Old Scholar Tyus. 📍 morocc_in 116,101 · Inn",
            "npcNames": [
              "Old Scholar Tyus"
            ],
            "map": {
              "map": "morocc_in",
              "label": "📍 morocc_in 116,101 · Inn"
            }
          },
          {
            "text": "Look for Clanux Heffron behind Prontera’s church. 📍 prontera 269,326",
            "npcNames": [
              "Clanux Heffron"
            ],
            "map": {
              "map": "prontera",
              "label": "📍 prontera 269,326"
            }
          },
          {
            "text": "Solve the clue at the Training Puppet and the Item Shop machine in Prontera.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Go back to Tyus and then look for Grout’he Tuccok. 📍 payon 182,132",
            "npcNames": [
              "Tyus",
              "Grout’he Tuccok"
            ],
            "map": {
              "map": "payon",
              "label": "📍 payon 182,132"
            }
          },
          {
            "text": "Complete the clues at Payon and the Buddha Statue. 📍 pay_arche 135,31",
            "npcNames": [],
            "map": {
              "map": "pay_arche",
              "label": "📍 pay_arche 135,31"
            }
          },
          {
            "text": "Go back to Tyus and then talk to Sage Welshyun. 📍 geffen 110,200",
            "npcNames": [
              "Tyus",
              "Sage Welshyun"
            ],
            "map": {
              "map": "geffen",
              "label": "📍 geffen 110,200"
            }
          },
          {
            "text": "Climb Geffen Tower and talk to Enoz. 📍 gef_tower 116,37",
            "npcNames": [
              "Enoz"
            ],
            "map": {
              "map": "gef_tower",
              "label": "📍 gef_tower 116,37"
            }
          },
          {
            "text": "Return to Welshyun to complete the tablets. 📍 geffen 110,200",
            "npcNames": [
              "Welshyun"
            ],
            "map": {
              "map": "geffen",
              "label": "📍 geffen 110,200"
            }
          },
          {
            "text": "Optional: enter Sealed Cave / Geffen Dungeon and defeat Hellion Revenant; you can skip the boss and still get 1.0M Base EXP.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Go back to Tyus to close out the quest. 📍 morocc_in 116,101",
            "npcNames": [
              "Tyus"
            ],
            "map": {
              "map": "morocc_in",
              "label": "📍 morocc_in 116,101"
            }
          }
        ],
        "prereq": null,
        "sourceHref": "https://irowiki.org/classic/Eye_of_Hellion_Quest",
        "sourceLabel": "Full guide on iRO Wiki Classic →"
      },
      {
        "id": "portal-f1-38",
        "minLevel": 70,
        "title": "Onward to the New World",
        "badges": [
          "13.1 → basis for 13.2",
          "Lv 70+",
          "1.32M Base + 420k Job",
          "300 Jellopy + Emerald + Ruby"
        ],
        "effort": "medium",
        "effortLabel": "Medium effort",
        "paragraphs": [
          "Starts: Recruiter for the Brave Prontera Castle 83,67.",
          "Also: unlocks the New World. On private Pre-Re servers this depends on the episode that’s been implemented."
        ],
        "steps": [
          {
            "text": "Start with Recruiter for the Brave. 📍 prt_castle 83,67",
            "npcNames": [
              "Recruiter for the Brave"
            ],
            "map": {
              "map": "prt_castle",
              "label": "📍 prt_castle 83,67"
            }
          },
          {
            "text": "Go to Promotional Staff — Aldebaran and hand over 300 Jellopy. 📍 aldebaran 127,138",
            "npcNames": [
              "Promotional Staff — Aldebaran"
            ],
            "map": {
              "map": "aldebaran",
              "label": "📍 aldebaran 127,138"
            }
          },
          {
            "text": "Go to Promotional Staff — Geffen and hand over 1 Emerald + 1 Ruby. 📍 geffen 90,67",
            "npcNames": [
              "Promotional Staff — Geffen"
            ],
            "map": {
              "map": "geffen",
              "label": "📍 geffen 90,67"
            }
          },
          {
            "text": "Talk to Promotional Staff — Izlude. 📍 izlude 99,136",
            "npcNames": [
              "Promotional Staff — Izlude"
            ],
            "map": {
              "map": "izlude",
              "label": "📍 izlude 99,136"
            }
          },
          {
            "text": "Go back to Recruiter for the Brave for the first EXP. 📍 prt_castle 83,67",
            "npcNames": [
              "Recruiter for the Brave"
            ],
            "map": {
              "map": "prt_castle",
              "label": "📍 prt_castle 83,67"
            }
          },
          {
            "text": "Enter Rekenber HQ and talk to the Guards. 📍 lhz_in01 124,234 · HQ entered via lighthalzen 101,246",
            "npcNames": [],
            "map": {
              "map": "lhz_in01",
              "label": "📍 lhz_in01 124,234 · HQ entered via lighthalzen 101,246"
            }
          },
          {
            "text": "Talk to Sikaiz at the front of the room; iRO doesn’t publish a separate coordinate for this NPC on that page.",
            "npcNames": [
              "Sikaiz"
            ],
            "map": null
          },
          {
            "text": "Report to the Rune-Midgards Alliance Manager. 📍 prt_castle 121,51",
            "npcNames": [
              "Rune-Midgards Alliance Manager"
            ],
            "map": {
              "map": "prt_castle",
              "label": "📍 prt_castle 121,51"
            }
          },
          {
            "text": "Deliver the message to the Arunafeltz Alliance Manager. 📍 ra_temple 119,113",
            "npcNames": [
              "Arunafeltz Alliance Manager"
            ],
            "map": {
              "map": "ra_temple",
              "label": "📍 ra_temple 119,113"
            }
          },
          {
            "text": "Go back to Sikaiz; then talk to the Guard outside the lecture hall. 📍 lhz_in01 130,231",
            "npcNames": [
              "Sikaiz",
              "Guard"
            ],
            "map": {
              "map": "lhz_in01",
              "label": "📍 lhz_in01 130,231"
            }
          },
          {
            "text": "Talk to the Rift Guard to head into the Dimensional Gorge. 📍 moc_fild20 349,179",
            "npcNames": [
              "Rift Guard"
            ],
            "map": {
              "map": "moc_fild20",
              "label": "📍 moc_fild20 349,179"
            }
          },
          {
            "text": "Find Munkenro and kill 50 Mobsters. 📍 moc_fild22b 230,197",
            "npcNames": [
              "Munkenro"
            ],
            "map": {
              "map": "moc_fild22b",
              "label": "📍 moc_fild22b 230,197"
            }
          },
          {
            "text": "Talk to Munkenro again to enter Ash-Vacuum and receive the second EXP.",
            "npcNames": [
              "Munkenro"
            ],
            "map": null
          }
        ],
        "prereq": {
          "id": "portal-f1-39",
          "title": "🔗 Episode context / access",
          "paragraphs": [
            "This quest starts the New World chain. In the documented Classic progression, Onward to the New World is 13.1 content and serves as the foundation for the later 13.2 quests."
          ],
          "chain": [
            "Onward to the New World 13.1",
            "→",
            "New World quests",
            "→",
            "Ring of the Wise King 13.2",
            "→",
            "Two Tribes 13.2"
          ],
          "sourceHref": "",
          "sourceLabel": ""
        },
        "sourceHref": "https://irowiki.org/classic/Onward_to_the_New_World_Quest",
        "sourceLabel": "Full guide on iRO Wiki Classic →"
      }
    ],
    "cooldowns": [
      {
        "id": "portal-f1-40",
        "minLevel": 70,
        "title": "Alfheim Perfume",
        "badges": [
          "700k Job",
          "18 h",
          "2 Splendide Coins"
        ],
        "effort": "easy",
        "effortLabel": "Very profitable",
        "paragraphs": [
          "Start: High Laphine Grenouille 📍 splendide 228,162 → 📍 spl_in01 30,324.",
          "Materials: no prior drop list required; the quest gives you the sprout and you do the route inside Splendide.",
          "Purifiers documented by iRO: 260,187 · 163,83 · 169,117 · 161,266 · 135,280 · 161,365 · 259,187 · 228,162. Soldiers: 205,139 · 196,153 · 181,135 · 139,178 · 164,188 · 177,257."
        ],
        "steps": [
          {
            "text": "Talk to High Laphine Grenouille. 📍 spl_in01 30,324 · entered via splendide 228,162",
            "npcNames": [
              "High Laphine Grenouille"
            ],
            "map": {
              "map": "spl_in01",
              "label": "📍 spl_in01 30,324 · entered via splendide 228,162"
            }
          },
          {
            "text": "Get the sprout from the Middle-ranked Laphine inside the cabin. 📍 splendide 284,228",
            "npcNames": [
              "Middle-ranked Laphine"
            ],
            "map": {
              "map": "splendide",
              "label": "📍 splendide 284,228"
            }
          },
          {
            "text": "Place the Sprout on any of the purifiers around the center of Splendide. 📍 e.g. purifier 260,187",
            "npcNames": [],
            "map": {
              "map": "splendide",
              "label": "📍 e.g. purifier 260,187"
            }
          },
          {
            "text": "Go back to Grenouille to craft the perfume.",
            "npcNames": [
              "Grenouille"
            ],
            "map": null
          },
          {
            "text": "Use the perfume on the exhausted soldiers; there are six valid positions. 📍 e.g. soldier 205,139",
            "npcNames": [],
            "map": {
              "map": "splendide",
              "label": "📍 e.g. soldier 205,139"
            }
          },
          {
            "text": "Go back to Grenouille for 700k Job EXP + 2 Splendide Coins. 📍 spl_in01 30,324",
            "npcNames": [
              "Grenouille"
            ],
            "map": {
              "map": "spl_in01",
              "label": "📍 spl_in01 30,324"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-41",
          "title": "🔗 Prerequisite: Ring of the Wise King",
          "paragraphs": [
            "Start: Schwartzvalt Mechanic 📍 mid_camp 197,237.",
            "You need: Lv 70, Finding a Fairy completed, and Report from the New World started.",
            "Finding a Fairy: starts with Small Fairy 📍 spl_fild02 34,223.",
            "Report from the New World: starts with Hibba Agip 📍 mid_campin 90,114 and requires completing 2 of the 4 prior quests listed in its guide."
          ],
          "chain": [
            "Onward to the New World",
            "→",
            "Finding a Fairy",
            "+",
            "Report started",
            "→",
            "Ring of the Wise King"
          ],
          "sourceHref": "https://irowiki.org/classic/Ring_of_the_Wise_King",
          "sourceLabel": "Ring of the Wise King → Finding a Fairy → Report from the New World →"
        },
        "sourceHref": "https://irowiki.org/classic/Alfheim_Perfume",
        "sourceLabel": "Full guide →"
      },
      {
        "id": "portal-f1-42",
        "minLevel": 70,
        "title": "Midgard Ore",
        "badges": [
          "700k Job",
          "18 h",
          "2 Manuk Coins"
        ],
        "effort": "easy",
        "effortLabel": "Very profitable",
        "paragraphs": [
          "Start: Scientist 📍 man_in01 372,221, factory basement entered via 📍 manuk 310,199.",
          "Materials: the quest gives you a Portable Toolbox; you need to gather Rough Ore in one of three assigned regions."
        ],
        "steps": [
          {
            "text": "Talk to the Scientist and receive the Portable Toolbox. 📍 man_in01 372,221 · factory entered via manuk 310,199",
            "npcNames": [
              "Scientist"
            ],
            "map": {
              "map": "man_in01",
              "label": "📍 man_in01 372,221 · factory entered via manuk 310,199"
            }
          },
          {
            "text": "Go to the region assigned by the Scientist; the Toolbox marks the points near the portal.",
            "npcNames": [
              "Scientist"
            ],
            "map": null
          },
          {
            "text": "Gather the amount of Rough Ore requested for your assigned route.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Go back to the Scientist for 700k Job EXP + 2 Manuk Coins. 📍 man_in01 372,221",
            "npcNames": [
              "Scientist"
            ],
            "map": {
              "map": "man_in01",
              "label": "📍 man_in01 372,221"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-43",
          "title": "🔗 Prerequisite: Ring of the Wise King",
          "paragraphs": [
            "Start: Schwartzvalt Mechanic 📍 mid_camp 197,237.",
            "You need: Lv 70, Finding a Fairy completed, and Report from the New World started.",
            "Finding a Fairy: starts with Small Fairy 📍 spl_fild02 34,223.",
            "Report from the New World: starts with Hibba Agip 📍 mid_campin 90,114 and requires completing 2 of the 4 prior quests listed in its guide."
          ],
          "chain": [
            "Onward to the New World",
            "→",
            "Finding a Fairy",
            "+",
            "Report started",
            "→",
            "Ring of the Wise King"
          ],
          "sourceHref": "https://irowiki.org/classic/Ring_of_the_Wise_King",
          "sourceLabel": "Ring of the Wise King → Finding a Fairy → Report from the New World →"
        },
        "sourceHref": "https://irowiki.org/classic/Midgard_Ore",
        "sourceLabel": "Full guide →"
      },
      {
        "id": "portal-f1-44",
        "minLevel": 70,
        "title": "Bradium Collection",
        "badges": [
          "40k Base + 40k Job",
          "24 h",
          "3 Manuk Coins"
        ],
        "effort": "easy",
        "effortLabel": "Low effort",
        "paragraphs": [
          "Start: Manuk Engineer Manuk building at 📍 manuk 309,322, last room.",
          "Materials: the Classic writeup lists 20 Bradium Fragments. That same page has a long-standing inconsistency in the final step, where it says “Refined Bradium”; that’s why it’s worth confirming your server’s script before farming."
        ],
        "steps": [
          {
            "text": "Talk to the Manuk Engineer in the last room of the building. 📍 manuk 309,322",
            "npcNames": [
              "Manuk Engineer"
            ],
            "map": {
              "map": "manuk",
              "label": "📍 manuk 309,322"
            }
          },
          {
            "text": "Get the 20 Bradium materials your server’s script asks for.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Go back to the Manuk Engineer for 40k Base + 40k Job + 3 Manuk Coins. 📍 manuk 309,322",
            "npcNames": [
              "Manuk Engineer"
            ],
            "map": {
              "map": "manuk",
              "label": "📍 manuk 309,322"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-45",
          "title": "🔗 Prerequisite: Ring of the Wise King",
          "paragraphs": [
            "Start: Schwartzvalt Mechanic 📍 mid_camp 197,237.",
            "You need: Lv 70, Finding a Fairy completed, and Report from the New World started.",
            "Finding a Fairy: starts with Small Fairy 📍 spl_fild02 34,223.",
            "Report from the New World: starts with Hibba Agip 📍 mid_campin 90,114 and requires completing 2 of the 4 prior quests listed in its guide."
          ],
          "chain": [
            "Onward to the New World",
            "→",
            "Finding a Fairy",
            "+",
            "Report started",
            "→",
            "Ring of the Wise King"
          ],
          "sourceHref": "https://irowiki.org/classic/Ring_of_the_Wise_King",
          "sourceLabel": "Ring of the Wise King → Finding a Fairy → Report from the New World →"
        },
        "sourceHref": "https://irowiki.org/classic/Bradium_Collection",
        "sourceLabel": "Full guide →"
      },
      {
        "id": "portal-f1-46",
        "minLevel": 70,
        "title": "Collecting Draco Eggs",
        "badges": [
          "40k Base + 40k Job",
          "24 h",
          "10 Draco's Egg"
        ],
        "effort": "easy",
        "effortLabel": "Low effort",
        "paragraphs": [
          "Start: Pinedel 📍 mid_camp 146,306.",
          "Materials: 10 Draco’s Egg, obtained on floors 1–2 of Yggdrasil Dungeon."
        ],
        "steps": [
          {
            "text": "Talk to Pinedel. 📍 mid_camp 146,306",
            "npcNames": [
              "Pinedel"
            ],
            "map": {
              "map": "mid_camp",
              "label": "📍 mid_camp 146,306"
            }
          },
          {
            "text": "Gather 10 Draco’s Egg on maps 1–2 of Yggdrasil Dungeon.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Go back to Pinedel for the reward. 📍 mid_camp 146,306",
            "npcNames": [
              "Pinedel"
            ],
            "map": {
              "map": "mid_camp",
              "label": "📍 mid_camp 146,306"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-47",
          "title": "🔗 Prerequisite: Two Tribes started / access to Yggdrasil Dungeon",
          "paragraphs": [
            "Start: Arc 📍 splendide 228,162 → 📍 spl_in01 32,306, with the Ring of the Ancient Wise King equipped.",
            "You need: Ring of the Wise King. For these dailies it’s enough to advance Two Tribes until you gain access to Yggdrasil Dungeon."
          ],
          "chain": [
            "Ring of the Wise King",
            "→",
            "Arc",
            "→",
            "Two Tribes started",
            "→",
            "Yggdrasil Dungeon"
          ],
          "sourceHref": "https://irowiki.org/classic/Two_Tribes",
          "sourceLabel": "Two Tribes guide →"
        },
        "sourceHref": "https://irowiki.org/classic/Collecting_Draco_Eggs",
        "sourceLabel": "Full guide →"
      },
      {
        "id": "portal-f1-48",
        "minLevel": 70,
        "title": "Laphine Craftsman",
        "badges": [
          "30k Base + 30k Job",
          "24 h",
          "3 Splendide Coins"
        ],
        "effort": "medium",
        "effortLabel": "Situational",
        "paragraphs": [
          "Start: Laphine, entered via 📍 splendide 198,238 , talk at 📍 spl_in 97,313.",
          "Materials: 15 Crystallized Teardrop + 15 Florescent Liquid. Crystallized Teardrops are character-bound according to the Classic documentation."
        ],
        "steps": [
          {
            "text": "Talk to Laphine. 📍 spl_in 97,313 · building entered via splendide 198,238",
            "npcNames": [
              "Laphine"
            ],
            "map": {
              "map": "spl_in",
              "label": "📍 spl_in 97,313 · building entered via splendide 198,238"
            }
          },
          {
            "text": "Hand over 15 Crystallized Teardrop + 15 Florescent Liquid.",
            "npcNames": [],
            "map": null
          },
          {
            "text": "Go back to Laphine for 30k Base + 30k Job + 3 Splendide Coins. 📍 spl_in 97,313",
            "npcNames": [
              "Laphine"
            ],
            "map": {
              "map": "spl_in",
              "label": "📍 spl_in 97,313"
            }
          }
        ],
        "prereq": {
          "id": "portal-f1-49",
          "title": "🔗 Prerequisite: Two Tribes started / access to Yggdrasil Dungeon",
          "paragraphs": [
            "Start: Arc 📍 splendide 228,162 → 📍 spl_in01 32,306, with the Ring of the Ancient Wise King equipped.",
            "You need: Ring of the Wise King. For these dailies it’s enough to advance Two Tribes until you gain access to Yggdrasil Dungeon."
          ],
          "chain": [
            "Ring of the Wise King",
            "→",
            "Arc",
            "→",
            "Two Tribes started",
            "→",
            "Yggdrasil Dungeon"
          ],
          "sourceHref": "https://irowiki.org/classic/Two_Tribes",
          "sourceLabel": "Two Tribes guide →"
        },
        "sourceHref": "https://irowiki.org/classic/Laphine_Craftsman",
        "sourceLabel": "Full guide →"
      }
    ]
  }
};
