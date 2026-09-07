#!/usr/bin/env node
/**
 * Congela el Power Ranking de una semana.
 *
 * No calcula nada por su cuenta: llama a buildWeekRankings(), el mismo motor
 * que sirve /api/power-ranking. La versión anterior de este script duplicaba
 * la lógica y se fue quedando atrás (usaba pass_epa_adj_z como percentil y
 * guardaba 10 de las ~50 métricas), así que los snapshots congelaban números
 * distintos a los que mostraba la app.
 *
 * Una vez escrito el archivo, la API deja de recalcular esa semana para
 * siempre. Por eso conviene correrlo ANTES de actualizar los JSON de datos,
 * que se sobrescriben en cada corrida de los scripts R.
 *
 * Uso:
 *   npm run snapshot 1
 *   npm run snapshot 1 -- --force    (sobrescribe un snapshot existente)
 */

import fs from "fs";
import path from "path";
import { buildWeekRankings } from "../lib/power-ranking/build.ts";

const projectRoot = process.cwd();

function parseArgs(): { week: number; force: boolean } {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const weekArg = args.find((a) => !a.startsWith("--"));
  const week = weekArg ? parseInt(weekArg, 10) : NaN;

  if (isNaN(week) || week < 1 || week > 18) {
    console.error("Uso: npm run snapshot <semana 1-18> [-- --force]");
    console.error("Ejemplo: npm run snapshot 1");
    process.exit(1);
  }

  return { week, force };
}

function buildSnapshot(week: number, force: boolean) {
  const snapshotDir = path.join(projectRoot, "public", "data", "rankings-snapshots");
  const snapshotPath = path.join(snapshotDir, `week-${String(week).padStart(2, "0")}.json`);

  if (fs.existsSync(snapshotPath) && !force) {
    console.error(`\n✗ La semana ${week} ya está congelada:`);
    console.error(`  ${path.relative(projectRoot, snapshotPath)}`);
    console.error(`\n  Para regenerarla: npm run snapshot ${week} -- --force`);
    process.exit(1);
  }

  console.log(`\n[Snapshot] Congelando semana ${week}...\n`);

  const rankings = buildWeekRankings(week);

  if (rankings.length !== 32) {
    console.error(`\n✗ Se esperaban 32 equipos y se obtuvieron ${rankings.length}. No se escribió nada.`);
    process.exit(1);
  }

  const withSummary = rankings.filter((t) => t.summary && t.summary.trim().length > 0);
  const missing = rankings.filter((t) => !t.summary || t.summary.trim().length === 0);
  const metricCount = Object.keys(rankings[0].metrics).length;

  const snapshot = {
    week,
    timestamp: new Date().toISOString(),
    rankings,
  };

  fs.mkdirSync(snapshotDir, { recursive: true });
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

  console.log(`\n✓ Semana ${week} congelada en ${path.relative(projectRoot, snapshotPath)}`);
  console.log(`  Equipos:   ${rankings.length}`);
  console.log(`  Métricas:  ${metricCount} por equipo`);
  console.log(`  Resúmenes: ${withSummary.length}/32`);
  console.log(`  Top 5:     ${rankings.slice(0, 5).map((t) => `${t.abbr} #${t.calculatedRank}`).join(", ")}`);

  if (missing.length > 0) {
    console.log(`\n⚠ Sin resumen (${missing.length}): ${missing.map((t) => t.abbr).join(", ")}`);
    console.log(`  Quedan congelados vacíos. Completá power-ranking-summaries.json`);
    console.log(`  y volvé a correr con --force si querés incluirlos.`);
  }

  console.log(`\n  A partir de ahora la API sirve este archivo para la semana ${week}`);
  console.log(`  y deja de recalcularla.\n`);
}

const { week, force } = parseArgs();
buildSnapshot(week, force);
