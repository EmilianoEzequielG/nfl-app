"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Game } from "@/types";
import { useResumenPartido } from "@/lib/espn/summary";
import { MetricsComparison } from "./MetricsComparison";
import { GamePreviewBox } from "./GamePreviewBox";
import { GameSummaryBox } from "./GameSummaryBox";
import { GamePlayerHighlights } from "./GamePlayerHighlights";

interface GameModalProps {
  game: Game;
  onClose: () => void;
}

const COLORS = { ink: "#121212", red: "#D02020", muted: "#666" };

export function GameModal({ game, onClose }: GameModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const { resumen, cargando } = useResumenPartido(game);

  // navigator.share (mobile) abre el picker nativo de apps para compartir;
  // sin eso (la mayoria de los navegadores de escritorio), se copia el link
  // al portapapeles y se avisa con el mismo boton en vez de un alert().
  const handleCompartir = async () => {
    const url = `${window.location.origin}/partido/${game.id}`;
    const titulo = `${game.awayTeam.abbr} @ ${game.homeTeam.abbr}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        // el usuario cancelo el picker nativo - no hace falta avisar nada
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard bloqueado (ej. sin HTTPS); no hay mucho mas que ofrecer aca
    }
  };

  // El partido decide que hay para ver, no solo el orden:
  //  - todavia no arranco: nada que resumir, directo a previa + metricas.
  //  - en vivo o terminado: el resultado manda (marcador + resumen, y si ya
  //    termino tambien las estadisticas destacadas), con la previa y las
  //    metricas a un swipe/click de distancia en vez de mas scroll.
  const arrancado = game.status !== "scheduled";
  const [pagina, setPagina] = useState<0 | 1>(0);
  const [touchStart, setTouchStart] = useState(0);

  // Al abrir un partido distinto (o cuando el estado cambia de "scheduled" a
  // "live" mientras el modal esta abierto) se vuelve a la primera pagina.
  useEffect(() => {
    setPagina(0);
  }, [game.id, arrancado]);

  useEffect(() => {
    if (!isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return; // mismo umbral que el carrusel de Tacticas
    setPagina(diff > 0 ? 1 : 0);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          zIndex: 1,
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          backgroundColor: "white",
          border: "4px solid #121212",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#D02020",
            border: "4px solid #121212",
            borderBottom: "4px solid #121212",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "white" }}>
            <p style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase" }}>
              {game.status === "final" ? "FINAL" : game.status === "live" ? "🔴 EN VIVO" : "📅 PRÓXIMO"}
            </p>
            <h2 style={{ fontSize: "24px", fontWeight: "900", textTransform: "uppercase" }}>
              {game.awayTeam.abbr} vs {game.homeTeam.abbr}
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={handleCompartir}
              aria-label="Compartir este partido"
              style={{
                padding: "8px 10px",
                backgroundColor: "white",
                border: "2px solid #121212",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 900,
                textTransform: "uppercase",
                color: COLORS.ink,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {copiado ? "✓" : "↗"} <span className="hidden sm:inline">{copiado ? "Copiado" : "Compartir"}</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: "8px",
                backgroundColor: "white",
                border: "2px solid #121212",
                cursor: "pointer",
                fontSize: "28px",
                color: "#D02020",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Marcador: siempre visible arriba, en los tres estados. Cada
              puntaje va debajo de su propio equipo en vez de los dos numeros
              apilados en el medio, para que se sepa cual es de quien de un
              vistazo. */}
          {(() => {
            const visitante = game.awayScore ?? 0;
            const local = game.homeScore ?? 0;
            const lado = (equipo: typeof game.awayTeam, puntos: number, gana: boolean) => (
              <div style={{ textAlign: "center", minWidth: 0 }}>
                <Image
                  src={`/helmets/${equipo.abbr}.png`}
                  alt={equipo.name}
                  width={80}
                  height={80}
                  unoptimized={true}
                  style={{ margin: "0 auto 8px", display: "block", width: "clamp(48px, 16vw, 80px)", height: "auto" }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#666",
                  }}
                >
                  {equipo.abbr}
                </p>
                {arrancado && (
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "clamp(38px, 13vw, 56px)",
                      fontWeight: 900,
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                      color: gana ? "#121212" : "#9a9a9a",
                    }}
                  >
                    {puntos}
                  </p>
                )}
              </div>
            );

            return (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "8px",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                {lado(game.awayTeam, visitante, arrancado && visitante >= local)}

                <div style={{ textAlign: "center", minWidth: 0 }}>
                  {game.status === "live" && (
                    <>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "10px",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          color: "#D02020",
                        }}
                        className="animate-pulse"
                      >
                        ● En vivo
                      </p>
                      {game.liveDetail && (
                        <p style={{ margin: "4px 0 0 0", fontSize: "11px", fontWeight: 700, color: "#666", whiteSpace: "nowrap" }}>
                          {game.liveDetail}
                        </p>
                      )}
                    </>
                  )}
                  {game.status === "final" && (
                    <p style={{ margin: 0, fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: "#666" }}>
                      Final
                    </p>
                  )}
                  {game.status === "scheduled" && (
                    <div style={{ fontWeight: 900, fontSize: "14px", backgroundColor: "#F0C020", border: "2px solid #121212", padding: "8px 12px" }}>
                      VS
                    </div>
                  )}
                </div>

                {lado(game.homeTeam, local, arrancado && local >= visitante)}
              </div>
            );
          })()}

          {!arrancado ? (
            // Todavia no hay nada que resumir: directo a la previa y las
            // metricas comparativas, sin carrusel de por medio (una sola
            // pagina no necesita paginacion).
            <div style={{ borderTop: "4px solid #121212", paddingTop: "24px" }}>
              <GamePreviewBox game={game} />
              <MetricsComparison game={game} />
            </div>
          ) : (
            <div
              style={{ borderTop: "4px solid #121212", paddingTop: "24px" }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {pagina === 0 ? (
                <>
                  <GameSummaryBox game={game} resumen={resumen} cargando={cargando} />
                  <GamePlayerHighlights game={game} resumen={resumen} />
                </>
              ) : (
                <>
                  <GamePreviewBox game={game} />
                  <MetricsComparison game={game} />
                </>
              )}

              {/* Navegacion entre paginas: flechas para click/tap, deslizar
                  tambien funciona (ver handleTouchStart/End arriba) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  marginTop: "8px",
                  paddingTop: "16px",
                  borderTop: "2px solid #121212",
                }}
              >
                <button
                  onClick={() => setPagina(0)}
                  aria-label="Ver resultado del partido"
                  style={{
                    padding: "8px 12px",
                    border: `2px solid ${COLORS.ink}`,
                    backgroundColor: pagina === 0 ? COLORS.ink : "white",
                    color: pagina === 0 ? "white" : COLORS.ink,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                  }}
                >
                  <ChevronLeft size={14} /> Resultado
                </button>
                <button
                  onClick={() => setPagina(1)}
                  aria-label="Ver previa y métricas"
                  style={{
                    padding: "8px 12px",
                    border: `2px solid ${COLORS.ink}`,
                    backgroundColor: pagina === 1 ? COLORS.ink : "white",
                    color: pagina === 1 ? "white" : COLORS.ink,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                  }}
                >
                  Previa y métricas <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
