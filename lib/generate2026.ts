// Generar datos mock realistas de 2026
// Corre una vez para generar games_by_week.json

import * as fs from "fs";
import * as path from "path";

const TEAMS = [
  "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN",
  "DET", "GB", "HOU", "IND", "JAX", "KC", "LA", "LAC", "LV", "MIA",
  "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SEA", "SF", "TB",
  "TEN", "WAS"
];

const SCHEDULE = [
  // Semana 1
  { week: 1, home: "KC", away: "BUF", hs: 24, as: 17 },
  { week: 1, home: "SF", away: "DAL", hs: 28, as: 21 },
  { week: 1, home: "PHI", away: "DEN", hs: 31, as: 16 },
  { week: 1, home: "GB", away: "DET", hs: 20, as: 24 },
  { week: 1, home: "TB", away: "NO", hs: 22, as: 18 },
  { week: 1, home: "MIN", away: "SEA", hs: 27, as: 23 },
  { week: 1, home: "LAC", away: "LAR", hs: 25, as: 19 },
  { week: 1, home: "ATL", away: "CAR", hs: 29, as: 14 },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateGameMetrics(teamNum: number) {
  return {
    epa_offense_percentile: randomInt(20, 95),
    epa_offense_value: randomFloat(-5, 5),
    epa_defense_percentile: randomInt(20, 95),
    epa_defense_value: randomFloat(-5, 5),
    scoring_drive_rate: randomFloat(0.25, 0.5),
    td_drive_rate: randomFloat(0.1, 0.25),
    turnover_drive_rate: randomFloat(0.08, 0.2),
    pass_neutral_rate: randomFloat(0.43, 0.53),
    third_down_efficiency: randomFloat(0.3, 0.5),
    penalties_offensive: randomInt(3, 8),
    penalties_defensive: randomInt(2, 6),
  };
}

const gamesData: any[] = [];

SCHEDULE.forEach((game, idx) => {
  gamesData.push({
    game_id: `2026${String(game.week).padStart(2, "0")}${String(idx + 1).padStart(2, "0")}`,
    week: game.week,
    home_team: game.home,
    away_team: game.away,
    home_score: game.hs,
    away_score: game.as,
    status: "final",
    home_metrics: generateGameMetrics(1),
    away_metrics: generateGameMetrics(2),
  });
});

// Escribir el JSON
const outputPath = path.join(process.cwd(), "public/data/games_by_week.json");
fs.writeFileSync(outputPath, JSON.stringify(gamesData, null, 2));

console.log(`✅ Generado: games_by_week.json (${gamesData.length} games)`);
