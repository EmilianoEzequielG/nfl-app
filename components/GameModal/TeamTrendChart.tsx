"use client";

import { useEffect, useState } from "react";

interface TrendData {
  week: number;
  epaOfensivo: number;
  epaDefensivo: number;
  epaOffenseValue: number;
  epaDefenseValue: number;
  scoringDriveRate: number;
  thirdDownStopPct: number;
}

interface TeamTrendChartProps {
  teamId: string;
  teamName: string;
}

export function TeamTrendChart({ teamId, teamName }: TeamTrendChartProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrendData() {
      try {
        const response = await fetch(`/api/trend-data?teamId=${teamId}`);
        const data = await response.json();
        setTrendData(data);
      } catch (error) {
        console.error("Error fetching trend data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrendData();
  }, [teamId]);

  if (loading) return <div style={{ padding: "16px", color: "#666" }}>Cargando gráficos...</div>;

  const renderEPAChart = () => {
    const getColor = (value: number, isDefense: boolean = false) => {
      if (isDefense) {
        // Para defensa: menor es mejor
        if (value >= 70) return "#00AA00"; // Verde: 70+
        if (value >= 50) return "#FFE135"; // Amarillo: 50-70
        return "#DD0000"; // Rojo: <50
      } else {
        // Para ofensiva: mayor es mejor
        if (value >= 70) return "#00AA00"; // Verde: 70+
        if (value >= 50) return "#FFE135"; // Amarillo: 50-70
        return "#DD0000"; // Rojo: <50
      }
    };

    return (
      <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
        <div style={{ marginBottom: "12px", fontSize: "12px", fontWeight: "bold", color: "#121212" }}>
          📈 EPA Percentile (Ofensiva vs Defensiva)
        </div>

        <div style={{ fontFamily: "monospace", fontSize: "10px", lineHeight: "1.6" }}>
          {trendData.map((d) => (
            <div
              key={d.week}
              style={{
                display: "grid",
                gridTemplateColumns: "30px 1fr 1fr 80px",
                gap: "8px",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <div style={{ fontWeight: "600", color: "#666" }}>{d.week}:</div>

              {/* Ofensiva */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: Math.round((d.epaOfensivo / 100) * 40) + "px",
                    height: "16px",
                    backgroundColor: getColor(d.epaOfensivo, false),
                    borderRadius: "2px",
                  }}
                />
                <span style={{ color: getColor(d.epaOfensivo, false), fontWeight: "600", minWidth: "30px" }}>
                  {d.epaOfensivo.toFixed(0)}
                </span>
              </div>

              {/* Defensiva */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: Math.round((d.epaDefensivo / 100) * 40) + "px",
                    height: "16px",
                    backgroundColor: getColor(d.epaDefensivo, true),
                    borderRadius: "2px",
                  }}
                />
                <span style={{ color: getColor(d.epaDefensivo, true), fontWeight: "600", minWidth: "30px" }}>
                  {d.epaDefensivo.toFixed(0)}
                </span>
              </div>

              <div style={{ fontSize: "9px", color: "#999", textAlign: "right" }}>
                +{d.epaOffenseValue.toFixed(1)} / {d.epaDefenseValue.toFixed(1)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "12px", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "2px", fontSize: "9px", color: "#666" }}>
          <div style={{ marginBottom: "4px" }}>
            🟢 70-100: Excelente | 🟡 50-70: Bueno | 🔴 &lt;50: Necesita mejora
          </div>
          <div>Ofensiva (izq): mayor % es mejor | Defensiva (der): menor % también es mejor (menos puntos permitidos)</div>
        </div>
      </div>
    );
  };

  const renderDriveRatesChart = () => {
    return (
      <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #ddd" }}>
        <div style={{ marginBottom: "12px", fontSize: "12px", fontWeight: "bold", color: "#121212" }}>
          🏈 Drive Efficiency
        </div>

        <div style={{ fontFamily: "monospace", fontSize: "10px", lineHeight: "1.6" }}>
          <div style={{ marginBottom: "8px", fontWeight: "600", color: "#666", fontSize: "9px" }}>Scoring Drive Rate vs 3rd Down Stop %:</div>
          {trendData.map((d) => (
            <div
              key={d.week}
              style={{
                display: "grid",
                gridTemplateColumns: "30px 1fr 1fr 80px",
                gap: "8px",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <div style={{ fontWeight: "600", color: "#666" }}>{d.week}:</div>

              {/* Scoring Drive Rate */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: Math.round((d.scoringDriveRate / 100) * 40) + "px",
                    height: "16px",
                    backgroundColor: d.scoringDriveRate > 50 ? "#00AA00" : d.scoringDriveRate > 40 ? "#FFE135" : "#DD0000",
                    borderRadius: "2px",
                  }}
                />
                <span
                  style={{
                    color: d.scoringDriveRate > 50 ? "#00AA00" : d.scoringDriveRate > 40 ? "#FFE135" : "#DD0000",
                    fontWeight: "600",
                    minWidth: "30px",
                  }}
                >
                  {d.scoringDriveRate.toFixed(0)}%
                </span>
              </div>

              {/* 3rd Down Stop % */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: Math.round((d.thirdDownStopPct / 100) * 40) + "px",
                    height: "16px",
                    backgroundColor: d.thirdDownStopPct > 50 ? "#00AA00" : d.thirdDownStopPct > 40 ? "#FFE135" : "#DD0000",
                    borderRadius: "2px",
                  }}
                />
                <span
                  style={{
                    color: d.thirdDownStopPct > 50 ? "#00AA00" : d.thirdDownStopPct > 40 ? "#FFE135" : "#DD0000",
                    fontWeight: "600",
                    minWidth: "30px",
                  }}
                >
                  {d.thirdDownStopPct.toFixed(0)}%
                </span>
              </div>

              <div style={{ fontSize: "9px", color: "#999", textAlign: "right" }}>
                {d.scoringDriveRate.toFixed(1)}% / {d.thirdDownStopPct.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "12px", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "2px", fontSize: "9px", color: "#666" }}>
          <div style={{ marginBottom: "4px" }}>
            Scoring Drive Rate (izq): % de drives que terminan en TD/FG | 3rd Down Stop % (der): % de 3rd downs detenidos
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "2px solid #121212" }}>
      <h3 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", marginBottom: "16px", color: "#121212" }}>
        📊 Análisis de Tendencias (18 Semanas)
      </h3>
      {renderEPAChart()}
      {renderDriveRatesChart()}
    </div>
  );
}
