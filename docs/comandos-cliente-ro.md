# Comandos de cliente en Ragnarok Online (no-GM)

Referencia para usar en las guías. Estos son comandos que escribe cualquier jugador
en el chat del cliente (`/comando`) — no requieren rango de GM ni `@comando`. Se
guardan acá porque el sitio ya usa uno (`/navi`, ver más abajo) y puede convenir
usar otros más adelante.

**Fuente principal:** [Basic Game Control — iRO Wiki](https://irowiki.org/wiki/Basic_Game_Control)
(documentación oficial de iRO, separa explícitamente los comandos de jugador de los
de GM). Sintaxis de `/navi` confirmada además en
[Navigation System — Ragnarök Wiki](https://ragnarok.fandom.com/wiki/Navigation_System).

## El que ya usamos: `/navi`

```
/navi <nombre_de_mapa> <x>/<y>
```

Ejemplo real: `/navi prontera 150/180`.

- Abre el sistema de navegación in-game y traza una ruta con flechas hasta esa
  coordenada, incluso cruzando portales o mapas si hace falta.
- **Importante:** el separador entre X e Y es una barra `/`, no una coma. El
  cliente no reconoce comas ahí (`prontera 150,180` no funciona).
- Existe una variante `/navi2 <mapa> <x>/<y> <scroll>/<zeny>/<barco>` que agrega
  banderas para permitir o no rutas que usan Fly Wing, Warp Portal pago o el
  barco (1 = mostrar esa ruta, 0 = no). No la usamos; con `/navi` alcanza.
- Se agregó al cliente en el parche de navegación de 2012, muy anterior al
  Episode 13.2 que ya usa este servidor — debería funcionar sin problema, pero
  como con cualquier función de cliente, puede depender de qué tan actualizado
  esté el cliente de AscencionRO.
- Implementado en `app/ExpGuide.tsx` (componente `NpcLink`): arma el comando con
  las coordenadas reales de cada NPC y lo copia al portapapeles con un botón.

## Otros comandos de jugador (no-GM) que podrían servir después

De la misma fuente (iRO Wiki), agrupados por si sirven para futuras guías:

**Ubicación / navegación**
- `/where` — muestra el mapa y coordenadas actuales del propio personaje.

**Información y utilidad**
- `/h` o `/help` — lista los comandos disponibles.
- `/monsterhp` — muestra/oculta las barras de vida de los monstruos.
- `/battlestat` — (variantes por cliente) estadísticas de combate.
- `/memo` — memoriza una ubicación para el skill Warp Portal.

**Interfaz / comodidad**
- `/noctrl` o `/nc` — ataca en repetición sin mantener Ctrl apretado.
- `/noshift` o `/ns` — usa magia/skills de soporte en cualquiera sin mantener Shift.
- `/showname` — cambia la fuente del nombre del personaje (soporte varía por servidor).
- `/skillfail` o `/sf` — oculta el aviso de "skill fallido".
- `/effect` — muestra/oculta efectos gráficos no esenciales.
- `/bgm`, `/sound` — activan/desactivan música y efectos de sonido.

**Social**
- `/invite "<nombre>"` — invita a alguien a la party (funciona entre mapas).
- `/organize "<nombre>"` — crea una party.
- `/guild "<nombre>"` — crea un guild (requiere Emperium en el inventario).
- `/ex <nombre>` — bloquea mensajes de un personaje.

**Rankings del servidor**
- `/alchemist`, `/blacksmith`, `/taekwon` — top 10 de esas categorías en el servidor.

## Comandos de GM (excluidos a propósito)

`/hide`, `/kill`, `/killall`, `/b` y `/nb` (broadcast), `/mm` (moverse a un mapa),
`/shift`, `/summon`, `/check` — todos requieren permisos de GM y no aplican a
guías para jugadores.
