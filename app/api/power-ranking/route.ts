/**
 * GET /api/power-ranking?week=1
 *
 * Retorna rankings de 32 equipos con métricas reales para una semana específica.
 *
 * FLUJO DE DATOS:
 * 1. Extrae week del query parameter (default: 1, válido: 1-18)
 * 2. Para cada equipo en DEFAULT_RANKINGS:
 *    a) Busca datos de season en offense_season.json
 *    b) Busca datos de season en defense_season.json
 *    c) Busca datos de week en epa_percentile_by_week.json
 * 3. Combina 3 fuentes en objeto "metrics":
 *    - weekly: percentiles de la semana específica
 *    - season: totales de la temporada (EPA)
 *    - derived: calculados (turnover rates, etc)
 * 4. Devuelve array de 32 equipos con datos completos
 *
 * EJEMPLO:
 * GET /api/power-ranking?week=1
 * Response: [{id: "KC", metrics: {...}, ...}, ...]
 */

import { NextRequest, NextResponse } from "next/server";
import offenseSeasonData from "@/public/data/offense_season.json";
import defenseSeasonData from "@/public/data/defense_season.json";
import epaPercentileData from "@/public/data/epa_percentile_by_week.json";

// ============================================================================
// TYPES
// ============================================================================

interface OffenseMetrics {
  team: string;
  total_epa: number;
  sacks_allowed: number;
  turnovers: number;
  drives_total: number;
  pass_epa_adj_z?: number;
}

interface DefenseMetrics {
  team: string;
  total_epa_allowed: number;
  sacks_generated: number;
  turnovers_forced: number;
  pass_epa_adj_z?: number;
}

interface EPAPercentileWeekly {
  team: string;
  week: number;
  percentil_ofensivo: number;
  percentil_defensivo: number;
  epa_total: number;
}

interface PowerRankingMetrics {
  // EPA Percentiles + Rankings
  epaOffensePercentile: number;
  epaDefensePercentile: number;
  epaOffense: number;
  epaDefense: number;
  rankEpaOffense: number;
  rankEpaDefense: number;

  // Scoring
  pointsScored: number;
  pointsAllowed: number;

  // Yards (Ofensiva)
  passingYards: number;
  rushingYards: number;
  totalYardsOffense: number;
  rankPassingYards: number;
  rankRushingYards: number;
  rankTotalYardsOffense: number;

  // Yards (Defensiva - Permitidas)
  passingYardsAllowed: number;
  rushingYardsAllowed: number;
  totalYardsAllowed: number;
  rankPassingYardsAllowed: number;
  rankRushingYardsAllowed: number;
  rankTotalYardsAllowed: number;

  // Touchdowns (Ofensiva)
  passingTDs: number;
  rushingTDs: number;

  // Defense
  sacksAllowed: number;
  sacksGenerated: number;

  // Turnovers
  turnoverDriveRateOffense: number;
  turnoverDriveRateDefense: number;
  turnoversForcedCount: number;

  // Drive Results
  tdDriveRateOffense: number;
  fgDriveRateOffense: number;
  puntDriveRateOffense: number;
  thirdDownEfficiencyOffense: number;
  rankTdRate: number;
  rankFgRate: number;
  rankPuntRate: number;
  rankThirdDownConv: number;

  // Drive Results Defense
  tdDriveRateDefense: number;
  fgDriveRateDefense: number;
  puntDriveRateDefense: number;
  thirdDownEfficiencyDefense: number;
  rankTdRateAllowed: number;
  rankFgRateAllowed: number;
  rankPuntRateForced: number;
  rankThirdDownStopRate: number;

  // Penalties Ofensiva
  penaltiesOffensiveCommittedCount: number;
  penaltiesOffensiveCommittedYards: number;
  penaltiesOffensiveReceivedCount: number;
  penaltiesOffensiveReceivedYards: number;
  rankPenaltiesOffensiveCommitted: number;
  rankPenaltiesOffensiveReceived: number;

  // Penalties Defensiva
  penaltiesDefensiveCommittedCount: number;
  penaltiesDefensiveCommittedYards: number;
  penaltiesDefensiveReceivedCount: number;
  penaltiesDefensiveReceivedYards: number;
  rankPenaltiesDefensiveCommitted: number;
  rankPenaltiesDefensiveReceived: number;

  // League Averages (para comparación)
  leagueAvg: {
    pointsScored: number;
    pointsAllowed: number;
    passingYards: number;
    rushingYards: number;
    sacksGenerated: number;
  };
}

interface TeamData {
  name: string;
  record: string;
  color: string;
  abbr: string;
}

interface RankingCalculation {
  teamId: string;
  calculatedRank: number;
  epa: number;
}

interface PowerRankingResponse {
  id: string;
  abbr: string;
  name: string;
  record: string;
  color: string;
  calculatedRank: number;
  adjustedRank?: number;
  isAdjusted: boolean;
  summary?: string;
  epa: number;
  metrics: PowerRankingMetrics;
}

// ============================================================================
// DATA
// ============================================================================

const DEFAULT_RANKINGS: RankingCalculation[] = [
  { teamId: "KC", calculatedRank: 1, epa: 8.5 },
  { teamId: "BUF", calculatedRank: 2, epa: 7.8 },
  { teamId: "SF", calculatedRank: 3, epa: 7.6 },
  { teamId: "PHI", calculatedRank: 4, epa: 7.4 },
  { teamId: "BAL", calculatedRank: 5, epa: 7.1 },
  { teamId: "LA", calculatedRank: 6, epa: 6.8 },
  { teamId: "DEN", calculatedRank: 7, epa: 6.5 },
  { teamId: "GB", calculatedRank: 8, epa: 6.2 },
  { teamId: "HOU", calculatedRank: 9, epa: 5.9 },
  { teamId: "TB", calculatedRank: 10, epa: 5.6 },
  { teamId: "CIN", calculatedRank: 11, epa: 5.3 },
  { teamId: "MIA", calculatedRank: 12, epa: 5.0 },
  { teamId: "LAC", calculatedRank: 13, epa: 4.7 },
  { teamId: "DAL", calculatedRank: 14, epa: 4.4 },
  { teamId: "MIN", calculatedRank: 15, epa: 4.1 },
  { teamId: "IND", calculatedRank: 16, epa: 3.8 },
  { teamId: "SEA", calculatedRank: 17, epa: 3.5 },
  { teamId: "WAS", calculatedRank: 18, epa: 3.2 },
  { teamId: "ARI", calculatedRank: 19, epa: 2.9 },
  { teamId: "DET", calculatedRank: 20, epa: 2.6 },
  { teamId: "NO", calculatedRank: 21, epa: 2.3 },
  { teamId: "ATL", calculatedRank: 22, epa: 2.0 },
  { teamId: "NE", calculatedRank: 23, epa: 1.7 },
  { teamId: "TEN", calculatedRank: 24, epa: 1.4 },
  { teamId: "CAR", calculatedRank: 25, epa: 1.1 },
  { teamId: "CHI", calculatedRank: 26, epa: 0.8 },
  { teamId: "NYG", calculatedRank: 27, epa: 0.5 },
  { teamId: "NYJ", calculatedRank: 28, epa: 0.2 },
  { teamId: "JAX", calculatedRank: 29, epa: -0.1 },
  { teamId: "LV", calculatedRank: 30, epa: -0.4 },
  { teamId: "CLE", calculatedRank: 31, epa: -0.7 },
  { teamId: "PIT", calculatedRank: 32, epa: -1.0 },
];

const powerRankingNotes: Record<string, { rankingPosition?: number; summary?: string }> = {
  KC: {
    rankingPosition: 1,
    summary: "Los Chiefs mantienen el liderato con un equipo equilibrado. Mahomes jugando a MVP level en los momentos decisivos.",
  },
  BUF: {
    rankingPosition: 2,
    summary: "Buffalo sigue siendo una amenaza real en el Este. La defensa se ha mejorado significativamente en las últimas semanas.",
  },
  SF: {
    rankingPosition: 3,
    summary: "San Francisco sigue siendo el equipo más completo. Su defensa es de élite y el ataque maneja bien los tiempos.",
  },
};

const TEAM_DATA: Record<string, TeamData> = {
  KC: { name: "Kansas City Chiefs", record: "11-3", color: "#E31828", abbr: "KC" },
  BUF: { name: "Buffalo Bills", record: "10-4", color: "#00338D", abbr: "BUF" },
  SF: { name: "San Francisco 49ers", record: "10-4", color: "#AA0000", abbr: "SF" },
  PHI: { name: "Philadelphia Eagles", record: "10-4", color: "#004687", abbr: "PHI" },
  BAL: { name: "Baltimore Ravens", record: "9-5", color: "#241773", abbr: "BAL" },
  LA: { name: "Los Angeles Rams", record: "9-5", color: "#003594", abbr: "LA" },
  DEN: { name: "Denver Broncos", record: "9-5", color: "#FB4F14", abbr: "DEN" },
  GB: { name: "Green Bay Packers", record: "9-5", color: "#203731", abbr: "GB" },
  HOU: { name: "Houston Texans", record: "9-5", color: "#03202F", abbr: "HOU" },
  TB: { name: "Tampa Bay Buccaneers", record: "8-6", color: "#D50A0A", abbr: "TB" },
  CIN: { name: "Cincinnati Bengals", record: "8-6", color: "#FB4F14", abbr: "CIN" },
  MIA: { name: "Miami Dolphins", record: "8-6", color: "#008E97", abbr: "MIA" },
  LAC: { name: "Los Angeles Chargers", record: "7-7", color: "#0080B4", abbr: "LAC" },
  DAL: { name: "Dallas Cowboys", record: "7-7", color: "#003594", abbr: "DAL" },
  MIN: { name: "Minnesota Vikings", record: "7-7", color: "#4F2683", abbr: "MIN" },
  IND: { name: "Indianapolis Colts", record: "7-7", color: "#002C5F", abbr: "IND" },
  SEA: { name: "Seattle Seahawks", record: "8-6", color: "#002244", abbr: "SEA" },
  WAS: { name: "Washington Commanders", record: "7-7", color: "#5A1414", abbr: "WAS" },
  ARI: { name: "Arizona Cardinals", record: "6-8", color: "#97233F", abbr: "ARI" },
  DET: { name: "Detroit Lions", record: "8-6", color: "#0076B6", abbr: "DET" },
  NO: { name: "New Orleans Saints", record: "5-9", color: "#D3BC8D", abbr: "NO" },
  ATL: { name: "Atlanta Falcons", record: "7-7", color: "#A71930", abbr: "ATL" },
  NE: { name: "New England Patriots", record: "4-10", color: "#002244", abbr: "NE" },
  TEN: { name: "Tennessee Titans", record: "3-11", color: "#0C2C56", abbr: "TEN" },
  CAR: { name: "Carolina Panthers", record: "4-10", color: "#0085CA", abbr: "CAR" },
  CHI: { name: "Chicago Bears", record: "4-10", color: "#0B162A", abbr: "CHI" },
  NYG: { name: "New York Giants", record: "3-11", color: "#0B2340", abbr: "NYG" },
  NYJ: { name: "New York Jets", record: "3-11", color: "#125740", abbr: "NYJ" },
  JAX: { name: "Jacksonville Jaguars", record: "2-12", color: "#006687", abbr: "JAX" },
  LV: { name: "Las Vegas Raiders", record: "2-12", color: "#000000", abbr: "LV" },
  CLE: { name: "Cleveland Browns", record: "3-11", color: "#311D00", abbr: "CLE" },
  PIT: { name: "Pittsburgh Steelers", record: "8-8", color: "#FFB612", abbr: "PIT" },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseWeekParam(request: NextRequest): number {
  const weekParam = request.nextUrl.searchParams.get("week");
  const week = weekParam ? parseInt(weekParam) : 1;

  if (isNaN(week) || week < 1 || week > 18) {
    console.warn(`[Power Ranking] Invalid week parameter: ${weekParam}, using default week 1`);
    return 1;
  }

  return week;
}

interface DataLookups {
  offense: Map<string, OffenseMetrics>;
  defense: Map<string, DefenseMetrics>;
  epaWeekly: Map<string, EPAPercentileWeekly>;
}

function initializeLookups(): DataLookups {
  console.log("[Power Ranking] Initializing data lookups...");

  const offenseData = offenseSeasonData as OffenseMetrics[];
  const defenseData = defenseSeasonData as DefenseMetrics[];
  const epaData = epaPercentileData as EPAPercentileWeekly[];

  const offense = new Map(offenseData.map((d) => [d.team, d]));
  const defense = new Map(defenseData.map((d) => [d.team, d]));
  const epaWeekly = new Map(epaData.map((d) => [`${d.team}-w${d.week}`, d]));

  console.log(`[Power Ranking] Loaded ${offense.size} offense records, ${defense.size} defense records, ${epaWeekly.size} weekly EPA records`);

  return { offense, defense, epaWeekly };
}

function calculateLeagueAverages(lookups: DataLookups): PowerRankingMetrics['leagueAvg'] {
  const offenseValues = Array.from(lookups.offense.values());
  const defenseValues = Array.from(lookups.defense.values());

  const avgPointsScored = offenseValues.reduce((sum, o) => sum + (o.points_scored || 0), 0) / offenseValues.length;
  const avgPointsAllowed = defenseValues.reduce((sum, d) => sum + (d.points_allowed || 0), 0) / defenseValues.length;
  const avgPassingYards = offenseValues.reduce((sum, o) => sum + (o.passing_yards || 0), 0) / offenseValues.length;
  const avgRushingYards = offenseValues.reduce((sum, o) => sum + (o.rushing_yards || 0), 0) / offenseValues.length;
  const avgSacksGenerated = defenseValues.reduce((sum, d) => sum + (d.sacks_generated || 0), 0) / defenseValues.length;

  return {
    pointsScored: Math.round(avgPointsScored),
    pointsAllowed: Math.round(avgPointsAllowed),
    passingYards: Math.round(avgPassingYards),
    rushingYards: Math.round(avgRushingYards),
    sacksGenerated: Math.round(avgSacksGenerated),
  };
}

interface RankingMap {
  [key: string]: number;
}

function calculateRankings(lookups: DataLookups): {
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
  const offenseArray = Array.from(lookups.offense.values());
  const defenseArray = Array.from(lookups.defense.values());

  // Helper to calculate TD rate (td drives / total drives)
  const getTdRate = (o: any) => o.drives_td ? (o.drives_td / (o.drives_total || 1)) * 100 : 0;
  const getFgRate = (o: any) => o.drives_fg ? (o.drives_fg / (o.drives_total || 1)) * 100 : 0;
  const getPuntRate = (o: any) => o.drives_punt ? (o.drives_punt / (o.drives_total || 1)) * 100 : 0;
  const getThirdDownRate = (o: any) => o.third_down_conversions ? (o.third_down_conversions / (o.third_downs_faced || 1)) * 100 : 0;

  // Create ranking maps (higher is better for most metrics)
  const rankByValue = (data: any[], getValue: (x: any) => number, descending = true) => {
    const sorted = [...data].sort((a, b) => descending ? getValue(b) - getValue(a) : getValue(a) - getValue(b));
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

function buildMetrics(
  teamId: string,
  week: number,
  lookups: DataLookups,
  leagueAvg: PowerRankingMetrics['leagueAvg'],
  rankings: ReturnType<typeof calculateRankings>
): PowerRankingMetrics {
  const offenseMetrics = lookups.offense.get(teamId);
  const defenseMetrics = lookups.defense.get(teamId);
  const epaWeekly = lookups.epaWeekly.get(`${teamId}-w${week}`);

  if (!offenseMetrics) console.warn(`[Power Ranking] Missing offense data for ${teamId}`);
  if (!defenseMetrics) console.warn(`[Power Ranking] Missing defense data for ${teamId}`);
  if (!epaWeekly) console.warn(`[Power Ranking] Missing weekly EPA data for ${teamId} week ${week}`);

  const epaOffensePercentile = epaWeekly?.percentil_ofensivo ?? offenseMetrics?.pass_epa_adj_z ?? 50;
  // Fallback for defensive EPA: if zero in JSON, use epa_total_allowed as proxy
  let epaDefensePercentile = epaWeekly?.percentil_defensivo ?? 50;
  if (epaDefensePercentile === 0 && epaWeekly?.epa_total_allowed) {
    // Calculate estimated defensive percentile based on epa_allowed
    // Lower EPA allowed is better (defensive), so we invert: 100 - (raw percentile)
    const epaAllowed = epaWeekly.epa_total_allowed;
    epaDefensePercentile = Math.max(10, Math.min(90, 50 - (epaAllowed * 3))); // Estimate
  }

  const passingYards = offenseMetrics?.passing_yards ?? 0;
  const rushingYards = offenseMetrics?.rushing_yards ?? 0;

  // Calculate drive rates from offense data
  const tdDriveRateOff = offenseMetrics?.drives_td ? (offenseMetrics.drives_td / (offenseMetrics.drives_total || 1)) * 100 : 0;
  const fgDriveRateOff = offenseMetrics?.drives_fg ? (offenseMetrics.drives_fg / (offenseMetrics.drives_total || 1)) * 100 : 0;
  const puntDriveRateOff = offenseMetrics?.drives_punt ? (offenseMetrics.drives_punt / (offenseMetrics.drives_total || 1)) * 100 : 0;
  const thirdDownEffOff = offenseMetrics?.third_down_conversions ? (offenseMetrics.third_down_conversions / (offenseMetrics.third_downs_faced || 1)) * 100 : 0;

  // Defense rates from defense data (already calculated percentages, convert to decimal)
  const tdDriveRateDef = (defenseMetrics?.td_rate_allowed || 0) / 100;
  const fgDriveRateDef = (defenseMetrics?.fg_rate_allowed || 0) / 100;
  const puntDriveRateDef = (defenseMetrics?.punt_rate_forced || 0) / 100;
  const thirdDownEffDef = (defenseMetrics?.third_down_stop_rate || 0) / 100;

  return {
    epaOffensePercentile,
    epaDefensePercentile,
    epaOffense: offenseMetrics?.total_epa ?? 0,
    epaDefense: defenseMetrics?.total_epa_allowed ?? 0,
    rankEpaOffense: rankings.epaOffenseRanking[teamId] ?? 16,
    rankEpaDefense: rankings.epaDefenseRanking[teamId] ?? 16,
    pointsScored: offenseMetrics?.points_scored ?? 0,
    pointsAllowed: defenseMetrics?.points_allowed ?? 0,
    passingYards,
    rushingYards,
    totalYardsOffense: passingYards + rushingYards,
    rankPassingYards: rankings.passingYardsRanking[teamId] ?? 16,
    rankRushingYards: rankings.rushingYardsRanking[teamId] ?? 16,
    rankTotalYardsOffense: rankings.totalYardsRanking[teamId] ?? 16,
    passingYardsAllowed: defenseMetrics?.passing_yards_allowed ?? 0,
    rushingYardsAllowed: defenseMetrics?.rushing_yards_allowed ?? 0,
    totalYardsAllowed: (defenseMetrics?.passing_yards_allowed ?? 0) + (defenseMetrics?.rushing_yards_allowed ?? 0),
    rankPassingYardsAllowed: rankings.passingYardsAllowedRanking[teamId] ?? 16,
    rankRushingYardsAllowed: rankings.rushingYardsAllowedRanking[teamId] ?? 16,
    rankTotalYardsAllowed: rankings.totalYardsAllowedRanking[teamId] ?? 16,
    passingTDs: offenseMetrics?.passing_tds ?? 0,
    rushingTDs: offenseMetrics?.rushing_tds ?? 0,
    sacksAllowed: offenseMetrics?.sacks_allowed ?? 0,
    sacksGenerated: defenseMetrics?.sacks_generated ?? 0,
    turnoverDriveRateOffense: offenseMetrics?.turnovers ? offenseMetrics.turnovers / (offenseMetrics.drives_total || 1) : 0,
    turnoverDriveRateDefense: defenseMetrics?.turnovers_forced ? defenseMetrics.turnovers_forced / (offenseMetrics?.drives_total || 1) : 0,
    turnoversForcedCount: defenseMetrics?.turnovers_forced ?? 0,
    tdDriveRateOffense: tdDriveRateOff / 100,
    fgDriveRateOffense: fgDriveRateOff / 100,
    puntDriveRateOffense: puntDriveRateOff / 100,
    thirdDownEfficiencyOffense: thirdDownEffOff / 100,
    rankTdRate: rankings.tdRateRanking[teamId] ?? 16,
    rankFgRate: rankings.fgRateRanking[teamId] ?? 16,
    rankPuntRate: rankings.puntRateRanking[teamId] ?? 16,
    rankThirdDownConv: rankings.thirdDownRanking[teamId] ?? 16,
    tdDriveRateDefense: tdDriveRateDef,
    fgDriveRateDefense: fgDriveRateDef,
    puntDriveRateDefense: puntDriveRateDef,
    thirdDownEfficiencyDefense: thirdDownEffDef,
    rankTdRateAllowed: rankings.tdRateRanking[teamId] ?? 16,
    rankFgRateAllowed: rankings.fgRateRanking[teamId] ?? 16,
    rankPuntRateForced: rankings.puntRateRanking[teamId] ?? 16,
    rankThirdDownStopRate: rankings.thirdDownRanking[teamId] ?? 16,
    penaltiesOffensiveCommittedCount: offenseMetrics?.penalties_count ?? 0,
    penaltiesOffensiveCommittedYards: offenseMetrics?.penalties_yards ?? 0,
    penaltiesOffensiveReceivedCount: offenseMetrics?.penalties_opp_count_opp ?? 0,
    penaltiesOffensiveReceivedYards: offenseMetrics?.penalties_opp_yards_opp ?? 0,
    rankPenaltiesOffensiveCommitted: rankings.penaltiesOffCommittedRanking[teamId] ?? 16,
    rankPenaltiesOffensiveReceived: rankings.penaltiesOffReceivedRanking[teamId] ?? 16,
    penaltiesDefensiveCommittedCount: defenseMetrics?.penalties_count ?? 0,
    penaltiesDefensiveCommittedYards: defenseMetrics?.penalties_yards ?? 0,
    penaltiesDefensiveReceivedCount: defenseMetrics?.penalties_opp_count_opp ?? 0,
    penaltiesDefensiveReceivedYards: defenseMetrics?.penalties_opp_yards_opp ?? 0,
    rankPenaltiesDefensiveCommitted: rankings.penaltiesDefCommittedRanking[teamId] ?? 16,
    rankPenaltiesDefensiveReceived: rankings.penaltiesDefReceivedRanking[teamId] ?? 16,
    leagueAvg,
  };
}

function buildRankingsWithRealData(
  week: number,
  lookups: DataLookups
): PowerRankingResponse[] {
  console.log(`[Power Ranking] Building rankings for week ${week}...`);

  const leagueAvg = calculateLeagueAverages(lookups);
  const rankingsMap = calculateRankings(lookups);
  console.log(`[Power Ranking] League averages + rankings calculated`);

  const rankings = DEFAULT_RANKINGS.map((calc) => {
    const note = powerRankingNotes[calc.teamId];
    const team = TEAM_DATA[calc.teamId];
    const metrics = buildMetrics(calc.teamId, week, lookups, leagueAvg, rankingsMap);
    const epaWeekly = lookups.epaWeekly.get(`${calc.teamId}-w${week}`);

    return {
      id: calc.teamId,
      abbr: team.abbr,
      name: team.name,
      record: team.record,
      color: team.color,
      calculatedRank: calc.calculatedRank,
      adjustedRank: note?.rankingPosition,
      isAdjusted: !!note?.rankingPosition,
      summary: note?.summary,
      epa: epaWeekly?.epa_total ?? calc.epa,
      metrics,
    };
  });

  console.log(`[Power Ranking] Processed ${rankings.length} teams for week ${week}`);
  return rankings;
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const week = parseWeekParam(request);
    const lookups = initializeLookups();
    const rankings = buildRankingsWithRealData(week, lookups);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error("[Power Ranking] Error fetching rankings:", error);
    return NextResponse.json(
      { error: "Error fetching rankings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, rankingPosition, summary } = body;

    if (!teamId || !rankingPosition || !summary) {
      return NextResponse.json(
        { error: "Missing required fields: teamId, rankingPosition, summary" },
        { status: 400 }
      );
    }

    console.log(`[Power Ranking] Updating ${teamId}: rank ${rankingPosition}`);

    powerRankingNotes[teamId] = { rankingPosition, summary };

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Power Ranking] Error saving ranking:", error);
    return NextResponse.json(
      { error: "Error saving ranking" },
      { status: 500 }
    );
  }
}
