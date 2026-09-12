import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { PartidoClient } from "./PartidoClient";

interface GameRow {
  game_id: string;
  week: number;
  home_team: string;
  away_team: string;
  home_score: string | number;
  away_score: string | number;
  status: string;
}

function buscarPartido(gameId: string): GameRow | null {
  try {
    const ruta = path.join(process.cwd(), "public", "data", "games_by_week.json");
    const juegos: GameRow[] = JSON.parse(fs.readFileSync(ruta, "utf8"));
    return juegos.find((g) => g.game_id === gameId) ?? null;
  } catch {
    return null;
  }
}

/**
 * Metadata dinamica para que el link de un partido puntual se vea bien al
 * compartirlo (WhatsApp, etc.) en vez de mostrar el titulo generico del
 * sitio. No usa el marcador en vivo de ESPN - alcanza con equipos y semana,
 * sin depender de un fetch adicional solo para armar la preview del link.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameId: string }>;
}): Promise<Metadata> {
  const { gameId } = await params;
  const partido = buscarPartido(gameId);

  if (!partido) {
    return { title: "Partido no encontrado - Balón Suelto" };
  }

  const titulo = `${partido.away_team} @ ${partido.home_team} — Semana ${partido.week}`;

  return {
    title: `${titulo} - Balón Suelto`,
    openGraph: {
      title: titulo,
      siteName: "Balón Suelto",
      description: `Resultado, resumen y estadísticas de ${partido.away_team} @ ${partido.home_team}.`,
      type: "website",
    },
  };
}

export default async function PartidoPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  return <PartidoClient gameId={gameId} />;
}
