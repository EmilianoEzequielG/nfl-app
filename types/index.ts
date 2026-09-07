export type Team = {
  id: string;
  name: string;
  abbr: string;
  color: string; // hex color
  wins: number;
  losses: number;
};

export type GameMetrics = {
  // EPA percentiles
  epaOffensePercentile: number;
  epaOffenseValue: number;
  epaDefensePercentile: number;
  epaDefenseValue: number;

  // Pass neutral rate
  passNeutralRate: number;

  // Drive rates (offensive perspective)
  scoringDriveRateOffense: number;
  tdDriveRateOffense: number;
  fgDriveRateOffense?: number;
  puntDriveRateOffense?: number;
  turnoverDriveRateOffense: number;

  // Drive rates (defensive perspective - what opponent accomplished against this defense)
  scoringDriveRateDefense: number;
  tdDriveRateDefense: number;
  fgDriveRateDefense?: number;
  puntDriveRateDefense?: number;
  turnoverDriveRateDefense: number;

  // 3rd down efficiency
  thirdDownEfficiencyOffense: number;
  thirdDownEfficiencyDefense: number;

  // Penalties - Offensive perspective (4 facets)
  penaltiesOffensiveCommittedCount?: number;
  penaltiesOffensiveCommittedYards?: number;
  penaltiesOffensiveReceivedCount?: number;
  penaltiesOffensiveReceivedYards?: number;
  rankPenaltiesOffensiveCommitted?: number;
  rankPenaltiesOffensiveReceived?: number;

  // Penalties - Defensive perspective (4 facets)
  penaltiesDefensiveCommittedCount?: number;
  penaltiesDefensiveCommittedYards?: number;
  penaltiesDefensiveReceivedCount?: number;
  penaltiesDefensiveReceivedYards?: number;
  rankPenaltiesDefensiveCommitted?: number;
  rankPenaltiesDefensiveReceived?: number;

  // Legacy fields for backward compatibility
  penaltiesCommittedCount?: number;
  penaltiesCommittedYards?: number;
  penaltiesForcedCount?: number;
  penaltiesForcedYards?: number;

  // Legacy fields for backward compatibility
  penaltiesOffensive?: number;
  penaltiesDefensive?: number;

  // Rankings - Offensive
  rankEpaOffense?: number;
  rankTdRate?: number;
  rankFgRate?: number;
  rankPuntRate?: number;
  rankTurnoverRate?: number;
  rankThirdDownConv?: number;

  // Rankings - Defensive
  rankEpaDefense?: number;
  rankTdRateAllowed?: number;
  rankFgRateAllowed?: number;
  rankPuntRateForced?: number;
  rankTurnoverRateForced?: number;
  rankThirdDownStopRate?: number;
  rankScoringRateAllowed?: number;
};

/** Previa editorial del partido, cargada de public/data/game-previews.json */
export type GamePreview = {
  titulo: string;
  cuando: string;
  /** Horario nocturno o ventana exclusiva; pinta el badge PRIME TIME */
  primeTime: boolean;
  introduccion: string;
  figura: string;
  duelo: string;
  /** Cómo gana cada equipo, indexado por abreviatura */
  comoGana: Record<string, string>;
};

export type Game = {
  id: string;
  week: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  homeMetrics: GameMetrics;
  awayMetrics: GameMetrics;
  gameTime: string;
  status: "scheduled" | "live" | "final";
  dateUTC?: string;
  spreadLine?: string;
  preview?: GamePreview;
};

export type Week = {
  weekNumber: number;
  startDate: string;
  endDate: string;
  games: Game[];
};

export type PowerRankingNote = {
  teamId: string;
  weekNumber: number;
  rank: number;
  title: string;
  content: string;
  updatedAt: string;
};
