"use client";

import { Game } from "@/types";
import type { LineaJugador, ResumenPartido } from "@/lib/espn/summary";

const COLORS = {
  ink: "#121212",
  muted: "#666",
  hairline: "#ddd",
};

function Categoria({
  titulo,
  icono,
  lineas,
  colorDe,
}: {
  titulo: string;
  icono: string;
  lineas: LineaJugador[];
  colorDe: (abbr?: string) => string;
}) {
  if (lineas.length === 0) return null;
  return (
    <div style={{ marginBottom: "14px" }}>
      <p
        style={{
          margin: "0 0 6px 0",
          fontSize: "10px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: COLORS.muted,
        }}
      >
        {icono} {titulo}
      </p>
      {lineas.map((l, i) => (
        <div
          key={`${l.jugador}-${i}`}
          style={{
            borderLeft: `4px solid ${colorDe(l.equipo)}`,
            paddingLeft: "8px",
            marginBottom: i < lineas.length - 1 ? "6px" : 0,
          }}
        >
          <p style={{ margin: 0, fontSize: "12px", color: COLORS.ink }}>
            <strong style={{ fontWeight: 900 }}>{l.jugador}</strong>
            {l.equipo ? ` (${l.equipo})` : ""} — {l.linea}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Estadisticas destacadas por jugador: QB, corredor y receptor lider de cada
 * equipo, y los resultados de goles de campo. Solo tiene sentido con el
 * partido terminado - antes de eso el boxscore de jugadores puede estar
 * incompleto o vacio, y comparar "el lider hasta ahora" no aporta demasiado
 * mientras el marcador sigue moviendose.
 *
 * Capturas, intercepciones y fumbles recuperados con su autor ya se muestran
 * en GameSummaryBox (llegan del mismo resumen) - no se repiten aca.
 */
export function GamePlayerHighlights({
  game,
  resumen,
}: {
  game: Game;
  resumen: ResumenPartido | null;
}) {
  if (game.status !== "final" || !resumen) return null;

  const { qb, topRB, topWR, fieldGoals } = resumen.destacados;
  if (qb.length + topRB.length + topWR.length + fieldGoals.length === 0) return null;

  const colorDe = (a?: string) =>
    a === game.awayTeam.abbr
      ? game.awayTeam.color
      : a === game.homeTeam.abbr
      ? game.homeTeam.color
      : COLORS.muted;

  return (
    <div
      style={{
        border: `4px solid ${COLORS.ink}`,
        backgroundColor: "white",
        padding: "16px",
        marginBottom: "24px",
      }}
    >
      <p
        style={{
          margin: "0 0 14px 0",
          fontSize: "12px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: COLORS.ink,
          borderBottom: `2px solid ${COLORS.ink}`,
          paddingBottom: "10px",
        }}
      >
        🏆 Estadísticas destacadas
      </p>

      <Categoria titulo="Quarterbacks" icono="🎯" lineas={qb} colorDe={colorDe} />
      <Categoria titulo="Corredor líder" icono="🏃" lineas={topRB} colorDe={colorDe} />
      <Categoria titulo="Receptor líder" icono="🙌" lineas={topWR} colorDe={colorDe} />
      <Categoria titulo="Goles de campo" icono="🥅" lineas={fieldGoals} colorDe={colorDe} />
    </div>
  );
}
