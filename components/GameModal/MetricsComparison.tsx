"use client";

import { Game } from "@/types";

interface MetricsComparisonProps {
  game: Game;
}

// Metric row with 3-column fixed-width grid
const MetricRow = ({
  label,
  awayValue,
  homeValue,
  awayRank,
  homeRank,
  format = "number",
  awayColor = "#666",
  homeColor = "#666",
  isPerspective = false,
}: {
  label: string;
  awayValue: number;
  homeValue: number;
  awayRank?: number;
  homeRank?: number;
  format?: "number" | "percent" | "rank";
  awayColor?: string;
  homeColor?: string;
  isPerspective?: boolean;
}) => {
  const formatValue = (val: number) => {
    if (format === "percent") return `${val.toFixed(1)}%`;
    if (format === "rank") return `#${val}`;
    return val.toFixed(1);
  };

  // Find max value for proportional bar (0-100% scale)
  const maxVal = Math.max(Math.abs(awayValue), Math.abs(homeValue), 1);
  const awayPercent = (Math.abs(awayValue) / maxVal) * 100;
  const homePercent = (Math.abs(homeValue) / maxVal) * 100;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
      {/* Away value column */}
      <div style={{ textAlign: "right", minWidth: "60px" }}>
        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#121212" }}>{formatValue(awayValue)}</div>
        {awayRank && <div style={{ fontSize: "10px", color: "#666" }}>Rank: #{awayRank}</div>}
        <div
          style={{
            height: "4px",
            backgroundColor: awayColor,
            marginTop: "4px",
            width: `${awayPercent}%`,
            marginLeft: "auto",
          }}
        />
      </div>

      {/* Label column */}
      <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "600", color: "#121212", lineHeight: "1.2" }}>
        {label}
      </div>

      {/* Home value column */}
      <div style={{ textAlign: "left", minWidth: "60px" }}>
        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#121212" }}>{formatValue(homeValue)}</div>
        {homeRank && <div style={{ fontSize: "10px", color: "#666" }}>Rank: #{homeRank}</div>}
        <div
          style={{
            height: "4px",
            backgroundColor: homeColor,
            marginTop: "4px",
            width: `${homePercent}%`,
          }}
        />
      </div>
    </div>
  );
};

export function MetricsComparison({ game }: MetricsComparisonProps) {
  const away = game.awayTeam;
  const home = game.homeTeam;
  const awayMetrics = game.awayMetrics;
  const homeMetrics = game.homeMetrics;

  return (
    <div style={{ padding: "0", fontSize: "13px" }}>
      {/* Section: EPA & Drive Tendencies */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", borderBottom: "2px solid #121212", paddingBottom: "8px", marginBottom: "12px" }}>
          📊 EPA Percentile
        </h3>
        <MetricRow label="Ofensivo" awayValue={awayMetrics.epaOffensePercentile} homeValue={homeMetrics.epaDefensePercentile} format="percent" />
        <MetricRow label="Defensivo" awayValue={awayMetrics.epaDefensePercentile} homeValue={homeMetrics.epaOffensePercentile} format="percent" />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", borderBottom: "2px solid #121212", paddingBottom: "8px", marginBottom: "12px" }}>
          🏈 Drive Tendencies & Efficiency
        </h3>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "8px", textAlign: "center" }}>Pass Neutral %</div>
          <MetricRow label="Off" awayValue={awayMetrics.passNeutralRate * 100} homeValue={homeMetrics.passNeutralRate * 100} format="percent" awayColor={away.color} homeColor={home.color} />
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "8px", textAlign: "center" }}>TD Rate %</div>
          <MetricRow label="Off" awayValue={awayMetrics.tdDriveRateOffense * 100} homeValue={homeMetrics.tdDriveRateOffense * 100} awayRank={awayMetrics.rankTdRate} homeRank={homeMetrics.rankTdRate} format="percent" awayColor={away.color} homeColor={home.color} />
          <MetricRow label="Def" awayValue={awayMetrics.tdDriveRateDefense * 100} homeValue={homeMetrics.tdDriveRateDefense * 100} awayRank={awayMetrics.rankTdRateAllowed} homeRank={homeMetrics.rankTdRateAllowed} format="percent" awayColor={away.color} homeColor={home.color} />
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "8px", textAlign: "center" }}>FG Rate %</div>
          <MetricRow label="Off" awayValue={(awayMetrics.fgDriveRateOffense || 0) * 100} homeValue={(homeMetrics.fgDriveRateOffense || 0) * 100} awayRank={awayMetrics.rankFgRate} homeRank={homeMetrics.rankFgRate} format="percent" awayColor={away.color} homeColor={home.color} />
          <MetricRow label="Def" awayValue={(awayMetrics.fgDriveRateDefense || 0) * 100} homeValue={(homeMetrics.fgDriveRateDefense || 0) * 100} awayRank={awayMetrics.rankFgRateAllowed} homeRank={homeMetrics.rankFgRateAllowed} format="percent" awayColor={away.color} homeColor={home.color} />
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "8px", textAlign: "center" }}>Punt Rate %</div>
          <MetricRow label="Off" awayValue={(awayMetrics.puntDriveRateOffense || 0) * 100} homeValue={(homeMetrics.puntDriveRateOffense || 0) * 100} awayRank={awayMetrics.rankPuntRate} homeRank={homeMetrics.rankPuntRate} format="percent" awayColor={away.color} homeColor={home.color} />
          <MetricRow label="Def" awayValue={(awayMetrics.puntDriveRateDefense || 0) * 100} homeValue={(homeMetrics.puntDriveRateDefense || 0) * 100} awayRank={awayMetrics.rankPuntRateForced} homeRank={homeMetrics.rankPuntRateForced} format="percent" awayColor={away.color} homeColor={home.color} />
        </div>

        <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "8px", textAlign: "center" }}>Turnover Rate %</div>
          <MetricRow label="Off" awayValue={awayMetrics.turnoverDriveRateOffense * 100} homeValue={homeMetrics.turnoverDriveRateOffense * 100} awayRank={awayMetrics.rankTurnoverRate} homeRank={homeMetrics.rankTurnoverRate} format="percent" awayColor={away.color} homeColor={home.color} />
          <MetricRow label="Def" awayValue={awayMetrics.turnoverDriveRateDefense * 100} homeValue={homeMetrics.turnoverDriveRateDefense * 100} awayRank={awayMetrics.rankTurnoverRateForced} homeRank={homeMetrics.rankTurnoverRateForced} format="percent" awayColor={away.color} homeColor={home.color} />
        </div>

        <div>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "8px", textAlign: "center" }}>3rd Down %</div>
          <MetricRow label="Off" awayValue={awayMetrics.thirdDownEfficiencyOffense * 100} homeValue={homeMetrics.thirdDownEfficiencyOffense * 100} awayRank={awayMetrics.rankThirdDownConv} homeRank={homeMetrics.rankThirdDownConv} format="percent" awayColor={away.color} homeColor={home.color} />
          <MetricRow label="Def" awayValue={awayMetrics.thirdDownEfficiencyDefense * 100} homeValue={homeMetrics.thirdDownEfficiencyDefense * 100} awayRank={awayMetrics.rankThirdDownStopRate} homeRank={homeMetrics.rankThirdDownStopRate} format="percent" awayColor={away.color} homeColor={home.color} />
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", borderBottom: "2px solid #121212", paddingBottom: "8px", marginBottom: "12px" }}>
          ⚠️ Penalties - Ofensiva
        </h3>
        <div style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #ddd" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "4px", textAlign: "center" }}>Cometidas</div>
          <MetricRow label="Count" awayValue={awayMetrics.penaltiesOffensiveCommittedCount || 0} homeValue={homeMetrics.penaltiesOffensiveCommittedCount || 0} awayRank={awayMetrics.rankPenaltiesOffensiveCommitted} homeRank={homeMetrics.rankPenaltiesOffensiveCommitted} format="rank" />
          <MetricRow label="Yards" awayValue={awayMetrics.penaltiesOffensiveCommittedYards || 0} homeValue={homeMetrics.penaltiesOffensiveCommittedYards || 0} format="number" />
        </div>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "4px", textAlign: "center" }}>Recibidas</div>
          <MetricRow label="Count" awayValue={awayMetrics.penaltiesOffensiveReceivedCount || 0} homeValue={homeMetrics.penaltiesOffensiveReceivedCount || 0} awayRank={awayMetrics.rankPenaltiesOffensiveReceived} homeRank={homeMetrics.rankPenaltiesOffensiveReceived} format="rank" />
          <MetricRow label="Yards" awayValue={awayMetrics.penaltiesOffensiveReceivedYards || 0} homeValue={homeMetrics.penaltiesOffensiveReceivedYards || 0} format="number" />
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", borderBottom: "2px solid #121212", paddingBottom: "8px", marginBottom: "12px" }}>
          ⚠️ Penalties - Defensiva
        </h3>
        <div style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #ddd" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "4px", textAlign: "center" }}>Cometidas</div>
          <MetricRow label="Count" awayValue={awayMetrics.penaltiesDefensiveCommittedCount || 0} homeValue={homeMetrics.penaltiesDefensiveCommittedCount || 0} awayRank={awayMetrics.rankPenaltiesDefensiveCommitted} homeRank={homeMetrics.rankPenaltiesDefensiveCommitted} format="rank" />
          <MetricRow label="Yards" awayValue={awayMetrics.penaltiesDefensiveCommittedYards || 0} homeValue={homeMetrics.penaltiesDefensiveCommittedYards || 0} format="number" />
        </div>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#666", marginBottom: "4px", textAlign: "center" }}>Recibidas</div>
          <MetricRow label="Count" awayValue={awayMetrics.penaltiesDefensiveReceivedCount || 0} homeValue={homeMetrics.penaltiesDefensiveReceivedCount || 0} awayRank={awayMetrics.rankPenaltiesDefensiveReceived} homeRank={homeMetrics.rankPenaltiesDefensiveReceived} format="rank" />
          <MetricRow label="Yards" awayValue={awayMetrics.penaltiesDefensiveReceivedYards || 0} homeValue={homeMetrics.penaltiesDefensiveReceivedYards || 0} format="number" />
        </div>
      </div>
    </div>
  );
}
