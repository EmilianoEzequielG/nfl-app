import { NextRequest, NextResponse } from "next/server";

// Default rankings si no hay datos personalizados
const DEFAULT_RANKINGS = [
  { teamId: "KC", calculatedRank: 1, epa: 8.5 },
  { teamId: "BUF", calculatedRank: 2, epa: 7.8 },
  { teamId: "SF", calculatedRank: 3, epa: 7.6 },
  { teamId: "PHI", calculatedRank: 4, epa: 7.4 },
  { teamId: "BAL", calculatedRank: 5, epa: 7.1 },
  { teamId: "LAR", calculatedRank: 6, epa: 6.8 },
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
  { teamId: "IND", calculatedRank: 31, epa: -0.7 },
  { teamId: "PHI", calculatedRank: 32, epa: -1.0 },
];

// Simulación de base de datos local (en producción usar Postgres)
const powerRankingNotes: Record<string, { rankingPosition?: number; summary?: string }> = {
  KC: {
    rankingPosition: 1,
    summary:
      "Los Chiefs mantienen el liderato con un equipo equilibrado. Mahomes jugando a MVP level en los momentos decisivos.",
  },
  BUF: {
    rankingPosition: 2,
    summary:
      "Buffalo sigue siendo una amenaza real en el Este. La defensa se ha mejorado significativamente en las últimas semanas.",
  },
  SF: {
    rankingPosition: 3,
    summary:
      "San Francisco sigue siendo el equipo más completo. Su defensa es de élite y el ataque maneja bien los tiempos.",
  },
};

const TEAM_DATA: Record<
  string,
  { name: string; record: string; color: string; abbr: string }
> = {
  KC: { name: "Kansas City Chiefs", record: "11-3", color: "#E31828", abbr: "KC" },
  BUF: { name: "Buffalo Bills", record: "10-4", color: "#00338D", abbr: "BUF" },
  SF: { name: "San Francisco 49ers", record: "10-4", color: "#AA0000", abbr: "SF" },
  PHI: { name: "Philadelphia Eagles", record: "10-4", color: "#004687", abbr: "PHI" },
  BAL: { name: "Baltimore Ravens", record: "9-5", color: "#241773", abbr: "BAL" },
  LAR: { name: "Los Angeles Rams", record: "9-5", color: "#003594", abbr: "LAR" },
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
};

export async function GET() {
  try {
    // Combinar datos calculados con notas ajustadas
    const rankings = DEFAULT_RANKINGS.map((calc) => {
      const note = powerRankingNotes[calc.teamId];
      const team = TEAM_DATA[calc.teamId];

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
        epa: calc.epa,
      };
    });

    return NextResponse.json(rankings);
  } catch (error) {
    console.error("Error fetching rankings:", error);
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
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Guardar en la "base de datos" simulada
    powerRankingNotes[teamId] = {
      rankingPosition,
      summary,
    };

    // En producción, guardar en Postgres
    // await updatePowerRankingNote(teamId, rankingPosition, summary);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving ranking:", error);
    return NextResponse.json(
      { error: "Error saving ranking" },
      { status: 500 }
    );
  }
}
