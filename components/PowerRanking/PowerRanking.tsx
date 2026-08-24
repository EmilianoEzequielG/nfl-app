"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Lock, Unlock, Trophy } from "lucide-react";
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
}

interface EditState {
  teamId: string;
  newRank: number;
  newSummary: string;
}


export function PowerRanking() {
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/power-ranking");
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

  const sortedRankings = [...rankings].sort((a, b) => {
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
              <div key={team.id}>
                <button
                  onClick={() => setExpandedId(expandedId === team.id ? null : team.id)}
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
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                      <ChevronDown
                        className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform flex-shrink-0 ${
                          expandedId === team.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* EXPANDED - Bauhaus */}
                {expandedId === team.id && (
                  <div className={`border-4 border-t-0 border-bauhaus-black p-4 sm:p-6 bg-white`}>
                    {team.summary ? (
                      <p className="text-sm sm:text-base font-medium leading-relaxed text-bauhaus-black">
                        {team.summary}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-bauhaus-black/60 italic">
                        ⚠️ Todavía no hay resumen para este equipo esta semana
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
