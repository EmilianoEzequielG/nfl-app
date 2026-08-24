import { Week, Game, GameMetrics } from "@/types";
import { CURRENT_STATS_SEASON } from "./config";

const teamColors: Record<string, string> = {
  ARI: "#97233F",
  ATL: "#A71930",
  BAL: "#241773",
  BUF: "#00338D",
  CAR: "#0085CA",
  CHI: "#0B162A",
  CIN: "#FB4F14",
  CLE: "#311D00",
  DAL: "#003594",
  DEN: "#FB4F14",
  DET: "#0076B6",
  GB: "#203731",
  HOU: "#03202F",
  IND: "#002C5F",
  JAX: "#006687",
  KC: "#E31828",
  LA: "#003594",
  LAC: "#0080C6",
  LV: "#000000",
  MIA: "#008E97",
  MIN: "#4F2683",
  NE: "#002244",
  NO: "#D3BC8D",
  NYG: "#0B2340",
  NYJ: "#125740",
  PHI: "#004687",
  PIT: "#27251F",
  SEA: "#002244",
  SF: "#AA0000",
  TB: "#092C5A",
  TEN: "#0C2C56",
  WAS: "#5A1D36",
};

const teamNames: Record<string, string> = {
  ARI: "Arizona Cardinals",
  ATL: "Atlanta Falcons",
  BAL: "Baltimore Ravens",
  BUF: "Buffalo Bills",
  CAR: "Carolina Panthers",
  CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals",
  CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys",
  DEN: "Denver Broncos",
  DET: "Detroit Lions",
  GB: "Green Bay Packers",
  HOU: "Houston Texans",
  IND: "Indianapolis Colts",
  JAX: "Jacksonville Jaguars",
  KC: "Kansas City Chiefs",
  LA: "Los Angeles Rams",
  LAC: "Los Angeles Chargers",
  LV: "Las Vegas Raiders",
  MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings",
  NE: "New England Patriots",
  NO: "New Orleans Saints",
  NYG: "New York Giants",
  NYJ: "New York Jets",
  PHI: "Philadelphia Eagles",
  PIT: "Pittsburgh Steelers",
  SEA: "Seattle Seahawks",
  SF: "San Francisco 49ers",
  TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans",
  WAS: "Washington Commanders",
};

const teamNicknames: Record<string, string> = {
  ARI: "CARDINALS",
  ATL: "FALCONS",
  BAL: "RAVENS",
  BUF: "BILLS",
  CAR: "PANTHERS",
  CHI: "BEARS",
  CIN: "BENGALS",
  CLE: "BROWNS",
  DAL: "COWBOYS",
  DEN: "BRONCOS",
  DET: "LIONS",
  GB: "PACKERS",
  HOU: "TEXANS",
  IND: "COLTS",
  JAX: "JAGUARS",
  KC: "CHIEFS",
  LA: "RAMS",
  LAC: "CHARGERS",
  LV: "RAIDERS",
  MIA: "DOLPHINS",
  MIN: "VIKINGS",
  NE: "PATRIOTS",
  NO: "SAINTS",
  NYG: "GIANTS",
  NYJ: "JETS",
  PHI: "EAGLES",
  PIT: "STEELERS",
  SEA: "SEAHAWKS",
  SF: "49ERS",
  TB: "BUCCANEERS",
  TEN: "TITANS",
  WAS: "COMMANDERS",
};

const teamCities: Record<string, string> = {
  ARI: "Arizona",
  ATL: "Atlanta",
  BAL: "Baltimore",
  BUF: "Buffalo",
  CAR: "Carolina",
  CHI: "Chicago",
  CIN: "Cincinnati",
  CLE: "Cleveland",
  DAL: "Dallas",
  DEN: "Denver",
  DET: "Detroit",
  GB: "Green Bay",
  HOU: "Houston",
  IND: "Indianapolis",
  JAX: "Jacksonville",
  KC: "Kansas City",
  LA: "Los Angeles",
  LAC: "Los Angeles",
  LV: "Las Vegas",
  MIA: "Miami",
  MIN: "Minnesota",
  NE: "New England",
  NO: "New Orleans",
  NYG: "New York",
  NYJ: "New York",
  PHI: "Philadelphia",
  PIT: "Pittsburgh",
  SEA: "Seattle",
  SF: "San Francisco",
  TB: "Tampa Bay",
  TEN: "Tennessee",
  WAS: "Washington",
};

export function getTeamNickname(abbr: string): string {
  return teamNicknames[abbr] || abbr;
}

export function getTeamCity(abbr: string): string {
  return teamCities[abbr] || abbr;
}

export function formatGameTimeArg(dateStr: string | undefined): string {
  if (!dateStr) return "TBD";
  try {
    const date = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === "day")?.value || "00";
    const month = parts.find((p) => p.type === "month")?.value || "00";
    const year = parts.find((p) => p.type === "year")?.value || "0000";
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    return `${day}/${month}/${year} ${hour}:${minute}`;
  } catch {
    return "TBD";
  }
}

// Calculate all penalty rankings (lower count = better = higher rank)
function calculateAllPenaltyRankings(offenseData: any[], defenseData: any[]) {
  const rankings = {
    offensiveCommitted: {} as Record<string, number>,
    offensiveReceived: {} as Record<string, number>,
    defensiveCommitted: {} as Record<string, number>,
    defensiveReceived: {} as Record<string, number>,
  };

  // Offensive penalties committed (from offense JSON)
  const offCommitted = offenseData.map(t => ({ team: t.team, count: t.penalties_count || 0 }))
    .sort((a, b) => a.count - b.count);
  offCommitted.forEach((t, i) => rankings.offensiveCommitted[t.team] = i + 1);

  // Offensive penalties received (from offense JSON)
  const offReceived = offenseData.map(t => ({ team: t.team, count: t.penalties_opp_count_opp || 0 }))
    .sort((a, b) => a.count - b.count);
  offReceived.forEach((t, i) => rankings.offensiveReceived[t.team] = i + 1);

  // Defensive penalties committed (from defense JSON)
  const defCommitted = defenseData.map(t => ({ team: t.team, count: t.penalties_count || 0 }))
    .sort((a, b) => a.count - b.count);
  defCommitted.forEach((t, i) => rankings.defensiveCommitted[t.team] = i + 1);

  // Defensive penalties received (from defense JSON)
  const defReceived = defenseData.map(t => ({ team: t.team, count: t.penalties_opp_count_opp || 0 }))
    .sort((a, b) => a.count - b.count);
  defReceived.forEach((t, i) => rankings.defensiveReceived[t.team] = i + 1);

  return rankings;
}

// Load seasonal stats to enrich game metrics
async function loadSeasonalStats(season: number = CURRENT_STATS_SEASON) {
  try {
    console.log("🔄 Starting seasonal stats load...");

    const offenseRes = await fetch(`/data/offense_season.json`);
    const defenseRes = await fetch(`/data/defense_season.json`);

    if (!offenseRes.ok) {
      console.error("❌ Failed to load offense_season.json:", offenseRes.status);
      return { offenseMap: {}, defenseMap: {}, offensePenaltyRanks: {}, defensePenaltyRanks: {} };
    }
    if (!defenseRes.ok) {
      console.error("❌ Failed to load defense_season.json:", defenseRes.status);
      return { offenseMap: {}, defenseMap: {}, offensePenaltyRanks: {}, defensePenaltyRanks: {} };
    }

    const offense = await offenseRes.json();
    const defense = await defenseRes.json();

    // Map to team abbreviation for quick lookup
    const offenseMap: Record<string, any> = {};
    const defenseMap: Record<string, any> = {};

    offense.forEach((team: any) => {
      offenseMap[team.team] = team;
    });
    defense.forEach((team: any) => {
      defenseMap[team.team] = team;
    });

    // Calculate penalty rankings
    const penaltyRankings = calculateAllPenaltyRankings(offense, defense);

    console.log("✅ Seasonal stats loaded. Offense teams:", Object.keys(offenseMap).length, "Defense teams:", Object.keys(defenseMap).length);
    return { offenseMap, defenseMap, penaltyRankings };
  } catch (error) {
    console.error("❌ Error loading seasonal stats:", error);
    return { offenseMap: {}, defenseMap: {}, offensePenaltyRanks: {}, defensePenaltyRanks: {} };
  }
}

// Enrich game metrics with seasonal data
function enrichMetricsWithSeasonalData(
  teamAbbr: string,
  offenseMap: Record<string, any>,
  defenseMap: Record<string, any>,
  penaltyRankings?: any
): Partial<GameMetrics> {
  const teamOffenseData = offenseMap[teamAbbr] || {};
  const teamDefenseData = defenseMap[teamAbbr] || {};

  console.log(`📝 Enriching ${teamAbbr}:`, {
    hasRankings: !!penaltyRankings,
    offCommittedRank: penaltyRankings?.offensiveCommitted?.[teamAbbr],
    defCommittedRank: penaltyRankings?.defensiveCommitted?.[teamAbbr],
  });

  const enriched = {
    // ===== OFFENSIVE STATS (what this team does) =====

    // Drive outcomes (offensive) - calculated from drives
    scoringDriveRateOffense: teamOffenseData.drives_total ? teamOffenseData.drives_score / teamOffenseData.drives_total : 0.45,
    tdDriveRateOffense: teamOffenseData.drives_total ? teamOffenseData.drives_td / teamOffenseData.drives_total : 0.30,
    fgDriveRateOffense: teamOffenseData.drives_total ? teamOffenseData.drives_fg / teamOffenseData.drives_total : 0.15,
    puntDriveRateOffense: teamOffenseData.drives_total ? teamOffenseData.drives_punt / teamOffenseData.drives_total : 0.20,
    turnoverDriveRateOffense: teamOffenseData.drives_total ? teamOffenseData.drives_turnover / teamOffenseData.drives_total : 0.05,

    // 3rd down efficiency (offensive)
    thirdDownEfficiencyOffense: teamOffenseData.third_down_conv_rate ? teamOffenseData.third_down_conv_rate / 100 : 0.35,

    // Pass neutral rate (use neutral pass pct)
    passNeutralRate: teamOffenseData.neutral_pass_pct ? teamOffenseData.neutral_pass_pct / 100 : 0.50,

    // EPA percentiles & values (offensive)
    epaOffensePercentile: teamOffenseData.rank_total_epa ? Math.round((100 * (32 - teamOffenseData.rank_total_epa)) / 31) : 50,
    epaOffenseValue: teamOffenseData.total_epa || 0,

    // Penalties - Offensive (what team commits/receives in offense)
    penaltiesOffensiveCommittedCount: teamOffenseData.penalties_count || 0,
    penaltiesOffensiveCommittedYards: teamOffenseData.penalties_yards || 0,
    penaltiesOffensiveReceivedCount: teamOffenseData.penalties_opp_count_opp || 0,
    penaltiesOffensiveReceivedYards: teamOffenseData.penalties_opp_yards_opp || 0,
    rankPenaltiesOffensiveCommitted: penaltyRankings?.offensiveCommitted?.[teamAbbr],
    rankPenaltiesOffensiveReceived: penaltyRankings?.offensiveReceived?.[teamAbbr],

    // Legacy fields for backward compatibility
    penaltiesCommittedCount: teamOffenseData.penalties_count || 0,
    penaltiesCommittedYards: teamOffenseData.penalties_yards || 0,

    // Rankings (offensive)
    rankTdRate: teamOffenseData.rank_td_rate,
    rankFgRate: teamOffenseData.rank_fg_rate,
    rankPuntRate: teamOffenseData.rank_punt_rate,
    rankTurnoverRate: teamOffenseData.rank_turnover_rate,
    rankThirdDownConv: teamOffenseData.rank_third_down_conv,
    rankEpaOffense: teamOffenseData.rank_total_epa,

    // ===== DEFENSIVE STATS (what this team's defense allows) =====

    // Drive outcomes (defensive - what opponent accomplished against this defense)
    scoringDriveRateDefense: teamDefenseData.drives_faced ? teamDefenseData.drives_allowed_score / teamDefenseData.drives_faced : 0.45,
    tdDriveRateDefense: teamDefenseData.drives_faced ? teamDefenseData.drives_allowed_td / teamDefenseData.drives_faced : 0.30,
    fgDriveRateDefense: teamDefenseData.drives_faced ? teamDefenseData.drives_allowed_fg / teamDefenseData.drives_faced : 0.16,
    puntDriveRateDefense: teamDefenseData.drives_faced ? teamDefenseData.drives_forced_punt / teamDefenseData.drives_faced : 0.21,
    turnoverDriveRateDefense: teamDefenseData.drives_faced ? teamDefenseData.drives_forced_turnover / teamDefenseData.drives_faced : 0.05,

    // 3rd down efficiency (defensive - stop rate)
    thirdDownEfficiencyDefense: teamDefenseData.third_down_stop_rate ? teamDefenseData.third_down_stop_rate / 100 : 0.65,

    // EPA percentiles & values (defensive)
    epaDefensePercentile: teamDefenseData.rank_total_epa_allowed ? Math.round((100 * (32 - teamDefenseData.rank_total_epa_allowed)) / 31) : 50,
    epaDefenseValue: teamDefenseData.total_epa_allowed || 0,

    // Penalties - Defensive (what team commits/receives in defense)
    penaltiesDefensiveCommittedCount: teamDefenseData.penalties_count || 0,
    penaltiesDefensiveCommittedYards: teamDefenseData.penalties_yards || 0,
    penaltiesDefensiveReceivedCount: teamDefenseData.penalties_opp_count_opp || 0,
    penaltiesDefensiveReceivedYards: teamDefenseData.penalties_opp_yards_opp || 0,
    rankPenaltiesDefensiveCommitted: penaltyRankings?.defensiveCommitted?.[teamAbbr],
    rankPenaltiesDefensiveReceived: penaltyRankings?.defensiveReceived?.[teamAbbr],

    // Legacy fields for backward compatibility
    penaltiesForcedCount: teamDefenseData.penalties_opp_count_opp || 0,
    penaltiesForcedYards: teamDefenseData.penalties_opp_yards_opp || 0,

    // Rankings (defensive)
    rankEpaDefense: teamDefenseData.rank_total_epa_allowed,
    rankTdRateAllowed: teamDefenseData.rank_td_rate_allowed,
    rankFgRateAllowed: teamDefenseData.rank_fg_rate_allowed,
    rankPuntRateForced: teamDefenseData.rank_punt_rate_forced,
    rankTurnoverRateForced: teamDefenseData.rank_turnover_rate_forced,
    rankThirdDownStopRate: teamDefenseData.rank_third_down_stop_rate,
    rankScoringRateAllowed: teamDefenseData.rank_score_rate_allowed,
  };

  return enriched;
}

export async function loadWeekData(week: number): Promise<Week | null> {
  try {
    // Load seasonal stats for enrichment
    const { offenseMap, defenseMap, penaltyRankings } = await loadSeasonalStats();

    // Cargar schedule base
    const response = await fetch("/data/games_by_week.json");
    let allGames: any[] = await response.json();

    // Intentar obtener scores en vivo desde ESPN
    try {
      const espnResponse = await fetch("/api/espn?endpoint=scoreboard");
      if (espnResponse.ok) {
        const espnData = await espnResponse.json();
        allGames = mergeESPNScores(allGames, espnData);
      }
    } catch (error) {
      console.log("ESPN scores no disponibles, usando schedule base");
    }

    const weekGames = allGames
      .filter((g) => g.week === week)
      .map((g) => {
        const homeTeam = {
          id: g.home_team,
          name: teamNames[g.home_team] || g.home_team,
          abbr: g.home_team,
          color: teamColors[g.home_team] || "#000000",
          wins: 0,
          losses: 0,
        };

        const awayTeam = {
          id: g.away_team,
          name: teamNames[g.away_team] || g.away_team,
          abbr: g.away_team,
          color: teamColors[g.away_team] || "#000000",
          wins: 0,
          losses: 0,
        };

        return {
          id: g.game_id,
          week: g.week,
          homeTeam,
          awayTeam,
          homeScore: g.home_score,
          awayScore: g.away_score,
          status: g.status,
          gameTime: "TBD",
          homeMetrics: {
            epaOffensePercentile: g.home_metrics.epa_offense_percentile,
            epaOffenseValue: g.home_metrics.epa_offense_value,
            epaDefensePercentile: g.home_metrics.epa_defense_percentile,
            epaDefenseValue: g.home_metrics.epa_defense_value,
            passNeutralRate: g.home_metrics.pass_neutral_rate,
            scoringDriveRateOffense: g.home_metrics.scoring_drive_rate,
            scoringDriveRateDefense:
              g.away_metrics.scoring_drive_rate > 0.3
                ? g.away_metrics.scoring_drive_rate
                : 0.28,
            tdDriveRateOffense: g.home_metrics.td_drive_rate,
            tdDriveRateDefense: g.away_metrics.td_drive_rate || 0.15,
            turnoverDriveRateOffense: g.home_metrics.turnover_drive_rate,
            turnoverDriveRateDefense: g.away_metrics.turnover_drive_rate || 0.12,
            thirdDownEfficiencyOffense:
              1 - (g.away_metrics.third_down_efficiency || 0.35),
            thirdDownEfficiencyDefense: g.home_metrics.third_down_efficiency || 0.35,
            penaltiesOffensive: g.home_metrics.penalties_offensive,
            penaltiesDefensive: g.home_metrics.penalties_defensive,
            ...enrichMetricsWithSeasonalData(g.home_team, offenseMap, defenseMap, penaltyRankings),
          },
          awayMetrics: {
            epaOffensePercentile: g.away_metrics.epa_offense_percentile,
            epaOffenseValue: g.away_metrics.epa_offense_value,
            epaDefensePercentile: g.away_metrics.epa_defense_percentile,
            epaDefenseValue: g.away_metrics.epa_defense_value,
            passNeutralRate: g.away_metrics.pass_neutral_rate,
            scoringDriveRateOffense: g.away_metrics.scoring_drive_rate,
            scoringDriveRateDefense:
              g.home_metrics.scoring_drive_rate > 0.3
                ? g.home_metrics.scoring_drive_rate
                : 0.28,
            tdDriveRateOffense: g.away_metrics.td_drive_rate,
            tdDriveRateDefense: g.home_metrics.td_drive_rate || 0.15,
            turnoverDriveRateOffense: g.away_metrics.turnover_drive_rate,
            turnoverDriveRateDefense: g.home_metrics.turnover_drive_rate || 0.12,
            thirdDownEfficiencyOffense:
              1 - (g.home_metrics.third_down_efficiency || 0.35),
            thirdDownEfficiencyDefense: g.away_metrics.third_down_efficiency || 0.35,
            penaltiesOffensive: g.away_metrics.penalties_offensive,
            penaltiesDefensive: g.away_metrics.penalties_defensive,
            ...enrichMetricsWithSeasonalData(g.away_team, offenseMap, defenseMap, penaltyRankings),
          },
          dateUTC: g.date_utc,
          spreadLine: g.spread_line,
        } as Game;
      });

    if (weekGames.length === 0) return null;

    return {
      weekNumber: week,
      startDate: `2025-09-${4 + week * 7}`,
      endDate: `2025-09-${11 + week * 7}`,
      games: weekGames,
    };
  } catch (error) {
    console.error("Error loading week data:", error);
    return null;
  }
}

function mergeESPNScores(scheduleGames: any[], espnData: any): any[] {
  if (!espnData?.events) return scheduleGames;

  return scheduleGames.map((game) => {
    // Buscar el evento correspondiente en ESPN
    const espnEvent = espnData.events?.find(
      (event: any) =>
        event.competitions?.[0]?.home?.team?.abbreviation === game.home_team &&
        event.competitions?.[0]?.away?.team?.abbreviation === game.away_team
    );

    if (espnEvent) {
      const comp = espnEvent.competitions[0];
      const homeScore = parseInt(comp.home?.score || "0");
      const awayScore = parseInt(comp.away?.score || "0");
      const status = comp.status?.type === "STATUS_FINAL" ? "final" :
                     comp.status?.type === "STATUS_IN_PROGRESS" ? "live" : "scheduled";

      return {
        ...game,
        home_score: homeScore,
        away_score: awayScore,
        status: status,
        date_utc: espnEvent.date,
      };
    }

    return game;
  });
}
