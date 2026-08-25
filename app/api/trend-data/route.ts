import { NextRequest, NextResponse } from "next/server";
import epaData from "@/public/data/epa_percentile_by_week.json";
import offenseData from "@/public/data/offense_by_week.json";
import defenseData from "@/public/data/defense_by_week.json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
  }

  const teamEpa = (epaData as any[])
    .filter((d) => d.team === teamId)
    .sort((a, b) => a.week - b.week);

  const teamOffense = (offenseData as any[])
    .filter((d) => d.team === teamId)
    .sort((a, b) => a.week - b.week);

  const teamDefense = (defenseData as any[])
    .filter((d) => d.team === teamId)
    .sort((a, b) => a.week - b.week);

  // Merge all data by week
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
  const trendData = weeks.map((week) => {
    const epa = teamEpa.find((d) => d.week === week);
    const off = teamOffense.find((d) => d.week === week);
    const def = teamDefense.find((d) => d.week === week);

    return {
      week,
      epaOfensivo: epa?.percentil_ofensivo || 0,
      epaDefensivo: epa?.percentil_defensivo || 0,
      epaOffenseValue: off?.total_epa || 0,
      epaDefenseValue: def?.total_epa_allowed || 0,
      scoringDriveRate: off?.scoring_drive_rate || 0,
      thirdDownStopPct: def?.third_down_stop_pct || 0,
    };
  });

  return NextResponse.json(trendData);
}
