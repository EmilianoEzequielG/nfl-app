"use client";

import { X } from "lucide-react";

interface TeamComparisonProps {
  team1: any;
  team2: any;
  onClose: () => void;
}

const COLORS = {
  primary: "#1a1a1a",
  bg: "#f0f0f0",
  success: "#2ecc71",
  error: "#e74c3c",
  warning: "#f39c12",
  muted: "#888",
  border: "#ddd",
};

const TYPOGRAPHY = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  caption: { fontSize: "9px", fontWeight: "500" },
  small: { fontSize: "11px", fontWeight: "500" },
  base: { fontSize: "12px", fontWeight: "600" },
  large: { fontSize: "14px", fontWeight: "600" },
  xl: { fontSize: "16px", fontWeight: "700" },
  xxl: { fontSize: "24px", fontWeight: "900" },
};

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
      <div style={{ marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", alignItems: "center" }}>
        <div style={{ textAlign: "right", ...TYPOGRAPHY.small, color: winner === 1 ? COLORS.success : COLORS.muted }}>
          {formatValue(val1)}
        </div>
        <div style={{ textAlign: "center", ...TYPOGRAPHY.small, color: "#555" }}>
          {label}
        </div>
        <div style={{ textAlign: "left", ...TYPOGRAPHY.small, color: winner === 2 ? COLORS.success : COLORS.muted }}>
          {formatValue(val2)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TYPOGRAPHY.fontFamily }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
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
          border: "3px solid " + COLORS.primary,
          boxShadow: "0 12px 48px rgba(0, 0, 0, 0.25)",
          overflow: "auto",
          borderRadius: "2px",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: COLORS.primary,
            border: "3px solid " + COLORS.primary,
            borderBottom: "3px solid " + COLORS.primary,
            padding: "32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "24px",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ color: "white", textAlign: "center" }}>
            <p style={{ ...TYPOGRAPHY.xxl, textTransform: "uppercase", margin: 0 }}>
              {team1.name}
            </p>
            <p style={{ ...TYPOGRAPHY.small, marginTop: "8px", opacity: 0.8, margin: 0 }}>
              #{team1.adjustedRank || team1.calculatedRank}
            </p>
          </div>
          <div style={{ color: "white", textAlign: "center" }}>
            <p style={{ ...TYPOGRAPHY.xl, textTransform: "uppercase", margin: 0 }}>
              COMPARACIÓN
            </p>
          </div>
          <div style={{ color: "white", textAlign: "center" }}>
            <p style={{ ...TYPOGRAPHY.xxl, textTransform: "uppercase", margin: 0 }}>
              {team2.name}
            </p>
            <p style={{ ...TYPOGRAPHY.small, marginTop: "8px", opacity: 0.8, margin: 0 }}>
              #{team2.adjustedRank || team2.calculatedRank}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              padding: "8px",
              backgroundColor: "white",
              border: "2px solid " + COLORS.primary,
              cursor: "pointer",
              fontSize: "20px",
              color: COLORS.primary,
              borderRadius: "2px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {/* EPA Percentile */}
          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid " + COLORS.border }}>
            <h3 style={{ ...TYPOGRAPHY.large, textTransform: "uppercase", marginBottom: "16px", color: COLORS.primary, margin: "0 0 16px 0" }}>
              📊 EPA Percentile
            </h3>
            {renderMetricRow("Ofensiva %", team1.metrics.epaOffensePercentile || 0, team2.metrics.epaOffensePercentile || 0, "percent")}
            {renderMetricRow("Defensiva %", team1.metrics.epaDefensePercentile || 0, team2.metrics.epaDefensePercentile || 0, "percent", "lower")}
            <p style={{ ...TYPOGRAPHY.caption, color: COLORS.muted, marginTop: "12px", fontStyle: "italic", margin: "12px 0 0 0" }}>
              ℹ️ Menor EPA defensivo = Mejor (permite menos)
            </p>
          </div>

          {/* Drive Rates - Ofensiva */}
          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid " + COLORS.border }}>
            <h3 style={{ ...TYPOGRAPHY.large, textTransform: "uppercase", marginBottom: "16px", color: COLORS.primary, margin: "0 0 16px 0" }}>
              🏈 Drive Tendencies - Ofensiva
            </h3>
            {renderMetricRow("TD %", (team1.metrics.tdDriveRateOffense || 0) * 100, (team2.metrics.tdDriveRateOffense || 0) * 100, "percent")}
            {renderMetricRow("FG %", (team1.metrics.fgDriveRateOffense || 0) * 100, (team2.metrics.fgDriveRateOffense || 0) * 100, "percent")}
            {renderMetricRow("Punt %", (team1.metrics.puntDriveRateOffense || 0) * 100, (team2.metrics.puntDriveRateOffense || 0) * 100, "percent")}
            {renderMetricRow("Turnover %", (team1.metrics.turnoverDriveRateOffense || 0) * 100, (team2.metrics.turnoverDriveRateOffense || 0) * 100, "percent", "lower")}
            {renderMetricRow("3rd Down Conv", (team1.metrics.thirdDownEfficiencyOffense || 0) * 100, (team2.metrics.thirdDownEfficiencyOffense || 0) * 100, "percent")}
          </div>

          {/* Drive Rates - Defensiva */}
          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid " + COLORS.border }}>
            <h3 style={{ ...TYPOGRAPHY.large, textTransform: "uppercase", marginBottom: "16px", color: COLORS.primary, margin: "0 0 16px 0" }}>
              🏈 Drive Tendencies - Defensiva
            </h3>
            {renderMetricRow("TD Permitido %", (team1.metrics.tdDriveRateDefense || 0) * 100, (team2.metrics.tdDriveRateDefense || 0) * 100, "percent", "lower")}
            {renderMetricRow("FG Permitido %", (team1.metrics.fgDriveRateDefense || 0) * 100, (team2.metrics.fgDriveRateDefense || 0) * 100, "percent", "lower")}
            {renderMetricRow("Punt Forzado %", (team1.metrics.puntDriveRateDefense || 0) * 100, (team2.metrics.puntDriveRateDefense || 0) * 100, "percent")}
            {renderMetricRow("Turnover Forzado %", (team1.metrics.turnoverDriveRateDefense || 0) * 100, (team2.metrics.turnoverDriveRateDefense || 0) * 100, "percent")}
            {renderMetricRow("3rd Down Stop %", (team1.metrics.thirdDownEfficiencyDefense || 0) * 100, (team2.metrics.thirdDownEfficiencyDefense || 0) * 100, "percent")}
          </div>

          {/* Yards Offensive */}
          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid " + COLORS.border }}>
            <h3 style={{ ...TYPOGRAPHY.large, textTransform: "uppercase", marginBottom: "16px", color: COLORS.primary, margin: "0 0 16px 0" }}>
              📍 Yardas Ganadas (Ofensiva)
            </h3>
            {renderMetricRow("Total Ganado", team1.metrics.totalYardsOffense || 0, team2.metrics.totalYardsOffense || 0, "yards")}
            {renderMetricRow("Aéreas Ganadas", team1.metrics.passingYards || 0, team2.metrics.passingYards || 0, "yards")}
            {renderMetricRow("Terrestres Ganadas", team1.metrics.rushingYards || 0, team2.metrics.rushingYards || 0, "yards")}
            <p style={{ ...TYPOGRAPHY.caption, color: COLORS.muted, marginTop: "12px", fontStyle: "italic", margin: "12px 0 0 0" }}>
              ✓ Mayor = Mejor ofensivamente
            </p>
          </div>

          {/* Yards Defensive */}
          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid " + COLORS.border }}>
            <h3 style={{ ...TYPOGRAPHY.large, textTransform: "uppercase", marginBottom: "16px", color: COLORS.primary, margin: "0 0 16px 0" }}>
              🛡️ Yardas Permitidas (Defensiva)
            </h3>
            {renderMetricRow("Total Permitido", team1.metrics.totalYardsAllowed || 0, team2.metrics.totalYardsAllowed || 0, "yards", "lower")}
            {renderMetricRow("Aéreas Permitidas", team1.metrics.passingYardsAllowed || 0, team2.metrics.passingYardsAllowed || 0, "yards", "lower")}
            {renderMetricRow("Terrestres Permitidas", team1.metrics.rushingYardsAllowed || 0, team2.metrics.rushingYardsAllowed || 0, "yards", "lower")}
            <p style={{ ...TYPOGRAPHY.caption, color: COLORS.muted, marginTop: "12px", fontStyle: "italic", margin: "12px 0 0 0" }}>
              ✓ Menor = Mejor defensivamente
            </p>
          </div>

          {/* Penalties - Ofensiva */}
          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid " + COLORS.border }}>
            <h3 style={{ ...TYPOGRAPHY.large, textTransform: "uppercase", marginBottom: "16px", color: COLORS.primary, margin: "0 0 16px 0" }}>
              ⚠️ Penalties Cometidas (Ofensiva)
            </h3>
            {renderMetricRow("Count", team1.metrics.penaltiesOffensiveCommittedCount || 0, team2.metrics.penaltiesOffensiveCommittedCount || 0, "number", "lower")}
            {renderMetricRow("Yards", team1.metrics.penaltiesOffensiveCommittedYards || 0, team2.metrics.penaltiesOffensiveCommittedYards || 0, "yards", "lower")}
            <p style={{ ...TYPOGRAPHY.caption, color: COLORS.muted, marginTop: "12px", fontStyle: "italic", margin: "12px 0 0 0" }}>
              ✓ Menor = Menos penalidades = Mejor
            </p>
          </div>

          {/* Penalties - Defensiva */}
          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid " + COLORS.border }}>
            <h3 style={{ ...TYPOGRAPHY.large, textTransform: "uppercase", marginBottom: "16px", color: COLORS.primary, margin: "0 0 16px 0" }}>
              ⚠️ Penalties Cometidas (Defensiva)
            </h3>
            {renderMetricRow("Count", team1.metrics.penaltiesDefensiveCommittedCount || 0, team2.metrics.penaltiesDefensiveCommittedCount || 0, "number", "lower")}
            {renderMetricRow("Yards", team1.metrics.penaltiesDefensiveCommittedYards || 0, team2.metrics.penaltiesDefensiveCommittedYards || 0, "yards", "lower")}
            <p style={{ ...TYPOGRAPHY.caption, color: COLORS.muted, marginTop: "12px", fontStyle: "italic", margin: "12px 0 0 0" }}>
              ✓ Menor = Menos penalidades = Mejor
            </p>
          </div>

          {/* Summary */}
          <div style={{ padding: "20px", backgroundColor: COLORS.bg, border: "1px solid " + COLORS.border, borderRadius: "2px" }}>
            <p style={{ ...TYPOGRAPHY.small, color: COLORS.primary, marginBottom: "12px", margin: 0 }}>
              🟢 Verde = Ventaja en esa métrica
            </p>
            <p style={{ ...TYPOGRAPHY.small, color: COLORS.primary, marginBottom: "12px", margin: "0 0 12px 0" }}>
              📌 Ofensiva: Mayor es mejor (más yardas, más TDs, menos penalidades)
            </p>
            <p style={{ ...TYPOGRAPHY.small, color: COLORS.primary, margin: 0 }}>
              🛡️ Defensiva: Menor es mejor (menos yardas permitidas, menos puntos, menos penalidades)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
