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

export interface SeasonEpaPercentiles {
  offense: number;
  defense: number;
}

/**
 * Calcula percentiles EPA (0-100) sobre el ACUMULADO de temporada.
 *
 * Los percentiles de epa_percentile_by_week.json corresponden a una semana
 * aislada, mientras que el resto de las métricas mostradas (yardas, drives,
 * penalidades) salen de offense_season.json / defense_season.json, que son
 * acumulados de toda la temporada. Mezclar ambas escalas hacía que la misma
 * pantalla comparara una semana suelta contra 17 semanas.
 *
 * Acá se rankean los 32 equipos por su EPA acumulado y se convierte la
 * posición a percentil: el mejor obtiene 100, el peor 0.
 *   - Ofensiva: mayor total_epa es mejor.
 *   - Defensiva: menor total_epa_allowed es mejor (permite menos EPA).
 */
export function calculateSeasonEpaPercentiles(
  offense: Map<string, OffenseMetrics>,
  defense: Map<string, DefenseMetrics>
): Map<string, SeasonEpaPercentiles> {
  const toPercentile = (index: number, total: number) =>
    total <= 1 ? 50 : ((total - 1 - index) / (total - 1)) * 100;

  const offenseRanked = Array.from(offense.values()).sort(
    (a, b) => (b.total_epa ?? 0) - (a.total_epa ?? 0)
  );
  const defenseRanked = Array.from(defense.values()).sort(
    (a, b) => (a.total_epa_allowed ?? 0) - (b.total_epa_allowed ?? 0)
  );

  const result = new Map<string, SeasonEpaPercentiles>();

  offenseRanked.forEach((team, index) => {
    result.set(team.team, {
      offense: toPercentile(index, offenseRanked.length),
      defense: 50,
    });
  });

  defenseRanked.forEach((team, index) => {
    const existing = result.get(team.team) ?? { offense: 50, defense: 50 };
    existing.defense = toPercentile(index, defenseRanked.length);
    result.set(team.team, existing);
  });

  return result;
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

  // Percentiles EPA reales (0-100) sobre el acumulado de temporada.
  // Antes se usaba pass_epa_adj_z, que es un z-score (~-3 a +3) y no un
  // percentil: un valor excelente como 11.4 se leía como "percentil 11.4",
  // es decir casi el peor de la liga, y con peso 0.40 distorsionaba el ranking.
  const seasonPercentiles = calculateSeasonEpaPercentiles(offense, defense);

  for (const teamId of allTeamIds) {
    const offenseMetrics = offense.get(teamId);
    const defenseMetrics = defense.get(teamId);

    if (!offenseMetrics || !defenseMetrics) {
      console.warn(`[Ranking Calculation] Missing metrics for ${teamId}, skipping`);
      continue;
    }

    const percentiles = seasonPercentiles.get(teamId) ?? { offense: 50, defense: 50 };
    const epaOffensePercentile = percentiles.offense;
    const epaDefensePercentile = percentiles.defense;

    // Diferencial de puntos por juego (proxy de dominio general)
    const pointsDiff = (offenseMetrics.points_scored ?? 0) - (defenseMetrics.points_allowed ?? 0);

    // Tercera y corta (predictor de close games)
    const thirdDownEff = offenseMetrics.third_down_conversions
      ? (offenseMetrics.third_down_conversions / (offenseMetrics.third_downs_faced || 1)) * 100
      : 50;

    // Diferencial normalizado a 0-100: 50 es paridad, +/-100 puntos satura los extremos.
    // El clamp inferior evita que un diferencial muy negativo aporte un valor negativo.
    const pointsDiffNormalized = Math.max(0, Math.min(100, 50 + pointsDiff * 0.5));

    // Puntuación compuesta: EPA ofensivo (40%) + EPA defensivo (40%) + diferencial puntos (15%) + 3ª corta (5%)
    const compositeScore =
      epaOffensePercentile * 0.40 +
      epaDefensePercentile * 0.40 +
      pointsDiffNormalized * 0.15 +
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
