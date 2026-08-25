"use client";

import { X } from "lucide-react";

interface TeamComparisonProps {
  team1: any;
  team2: any;
  onClose: () => void;
}

export function TeamComparison({ team1, team2, onClose }: TeamComparisonProps) {
  const getMetricDifference = (val1: number, val2: number, isBetter: "higher" | "lower" = "higher") => {
    const diff = Math.abs(val1 - val2);
    const winner = isBetter === "higher" ? (val1 > val2 ? 1 : 2) : (val1 < val2 ? 1 : 2);
    return { diff, winner };
  };

  const renderMetricRow = (label: string, val1: number, val2: number, format: "percent" | "number" | "yards" = "number", isBetter: "higher" | "lower" = "higher") => {
    const { diff, winner } = getMetricDifference(val1, val2, isBetter);

    const formatValue = (v: number) => {
      if (format === "percent") return `${v.toFixed(1)}%`;
      if (format === "yards") return `${Math.round(v)} yds`;
      return Math.round(v).toString();
    };

    return (
      <div style={{ marginBottom: "8px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", alignItems: "center" }}>
        <div style={{ textAlign: "right", fontSize: "11px", fontWeight: winner === 1 ? "700" : "500", color: winner === 1 ? "#00AA00" : "#999" }}>
          {formatValue(val1)}
        </div>
        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "600", color: "#666" }}>
          {label}
        </div>
        <div style={{ textAlign: "left", fontSize: "11px", fontWeight: winner === 2 ? "700" : "500", color: winner === 2 ? "#00AA00" : "#999" }}>
          {formatValue(val2)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          zIndex: 1,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "95%",
          maxWidth: "900px",
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
            backgroundColor: "#121212",
            border: "4px solid #121212",
            borderBottom: "4px solid #121212",
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "24px",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ color: "white", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "900", textTransform: "uppercase" }}>
              {team1.name}
            </p>
            <p style={{ fontSize: "12px", fontWeight: "600", marginTop: "4px", opacity: 0.8 }}>
              #{team1.adjustedRank || team1.calculatedRank}
            </p>
          </div>
          <div style={{ color: "white", textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: "900", textTransform: "uppercase" }}>
              COMPARACIÓN
            </p>
          </div>
          <div style={{ color: "white", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "900", textTransform: "uppercase" }}>
              {team2.name}
            </p>
            <p style={{ fontSize: "12px", fontWeight: "600", marginTop: "4px", opacity: 0.8 }}>
              #{team2.adjustedRank || team2.calculatedRank}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              padding: "8px",
              backgroundColor: "white",
              border: "2px solid #121212",
              cursor: "pointer",
              fontSize: "24px",
              color: "#121212",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* EPA Percentile */}
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px", color: "#121212" }}>
              📊 EPA Percentile
            </h3>
            {renderMetricRow("Ofensiva %", team1.metrics.epaOffensePercentile || 0, team2.metrics.epaOffensePercentile || 0, "percent")}
            {renderMetricRow("Defensiva %", team1.metrics.epaDefensePercentile || 0, team2.metrics.epaDefensePercentile || 0, "percent", "lower")}
            <p style={{ fontSize: "9px", color: "#999", marginTop: "8px", fontStyle: "italic" }}>
              ℹ️ Menor EPA defensivo = Mejor (permite menos)
            </p>
          </div>

          {/* Drive Rates - Ofensiva */}
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px", color: "#121212" }}>
              🏈 Drive Tendencies - Ofensiva
            </h3>
            {renderMetricRow("TD %", (team1.metrics.tdDriveRateOffense || 0) * 100, (team2.metrics.tdDriveRateOffense || 0) * 100, "percent")}
            {renderMetricRow("FG %", (team1.metrics.fgDriveRateOffense || 0) * 100, (team2.metrics.fgDriveRateOffense || 0) * 100, "percent")}
            {renderMetricRow("Punt %", (team1.metrics.puntDriveRateOffense || 0) * 100, (team2.metrics.puntDriveRateOffense || 0) * 100, "percent")}
            {renderMetricRow("Turnover %", (team1.metrics.turnoverDriveRateOffense || 0) * 100, (team2.metrics.turnoverDriveRateOffense || 0) * 100, "percent", "lower")}
            {renderMetricRow("3rd Down Conv", (team1.metrics.thirdDownEfficiencyOffense || 0) * 100, (team2.metrics.thirdDownEfficiencyOffense || 0) * 100, "percent")}
          </div>

          {/* Drive Rates - Defensiva */}
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px", color: "#121212" }}>
              🏈 Drive Tendencies - Defensiva
            </h3>
            {renderMetricRow("TD Permitido %", (team1.metrics.tdDriveRateDefense || 0) * 100, (team2.metrics.tdDriveRateDefense || 0) * 100, "percent", "lower")}
            {renderMetricRow("FG Permitido %", (team1.metrics.fgDriveRateDefense || 0) * 100, (team2.metrics.fgDriveRateDefense || 0) * 100, "percent", "lower")}
            {renderMetricRow("Punt Forzado %", (team1.metrics.puntDriveRateDefense || 0) * 100, (team2.metrics.puntDriveRateDefense || 0) * 100, "percent")}
            {renderMetricRow("Turnover Forzado %", (team1.metrics.turnoverDriveRateDefense || 0) * 100, (team2.metrics.turnoverDriveRateDefense || 0) * 100, "percent")}
            {renderMetricRow("3rd Down Stop %", (team1.metrics.thirdDownEfficiencyDefense || 0) * 100, (team2.metrics.thirdDownEfficiencyDefense || 0) * 100, "percent")}
          </div>

          {/* Yards Offensive */}
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px", color: "#121212" }}>
              📍 Yardas Ganadas (Ofensiva)
            </h3>
            {renderMetricRow("Total Ganado", team1.metrics.totalYardsOffense || 0, team2.metrics.totalYardsOffense || 0, "yards")}
            {renderMetricRow("Aéreas Ganadas", team1.metrics.passingYards || 0, team2.metrics.passingYards || 0, "yards")}
            {renderMetricRow("Terrestres Ganadas", team1.metrics.rushingYards || 0, team2.metrics.rushingYards || 0, "yards")}
            <p style={{ fontSize: "9px", color: "#999", marginTop: "8px", fontStyle: "italic" }}>
              ✓ Mayor = Mejor ofensivamente
            </p>
          </div>

          {/* Yards Defensive */}
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px", color: "#121212" }}>
              🛡️ Yardas Permitidas (Defensiva)
            </h3>
            {renderMetricRow("Total Permitido", team1.metrics.totalYardsAllowed || 0, team2.metrics.totalYardsAllowed || 0, "yards", "lower")}
            {renderMetricRow("Aéreas Permitidas", team1.metrics.passingYardsAllowed || 0, team2.metrics.passingYardsAllowed || 0, "yards", "lower")}
            {renderMetricRow("Terrestres Permitidas", team1.metrics.rushingYardsAllowed || 0, team2.metrics.rushingYardsAllowed || 0, "yards", "lower")}
            <p style={{ fontSize: "9px", color: "#999", marginTop: "8px", fontStyle: "italic" }}>
              ✓ Menor = Mejor defensivamente
            </p>
          </div>

          {/* Penalties - Ofensiva */}
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px", color: "#121212" }}>
              ⚠️ Penalties Cometidas (Ofensiva)
            </h3>
            {renderMetricRow("Count", team1.metrics.penaltiesOffensiveCommittedCount || 0, team2.metrics.penaltiesOffensiveCommittedCount || 0, "number", "lower")}
            {renderMetricRow("Yards", team1.metrics.penaltiesOffensiveCommittedYards || 0, team2.metrics.penaltiesOffensiveCommittedYards || 0, "yards", "lower")}
            <p style={{ fontSize: "9px", color: "#999", marginTop: "8px", fontStyle: "italic" }}>
              ✓ Menor = Menos penalidades = Mejor
            </p>
          </div>

          {/* Penalties - Defensiva */}
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px", color: "#121212" }}>
              ⚠️ Penalties Cometidas (Defensiva)
            </h3>
            {renderMetricRow("Count", team1.metrics.penaltiesDefensiveCommittedCount || 0, team2.metrics.penaltiesDefensiveCommittedCount || 0, "number", "lower")}
            {renderMetricRow("Yards", team1.metrics.penaltiesDefensiveCommittedYards || 0, team2.metrics.penaltiesDefensiveCommittedYards || 0, "yards", "lower")}
            <p style={{ fontSize: "9px", color: "#999", marginTop: "8px", fontStyle: "italic" }}>
              ✓ Menor = Menos penalidades = Mejor
            </p>
          </div>

          {/* Summary */}
          <div style={{ padding: "16px", backgroundColor: "#f5f5f5", border: "2px solid #ddd", borderRadius: "4px" }}>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#666", marginBottom: "8px" }}>
              🟢 Verde = Ventaja en esa métrica
            </p>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#666", marginBottom: "8px" }}>
              📌 Ofensiva: Mayor es mejor (más yardas, más TDs, menos penalidades)
            </p>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#666" }}>
              🛡️ Defensiva: Menor es mejor (menos yardas permitidas, menos puntos, menos penalidades)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
