"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Trophy, ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import Image from "next/image";
import { MetricsSingleTeamFull } from "@/components/GameModal/MetricsSingleTeamFull";
import { TeamComparison } from "@/components/GameModal/TeamComparison";
import { useSemanaActual } from "@/lib/data";

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
    epaOffensePercentile?: number;
    epaDefensePercentile?: number;
    epaOffense?: number;
    epaDefense?: number;
    rankEpaOffense?: number;
    rankEpaDefense?: number;
    pointsScored?: number;
    pointsAllowed?: number;
    passingYards?: number;
    rushingYards?: number;
    totalYardsOffense?: number;
    rankPassingYards?: number;
    rankRushingYards?: number;
    rankTotalYardsOffense?: number;
    passingYardsAllowed?: number;
    rushingYardsAllowed?: number;
    totalYardsAllowed?: number;
    rankPassingYardsAllowed?: number;
    rankRushingYardsAllowed?: number;
    rankTotalYardsAllowed?: number;
    passingTDs?: number;
    rushingTDs?: number;
    sacksAllowed?: number;
    sacksGenerated?: number;
    turnoverDriveRateOffense?: number;
    turnoverDriveRateDefense?: number;
    turnoversForcedCount?: number;
    tdDriveRateOffense?: number;
    fgDriveRateOffense?: number;
    puntDriveRateOffense?: number;
    thirdDownEfficiencyOffense?: number;
    rankTdRate?: number;
    rankFgRate?: number;
    rankPuntRate?: number;
    rankThirdDownConv?: number;
    tdDriveRateDefense?: number;
    fgDriveRateDefense?: number;
    puntDriveRateDefense?: number;
    thirdDownEfficiencyDefense?: number;
    rankTdRateAllowed?: number;
    rankFgRateAllowed?: number;
    rankPuntRateForced?: number;
    rankThirdDownStopRate?: number;
    penaltiesOffensiveCommittedCount?: number;
    penaltiesOffensiveCommittedYards?: number;
    penaltiesOffensiveReceivedCount?: number;
    penaltiesOffensiveReceivedYards?: number;
    rankPenaltiesOffensiveCommitted?: number;
    rankPenaltiesOffensiveReceived?: number;
    penaltiesDefensiveCommittedCount?: number;
    penaltiesDefensiveCommittedYards?: number;
    penaltiesDefensiveReceivedCount?: number;
    penaltiesDefensiveReceivedYards?: number;
    rankPenaltiesDefensiveCommitted?: number;
    rankPenaltiesDefensiveReceived?: number;
    leagueAvg?: {
      pointsScored?: number;
      pointsAllowed?: number;
      passingYards?: number;
      rushingYards?: number;
      sacksGenerated?: number;
    };
  };
}

export function PowerRanking() {
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamRanking | null>(null);
  const [comparisonTeams, setComparisonTeams] = useState<[TeamRanking | null, TeamRanking | null]>([null, null]);
  const [loading, setLoading] = useState(true);
  // null hasta que se resuelve la semana actual (ver useSemanaActual) - evita
  // mostrar el ranking de la semana 1 un instante para saltar despues al real.
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const TOTAL_WEEKS = 18;

  const semanaDetectada = useSemanaActual();
  useEffect(() => {
    if (currentWeek === null && semanaDetectada !== null) {
      setCurrentWeek(semanaDetectada);
    }
  }, [currentWeek, semanaDetectada]);

  const addToComparison = (team: TeamRanking) => {
    if (comparisonTeams[0] === null) {
      setComparisonTeams([team, null]);
    } else if (comparisonTeams[1] === null && team.id !== comparisonTeams[0]?.id) {
      setComparisonTeams([comparisonTeams[0], team]);
    }
  };

  const clearComparison = () => {
    setComparisonTeams([null, null]);
  };

  useEffect(() => {
    if (currentWeek === null) return; // todavia no se resolvio la semana inicial
    loadRankings(currentWeek);
  }, [currentWeek]);


  const loadRankings = async (semana: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/power-ranking?week=${semana}`);
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

  const handlePreviousWeek = () => {
    setCurrentWeek(Math.max(1, (currentWeek ?? 1) - 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(Math.min(TOTAL_WEEKS, (currentWeek ?? 1) + 1));
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

  // Filtro por nombre o abreviatura. Sin esto, encontrar un equipo puntual
  // entre los 32 significaba scrollear toda la lista.
  const terminoBusqueda = busqueda.trim().toLowerCase();
  const filteredRankings = terminoBusqueda
    ? sortedRankings.filter(
        (team) =>
          team.name.toLowerCase().includes(terminoBusqueda) ||
          team.abbr.toLowerCase().includes(terminoBusqueda)
      )
    : sortedRankings;

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
          </div>

          {/* Buscador: filtra por nombre o abreviatura */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bauhaus-black/50 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar equipo..."
              className="w-full border-2 border-bauhaus-black pl-11 pr-4 py-3 font-bold text-sm uppercase tracking-wide shadow-geo-sm focus:outline-none focus:shadow-geo-md transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bauhaus-black/50 hover:text-bauhaus-black"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WEEK NAVIGATION */}
      <div className="section bg-bauhaus-yellow border-b-4 border-bauhaus-black">
        <div className="container-geo">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousWeek}
              disabled={currentWeek === null || currentWeek === 1}
              className={`p-3 border-2 border-bauhaus-black font-black text-xl transition-all ${
                currentWeek === null || currentWeek === 1
                  ? "opacity-30"
                  : "hover:shadow-geo-md active:shadow-geo-sm"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="font-black text-xl uppercase">
              SEMANA {currentWeek ?? "—"}
            </div>
            <button
              onClick={handleNextWeek}
              disabled={currentWeek === null || currentWeek === TOTAL_WEEKS}
              className={`p-3 border-2 border-bauhaus-black font-black text-xl transition-all ${
                currentWeek === null || currentWeek === TOTAL_WEEKS
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
                  SEMANA {currentWeek ?? "—"}
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
              {/* Wordmark - Bauhaus Frame */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "32px",
                  padding: "32px",
                  backgroundColor: "white",
                  border: "3px solid #1a1a1a",
                  borderRadius: "2px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div style={{ position: "relative", width: "100%", maxHeight: "150px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image
                    src={`/wordmarks/${selectedTeam.id}.png`}
                    alt={selectedTeam.name}
                    width={320}
                    height={150}
                    priority={true}
                    style={{
                      display: "block",
                      objectFit: "contain",
                      maxWidth: "100%",
                      maxHeight: "150px",
                      width: "auto",
                      height: "auto",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                    }}
                    onError={(e) => {
                      (e.target as any).src = `/helmets/${selectedTeam.id}.png`;
                    }}
                  />
                </div>
                <div style={{ width: "100%", borderTop: "2px solid #e0e0e0", paddingTop: "20px", textAlign: "center" }}>
                  <p
                    style={{
                      fontWeight: "900",
                      fontSize: "28px",
                      marginBottom: "8px",
                      color: selectedTeam.color,
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    #{selectedTeam.adjustedRank || selectedTeam.calculatedRank}
                  </p>
                  <p style={{ fontWeight: "700", fontSize: "18px", marginBottom: "8px", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0" }}>
                    {selectedTeam.name}
                  </p>
                  <p style={{ fontSize: "14px", color: "#888", fontWeight: "600", letterSpacing: "0.5px", margin: 0 }}>{selectedTeam.record}</p>
                </div>
              </div>

              {/* Summary */}
              <div style={{ marginBottom: "32px", borderBottom: "2px solid #e0e0e0", paddingBottom: "24px" }}>
                <p style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px", color: "#1a1a1a", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>
                  📝 Resumen Editorial
                </p>
                {selectedTeam.summary ? (
                  <p style={{ fontSize: "14px", fontWeight: "500", lineHeight: "1.7", color: "#333", whiteSpace: "pre-wrap" }}>
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
                <MetricsSingleTeamFull
                  teamName={selectedTeam.name}
                  teamId={selectedTeam.id}
                  teamColor={selectedTeam.color}
                  metrics={selectedTeam.metrics}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON MODAL */}
      {comparisonTeams[0] && comparisonTeams[1] && (
        <TeamComparison
          team1={comparisonTeams[0]}
          team2={comparisonTeams[1]}
          onClose={clearComparison}
        />
      )}

      {/* COMPARISON INDICATOR */}
      {(comparisonTeams[0] || comparisonTeams[1]) && !(comparisonTeams[0] && comparisonTeams[1]) && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9998, backgroundColor: "#FFE135", border: "4px solid #121212", padding: "16px", borderRadius: "0" }}>
          <div style={{ fontSize: "12px", fontWeight: "900", marginBottom: "8px" }}>
            COMPARACIÓN
          </div>
          <div style={{ fontSize: "11px", fontWeight: "600", marginBottom: "8px" }}>
            {comparisonTeams[0]?.abbr || "—"} vs {comparisonTeams[1]?.abbr || "—"}
          </div>
          <button
            onClick={clearComparison}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "white",
              border: "2px solid #121212",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Limpiar
          </button>
        </div>
      )}

      {/* RANKINGS LIST - Bauhaus */}
      <div className="section">
        <div className="container-geo space-y-6 sm:space-y-8">
          {filteredRankings.length === 0 && (
            <div className="text-center py-12">
              <p className="font-black uppercase text-lg">Sin resultados para &quot;{busqueda}&quot;</p>
            </div>
          )}
          {filteredRankings.map((team, idx) => {
            return (
              <div key={`${team.id}-${currentWeek}`}>
                <div
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full bg-white text-bauhaus-black border-4 border-bauhaus-black p-4 sm:p-6 text-left font-black shadow-geo-lg transition-transform hover:shadow-geo-xl active:translate-x-1 active:translate-y-1 active:shadow-geo-md cursor-pointer`}
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
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToComparison(team);
                        }}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: comparisonTeams.some(t => t?.id === team.id) ? "#FFE135" : "white",
                          border: "2px solid #121212",
                          fontWeight: "bold",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          borderRadius: "0",
                        }}
                      >
                        {comparisonTeams.some(t => t?.id === team.id) ? "✓" : "Comp."}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
