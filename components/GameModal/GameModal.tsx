"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { MetricsComparison } from "./MetricsComparison";
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
          overflow: "auto",
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
          {/* Teams */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* Away */}
            <div style={{ textAlign: "center" }}>
              <Image
                src={`/helmets/${game.awayTeam.abbr}.png`}
                alt={game.awayTeam.name}
                width={80}
                height={80}
                unoptimized={true}
                style={{ margin: "0 auto 12px", display: "block" }}
              />
              <p style={{ fontWeight: "bold", fontSize: "14px" }}>{game.awayTeam.name}</p>
            </div>

            {/* Score */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {game.status === "final" && (
                <>
                  <div style={{ fontSize: "48px", fontWeight: "900", marginBottom: "8px" }}>{game.awayScore}</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#666" }}>-</div>
                  <div style={{ fontSize: "48px", fontWeight: "900", marginTop: "8px" }}>{game.homeScore}</div>
                </>
              )}
              {game.status !== "final" && (
                <div style={{ fontWeight: "900", fontSize: "14px", backgroundColor: "#F0C020", border: "2px solid #121212", padding: "8px 12px" }}>
                  VS
                </div>
              )}
            </div>

            {/* Home */}
            <div style={{ textAlign: "center" }}>
              <Image
                src={`/helmets/${game.homeTeam.abbr}.png`}
                alt={game.homeTeam.name}
                width={80}
                height={80}
                unoptimized={true}
                style={{ margin: "0 auto 12px", display: "block" }}
              />
              <p style={{ fontWeight: "bold", fontSize: "14px" }}>{game.homeTeam.name}</p>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ borderTop: "4px solid #121212", paddingTop: "24px" }}>
            <MetricsComparison game={game} />
          </div>
        </div>
      </div>
    </div>
  );
}
