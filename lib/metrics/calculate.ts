/**
 * Shared metric calculation logic used by both Partidos and Power Ranking
 * Ensures data consistency across the app
 */

export interface OffenseData {
  drives_total?: number;
  drives_td?: number;
  drives_fg?: number;
  drives_punt?: number;
  drives_turnover?: number;
  third_down_conversions?: number;
  third_downs_faced?: number;
  passing_yards?: number;
  rushing_yards?: number;
  passing_tds?: number;
  rushing_tds?: number;
  points_scored?: number;
  penalties_count?: number;
  penalties_yards?: number;
  penalties_opp_count_opp?: number;
  penalties_opp_yards_opp?: number;
  total_epa?: number;
  sacks_allowed?: number;
  turnovers?: number;
}

export interface DefenseData {
  drives_faced?: number;
  drives_allowed_score?: number;
  drives_allowed_td?: number;
  drives_allowed_fg?: number;
  drives_forced_punt?: number;
  drives_forced_turnover?: number;
  third_down_stop_rate?: number;
  passing_yards_allowed?: number;
  rushing_yards_allowed?: number;
  points_allowed?: number;
  penalties_count?: number;
  penalties_yards?: number;
  penalties_opp_count_opp?: number;
  penalties_opp_yards_opp?: number;
  total_epa_allowed?: number;
  sacks_generated?: number;
  turnovers_forced?: number;
  td_rate_allowed?: number;
  fg_rate_allowed?: number;
  punt_rate_forced?: number;
}

/**
 * Calculate offensive drive rates from offense data
 * Returns values as decimals (0.0 - 1.0), not percentages
 */
export function calculateOffensiveDriveRates(offenseData: OffenseData) {
  if (!offenseData) {
    console.warn("[calculateOffensiveDriveRates] No offense data provided, returning zeros");
    return {
      tdDriveRateOffense: 0,
      fgDriveRateOffense: 0,
      puntDriveRateOffense: 0,
      turnoverDriveRateOffense: 0,
      scoringDriveRateOffense: 0,
    };
  }

  const drivesTotal = offenseData.drives_total || 1;
  const td = offenseData.drives_td || 0;
  const fg = offenseData.drives_fg || 0;
  const punt = offenseData.drives_punt || 0;
  const turnover = offenseData.drives_turnover || 0;

  const result = {
    tdDriveRateOffense: td / drivesTotal,
    fgDriveRateOffense: fg / drivesTotal,
    puntDriveRateOffense: punt / drivesTotal,
    turnoverDriveRateOffense: turnover / drivesTotal,
    scoringDriveRateOffense: (td + fg) / drivesTotal,
  };

  console.debug("[calculateOffensiveDriveRates]", { drivesTotal, td, fg, result });
  return result;
}

/**
 * Calculate defensive drive rates from defense data
 * Returns values as decimals (0.0 - 1.0), not percentages
 */
export function calculateDefensiveDriveRates(defenseData: DefenseData) {
  const drivesFaced = defenseData.drives_faced || 1;

  return {
    tdDriveRateDefense: defenseData.drives_allowed_td
      ? defenseData.drives_allowed_td / drivesFaced
      : (defenseData.td_rate_allowed || 0) / 100,
    fgDriveRateDefense: defenseData.drives_allowed_fg
      ? defenseData.drives_allowed_fg / drivesFaced
      : (defenseData.fg_rate_allowed || 0) / 100,
    puntDriveRateDefense: defenseData.drives_forced_punt
      ? defenseData.drives_forced_punt / drivesFaced
      : (defenseData.punt_rate_forced || 0) / 100,
    turnoverDriveRateDefense: defenseData.drives_forced_turnover
      ? defenseData.drives_forced_turnover / drivesFaced
      : 0,
    scoringDriveRateDefense: defenseData.drives_faced
      ? (defenseData.drives_allowed_score || 0) / drivesFaced
      : 0,
  };
}

/**
 * Calculate 3rd down efficiency from offense data
 * Returns value as decimal (0.0 - 1.0)
 */
export function calculateThirdDownEfficiency(offenseData: OffenseData) {
  const thirdDownsFaced = offenseData.third_downs_faced || 1;
  const conversions = offenseData.third_down_conversions || 0;
  return conversions / thirdDownsFaced;
}

/**
 * Calculate 3rd down stop rate from defense data
 * Returns value as decimal (0.0 - 1.0)
 */
export function calculateThirdDownStopRate(defenseData: DefenseData) {
  return (defenseData.third_down_stop_rate || 0) / 100;
}

/**
 * Calculate total yards from passing and rushing yards
 */
export function calculateTotalYards(offenseData: OffenseData) {
  return (offenseData.passing_yards || 0) + (offenseData.rushing_yards || 0);
}

/**
 * Calculate total yards allowed from defense data
 */
export function calculateTotalYardsAllowed(defenseData: DefenseData) {
  return (defenseData.passing_yards_allowed || 0) + (defenseData.rushing_yards_allowed || 0);
}
