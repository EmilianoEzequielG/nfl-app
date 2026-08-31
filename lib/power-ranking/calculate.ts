/**
 * Power Ranking Calculation Module
 *
 * Calcula rankings reales basados en métricas de rendimiento en lugar de valores hardcodeados.
 * Puede ser reutilizado desde API routes (cálculo en vivo) y desde scripts de snapshot (congelado).
 */

interface OffenseMetrics {
  team: string;
  total_epa: number;
  sacks_allowed: number;
  turnovers: number;
  drives_total: number;
  pass_epa_adj_z?: number;
  points_scored?: number;
  passing_yards?: number;
  rushing_yards?: number;
  drives_td?: number;
  drives_fg?: number;
  drives_punt?: number;
  third_down_conversions?: number;
  third_downs_faced?: number;
  passing_tds?: number;
  rushing_tds?: number;
  penalties_count?: number;
  penalties_yards?: number;
  penalties_opp_count_opp?: number;
  penalties_opp_yards_opp?: number;
}

interface DefenseMetrics {
  team: string;
  total_epa_allowed: number;
  sacks_generated: number;
  turnovers_forced: number;
  pass_epa_adj_z?: number;
  points_allowed?: number;
  passing_yards_allowed?: number;
  rushing_yards_allowed?: number;
  td_rate_allowed?: number;
  fg_rate_allowed?: number;
  punt_rate_forced?: number;
  third_down_stop_rate?: number;
  penalties_count?: number;
  penalties_yards?: number;
  penalties_opp_count_opp?: number;
  penalties_opp_yards_opp?: number;
}

interface EPAPercentileWeekly {
  team: string;
  week: number;
  percentil_ofensivo: number;
  percentil_defensivo: number;
  epa_total: number;
}

interface RankingMap {
  [key: string]: number;
}

interface RankingCalculationInput {
  teamId: string;
  epaPercentileOffense: number;
  epaPercentileDefense: number;
  pointsScored: number;
  pointsAllowed: number;
  yardsDiff: number;
  thirdDownEff: number;
}

interface RankingScore {
  teamId: string;
  score: number;
  compositeScore: number;
  epaOffensePercentile: number;
  epaDefensePercentile: number;
}

/**
 * Calcula un ranking numérico real para cada equipo basado en sus métricas
 * Fórmula: combinación ponderada de EPA ofensivo/defensivo + diferencial de puntos
 *
 * Retorna array ordenado de 1 a 32, donde 1 es el mejor equipo
 */
export function calculateTeamRankings(
  offense: Map<string, OffenseMetrics>,
  defense: Map<string, DefenseMetrics>,
  epaWeekly: Map<string, EPAPercentileWeekly>,
  allTeamIds: string[]
): Map<string, number> {
  const scores: RankingScore[] = [];

  for (const teamId of allTeamIds) {
    const offenseMetrics = offense.get(teamId);
    const defenseMetrics = defense.get(teamId);

    if (!offenseMetrics || !defenseMetrics) {
      console.warn(`[Ranking Calculation] Missing metrics for ${teamId}, skipping`);
      continue;
    }

    // Obtener percentiles EPA (normalizados 0-100, donde 100 = mejor)
    const epaOffensePercentile = offenseMetrics.pass_epa_adj_z ?? 50;
    const epaDefensePercentile = 100 - (defenseMetrics.pass_epa_adj_z ?? 50); // Invertir: menor EPA permitido = mejor defensa

    // Diferencial de puntos por juego (proxy de dominio general)
    const pointsDiff = (offenseMetrics.points_scored ?? 0) - (defenseMetrics.points_allowed ?? 0);

    // Tercera y corta (predictor de close games)
    const thirdDownEff = offenseMetrics.third_down_conversions
      ? (offenseMetrics.third_down_conversions / (offenseMetrics.third_downs_faced || 1)) * 100
      : 50;

    // Puntuación compuesta: EPA ofensivo (40%) + EPA defensivo (40%) + diferencial puntos (15%) + 3ª corta (5%)
    const compositeScore =
      epaOffensePercentile * 0.40 +
      epaDefensePercentile * 0.40 +
      Math.min(pointsDiff * 1.5, 100) * 0.15 + // Normalizar diff puntos a 0-100
      Math.min(thirdDownEff, 100) * 0.05;

    scores.push({
      teamId,
      score: compositeScore,
      compositeScore,
      epaOffensePercentile,
      epaDefensePercentile,
    });
  }

  // Ordenar por puntuación compuesta (descendente: mayor score = mejor ranking)
  scores.sort((a, b) => b.compositeScore - a.compositeScore);

  // Mapear a ranks del 1 al 32
  const rankingMap = new Map<string, number>();
  scores.forEach((score, index) => {
    rankingMap.set(score.teamId, index + 1);
  });

  console.log(`[Ranking Calculation] Top 3 teams:`, scores.slice(0, 3).map((s) => `${s.teamId}=#${rankingMap.get(s.teamId)}`).join(", "));

  return rankingMap;
}

/**
 * Calcula todos los sub-rankings (EPA, yardas, penalidades, etc.)
 * Usado por buildMetrics para llenar cada métrica de ranking individual
 */
export function calculateSubRankings(offense: Map<string, OffenseMetrics>, defense: Map<string, DefenseMetrics>): {
  tdRateRanking: RankingMap;
  fgRateRanking: RankingMap;
  puntRateRanking: RankingMap;
  thirdDownRanking: RankingMap;
  penaltiesOffCommittedRanking: RankingMap;
  penaltiesOffReceivedRanking: RankingMap;
  penaltiesDefCommittedRanking: RankingMap;
  penaltiesDefReceivedRanking: RankingMap;
  epaOffenseRanking: RankingMap;
  epaDefenseRanking: RankingMap;
  passingYardsRanking: RankingMap;
  rushingYardsRanking: RankingMap;
  totalYardsRanking: RankingMap;
  passingYardsAllowedRanking: RankingMap;
  rushingYardsAllowedRanking: RankingMap;
  totalYardsAllowedRanking: RankingMap;
} {
  const offenseArray = Array.from(offense.values());
  const defenseArray = Array.from(defense.values());

  const getTdRate = (o: any) => (o.drives_td ? (o.drives_td / (o.drives_total || 1)) * 100 : 0);
  const getFgRate = (o: any) => (o.drives_fg ? (o.drives_fg / (o.drives_total || 1)) * 100 : 0);
  const getPuntRate = (o: any) => (o.drives_punt ? (o.drives_punt / (o.drives_total || 1)) * 100 : 0);
  const getThirdDownRate = (o: any) => (o.third_down_conversions ? (o.third_down_conversions / (o.third_downs_faced || 1)) * 100 : 0);

  const rankByValue = (data: any[], getValue: (x: any) => number, descending = true) => {
    const sorted = [...data].sort((a, b) => (descending ? getValue(b) - getValue(a) : getValue(a) - getValue(b)));
    return Object.fromEntries(sorted.map((item, idx) => [item.team, idx + 1]));
  };

  return {
    tdRateRanking: rankByValue(offenseArray, getTdRate),
    fgRateRanking: rankByValue(offenseArray, getFgRate),
    puntRateRanking: rankByValue(offenseArray, getPuntRate),
    thirdDownRanking: rankByValue(offenseArray, getThirdDownRate),
    penaltiesOffCommittedRanking: rankByValue(offenseArray, (o) => o.penalties_count || 0, false),
    penaltiesOffReceivedRanking: rankByValue(offenseArray, (o) => o.penalties_opp_count_opp || 0, false),
    penaltiesDefCommittedRanking: rankByValue(defenseArray, (d) => d.penalties_count || 0, false),
    penaltiesDefReceivedRanking: rankByValue(defenseArray, (d) => d.penalties_opp_count_opp || 0, false),
    epaOffenseRanking: rankByValue(offenseArray, (o) => o.total_epa || 0),
    epaDefenseRanking: rankByValue(defenseArray, (d) => d.total_epa_allowed || 0, false),
    passingYardsRanking: rankByValue(offenseArray, (o) => o.passing_yards || 0),
    rushingYardsRanking: rankByValue(offenseArray, (o) => o.rushing_yards || 0),
    totalYardsRanking: rankByValue(offenseArray, (o) => (o.passing_yards || 0) + (o.rushing_yards || 0)),
    passingYardsAllowedRanking: rankByValue(defenseArray, (d) => d.passing_yards_allowed || 0, false),
    rushingYardsAllowedRanking: rankByValue(defenseArray, (d) => d.rushing_yards_allowed || 0, false),
    totalYardsAllowedRanking: rankByValue(defenseArray, (d) => (d.passing_yards_allowed || 0) + (d.rushing_yards_allowed || 0), false),
  };
}
