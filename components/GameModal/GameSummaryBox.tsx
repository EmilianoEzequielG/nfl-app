"use client";

import { useEffect, useState } from "react";
import { Game } from "@/types";
import { cargarResumenPartido, type ResumenPartido, type TipoAnotacion } from "@/lib/espn/summary";

const COLORS = {
  ink: "#121212",
  red: "#D02020",
  muted: "#666",
  hairline: "#ddd",
};

const ICONO: Record<TipoAnotacion, string> = {
  TD: "🏈",
  FG: "🥅",
  SAFETY: "🛡️",
  OTRO: "•",
};

function Totales({ abbr, color, t }: { abbr: string; color: string; t: any }) {
  const celdas = [
    { etiqueta: "TD", valor: t.td },
    { etiqueta: "FG", valor: t.fg },
    { etiqueta: "TO", valor: t.turnovers },
    { etiqueta: "Sacks", valor: t.sacks },
  ];
  return (
    <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: "10px" }}>
      <p
        style={{
          margin: "0 0 6px 0",
          fontSize: "11px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: COLORS.ink,
        }}
      >
        {abbr}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
        {celdas.map((c) => (
          <div key={c.etiqueta} style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "9px", color: COLORS.muted, textTransform: "uppercase" }}>
              {c.etiqueta}
            </p>
            <p style={{ margin: "2px 0 0 0", fontSize: "17px", fontWeight: 900, color: COLORS.ink }}>
              {c.valor ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GameSummaryBox({ game }: { game: Game }) {
  const [resumen, setResumen] = useState<ResumenPartido | null>(null);
  const [cargando, setCargando] = useState(false);

  const enJuego = game.status === "live";
  const arrancado = enJuego || game.status === "final";

  useEffect(() => {
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
    // Terminado el partido no hace falta volver a pedirlo.
    if (!enJuego) return () => { vigente = false; };
    const id = setInterval(traer, 45000);
    return () => {
      vigente = false;
      clearInterval(id);
    };
  }, [game.espnId, arrancado, enJuego]);

  // Antes del kickoff no hay nada que mostrar
  if (!arrancado) return null;

  if (!resumen) {
    return (
      <div
        style={{
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: "white",
          padding: "14px 16px",
          marginBottom: "24px",
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: COLORS.muted }}>
          {cargando ? "Cargando resumen del partido…" : "Todavía no hay anotaciones."}
        </p>
      </div>
    );
  }

  const abbrs = [game.awayTeam.abbr, game.homeTeam.abbr];
  const colorDe = (a: string) =>
    a === game.awayTeam.abbr ? game.awayTeam.color : game.homeTeam.color;

  return (
    <div
      style={{
        border: `4px solid ${COLORS.ink}`,
        backgroundColor: "white",
        padding: "16px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: `2px solid ${COLORS.ink}`,
          paddingBottom: "10px",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: COLORS.ink,
          }}
        >
          📊 Resumen del partido
        </span>
        {enJuego && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: COLORS.red,
            }}
            className="animate-pulse"
          >
            ● En vivo
          </span>
        )}
        {game.liveDetail && (
          <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: COLORS.muted }}>
            {game.liveDetail}
          </span>
        )}
      </div>

      {/* Totales por equipo */}
      <div style={{ display: "grid", gap: "12px", marginBottom: "14px" }}>
        {abbrs.map((a) =>
          resumen.totales[a] ? (
            <Totales key={a} abbr={a} color={colorDe(a)} t={resumen.totales[a]} />
          ) : null
        )}
      </div>

      {/* Anotaciones, de la mas reciente a la mas vieja */}
      {resumen.anotaciones.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "12px" }}>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: COLORS.muted,
            }}
          >
            Anotaciones
          </p>
          {[...resumen.anotaciones].reverse().map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
                padding: "6px 0",
                borderBottom: i < resumen.anotaciones.length - 1 ? `1px solid ${COLORS.hairline}` : "none",
              }}
            >
              <span style={{ fontSize: "13px", flexShrink: 0 }}>{ICONO[a.tipo]}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.5, color: COLORS.ink }}>
                  {a.texto}
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: COLORS.muted }}>
                  {[a.equipo, a.cuando, a.marcador].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quien captura */}
      {resumen.sackeadores.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "12px", marginTop: "4px" }}>
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
            Capturas
          </p>
          <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.6, color: COLORS.ink }}>
            {resumen.sackeadores
              .map((s) => `${s.jugador}${s.equipo ? ` (${s.equipo})` : ""} ${s.cantidad}`)
              .join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
