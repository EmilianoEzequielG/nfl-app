/**
 * Motor de armado del Power Ranking.
 *
 * Vive fuera de app/api para que lo puedan importar tanto la route de Next
 * como scripts de Node (build-weekly-snapshot). Antes el script duplicaba
 * esta lógica y se fue quedando atrás: seguía usando pass_epa_adj_z como si
 * fuera un percentil y guardaba 10 métricas en vez de las ~50, así que los
 * snapshots congelaban datos que no coincidían con lo que mostraba el API.
 *
 * Nada de acá puede importar next/server ni usar alias de path (@/), porque
 * Node ejecuta este módulo directamente.
 */

import fs from "fs";
import path from "path";
import {
  calculateTeamRankings,
  calculateSubRankings,
  calculateSeasonEpaPercentiles,
  type SeasonEpaPercentiles,
} from "./calculate.ts";
import {
  calculateOffensiveDriveRates,
  calculateDefensiveDriveRates,
  calculateThirdDownEfficiency,
  calculateThirdDownStopRate,
  calculateTotalYards,
  calculateTotalYardsAllowed,
} from "../metrics/calculate.ts";

// ============================================================================
// TYPES
// ============================================================================

export interface OffenseMetrics {
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

export interface DefenseMetrics {
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

export interface EPAPercentileWeekly {
  team: string;
  week: number;
  percentil_ofensivo: number;
  percentil_defensivo: number;
  epa_total: number;
  epa_total_allowed?: number;
}

export interface PowerRankingMetrics {
  epaOffensePercentile: number;
  epaDefensePercentile: number;
  epaOffense: number;
  epaDefense: number;
  rankEpaOffense: number;
  rankEpaDefense: number;

  pointsScored: number;
  pointsAllowed: number;

  passingYards: number;
  rushingYards: number;
  totalYardsOffense: number;
  rankPassingYards: number;
  rankRushingYards: number;
  rankTotalYardsOffense: number;

  passingYardsAllowed: number;
  rushingYardsAllowed: number;
  totalYardsAllowed: number;
  rankPassingYardsAllowed: number;
  rankRushingYardsAllowed: number;
  rankTotalYardsAllowed: number;

  passingTDs: number;
  rushingTDs: number;

  sacksAllowed: number;
  sacksGenerated: number;

  turnoverDriveRateOffense: number;
  turnoverDriveRateDefense: number;
  turnoversForcedCount: number;

  tdDriveRateOffense: number;
  fgDriveRateOffense: number;
  puntDriveRateOffense: number;
  thirdDownEfficiencyOffense: number;
  rankTdRate: number;
  rankFgRate: number;
  rankPuntRate: number;
  rankThirdDownConv: number;

  tdDriveRateDefense: number;
  fgDriveRateDefense: number;
  puntDriveRateDefense: number;
  thirdDownEfficiencyDefense: number;
  rankTdRateAllowed: number;
  rankFgRateAllowed: number;
  rankPuntRateForced: number;
  rankThirdDownStopRate: number;

  penaltiesOffensiveCommittedCount: number;
  penaltiesOffensiveCommittedYards: number;
  penaltiesOffensiveReceivedCount: number;
  penaltiesOffensiveReceivedYards: number;
  rankPenaltiesOffensiveCommitted: number;
  rankPenaltiesOffensiveReceived: number;

  penaltiesDefensiveCommittedCount: number;
  penaltiesDefensiveCommittedYards: number;
  penaltiesDefensiveReceivedCount: number;
  penaltiesDefensiveReceivedYards: number;
  rankPenaltiesDefensiveCommitted: number;
  rankPenaltiesDefensiveReceived: number;

  leagueAvg: {
    pointsScored: number;
    pointsAllowed: number;
    passingYards: number;
    rushingYards: number;
    sacksGenerated: number;
  };
}

export interface TeamData {
  name: string;
  record: string;
  color: string;
  abbr: string;
}

export interface PowerRankingResponse {
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

export interface DataLookups {
  offense: Map<string, OffenseMetrics>;
  defense: Map<string, DefenseMetrics>;
  epaWeekly: Map<string, EPAPercentileWeekly>;
}

// ============================================================================
// DATA
// ============================================================================

export const ALL_TEAM_IDS = ["KC", "BUF", "SF", "PHI", "BAL", "LA", "DEN", "GB", "HOU", "TB", "CIN", "MIA", "LAC", "DAL", "MIN", "IND", "SEA", "WAS", "ARI", "DET", "NO", "ATL", "NE", "TEN", "CAR", "CHI", "NYG", "NYJ", "JAX", "LV", "CLE", "PIT"];

export const TEAM_DATA: Record<string, TeamData> = {
  KC: { name: "Kansas City Chiefs", record: "0-0", color: "#E31828", abbr: "KC" },
  BUF: { name: "Buffalo Bills", record: "0-0", color: "#00338D", abbr: "BUF" },
  SF: { name: "San Francisco 49ers", record: "0-0", color: "#AA0000", abbr: "SF" },
  PHI: { name: "Philadelphia Eagles", record: "0-0", color: "#004687", abbr: "PHI" },
  BAL: { name: "Baltimore Ravens", record: "0-0", color: "#241773", abbr: "BAL" },
  LA: { name: "Los Angeles Rams", record: "0-0", color: "#003594", abbr: "LA" },
  DEN: { name: "Denver Broncos", record: "0-0", color: "#FB4F14", abbr: "DEN" },
  GB: { name: "Green Bay Packers", record: "0-0", color: "#203731", abbr: "GB" },
  HOU: { name: "Houston Texans", record: "0-0", color: "#03202F", abbr: "HOU" },
  TB: { name: "Tampa Bay Buccaneers", record: "0-0", color: "#D50A0A", abbr: "TB" },
  CIN: { name: "Cincinnati Bengals", record: "0-0", color: "#FB4F14", abbr: "CIN" },
  MIA: { name: "Miami Dolphins", record: "0-0", color: "#008E97", abbr: "MIA" },
  LAC: { name: "Los Angeles Chargers", record: "0-0", color: "#0080B4", abbr: "LAC" },
  DAL: { name: "Dallas Cowboys", record: "0-0", color: "#003594", abbr: "DAL" },
  MIN: { name: "Minnesota Vikings", record: "0-0", color: "#4F2683", abbr: "MIN" },
  IND: { name: "Indianapolis Colts", record: "0-0", color: "#002C5F", abbr: "IND" },
  SEA: { name: "Seattle Seahawks", record: "0-0", color: "#002244", abbr: "SEA" },
  WAS: { name: "Washington Commanders", record: "0-0", color: "#5A1414", abbr: "WAS" },
  ARI: { name: "Arizona Cardinals", record: "0-0", color: "#97233F", abbr: "ARI" },
  DET: { name: "Detroit Lions", record: "0-0", color: "#0076B6", abbr: "DET" },
  NO: { name: "New Orleans Saints", record: "0-0", color: "#D3BC8D", abbr: "NO" },
  ATL: { name: "Atlanta Falcons", record: "0-0", color: "#A71930", abbr: "ATL" },
  NE: { name: "New England Patriots", record: "0-0", color: "#002244", abbr: "NE" },
  TEN: { name: "Tennessee Titans", record: "0-0", color: "#0C2C56", abbr: "TEN" },
  CAR: { name: "Carolina Panthers", record: "0-0", color: "#0085CA", abbr: "CAR" },
  CHI: { name: "Chicago Bears", record: "0-0", color: "#0B162A", abbr: "CHI" },
  NYG: { name: "New York Giants", record: "0-0", color: "#0B2340", abbr: "NYG" },
  NYJ: { name: "New York Jets", record: "0-0", color: "#125740", abbr: "NYJ" },
  JAX: { name: "Jacksonville Jaguars", record: "0-0", color: "#006687", abbr: "JAX" },
  LV: { name: "Las Vegas Raiders", record: "0-0", color: "#000000", abbr: "LV" },
  CLE: { name: "Cleveland Browns", record: "0-0", color: "#311D00", abbr: "CLE" },
  PIT: { name: "Pittsburgh Steelers", record: "0-0", color: "#FFB612", abbr: "PIT" },
};

// ============================================================================
// DATA LOADING
// ============================================================================

const dataDir = () => path.join(process.cwd(), "public", "data");

function readJson<T>(fileName: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataDir(), fileName), "utf8")) as T;
}

export function initializeLookups(): DataLookups {
  const offenseData = readJson<OffenseMetrics[]>("offense_season.json");
  const defenseData = readJson<DefenseMetrics[]>("defense_season.json");
  const epaData = readJson<EPAPercentileWeekly[]>("epa_percentile_by_week.json");

  // offense_season.json trae una fila extra sin `team` y con todo en 0. Colada
  // en los mapas, sumaba un elemento fantasma al ranking de percentiles
  // (corriendo un puesto a todo lo que quedaba por debajo) y diluía los
  // promedios de liga. Sólo entran equipos de la lista oficial.
  const validTeams = new Set(ALL_TEAM_IDS);
  const isValid = <T extends { team?: string }>(d: T) => !!d.team && validTeams.has(d.team);

  const offenseValid = offenseData.filter(isValid);
  const defenseValid = defenseData.filter(isValid);
  const epaValid = epaData.filter(isValid);

  const droppedOffense = offenseData.length - offenseValid.length;
  const droppedDefense = defenseData.length - defenseValid.length;
  if (droppedOffense || droppedDefense) {
    console.warn(
      `[Power Ranking] Ignorados ${droppedOffense} registro(s) de ofensiva y ${droppedDefense} de defensiva sin equipo válido`
    );
  }

  const offense = new Map(offenseValid.map((d) => [d.team, d]));
  const defense = new Map(defenseValid.map((d) => [d.team, d]));
  const epaWeekly = new Map(epaValid.map((d) => [`${d.team}-w${d.week}`, d]));

  console.log(`[Power Ranking] Loaded ${offense.size} offense, ${defense.size} defense, ${epaWeekly.size} weekly EPA records`);

  return { offense, defense, epaWeekly };
}

export function loadWeekSummaries(week: number): Record<string, string> {
  try {
    const data = readJson<{ summaries: Record<string, Record<string, string>> }>(
      "power-ranking-summaries.json"
    );
    const summaries = data.summaries[week.toString()] || {};
    const filled = Object.values(summaries).filter((s) => s && s.trim().length > 0).length;
    console.log(`[Power Ranking] Week ${week}: ${filled} summaries with text`);
    return summaries;
  } catch (error) {
    console.error("[Power Ranking] Error loading summaries:", error);
    return {};
  }
}

export function calculateLeagueAverages(lookups: DataLookups): PowerRankingMetrics["leagueAvg"] {
  const offenseValues = Array.from(lookups.offense.values());
  const defenseValues = Array.from(lookups.defense.values());

  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return {
    pointsScored: avg(offenseValues.map((o) => o.points_scored || 0)),
    pointsAllowed: avg(defenseValues.map((d) => d.points_allowed || 0)),
    passingYards: avg(offenseValues.map((o) => o.passing_yards || 0)),
    rushingYards: avg(offenseValues.map((o) => o.rushing_yards || 0)),
    sacksGenerated: avg(defenseValues.map((d) => d.sacks_generated || 0)),
  };
}

// ============================================================================
// METRIC ASSEMBLY
// ============================================================================

export function buildMetrics(
  teamId: string,
  lookups: DataLookups,
  leagueAvg: PowerRankingMetrics["leagueAvg"],
  rankings: ReturnType<typeof calculateSubRankings>,
  seasonPercentiles: Map<string, SeasonEpaPercentiles>
): PowerRankingMetrics {
  const offenseMetrics = lookups.offense.get(teamId);
  const defenseMetrics = lookups.defense.get(teamId);

  if (!offenseMetrics) console.warn(`[Power Ranking] Missing offense data for ${teamId}`);
  if (!defenseMetrics) console.warn(`[Power Ranking] Missing defense data for ${teamId}`);

  // EPA en percentil (0-100) sobre el ACUMULADO de temporada, la misma base que
  // usan las yardas, drives y penalidades. Tomar el percentil de una semana
  // aislada mezclaba una semana suelta con la temporada entera en la misma vista.
  const percentiles = seasonPercentiles.get(teamId) ?? { offense: 50, defense: 50 };

  const passingYards = offenseMetrics?.passing_yards ?? 0;
  const rushingYards = offenseMetrics?.rushing_yards ?? 0;

  const offensiveDrives = calculateOffensiveDriveRates(offenseMetrics ?? {});
  const defensiveDrives = calculateDefensiveDriveRates(defenseMetrics ?? {});
  const thirdDownEffOff = calculateThirdDownEfficiency(offenseMetrics ?? {});
  const thirdDownEffDef = calculateThirdDownStopRate(defenseMetrics ?? {});

  return {
    epaOffensePercentile: percentiles.offense,
    epaDefensePercentile: percentiles.defense,
    epaOffense: offenseMetrics?.total_epa ?? 0,
    epaDefense: defenseMetrics?.total_epa_allowed ?? 0,
    rankEpaOffense: rankings.epaOffenseRanking[teamId] ?? 16,
    rankEpaDefense: rankings.epaDefenseRanking[teamId] ?? 16,
    pointsScored: offenseMetrics?.points_scored ?? 0,
    pointsAllowed: defenseMetrics?.points_allowed ?? 0,
    passingYards,
    rushingYards,
    totalYardsOffense: calculateTotalYards(offenseMetrics ?? {}),
    rankPassingYards: rankings.passingYardsRanking[teamId] ?? 16,
    rankRushingYards: rankings.rushingYardsRanking[teamId] ?? 16,
    rankTotalYardsOffense: rankings.totalYardsRanking[teamId] ?? 16,
    passingYardsAllowed: defenseMetrics?.passing_yards_allowed ?? 0,
    rushingYardsAllowed: defenseMetrics?.rushing_yards_allowed ?? 0,
    totalYardsAllowed: calculateTotalYardsAllowed(defenseMetrics ?? {}),
    rankPassingYardsAllowed: rankings.passingYardsAllowedRanking[teamId] ?? 16,
    rankRushingYardsAllowed: rankings.rushingYardsAllowedRanking[teamId] ?? 16,
    rankTotalYardsAllowed: rankings.totalYardsAllowedRanking[teamId] ?? 16,
    passingTDs: offenseMetrics?.passing_tds ?? 0,
    rushingTDs: offenseMetrics?.rushing_tds ?? 0,
    sacksAllowed: offenseMetrics?.sacks_allowed ?? 0,
    sacksGenerated: defenseMetrics?.sacks_generated ?? 0,
    turnoverDriveRateOffense: offensiveDrives.turnoverDriveRateOffense,
    turnoverDriveRateDefense: defensiveDrives.turnoverDriveRateDefense,
    turnoversForcedCount: defenseMetrics?.turnovers_forced ?? 0,
    tdDriveRateOffense: offensiveDrives.tdDriveRateOffense,
    fgDriveRateOffense: offensiveDrives.fgDriveRateOffense,
    puntDriveRateOffense: offensiveDrives.puntDriveRateOffense,
    thirdDownEfficiencyOffense: thirdDownEffOff,
    rankTdRate: rankings.tdRateRanking[teamId] ?? 16,
    rankFgRate: rankings.fgRateRanking[teamId] ?? 16,
    rankPuntRate: rankings.puntRateRanking[teamId] ?? 16,
    rankThirdDownConv: rankings.thirdDownRanking[teamId] ?? 16,
    tdDriveRateDefense: defensiveDrives.tdDriveRateDefense,
    fgDriveRateDefense: defensiveDrives.fgDriveRateDefense,
    puntDriveRateDefense: defensiveDrives.puntDriveRateDefense,
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

/**
 * Arma el ranking completo de una semana: 32 equipos ordenados por rank,
 * con métricas completas y resumen editorial.
 *
 * Es la única fuente de verdad: la API la sirve por HTTP y el script de
 * snapshot la congela a disco, así que ambos ven exactamente lo mismo.
 */
export function buildWeekRankings(week: number): PowerRankingResponse[] {
  const lookups = initializeLookups();
  const leagueAvg = calculateLeagueAverages(lookups);
  const calculatedRankings = calculateTeamRankings(
    lookups.offense,
    lookups.defense,
    lookups.epaWeekly,
    ALL_TEAM_IDS
  );
  const subRankings = calculateSubRankings(lookups.offense, lookups.defense);
  const seasonPercentiles = calculateSeasonEpaPercentiles(lookups.offense, lookups.defense);
  const weekSummaries = loadWeekSummaries(week);

  const rankings = ALL_TEAM_IDS.map((teamId) => {
    const team = TEAM_DATA[teamId];
    const summary = weekSummaries[teamId] || "";

    return {
      id: teamId,
      abbr: team.abbr,
      name: team.name,
      record: team.record,
      color: team.color,
      calculatedRank: calculatedRankings.get(teamId) || 16,
      adjustedRank: undefined,
      isAdjusted: false,
      summary: summary || undefined,
      epa: lookups.offense.get(teamId)?.total_epa ?? 0,
      metrics: buildMetrics(teamId, lookups, leagueAvg, subRankings, seasonPercentiles),
    };
  });

  return rankings.sort((a, b) => a.calculatedRank - b.calculatedRank);
}
