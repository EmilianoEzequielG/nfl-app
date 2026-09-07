/**
 * GET /api/power-ranking?week=1
 *
 * Devuelve los 32 equipos ordenados por ranking, con métricas completas y
 * resumen editorial de esa semana.
 *
 * FLUJO:
 * 1. Si existe public/data/rankings-snapshots/week-XX.json, se devuelve tal
 *    cual: esa semana ya está cerrada y no se recalcula nunca más.
 * 2. Si no existe, se calcula en vivo con buildWeekRankings().
 *
 * Toda la lógica de cálculo vive en lib/power-ranking/build.ts, que también
 * usa scripts/build-weekly-snapshot.mts. Así el snapshot congela exactamente
 * lo mismo que servía la API, sin que las dos implementaciones se separen.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildWeekRankings } from "@/lib/power-ranking/build";

function parseWeekParam(request: NextRequest): number {
  const weekParam = request.nextUrl.searchParams.get("week");
  const week = weekParam ? parseInt(weekParam) : 1;

  if (isNaN(week) || week < 1 || week > 18) {
    console.warn(`[Power Ranking] Invalid week parameter: ${weekParam}, using default week 1`);
    return 1;
  }

  return week;
}

export async function GET(request: NextRequest) {
  try {
    const week = parseWeekParam(request);

    // Semana ya congelada: devolver el snapshot sin recalcular
    try {
      const snapshotModule = await import(
        `@/public/data/rankings-snapshots/week-${String(week).padStart(2, "0")}.json`
      );
      console.log(`[Power Ranking] Using frozen snapshot for week ${week}`);
      return NextResponse.json(
        snapshotModule.rankings || snapshotModule.default?.rankings || snapshotModule.default
      );
    } catch {
      console.log(`[Power Ranking] No snapshot for week ${week}, calculating live...`);
    }

    const rankings = buildWeekRankings(week);
    console.log(`[Power Ranking] Processed ${rankings.length} teams for week ${week}`);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error("[Power Ranking] Error:", error);
    return NextResponse.json({ error: "Failed to build power ranking" }, { status: 500 });
  }
}
