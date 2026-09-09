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
  /** Descripcion de ESPN, que ya incluye quien anoto */
  texto: string;
  /** Cuarto y reloj, ej "2C 7:32" */
  cuando?: string;
  marcador?: string;
}

export interface TotalesEquipo {
  td: number;
  fg: number;
  turnovers: number | null;
  sacks: number | null;
}

export interface Sackeador {
  equipo?: string;
  jugador: string;
  cantidad: number;
}

export interface ResumenPartido {
  anotaciones: Anotacion[];
  totales: Record<string, TotalesEquipo>;
  sackeadores: Sackeador[];
}

/** Mapa id-de-equipo -> abreviatura, desde el encabezado del resumen. */
function mapaEquipos(data: any): Record<string, string> {
  const mapa: Record<string, string> = {};
  const competidores = data?.header?.competitions?.[0]?.competitors ?? [];
  for (const c of competidores) {
    const id = c?.team?.id ?? c?.id;
    const abbr = c?.team?.abbreviation;
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

function extraerSackeadores(data: any, equipos: Record<string, string>): Sackeador[] {
  const salida: Sackeador[] = [];
  for (const bloque of data?.boxscore?.players ?? []) {
    const abbr = bloque?.team?.abbreviation ?? equipos[String(bloque?.team?.id)];
    for (const grupo of bloque?.statistics ?? []) {
      const etiquetas: string[] = (grupo?.labels ?? []).map((l: any) => String(l).toUpperCase());
      const i = etiquetas.indexOf("SACKS");
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

export function parsearResumen(data: any): ResumenPartido | null {
  if (!data) return null;

  const equipos = mapaEquipos(data);

  const anotaciones: Anotacion[] = (data?.scoringPlays ?? []).map((j: any) => {
    const cuarto = j?.period?.number;
    const reloj = j?.clock?.displayValue;
    return {
      tipo: clasificar(j),
      equipo: j?.team?.abbreviation ?? equipos[String(j?.team?.id)],
      texto: j?.text ?? "",
      cuando: cuarto ? `${cuarto}C${reloj ? " " + reloj : ""}` : reloj || undefined,
      marcador:
        j?.awayScore != null && j?.homeScore != null ? `${j.awayScore}-${j.homeScore}` : undefined,
    };
  });

  const totales: Record<string, TotalesEquipo> = {};
  for (const bloque of data?.boxscore?.teams ?? []) {
    const abbr = bloque?.team?.abbreviation ?? equipos[String(bloque?.team?.id)];
    if (!abbr) continue;
    const est = bloque?.statistics ?? [];
    totales[abbr] = {
      td: anotaciones.filter((a) => a.equipo === abbr && a.tipo === "TD").length,
      fg: anotaciones.filter((a) => a.equipo === abbr && a.tipo === "FG").length,
      turnovers: primerNumero(buscarEstadistica(est, ["turnovers", "giveaways"])),
      sacks: primerNumero(buscarEstadistica(est, ["sacksyardslost", "sacks", "totalsacks"])),
    };
  }

  // Sin bloque de equipos, al menos se informan las anotaciones contadas
  if (Object.keys(totales).length === 0) {
    for (const a of anotaciones) {
      if (!a.equipo) continue;
      totales[a.equipo] ??= { td: 0, fg: 0, turnovers: null, sacks: null };
      if (a.tipo === "TD") totales[a.equipo].td++;
      if (a.tipo === "FG") totales[a.equipo].fg++;
    }
  }

  if (anotaciones.length === 0 && Object.keys(totales).length === 0) return null;

  return { anotaciones, totales, sackeadores: extraerSackeadores(data, equipos) };
}

export async function cargarResumenPartido(espnId: string): Promise<ResumenPartido | null> {
  try {
    const res = await fetch(`/api/espn?endpoint=summary&event=${encodeURIComponent(espnId)}`);
    if (!res.ok) {
      console.warn(`[ESPN] summary devolvio ${res.status} para el evento ${espnId}`);
      return null;
    }
    return parsearResumen(await res.json());
  } catch (error) {
    console.warn("[ESPN] No se pudo cargar el resumen del partido:", error);
    return null;
  }
}
