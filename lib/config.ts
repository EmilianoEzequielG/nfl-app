// Centralized configuration for NFL app
export const CURRENT_STATS_SEASON = 2025;

// Map season to JSON directory
export const getStatsDirectory = (season: number = CURRENT_STATS_SEASON): string => {
  return `/data`; // All stats are in /public/data and nfl_json_2025
};

// Stats file paths
export const STATS_FILES = {
  offense_season: `offense_season.json`,
  defense_season: `defense_season.json`,
  epa_percentile: `epa_percentile_by_week.json`,
} as const;
