"use client";

interface MetricsSingleTeamProps {
  teamName: string;
  teamColor: string;
  metrics: {
    epaOffensePercentile?: number;
    epaDefensePercentile?: number;
    epaOffense?: number;
    epaDefense?: number;
    pointsScored?: number;
    pointsAllowed?: number;
    passingYards?: number;
    rushingYards?: number;
    totalYardsOffense?: number;
    passingTDs?: number;
    rushingTDs?: number;
    turnoverDriveRateOffense?: number;
    turnoverDriveRateDefense?: number;
    sacksAllowed?: number;
    sacksGenerated?: number;
    turnoversForcedCount?: number;
    penaltiesCommittedCount?: number;
    penaltiesReceivedCount?: number;
    leagueAvg?: {
      pointsScored: number;
      pointsAllowed: number;
      passingYards: number;
      rushingYards: number;
      sacksGenerated: number;
    };
  };
}

// Metric row comparing single team value vs league average (50)
const MetricRow = ({
  label,
  value,
  leagueAvg = 50,
  format = "percent",
  teamColor = "#666",
}: {
  label: string;
  value: number;
  leagueAvg?: number;
  format?: "percent" | "number" | "rank";
  teamColor?: string;
}) => {
  const formatValue = (val: number) => {
    if (format === "percent") return `${val.toFixed(1)}%`;
    if (format === "rank") return `#${Math.round(val)}`;
    return val.toFixed(1);
  };

  // Calculate bar width proportionally (team value scaled 0-100, league avg at 50%)
  const maxVal = Math.max(Math.abs(value), 100);
  const teamPercent = (Math.abs(value) / maxVal) * 100;
  const leaguePercent = (leagueAvg / maxVal) * 100;

  // Color: green if better, red if worse
  const isAboveAverage = value > leagueAvg;
  const teamBarColor = isAboveAverage ? "#00AA00" : "#DD0000";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        alignItems: "center",
        marginBottom: "12px",
      }}
    >
      {/* Team value column */}
      <div style={{ textAlign: "right", minWidth: "80px" }}>
        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#121212" }}>
          {formatValue(value)}
        </div>
        <div
          style={{
            height: "4px",
            backgroundColor: teamBarColor,
            marginTop: "4px",
            width: `${teamPercent}%`,
            marginLeft: "auto",
          }}
        />
      </div>

      {/* Label + League Avg column */}
      <div style={{ textAlign: "left", minWidth: "80px" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "#121212", marginBottom: "4px" }}>
          {label}
        </div>
        <div style={{ fontSize: "10px", color: "#666" }}>
          Avg: {formatValue(leagueAvg)}
        </div>
        <div
          style={{
            height: "4px",
            backgroundColor: "#CCCCCC",
            marginTop: "4px",
            width: `${leaguePercent}%`,
          }}
        />
      </div>
    </div>
  );
};

export function MetricsSingleTeam({ teamName, teamColor, metrics }: MetricsSingleTeamProps) {
  const leagueAvgPercentile = 50;
  const leagueAvg = metrics.leagueAvg || {
    pointsScored: 379,
    pointsAllowed: 391,
    passingYards: 3459,
    rushingYards: 1500,
    sacksGenerated: 24,
  };

  return (
    <div style={{ padding: "0", fontSize: "13px" }}>
      {/* Section: Scoring */}
      {(metrics.pointsScored !== undefined || metrics.pointsAllowed !== undefined) && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              borderBottom: "2px solid #121212",
              paddingBottom: "8px",
              marginBottom: "12px",
            }}
          >
            🎯 Scoring
          </h3>
          {metrics.pointsScored !== undefined && (
            <MetricRow
              label="Pts Anotados"
              value={metrics.pointsScored}
              leagueAvg={leagueAvg.pointsScored}
              format="number"
              teamColor={teamColor}
            />
          )}
          {metrics.pointsAllowed !== undefined && (
            <MetricRow
              label="Pts Permitidos"
              value={metrics.pointsAllowed}
              leagueAvg={leagueAvg.pointsAllowed}
              format="number"
              teamColor={teamColor}
            />
          )}
        </div>
      )}

      {/* Section: EPA Percentile */}
      {(metrics.epaOffensePercentile !== undefined || metrics.epaDefensePercentile !== undefined) && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              borderBottom: "2px solid #121212",
              paddingBottom: "8px",
              marginBottom: "12px",
            }}
          >
            📊 EPA Percentile
          </h3>
          {metrics.epaOffensePercentile !== undefined && (
            <MetricRow
              label="Ofensivo"
              value={metrics.epaOffensePercentile}
              leagueAvg={leagueAvgPercentile}
              format="percent"
              teamColor={teamColor}
            />
          )}
          {metrics.epaDefensePercentile !== undefined && (
            <MetricRow
              label="Defensivo"
              value={metrics.epaDefensePercentile}
              leagueAvg={leagueAvgPercentile}
              format="percent"
              teamColor={teamColor}
            />
          )}
        </div>
      )}

      {/* Section: Yardas */}
      {(metrics.passingYards !== undefined || metrics.rushingYards !== undefined) && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              borderBottom: "2px solid #121212",
              paddingBottom: "8px",
              marginBottom: "12px",
            }}
          >
            📍 Yardas
          </h3>
          {metrics.passingYards !== undefined && (
            <MetricRow
              label="Aéreas"
              value={metrics.passingYards}
              leagueAvg={leagueAvg.passingYards}
              format="number"
              teamColor={teamColor}
            />
          )}
          {metrics.rushingYards !== undefined && (
            <MetricRow
              label="Terrestres"
              value={metrics.rushingYards}
              leagueAvg={leagueAvg.rushingYards}
              format="number"
              teamColor={teamColor}
            />
          )}
          {metrics.totalYardsOffense !== undefined && (
            <MetricRow
              label="Total Ofensa"
              value={metrics.totalYardsOffense}
              leagueAvg={leagueAvg.passingYards + leagueAvg.rushingYards}
              format="number"
              teamColor={teamColor}
            />
          )}
        </div>
      )}

      {/* Section: Touchdowns */}
      {(metrics.passingTDs !== undefined || metrics.rushingTDs !== undefined) && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              borderBottom: "2px solid #121212",
              paddingBottom: "8px",
              marginBottom: "12px",
            }}
          >
            🏈 Touchdowns
          </h3>
          {metrics.passingTDs !== undefined && (
            <MetricRow
              label="Pase"
              value={metrics.passingTDs}
              leagueAvg={17}
              format="number"
              teamColor={teamColor}
            />
          )}
          {metrics.rushingTDs !== undefined && (
            <MetricRow
              label="Carrera"
              value={metrics.rushingTDs}
              leagueAvg={12}
              format="number"
              teamColor={teamColor}
            />
          )}
        </div>
      )}

      {/* Section: Pressure & Turnovers */}
      {(metrics.sacksGenerated !== undefined ||
        metrics.sacksAllowed !== undefined ||
        metrics.turnoversForcedCount !== undefined) && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              borderBottom: "2px solid #121212",
              paddingBottom: "8px",
              marginBottom: "12px",
            }}
          >
            ⚡ Presión & Turnovers
          </h3>
          {metrics.sacksAllowed !== undefined && (
            <MetricRow
              label="Sacks Permitidos"
              value={metrics.sacksAllowed}
              leagueAvg={24}
              format="number"
              teamColor={teamColor}
            />
          )}
          {metrics.sacksGenerated !== undefined && (
            <MetricRow
              label="Sacks Generados"
              value={metrics.sacksGenerated}
              leagueAvg={leagueAvg.sacksGenerated}
              format="number"
              teamColor={teamColor}
            />
          )}
          {metrics.turnoversForcedCount !== undefined && (
            <MetricRow
              label="Turnovers Forzados"
              value={metrics.turnoversForcedCount}
              leagueAvg={13}
              format="number"
              teamColor={teamColor}
            />
          )}
        </div>
      )}

      {/* Section: Penalties */}
      {(metrics.penaltiesCommittedCount !== undefined || metrics.penaltiesReceivedCount !== undefined) && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              borderBottom: "2px solid #121212",
              paddingBottom: "8px",
              marginBottom: "12px",
            }}
          >
            🚩 Penalidades
          </h3>
          {metrics.penaltiesCommittedCount !== undefined && (
            <MetricRow
              label="Cometidas"
              value={metrics.penaltiesCommittedCount}
              leagueAvg={7}
              format="number"
              teamColor={teamColor}
            />
          )}
          {metrics.penaltiesReceivedCount !== undefined && (
            <MetricRow
              label="Recibidas"
              value={metrics.penaltiesReceivedCount}
              leagueAvg={7}
              format="number"
              teamColor={teamColor}
            />
          )}
        </div>
      )}
    </div>
  );
}
