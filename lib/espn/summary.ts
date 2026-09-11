/**
 * Resumen de un partido en curso o terminado, a partir del endpoint `summary`
 * de ESPN (distinto de `scoreboard`, que solo da el marcador).
 *
 * Todo el parseo es tolerante: la respuesta trae muchos bloques opcionales que
 * aparecen recien cuando el partido arranca, y algunos cambian de forma segun
 * el estado. Ante cualquier campo ausente se devuelve el resumen sin esa parte
 * en vez de romper la vista del partido.
 */

export type TipoAnotacion = "TD" | "FG" | "SAFETY" | "OTRO";

export interface Anotacion {
  tipo: TipoAnotacion;
  equipo?: string;
  /** Descripcion traducida al espanol */
  texto: string;
  /** Original de ESPN, por si la traduccion deja algo raro */
  textoOriginal: string;
  /** Cuarto y reloj, ej "2C 7:32" */
  cuando?: string;
  marcador?: string;
}

export interface TotalesEquipo {
  td: number;
  fg: number;
  turnovers: number | null;
  sacks: number | null;
  intercepciones: number | null;
  fumblesRecuperados: number | null;
}

export interface Autor {
  equipo?: string;
  jugador: string;
  cantidad: number;
}

export interface ResumenPartido {
  anotaciones: Anotacion[];
  totales: Record<string, TotalesEquipo>;
  sacks: Autor[];
  intercepciones: Autor[];
  fumblesRecuperados: Autor[];
}

/**
 * ESPN usa "LAR" y "WSH" donde el resto de la app usa "LA" y "WAS" (mismo
 * mismatch que en lib/data.ts, mergeESPNScores). Sin esto, las anotaciones y
 * los totales de Rams/Washington quedan etiquetados con un codigo que
 * GameSummaryBox no reconoce (colorDe compara contra game.awayTeam.abbr /
 * homeTeam.abbr, que son "LA"/"WAS"), y esa mitad del resumen se pinta gris
 * en vez del color del equipo.
 */
const ABREVIATURA_ESPN_A_APP: Record<string, string> = {
  LAR: "LA",
  WSH: "WAS",
};

function normalizarAbbr(abbr: string | undefined): string | undefined {
  if (!abbr) return abbr;
  return ABREVIATURA_ESPN_A_APP[abbr] ?? abbr;
}

/** Mapa id-de-equipo -> abreviatura, desde el encabezado del resumen. */
function mapaEquipos(data: any): Record<string, string> {
  const mapa: Record<string, string> = {};
  const competidores = data?.header?.competitions?.[0]?.competitors ?? [];
  for (const c of competidores) {
    const id = c?.team?.id ?? c?.id;
    const abbr = normalizarAbbr(c?.team?.abbreviation);
    if (id && abbr) mapa[String(id)] = abbr;
  }
  return mapa;
}

function clasificar(jugada: any): TipoAnotacion {
  const texto = [
    jugada?.scoringType?.name,
    jugada?.scoringType?.abbreviation,
    jugada?.type?.text,
    jugada?.type?.abbreviation,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (texto.includes("touchdown") || /\btd\b/.test(texto)) return "TD";
  if (texto.includes("field goal") || /\bfg\b/.test(texto)) return "FG";
  if (texto.includes("safety")) return "SAFETY";
  return "OTRO";
}

/**
 * Traduce la descripcion de una anotacion.
 *
 * ESPN la manda en ingles y con una gramatica bastante fija:
 *   "Drake Maye 12 Yd pass to A.J. Brown (Andy Borregales Kick)"
 *   "Devon Witherspoon 25 Yd Interception Return (Jason Myers Kick)"
 *
 * Se reescribe como frase en espanol conservando los nombres propios, que no
 * se tocan. Si aparece una construccion no contemplada, esa parte queda en
 * ingles en lugar de descartarse: el original siempre viaja en `textoOriginal`.
 */
export function traducirJugada(texto: string): string {
  if (!texto) return "";
  let t = texto;

  // Anotaciones: "<jugador> <n> Yd <accion>"
  t = t.replace(/(\d+)\s*Yd\s+pass\s+(?:from|to)\s+/gi, "pase de $1 yd a ");
  t = t.replace(/(\d+)\s*Yd\s+Run\b/gi, "carrera de $1 yd");
  t = t.replace(/(\d+)\s*Yd\s+Field\s+Goal\b/gi, "gol de campo de $1 yd");
  t = t.replace(/(\d+)\s*Yd\s+Interception\s+Return\b/gi, "devolución de intercepción de $1 yd");
  t = t.replace(/(\d+)\s*Yd\s+Fumble\s+Return\b/gi, "devolución de fumble de $1 yd");
  t = t.replace(/(\d+)\s*Yd\s+(?:Punt|Kickoff)\s+Return\b/gi, "devolución de $1 yd");
  t = t.replace(/(\d+)\s*Yd\s+Blocked\s+(?:Punt|Field\s+Goal)\s+Return\b/gi, "devolución de bloqueo de $1 yd");
  t = t.replace(/(\d+)\s*Yd\s+Reception\b/gi, "recepción de $1 yd");

  // Extras y conversiones, normalmente entre parentesis
  t = t.replace(/\bKick\s+Failed\b/gi, "extra fallado");
  t = t.replace(/\bKick\s+Blocked\b/gi, "extra bloqueado");
  t = t.replace(/\bTwo-Point\s+Pass\s+Conversion\s+Failed\b/gi, "conversión de 2 por pase fallada");
  t = t.replace(/\bTwo-Point\s+Run\s+Conversion\s+Failed\b/gi, "conversión de 2 por carrera fallada");
  t = t.replace(/\bTwo-Point\s+Conversion\s+Failed\b/gi, "conversión de 2 fallada");
  t = t.replace(/\bTwo-Point\s+Pass\s+Conversion\b/gi, "conversión de 2 por pase");
  t = t.replace(/\bTwo-Point\s+Run\s+Conversion\b/gi, "conversión de 2 por carrera");
  t = t.replace(/\bTwo-Point\s+Conversion\b/gi, "conversión de 2");
  t = t.replace(/\bPass\s+Failed\b/gi, "conversión por pase fallada");
  t = t.replace(/\bRun\s+Failed\b/gi, "conversión por carrera fallada");
  // "(Nombre Apellido Kick)" -> "(extra de Nombre Apellido)"
  t = t.replace(/\(([^()]+?)\s+Kick\)/gi, "(extra de $1)");

  // Terminos sueltos
  t = t.replace(/\bSafety\b/gi, "safety");
  t = t.replace(/\bNo\s+Good\b/gi, "desviado");
  t = t.replace(/\bBlocked\b/gi, "bloqueado");
  t = t.replace(/\bFumble\s+Recovery\b/gi, "recuperación de fumble");
  t = t.replace(/\bInterception\b/gi, "intercepción");
  t = t.replace(/\bFumble\b/gi, "fumble");
  t = t.replace(/\bTouchdown\b/gi, "touchdown");
  t = t.replace(/\bTeam\b/g, "Equipo");

  return t.replace(/\s{2,}/g, " ").trim();
}

/** Busca una estadistica de equipo por varios nombres posibles. */
function buscarEstadistica(estadisticas: any[], nombres: string[]): string | null {
  for (const est of estadisticas ?? []) {
    const clave = String(est?.name ?? est?.label ?? "").toLowerCase();
    if (nombres.some((n) => clave === n || clave.replace(/\s/g, "") === n)) {
      return est?.displayValue ?? est?.value ?? null;
    }
  }
  return null;
}

/** "3-21" (capturas y yardas perdidas) -> 3. Un numero suelto se devuelve tal cual. */
function primerNumero(valor: string | null): number | null {
  if (valor == null) return null;
  const m = String(valor).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/**
 * Jugadores con registro en cierta columna del box score.
 *
 * ESPN agrupa por categoria (defensive, interceptions, fumbles...) y cada grupo
 * trae sus propias `labels`. La columna se busca por nombre y no por posicion,
 * porque el orden cambia entre categorias. `grupos` acota donde mirar: sin eso,
 * una etiqueta como "TD" aparece en varias a la vez.
 */
function extraerPorColumna(
  data: any,
  equipos: Record<string, string>,
  columnas: string[],
  grupos?: string[]
): Autor[] {
  const salida: Autor[] = [];
  for (const bloque of data?.boxscore?.players ?? []) {
    const abbr = normalizarAbbr(bloque?.team?.abbreviation) ?? equipos[String(bloque?.team?.id)];
    for (const grupo of bloque?.statistics ?? []) {
      const nombreGrupo = String(grupo?.name ?? "").toLowerCase();
      if (grupos && !grupos.some((g) => nombreGrupo.includes(g))) continue;

      const etiquetas: string[] = (grupo?.labels ?? []).map((l: any) => String(l).toUpperCase());
      const i = etiquetas.findIndex((e) => columnas.includes(e));
      if (i === -1) continue;

      for (const fila of grupo?.athletes ?? []) {
        const cantidad = Number(fila?.stats?.[i]);
        const jugador = fila?.athlete?.displayName ?? fila?.athlete?.shortName;
        if (jugador && Number.isFinite(cantidad) && cantidad > 0) {
          salida.push({ equipo: abbr, jugador, cantidad });
        }
      }
    }
  }
  return salida.sort((a, b) => b.cantidad - a.cantidad);
}

/** Suma por equipo lo aportado por sus jugadores. */
function totalPorEquipo(autores: Autor[], abbr: string): number | null {
  const propios = autores.filter((a) => a.equipo === abbr);
  if (propios.length === 0) return null;
  return propios.reduce((suma, a) => suma + a.cantidad, 0);
}

export function parsearResumen(data: any): ResumenPartido | null {
  if (!data) return null;

  const equipos = mapaEquipos(data);

  const anotaciones: Anotacion[] = (data?.scoringPlays ?? []).map((j: any) => {
    const cuarto = j?.period?.number;
    const reloj = j?.clock?.displayValue;
    const original = j?.text ?? "";
    return {
      tipo: clasificar(j),
      equipo: normalizarAbbr(j?.team?.abbreviation) ?? equipos[String(j?.team?.id)],
      texto: traducirJugada(original),
      textoOriginal: original,
      cuando: cuarto ? `${cuarto}C${reloj ? " " + reloj : ""}` : reloj || undefined,
      marcador:
        j?.awayScore != null && j?.homeScore != null ? `${j.awayScore}-${j.homeScore}` : undefined,
    };
  });

  const sacks = extraerPorColumna(data, equipos, ["SACKS"], ["defensive"]);
  const intercepciones = extraerPorColumna(data, equipos, ["INT"], ["interception", "defensive"]);
  const fumblesRecuperados = extraerPorColumna(data, equipos, ["REC", "FR"], ["fumble", "defensive"]);

  const totales: Record<string, TotalesEquipo> = {};
  const registrar = (abbr: string, est: any[]) => {
    totales[abbr] = {
      td: anotaciones.filter((a) => a.equipo === abbr && a.tipo === "TD").length,
      fg: anotaciones.filter((a) => a.equipo === abbr && a.tipo === "FG").length,
      turnovers: primerNumero(buscarEstadistica(est, ["turnovers", "giveaways"])),
      sacks: primerNumero(buscarEstadistica(est, ["sacksyardslost", "sacks", "totalsacks"])),
      // Las columnas de robos no siempre vienen en el bloque de equipo: se
      // reconstruyen sumando lo de cada jugador.
      intercepciones:
        primerNumero(buscarEstadistica(est, ["interceptions", "defensiveinterceptions"])) ??
        totalPorEquipo(intercepciones, abbr),
      fumblesRecuperados:
        primerNumero(buscarEstadistica(est, ["fumblesrecovered", "fumblesrecoveries"])) ??
        totalPorEquipo(fumblesRecuperados, abbr),
    };
  };

  for (const bloque of data?.boxscore?.teams ?? []) {
    const abbr = normalizarAbbr(bloque?.team?.abbreviation) ?? equipos[String(bloque?.team?.id)];
    if (abbr) registrar(abbr, bloque?.statistics ?? []);
  }

  // Sin bloque de equipos, al menos se informa lo que se pueda contar
  if (Object.keys(totales).length === 0) {
    for (const abbr of new Set(anotaciones.map((a) => a.equipo).filter(Boolean) as string[])) {
      registrar(abbr, []);
    }
  }

  if (anotaciones.length === 0 && Object.keys(totales).length === 0) return null;

  return { anotaciones, totales, sacks, intercepciones, fumblesRecuperados };
}

/**
 * Igual que el scoreboard, se lee de un archivo estatico
 * (public/data/espn-live/summary-{id}.json) que deja el job de GitHub
 * Actions, no de un fetch directo a ESPN - el proxy /api/espn recibe 403 de
 * forma consistente desde Vercel. El job solo guarda el resumen de partidos
 * en vivo o terminados hace menos de 4h, asi que un 404 ademas de "todavia
 * no corrio el job" tambien puede significar "ese partido ya no esta en la
 * ventana que se guarda".
 */
export async function cargarResumenPartido(espnId: string): Promise<ResumenPartido | null> {
  try {
    const res = await fetch(`/data/espn-live/summary-${encodeURIComponent(espnId)}.json`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status !== 404) {
        console.warn(`[ESPN] summary devolvio ${res.status} para el evento ${espnId}`);
      }
      return null;
    }
    const archivo = await res.json();
    return parsearResumen(archivo?.raw);
  } catch (error) {
    console.warn("[ESPN] No se pudo cargar el resumen del partido:", error);
    return null;
  }
}
