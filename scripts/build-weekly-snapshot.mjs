#!/usr/bin/env node
/**
 * Build Weekly Power Ranking Snapshot
 *
 * Congela el ranking de una semana completamente:
 * - Rankings calculados reales
 * - Resúmenes editoriales
 * - Todas las métricas
 *
 * Uso:
 *   npm run snapshot week:4
 *   node scripts/build-weekly-snapshot.mjs 4
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

async function buildWeeklySnapshot(week) {
  console.log(`[Snapshot] Building snapshot for week ${week}...`);

  try {
    // Leer datos necesarios
    const offenseSeasonPath = path.join(projectRoot, "public/data/offense_season.json");
    const defenseSeasonPath = path.join(projectRoot, "public/data/defense_season.json");
    const epaPercentilePath = path.join(projectRoot, "public/data/epa_percentile_by_week.json");
    const summariesPath = path.join(projectRoot, "public/data/power-ranking-summaries.json");
    const teamDataPath = path.join(projectRoot, "public/data/team-colors.json");

    const offenseData = JSON.parse(await fs.readFile(offenseSeasonPath, "utf-8"));
    const defenseData = JSON.parse(await fs.readFile(defenseSeasonPath, "utf-8"));
    const epaData = JSON.parse(await fs.readFile(epaPercentilePath, "utf-8"));
    const summaries = JSON.parse(await fs.readFile(summariesPath, "utf-8"));

    // Team data - puede no existir, usamos fallback
    let teamColors = {};
    try {
      teamColors = JSON.parse(await fs.readFile(teamDataPath, "utf-8"));
    } catch (e) {
      console.log("[Snapshot] team-colors.json not found, using defaults");
    }

    const TEAM_DATA = {
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

    const ALL_TEAM_IDS = Object.keys(TEAM_DATA);
    const weekSummaries = summaries.summaries[week.toString()] || {};

    // Crear mapas de búsqueda
    const offenseMap = new Map(offenseData.map((d) => [d.team, d]));
    const defenseMap = new Map(defenseData.map((d) => [d.team, d]));
    const epaMap = new Map(epaData.map((d) => [`${d.team}-w${d.week}`, d]));

    // Calcular rankings reales
    const rankings = [];

    for (const teamId of ALL_TEAM_IDS) {
      const offenseMetrics = offenseMap.get(teamId);
      const defenseMetrics = defenseMap.get(teamId);
      const epaWeekly = epaMap.get(`${teamId}-w${week}`);

      if (!offenseMetrics || !defenseMetrics) {
        console.warn(`[Snapshot] Missing data for ${teamId}, skipping`);
        continue;
      }

      // Calcular score compuesto (mismo que en calculate.ts)
      const epaOffensePercentile = offenseMetrics.pass_epa_adj_z ?? 50;
      const epaDefensePercentile = 100 - (defenseMetrics.pass_epa_adj_z ?? 50);
      const pointsDiff = (offenseMetrics.points_scored ?? 0) - (defenseMetrics.points_allowed ?? 0);
      const thirdDownEff = offenseMetrics.third_down_conversions
        ? (offenseMetrics.third_down_conversions / (offenseMetrics.third_downs_faced || 1)) * 100
        : 50;

      const compositeScore =
        epaOffensePercentile * 0.4 +
        epaDefensePercentile * 0.4 +
        Math.min(pointsDiff * 1.5, 100) * 0.15 +
        Math.min(thirdDownEff, 100) * 0.05;

      rankings.push({
        teamId,
        compositeScore,
        epaOffensePercentile,
        epaDefensePercentile,
      });
    }

    // Ordenar y asignar ranks
    rankings.sort((a, b) => b.compositeScore - a.compositeScore);
    const rankingMap = new Map();
    rankings.forEach((r, idx) => rankingMap.set(r.teamId, idx + 1));

    // Construir snapshot completo
    const snapshot = {
      week,
      timestamp: new Date().toISOString(),
      rankings: ALL_TEAM_IDS.map((teamId) => {
        const team = TEAM_DATA[teamId];
        const offenseMetrics = offenseMap.get(teamId);
        const defenseMetrics = defenseMap.get(teamId);
        const epaWeekly = epaMap.get(`${teamId}-w${week}`);
        const summary = weekSummaries[teamId] || "";

        return {
          id: teamId,
          abbr: team.abbr,
          name: team.name,
          record: team.record,
          color: team.color,
          calculatedRank: rankingMap.get(teamId),
          summary: summary || null,
          epa: epaWeekly?.epa_total ?? 0,
          metrics: {
            epaOffensePercentile: offenseMetrics?.pass_epa_adj_z ?? 50,
            epaDefensePercentile: 100 - (defenseMetrics?.pass_epa_adj_z ?? 50),
            epaOffense: offenseMetrics?.total_epa ?? 0,
            epaDefense: defenseMetrics?.total_epa_allowed ?? 0,
            pointsScored: offenseMetrics?.points_scored ?? 0,
            pointsAllowed: defenseMetrics?.points_allowed ?? 0,
            passingYards: offenseMetrics?.passing_yards ?? 0,
            rushingYards: offenseMetrics?.rushing_yards ?? 0,
            passingYardsAllowed: defenseMetrics?.passing_yards_allowed ?? 0,
            rushingYardsAllowed: defenseMetrics?.rushing_yards_allowed ?? 0,
          },
        };
      }),
    };

    // Crear directorio si no existe
    const snapshotDir = path.join(projectRoot, "public/data/rankings-snapshots");
    await fs.mkdir(snapshotDir, { recursive: true });

    // Escribir snapshot
    const snapshotPath = path.join(snapshotDir, `week-${String(week).padStart(2, "0")}.json`);
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));

    console.log(`[Snapshot] ✓ Created snapshot: ${snapshotPath}`);
    console.log(`[Snapshot] Week ${week} is now frozen with ${snapshot.rankings.length} teams`);
  } catch (error) {
    console.error("[Snapshot] Error:", error.message);
    process.exit(1);
  }
}

const week = process.argv[2];
if (!week || isNaN(parseInt(week))) {
  console.error("Usage: node scripts/build-weekly-snapshot.mjs <week-number>");
  console.error("Example: node scripts/build-weekly-snapshot.mjs 4");
  process.exit(1);
}

await buildWeeklySnapshot(parseInt(week));
