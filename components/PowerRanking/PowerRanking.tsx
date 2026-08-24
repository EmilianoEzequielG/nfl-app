"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Lock, Unlock, Trophy, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

interface TeamRanking {
  id: string;
  abbr: string;
  name: string;
  record: string;
  color: string;
  calculatedRank: number;
  adjustedRank?: number;
  isAdjusted: boolean;
  summary?: string;
  epa?: number;
  metrics?: {
    fgDriveRateOffense?: number;
    puntDriveRateOffense?: number;
    penaltiesCommittedCount?: number;
    rankFgRate?: number;
    rankEpaOffense?: number;
  };
}

interface EditState {
  teamId: string;
  newRank: number;
  newSummary: string;
}

export function PowerRanking() {
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamRanking | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const TOTAL_WEEKS = 18;

  useEffect(() => {
    loadRankings();
  }, [currentWeek]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/power-ranking?week=${currentWeek}`);
      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      }
    } catch (error) {
      console.error("Error loading rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminToggle = () => {
    if (!adminMode) {
      const password = prompt("🔐 Contraseña de admin:");
      if (password === "secret123") {
        setAdminMode(true);
      } else {
        alert("❌ Contraseña incorrecta");
      }
    } else {
      setAdminMode(false);
    }
  };

  const handleEditClick = (team: TeamRanking) => {
    setEditState({
      teamId: team.id,
      newRank: team.adjustedRank || team.calculatedRank,
      newSummary: team.summary || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    try {
      const response = await fetch("/api/power-ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: editState.teamId,
          rankingPosition: editState.newRank,
          summary: editState.newSummary,
          week: currentWeek,
        }),
      });
      if (response.ok) {
        await loadRankings();
        setEditState(null);
      }
    } catch (error) {
      console.error("Error saving ranking:", error);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(Math.max(1, currentWeek - 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(Math.min(TOTAL_WEEKS, currentWeek + 1));
  };

  // Eliminar duplicados - mantener solo uno por equipo
  const uniqueRankings = Array.from(
    new Map(rankings.map((team) => [team.id, team])).values()
  );

  const sortedRankings = uniqueRankings.sort((a, b) => {
    const aRank = a.adjustedRank || a.calculatedRank;
    const bRank = b.adjustedRank || b.calculatedRank;
    return aRank - bRank;
  });

  if (loading) {
    return (
      <div className="section flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-bauhaus-black border-t-bauhaus-red animate-spin rounded-none mb-4" />
          <p className="h3 text-display-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bauhaus-bg">
      {/* HEADER - Bauhaus */}
      <div className="section border-b-4 border-bauhaus-black bg-white">
        <div className="container-geo">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-8 h-8 text-bauhaus-red" />
                <h1 className="h1 text-display-lg">Power Ranking</h1>
              </div>
              <p className="text-sm uppercase tracking-wider text-bauhaus-black">
                Ranking editorial de los 32 equipos
              </p>
            </div>
            <button
              onClick={handleAdminToggle}
              className={`p-4 border-2 border-bauhaus-black font-black text-xl transition-all ${
                adminMode
                  ? "bg-bauhaus-yellow shadow-geo-md"
                  : "bg-white shadow-geo-sm hover:shadow-geo-md"
              }`}
            >
              {adminMode ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* WEEK NAVIGATION */}
      <div className="section bg-bauhaus-yellow border-b-4 border-bauhaus-black">
        <div className="container-geo">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousWeek}
              disabled={currentWeek === 1}
              className={`p-3 border-2 border-bauhaus-black font-black text-xl transition-all ${
                currentWeek === 1
                  ? "opacity-30"
                  : "hover:shadow-geo-md active:shadow-geo-sm"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="font-black text-xl uppercase">
              SEMANA {currentWeek}
            </div>
            <button
              onClick={handleNextWeek}
              disabled={currentWeek === TOTAL_WEEKS}
              className={`p-3 border-2 border-bauhaus-black font-black text-xl transition-all ${
                currentWeek === TOTAL_WEEKS
                  ? "opacity-30"
                  : "hover:shadow-geo-md active:shadow-geo-sm"
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* TEAM MODAL */}
      {selectedTeam && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              zIndex: 1,
            }}
            onClick={() => setSelectedTeam(null)}
          />
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
                  SEMANA {currentWeek}
                </p>
                <h2 style={{ fontSize: "24px", fontWeight: "900", textTransform: "uppercase" }}>
                  {selectedTeam.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
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
              {/* Wordmark */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Image
                  src={`/helmets/${selectedTeam.id}.png`}
                  alt={selectedTeam.name}
                  width={120}
                  height={120}
                  unoptimized={true}
                  style={{ margin: "0 auto 16px", display: "block" }}
                />
                <p style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "8px" }}>
                  #{selectedTeam.adjustedRank || selectedTeam.calculatedRank} - {selectedTeam.name}
                </p>
                <p style={{ fontSize: "14px", color: "#666" }}>{selectedTeam.record}</p>
              </div>

              {/* Summary */}
              <div style={{ marginBottom: "24px", borderBottom: "2px solid #121212", paddingBottom: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "8px", color: "#D02020" }}>
                  📝 Resumen Editorial
                </p>
                {selectedTeam.summary ? (
                  <p style={{ fontSize: "14px", fontWeight: "500", lineHeight: "1.6", color: "#121212" }}>
                    {selectedTeam.summary}
                  </p>
                ) : (
                  <p style={{ fontSize: "14px", fontWeight: "500", color: "#999", fontStyle: "italic" }}>
                    ⚠️ Sin resumen para esta semana
                  </p>
                )}
              </div>

              {/* Metrics */}
              {selectedTeam.metrics && (
                <div>
                  <p style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px", color: "#0066CC" }}>
                    📊 Métricas
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {selectedTeam.metrics.fgDriveRateOffense !== undefined && (
                      <div style={{ border: "2px solid #121212", padding: "12px" }}>
                        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>FG Drive Rate</p>
                        <p style={{ fontSize: "18px", fontWeight: "900" }}>
                          {(selectedTeam.metrics.fgDriveRateOffense * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedTeam.metrics.puntDriveRateOffense !== undefined && (
                      <div style={{ border: "2px solid #121212", padding: "12px" }}>
                        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Punt Drive Rate</p>
                        <p style={{ fontSize: "18px", fontWeight: "900" }}>
                          {(selectedTeam.metrics.puntDriveRateOffense * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedTeam.metrics.rankEpaOffense !== undefined && (
                      <div style={{ border: "2px solid #121212", padding: "12px" }}>
                        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>EPA Ofensiva Rank</p>
                        <p style={{ fontSize: "18px", fontWeight: "900" }}>#{selectedTeam.metrics.rankEpaOffense}</p>
                      </div>
                    )}
                    {selectedTeam.metrics.penaltiesCommittedCount !== undefined && (
                      <div style={{ border: "2px solid #121212", padding: "12px" }}>
                        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Penalidades</p>
                        <p style={{ fontSize: "18px", fontWeight: "900" }}>{selectedTeam.metrics.penaltiesCommittedCount}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL - Bauhaus */}
      {editState && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50">
          <div className="bg-bauhaus-yellow w-full border-t-4 border-bauhaus-black p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="h2 text-display-md mb-2">✏️ Editar</h2>
              <p className="font-black text-xl uppercase">{editState.teamId}</p>
            </div>

            <div>
              <label className="label block text-bauhaus-black mb-3">📍 Posición (1-32)</label>
              <input
                type="number"
                min="1"
                max="32"
                value={editState.newRank}
                onChange={(e) =>
                  setEditState({ ...editState, newRank: parseInt(e.target.value) })
                }
                className="w-full border-2 border-bauhaus-black p-3 font-black text-lg shadow-geo-sm"
              />
            </div>

            <div>
              <label className="label block text-bauhaus-black mb-3">📝 Resumen Editorial</label>
              <textarea
                value={editState.newSummary}
                onChange={(e) =>
                  setEditState({ ...editState, newSummary: e.target.value })
                }
                placeholder="Escribe tu análisis..."
                className="w-full border-2 border-bauhaus-black p-3 h-24 resize-none font-medium"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 btn-primary py-3 text-lg shadow-geo-md"
              >
                ✅ GUARDAR
              </button>
              <button
                onClick={() => setEditState(null)}
                className="flex-1 btn-outline py-3 text-lg shadow-geo-md"
              >
                ❌ CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RANKINGS LIST - Bauhaus */}
      <div className="section">
        <div className="container-geo space-y-6 sm:space-y-8">
          {sortedRankings.map((team, idx) => {
            return (
              <div key={`${team.id}-${currentWeek}`}>
                <button
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full bg-white text-bauhaus-black border-4 border-bauhaus-black p-4 sm:p-6 text-left font-black shadow-geo-lg transition-transform hover:shadow-geo-xl active:translate-x-1 active:translate-y-1 active:shadow-geo-md`}
                >
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    {/* RANK */}
                    <div className="text-3xl sm:text-4xl font-black flex-shrink-0">
                      #{team.adjustedRank || team.calculatedRank}
                    </div>

                    {/* HELMET */}
                    <div className="flex-shrink-0 transform -rotate-12">
                      <Image
                        src={`/helmets/${team.id}.png`}
                        alt={team.id}
                        width={64}
                        height={64}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                        unoptimized={true}
                      />
                    </div>

                    {/* TEAM INFO */}
                    <div className="flex-1 min-w-0">
                      <h3 className="h3 text-base sm:text-xl">
                        {team.name.toUpperCase()}
                      </h3>
                      <p className={`text-xs sm:text-sm font-bold mt-1 text-bauhaus-black opacity-70`}>
                        {team.record}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    {adminMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(team);
                        }}
                        className="px-2 py-1 sm:px-3 sm:py-2 bg-white text-bauhaus-black border-2 border-current font-black text-xs uppercase shadow-geo-sm"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
