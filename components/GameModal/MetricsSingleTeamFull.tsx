"use client";

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

interface MetricsSingleTeamFullProps {
  teamName: string;
  teamColor: string;
  teamId: string;
  metrics: any;
}

const MetricRowNewFormat = ({
  metric,
  offType,
  offValue,
  defType,
  defValue,
  offRank,
  defRank,
  format = "number",
}: {
  metric: string;
  offType: string;
  offValue: number;
  defType: string;
  defValue: number;
  offRank?: number;
  defRank?: number;
  format?: "number" | "percent";
}) => {
  const formatValue = (val: number) => {
    if (format === "percent") return `${val.toFixed(1)}%`;
    return val.toFixed(0);
  };

  const getBarWidth = (val: number) => Math.min((Math.abs(val) / 100) * 100, 100);
  const getBarColor = (val: number) => (val >= 50 ? COLORS.success : COLORS.error);

  const renderRow = (type: string, value: number, rank?: number) => (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
      {/* Metric — Type */}
      <div style={{ ...TYPOGRAPHY.small, color: COLORS.primary }}>
        {metric} — {type}:
      </div>
      {/* Barra */}
      <div
        style={{
          height: "6px",
          backgroundColor: getBarColor(value),
          width: `${getBarWidth(value)}%`,
          borderRadius: "2px",
        }}
      />
      {/* Ranking */}
      <div style={{ ...TYPOGRAPHY.small, color: COLORS.muted, textAlign: "center" }}>
        {rank ? `#${rank}` : "—"}
      </div>
      {/* Raw value in parentheses */}
      <div style={{ ...TYPOGRAPHY.small, color: COLORS.primary, textAlign: "right" }}>
        ({formatValue(value)})
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: "12px" }}>
      {renderRow(offType, offValue, offRank)}
      {renderRow(defType, defValue, defRank)}
    </div>
  );
};

export function MetricsSingleTeamFull({ teamName, teamColor, teamId, metrics }: MetricsSingleTeamFullProps) {
  return (
    <div style={{ padding: "0", fontSize: "13px", fontFamily: TYPOGRAPHY.fontFamily }}>
      {/* Section: EPA Percentile */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "12px",
            fontWeight: "900",
            textTransform: "uppercase",
            borderBottom: "2px solid " + COLORS.primary,
            paddingBottom: "8px",
            marginBottom: "12px",
          }}
        >
          📊 EPA Percentile
        </h3>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              EPA — Ofensiva:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.epaOffensePercentile || 0) >= 50 ? COLORS.success : COLORS.error,
                width: `${Math.min((metrics.epaOffensePercentile || 0), 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankEpaOffense ? `#${metrics.rankEpaOffense}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({(metrics.epaOffensePercentile || 0).toFixed(1)}%)
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              EPA — Defensiva:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.epaDefensePercentile || 0) >= 50 ? COLORS.success : COLORS.error,
                width: `${Math.min((metrics.epaDefensePercentile || 0), 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankEpaDefense ? `#${metrics.rankEpaDefense}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({(metrics.epaDefensePercentile || 0).toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Section: Drive Tendencies & Efficiency */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "12px",
            fontWeight: "900",
            textTransform: "uppercase",
            borderBottom: "2px solid " + COLORS.primary,
            paddingBottom: "8px",
            marginBottom: "12px",
          }}
        >
          🏈 Drive Tendencies & Efficiency
        </h3>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <MetricRowNewFormat
            metric="TD Rate"
            offType="Ofensiva"
            offValue={(metrics.tdDriveRateOffense || 0) * 100}
            defType="Defensiva"
            defValue={(metrics.tdDriveRateDefense || 0) * 100}
            offRank={metrics.rankTdRate}
            defRank={metrics.rankTdRateAllowed}
            format="percent"
          />
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <MetricRowNewFormat
            metric="FG Rate"
            offType="Ofensiva"
            offValue={(metrics.fgDriveRateOffense || 0) * 100}
            defType="Defensiva"
            defValue={(metrics.fgDriveRateDefense || 0) * 100}
            offRank={metrics.rankFgRate}
            defRank={metrics.rankFgRateAllowed}
            format="percent"
          />
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <MetricRowNewFormat
            metric="Punt Rate"
            offType="Ofensiva"
            offValue={(metrics.puntDriveRateOffense || 0) * 100}
            defType="Defensiva"
            defValue={(metrics.puntDriveRateDefense || 0) * 100}
            offRank={metrics.rankPuntRate}
            defRank={metrics.rankPuntRateForced}
            format="percent"
          />
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <MetricRowNewFormat
            metric="Turnover Rate"
            offType="Ofensiva"
            offValue={(metrics.turnoverDriveRateOffense || 0) * 100}
            defType="Defensiva"
            defValue={(metrics.turnoverDriveRateDefense || 0) * 100}
            format="percent"
          />
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <MetricRowNewFormat
            metric="3rd Down %"
            offType="Ofensiva"
            offValue={(metrics.thirdDownEfficiencyOffense || 0) * 100}
            defType="Defensiva"
            defValue={(metrics.thirdDownEfficiencyDefense || 0) * 100}
            offRank={metrics.rankThirdDownConv}
            defRank={metrics.rankThirdDownStopRate}
            format="percent"
          />
        </div>
      </div>

      {/* Section: Yardas Ofensivas */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "12px",
            fontWeight: "900",
            textTransform: "uppercase",
            borderBottom: "2px solid " + COLORS.primary,
            paddingBottom: "8px",
            marginBottom: "12px",
          }}
        >
          📍 Yardas Ofensivas
        </h3>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Yardas Totales:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.totalYardsOffense || 0) >= 5000 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.totalYardsOffense || 0) / 6000) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankTotalYardsOffense ? `#${metrics.rankTotalYardsOffense}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.totalYardsOffense || 0)})
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Yardas Aéreas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.passingYards || 0) >= 3500 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.passingYards || 0) / 4500) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankPassingYards ? `#${metrics.rankPassingYards}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.passingYards || 0)})
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Yardas Terrestres:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.rushingYards || 0) >= 1500 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.rushingYards || 0) / 2200) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankRushingYards ? `#${metrics.rankRushingYards}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.rushingYards || 0)})
            </div>
          </div>
        </div>
      </div>

      {/* Section: Yardas Defensivas */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "12px",
            fontWeight: "900",
            textTransform: "uppercase",
            borderBottom: "2px solid " + COLORS.primary,
            paddingBottom: "8px",
            marginBottom: "12px",
          }}
        >
          🛡️ Yardas Defensivas (Permitidas)
        </h3>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Yardas Totales:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.totalYardsAllowed || 0) <= 5500 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.totalYardsAllowed || 0) / 6500) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankTotalYardsAllowed ? `#${metrics.rankTotalYardsAllowed}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.totalYardsAllowed || 0)})
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Yardas Aéreas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.passingYardsAllowed || 0) <= 4000 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.passingYardsAllowed || 0) / 5000) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankPassingYardsAllowed ? `#${metrics.rankPassingYardsAllowed}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.passingYardsAllowed || 0)})
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Yardas Terrestres:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.rushingYardsAllowed || 0) <= 2000 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.rushingYardsAllowed || 0) / 2500) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankRushingYardsAllowed ? `#${metrics.rankRushingYardsAllowed}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.rushingYardsAllowed || 0)})
            </div>
          </div>
        </div>
      </div>

      {/* Section: Penalties - Ofensiva */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "12px",
            fontWeight: "900",
            textTransform: "uppercase",
            borderBottom: "2px solid " + COLORS.primary,
            paddingBottom: "8px",
            marginBottom: "12px",
          }}
        >
          ⚠️ Penalties - Ofensiva
        </h3>
        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Cometidas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.penaltiesOffensiveCommittedCount || 0) <= 50 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.penaltiesOffensiveCommittedCount || 0) / 80) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankPenaltiesOffensiveCommitted ? `#${metrics.rankPenaltiesOffensiveCommitted}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.penaltiesOffensiveCommittedCount || 0)})
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#999" }}>
              Yardas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: "#666",
                width: `${Math.min(((metrics.penaltiesOffensiveCommittedYards || 0) / 600) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div />
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.penaltiesOffensiveCommittedYards || 0)})
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Recibidas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.penaltiesOffensiveReceivedCount || 0) <= 50 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.penaltiesOffensiveReceivedCount || 0) / 80) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankPenaltiesOffensiveReceived ? `#${metrics.rankPenaltiesOffensiveReceived}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.penaltiesOffensiveReceivedCount || 0)})
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#999" }}>
              Yardas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: "#666",
                width: `${Math.min(((metrics.penaltiesOffensiveReceivedYards || 0) / 600) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div />
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.penaltiesOffensiveReceivedYards || 0)})
            </div>
          </div>
        </div>
      </div>

      {/* Section: Penalties - Defensiva */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "12px",
            fontWeight: "900",
            textTransform: "uppercase",
            borderBottom: "2px solid " + COLORS.primary,
            paddingBottom: "8px",
            marginBottom: "12px",
          }}
        >
          ⚠️ Penalties - Defensiva
        </h3>
        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Cometidas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.penaltiesDefensiveCommittedCount || 0) <= 50 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.penaltiesDefensiveCommittedCount || 0) / 80) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankPenaltiesDefensiveCommitted ? `#${metrics.rankPenaltiesDefensiveCommitted}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.penaltiesDefensiveCommittedCount || 0)})
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#999" }}>
              Yardas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: "#666",
                width: `${Math.min(((metrics.penaltiesDefensiveCommittedYards || 0) / 600) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div />
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.penaltiesDefensiveCommittedYards || 0)})
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: COLORS.primary }}>
              Recibidas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: (metrics.penaltiesDefensiveReceivedCount || 0) <= 50 ? COLORS.success : COLORS.error,
                width: `${Math.min(((metrics.penaltiesDefensiveReceivedCount || 0) / 80) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", textAlign: "center" }}>
              {metrics.rankPenaltiesDefensiveReceived ? `#${metrics.rankPenaltiesDefensiveReceived}` : "—"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.penaltiesDefensiveReceivedCount || 0)})
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px", gap: "12px", alignItems: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#999" }}>
              Yardas:
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: "#666",
                width: `${Math.min(((metrics.penaltiesDefensiveReceivedYards || 0) / 600) * 100, 100)}%`,
                borderRadius: "2px",
              }}
            />
            <div />
            <div style={{ fontSize: "11px", fontWeight: "500", color: COLORS.primary, textAlign: "right" }}>
              ({Math.round(metrics.penaltiesDefensiveReceivedYards || 0)})
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
