/**
 * Resumen de un partido en curso o terminado, a partir del endpoint `summary`
 * de ESPN (distinto de `scoreboard`, que solo da el marcador).
 *
 * Todo el parseo es tolerante: la respuesta trae muchos bloques opcionales que
 * aparecen recien cuando el partido arranca, y algunos cambian de forma segun
 * el estado. Ante cualquier campo ausente se devuelve el resumen sin esa parte
 * en vez de romper la vista del partido.
 */

import { useEffect, useState } from "react";
import type { Game } from "@/types";

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

export interface LineaJugador {
  equipo?: string;
  jugador: string;
  /** Ya formateada para mostrar, ej "25/34, 205 yd, 3 TD, 1 INT" */
  linea: string;
}

export interface Destacados {
  /** Uno por equipo: el de mas intentos de pase, normalmente el titular */
  qb: LineaJugador[];
  /** Uno por equipo: el de mas yardas terrestres */
  topRB: LineaJugador[];
  /** Uno por equipo: el de mas yardas por aire */
  topWR: LineaJugador[];
  /** Uno por equipo, solo si pateo al menos un FG */
  fieldGoals: LineaJugador[];
}

export interface ResumenPartido {
  anotaciones: Anotacion[];
  totales: Record<string, TotalesEquipo>;
  sacks: Autor[];
  intercepciones: Autor[];
  fumblesRecuperados: Autor[];
  destacados: Destacados;
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
  //
  // ESPN usa dos formas para el pase, con el orden de nombres invertido:
  //   "Drake Maye 12 Yd pass TO A.J. Brown"   -> [pasador] ... TO [receptor]
  //   "Eli Raridon 2 Yd pass FROM Drake Maye" -> [receptor] ... FROM [pasador]
  // Un replace simple del fragmento del medio (version anterior) daba
  // "Eli Raridon pase de 2 yd a Drake Maye" para el segundo caso: dejaba los
  // nombres en su posicion original del string sin darse cuenta de que con
  // "from" estan invertidos. Confirmado con datos reales de ESPN, no era un
  // caso hipotetico. Esta version captura ambos nombres y los reordena segun
  // corresponda antes de armar la frase.
  t = t.replace(
    /^(.+?)\s+(\d+)\s*Yd\s+pass\s+(from|to)\s+(.+?)(\s*\(.*)?$/i,
    (_m, nombreAntes: string, yardas: string, direccion: string, nombreDespues: string, resto = "") => {
      const [pasador, receptor] =
        direccion.toLowerCase() === "to" ? [nombreAntes, nombreDespues] : [nombreDespues, nombreAntes];
      return `${pasador} pase de ${yardas} yd a ${receptor}${resto}`;
    }
  );
  // "Rush" y "Run" son sinonimos en el texto de ESPN para carrera
  t = t.replace(/(\d+)\s*Yd\s+(?:Run|Rush)\b/gi, "carrera de $1 yd");
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

/**
 * El jugador con mayor valor en una columna, dentro de un grupo de
 * estadisticas de una categoria (ej. el de mas YDS en "rushing"). Nota
 * ausente: ESPN no expone "fumbles forzados" como columna individual en este
 * boxscore (solo FUM/LOST/REC, que es sobre quien perdio o recupero, no
 * quien lo forzo) - por eso no hay un extractor de forced fumbles aca.
 */
function liderDeGrupo(
  grupo: any,
  columnaOrden: string
): { fila: any; columnas: Record<string, number> } | null {
  const etiquetas: string[] = (grupo?.labels ?? []).map((l: any) => String(l).toUpperCase());
  const columnas: Record<string, number> = {};
  etiquetas.forEach((e, i) => (columnas[e] = i));
  const iOrden = columnas[columnaOrden];
  if (iOrden === undefined) return null;

  let mejor: any = null;
  let mejorValor = -Infinity;
  for (const fila of grupo?.athletes ?? []) {
    const valor = Number(fila?.stats?.[iOrden]);
    if (Number.isFinite(valor) && valor > mejorValor) {
      mejorValor = valor;
      mejor = fila;
    }
  }
  return mejor ? { fila: mejor, columnas } : null;
}

function nombreDe(fila: any): string | undefined {
  return fila?.athlete?.displayName ?? fila?.athlete?.shortName;
}

function valorCol(fila: any, columnas: Record<string, number>, nombre: string): string {
  const i = columnas[nombre];
  return i !== undefined ? String(fila?.stats?.[i] ?? "") : "";
}

function extraerDestacados(data: any, equipos: Record<string, string>): Destacados {
  const destacados: Destacados = { qb: [], topRB: [], topWR: [], fieldGoals: [] };

  for (const bloque of data?.boxscore?.players ?? []) {
    const abbr = normalizarAbbr(bloque?.team?.abbreviation) ?? equipos[String(bloque?.team?.id)];
    if (!abbr) continue;

    for (const grupo of bloque?.statistics ?? []) {
      const categoria = String(grupo?.name ?? "").toLowerCase();

      if (categoria === "passing") {
        const top = liderDeGrupo(grupo, "YDS");
        const jugador = top && nombreDe(top.fila);
        if (top && jugador) {
          const { fila, columnas } = top;
          const catt = valorCol(fila, columnas, "C/ATT");
          const yds = valorCol(fila, columnas, "YDS");
          const td = valorCol(fila, columnas, "TD");
          const int = valorCol(fila, columnas, "INT");
          destacados.qb.push({
            equipo: abbr,
            jugador,
            linea: `${catt ? catt + ", " : ""}${yds} yd, ${td} TD, ${int} INT`,
          });
        }
      }

      if (categoria === "rushing") {
        const top = liderDeGrupo(grupo, "YDS");
        const jugador = top && nombreDe(top.fila);
        if (top && jugador) {
          const { fila, columnas } = top;
          const car = valorCol(fila, columnas, "CAR");
          const yds = valorCol(fila, columnas, "YDS");
          const td = valorCol(fila, columnas, "TD");
          destacados.topRB.push({
            equipo: abbr,
            jugador,
            linea: `${car} ac, ${yds} yd, ${td} TD`,
          });
        }
      }

      if (categoria === "receiving") {
        const top = liderDeGrupo(grupo, "YDS");
        const jugador = top && nombreDe(top.fila);
        if (top && jugador) {
          const { fila, columnas } = top;
          const rec = valorCol(fila, columnas, "REC");
          const yds = valorCol(fila, columnas, "YDS");
          const td = valorCol(fila, columnas, "TD");
          destacados.topWR.push({
            equipo: abbr,
            jugador,
            linea: `${rec} rec, ${yds} yd, ${td} TD`,
          });
        }
      }

      if (categoria === "kicking") {
        // Un solo kicker por equipo normalmente; se toma el primero que
        // haya intentado al menos un FG (formato "0/0" cuando no intento).
        for (const fila of grupo?.athletes ?? []) {
          const etiquetas: string[] = (grupo?.labels ?? []).map((l: any) => String(l).toUpperCase());
          const columnas: Record<string, number> = {};
          etiquetas.forEach((e, i) => (columnas[e] = i));
          const fg = valorCol(fila, columnas, "FG");
          const intentos = Number(fg.split("/")[1] ?? "0");
          if (!intentos) continue;
          const jugador = nombreDe(fila);
          if (!jugador) continue;
          const long = valorCol(fila, columnas, "LONG");
          destacados.fieldGoals.push({
            equipo: abbr,
            jugador,
            linea: `${fg} FG${long ? ` (más largo: ${long} yd)` : ""}`,
          });
          break;
        }
      }
    }
  }

  return destacados;
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

  const destacados = extraerDestacados(data, equipos);

  return { anotaciones, totales, sacks, intercepciones, fumblesRecuperados, destacados };
}

/**
 * Igual que el scoreboard, se lee de un archivo estatico
 * (public/data/espn-live/summary-{id}.json) que deja el job de GitHub
 * Actions, no de un fetch directo a ESPN - el proxy /api/espn recibe 403 de
 * forma consistente desde Vercel. El job guarda el resumen de partidos en
 * vivo, y de los terminados solo hasta que se guarda una vez (el resultado
 * final ya no cambia), asi que un 404 puede significar tanto "todavia no
 * corrio el job" como "el partido ni empezo, nada que resumir todavia".
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

/**
 * Carga (y refresca mientras el partido esta en vivo) el resumen de un
 * partido. Vive aca, no dentro de GameSummaryBox, porque GamePlayerHighlights
 * necesita los mismos datos (destacados sale del mismo resumen) - si cada
 * componente hiciera su propio fetch+polling se duplicaria la llamada de red
 * y el intervalo, sin necesidad: GameModal llama esto una vez y pasa
 * `resumen`/`cargando` como props a ambos.
 */
export function useResumenPartido(game: Game): { resumen: ResumenPartido | null; cargando: boolean } {
  const [resumen, setResumen] = useState<ResumenPartido | null>(null);
  const [cargando, setCargando] = useState(false);

  const enJuego = game.status === "live";
  const arrancado = enJuego || game.status === "final";

  useEffect(() => {
    setResumen(null);
    if (!arrancado || !game.espnId) return;

    let vigente = true;
    const traer = async () => {
      setCargando(true);
      const r = await cargarResumenPartido(game.espnId!);
      if (vigente) {
        setResumen(r);
        setCargando(false);
      }
    };
    traer();

    // Mientras el partido corre, las anotaciones cambian: se refresca solo.
    // Terminado el partido no hace falta volver a pedirlo. El archivo detras
    // de esto lo actualiza un job externo cada 5-10 min, asi que pedirlo mas
    // seguido que eso no aporta.
    if (!enJuego) return () => { vigente = false; };
    const id = setInterval(traer, 120000);
    return () => {
      vigente = false;
      clearInterval(id);
    };
  }, [game.espnId, arrancado, enJuego]);

  return { resumen, cargando };
}
