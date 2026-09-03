"use client";

import { useState } from "react";
import { Game, Week } from "@/types";
import { GameCard } from "./GameCard";
import { GameModal } from "@/components/GameModal/GameModal";
import { Zap } from "lucide-react";

interface ScoreboardProps {
  week: Week;
}

export function Scoreboard({ week }: ScoreboardProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleSelectGame = (game: Game) => {
    console.log("🎬 Modal: Abriendo modal para:", game.awayTeam.abbr, "vs", game.homeTeam.abbr);
    setSelectedGame(game);
  };

  console.log("📋 Scoreboard - selectedGame:", selectedGame ? `${selectedGame.awayTeam.abbr} vs ${selectedGame.homeTeam.abbr}` : "null");

  return (
    <>
      {/* HEADER - Bauhaus */}
      <div className="bg-white border-b-4 border-bauhaus-black mb-8">
        <div className="container-geo py-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-bauhaus-red" />
            <h1 className="h1 text-display-lg">Semana {week.weekNumber}</h1>
          </div>
        </div>
      </div>

      {/* GAMES LIST - Bauhaus */}
      <div className="container-geo space-y-4 sm:space-y-8 pb-8">
        {week.games.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="font-black text-lg uppercase">No hay partidos disponibles</p>
          </div>
        ) : (
          week.games.map((game, idx) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={handleSelectGame}
              colorIndex={idx}
            />
          ))
        )}
      </div>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </>
  );
}
