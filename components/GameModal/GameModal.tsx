"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { MetricsComparison } from "./MetricsComparison";
import { GamePreviewBox } from "./GamePreviewBox";
import { GameSummaryBox } from "./GameSummaryBox";
import { X } from "lucide-react";

interface GameModalProps {
  game: Game;
  onClose: () => void;
}

export function GameModal({ game, onClose }: GameModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    console.log("🎯 GameModal opened for", game.awayTeam.abbr, "vs", game.homeTeam.abbr);
    console.log("📊 Away metrics:", {
      fg: game.awayMetrics.fgDriveRateOffense,
      punt: game.awayMetrics.puntDriveRateOffense,
      penalties: game.awayMetrics.penaltiesCommittedCount,
      rankFg: game.awayMetrics.rankFgRate,
      epaOffense: game.awayMetrics.rankEpaOffense,
    });
    console.log("📊 Home metrics:", {
      fg: game.homeMetrics.fgDriveRateOffense,
      punt: game.homeMetrics.puntDriveRateOffense,
      penalties: game.homeMetrics.penaltiesCommittedCount,
      rankFg: game.homeMetrics.rankFgRate,
      epaOffense: game.homeMetrics.rankEpaOffense,
    });
  }, [game]);

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

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Marcador. Los dos numeros vivian apilados en la columna del medio
              con un guion entre ellos, asi que no se sabia cual era de quien:
              ahora cada uno va debajo de su propio equipo. */}
          {(() => {
            const arrancado = game.status === "final" || game.status === "live";
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
                      // El que va arriba en negro pleno; el otro atenuado
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

          {/* Metrics */}
          <div style={{ borderTop: "4px solid #121212", paddingTop: "24px" }}>
            {/* Con el partido en marcha, primero lo que pasó; después la previa */}
          <GameSummaryBox game={game} />

          <GamePreviewBox game={game} />

          <MetricsComparison game={game} />
          </div>
        </div>
      </div>
    </div>
  );
}
