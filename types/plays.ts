export type PlayType = "pass" | "run" | "penalty" | "sack" | "interception" | "fumble" | "td";

export type PlayResult = "success" | "incomplete" | "sacked" | "tackled" | "td";

export interface Player {
  name: string;
  number: number;
  position: string;
}

export interface PlayDiagram {
  // Coordenadas en la cancha (0-100, donde 0 es una end zone y 100 es la otra)
  playerPositions: Array<{
    team: "offense" | "defense";
    x: number;
    y: number;
    player: Player;
    assignment?: string; // ej: "WR1", "MLB", etc
  }>;
  ballPath?: Array<{ x: number; y: number }>; // Trayectoria del balón
  routes?: Array<{
    player: Player;
    path: Array<{ x: number; y: number }>;
  }>;
}

export interface Play {
  id: string;
  week: number;
  game_id: string;
  quarter: number;
  time: string; // "12:34"
  down: number;
  yards_to_go: number;
  yard_line: number; // 0-100

  offense_team: string;
  defense_team: string;

  play_type: PlayType;
  result: PlayResult;
  yards_gained?: number;

  qb?: Player;
  receiver?: Player;
  rusher?: Player;
  defender?: Player;

  description: string; // Descripción en texto
  diagram: PlayDiagram; // Diagrama visual

  analysis: {
    concept: string; // "4 Verts", "Power Run", "Cover 2 Beater", etc
    success: boolean;
    reason: string; // Por qué fue exitosa o no
  };
}

export interface XOsGame {
  game_id: string;
  week: number;
  home_team: string;
  away_team: string;
  plays: Play[];
}
