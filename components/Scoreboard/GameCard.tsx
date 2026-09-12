"use client";

import { Game } from "@/types";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { getTeamNickname, getTeamCity, formatGameTimeArg, getGameDay, getGameTime } from "@/lib/data";

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  colorIndex?: number;
}

export function GameCard({ game, onSelect, colorIndex = 0 }: GameCardProps) {
  const arrancado = game.status === "final" || game.status === "live";
  const puntosVisita = game.awayScore ?? 0;
  const puntosLocal = game.homeScore ?? 0;

  // Con el partido en marcha el marcador manda: pasa a ser lo mas grande de la
  // tarjeta, y el que va abajo queda atenuado para que se lea de un vistazo.
  const estiloMarcador = (propios: number, ajenos: number): React.CSSProperties => ({
    // Arrancado el partido el marcador es lo mas grande de la tarjeta; antes del
    // kickoff el guion queda chico para no estirar los partidos programados.
    fontSize: arrancado ? "clamp(30px, 9vw, 40px)" : "15px",
    fontWeight: 900,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    marginTop: arrancado ? "2px" : "1px",
    color: arrancado && propios < ajenos ? "rgba(18,18,18,0.35)" : "#121212",
  });

  // El nombre del equipo es un h3 y globals.css lo lleva a 18px como minimo,
  // por encima de cualquier clase de Tailwind: se fija aca.
  const estiloEquipo: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 900,
    lineHeight: 1.1,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  };

  return (
    <button
      onClick={() => onSelect(game)}
      className={`w-full bg-white text-bauhaus-black border-4 border-bauhaus-black p-3 sm:p-6 text-left font-black shadow-geo-lg transition-transform hover:shadow-geo-xl active:translate-x-1 active:translate-y-1 active:shadow-geo-md !bg-white !text-bauhaus-black`}
    >
      <div className="flex items-center justify-between gap-1 sm:gap-4">
        {/* AWAY TEAM */}
        <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-3">
          <div className="flex-shrink-0">
            <Image
              src={`/helmets/${game.awayTeam.abbr}.png`}
              alt={game.awayTeam.abbr}
              width={56}
              height={56}
              className="w-8 h-8 sm:w-14 sm:h-14 object-contain"
              unoptimized={true}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-0.5">
              <span className="text-xs">✈️</span>
              <h3 className="truncate text-bauhaus-black" style={estiloEquipo}>
                {game.awayTeam.abbr}
              </h3>
            </div>
            <p className={`text-xs sm:text-sm text-bauhaus-black/60 truncate hidden sm:block`}>
              {getTeamCity(game.awayTeam.abbr)}
            </p>
            <p style={estiloMarcador(puntosVisita, puntosLocal)}>
              {arrancado ? puntosVisita : "—"}
            </p>
          </div>
        </div>

        {/* CENTER - Status & Time */}
        <div className="text-center flex-shrink-0 px-1 sm:px-2 space-y-0.5 sm:space-y-1">
          {game.status === "live" && (
            <>
              <p className={`text-xs font-black text-bauhaus-red animate-pulse`}>● LIVE</p>
              {game.liveDetail && (
                <p className={`text-[10px] font-bold text-bauhaus-black`}>{game.liveDetail}</p>
              )}
            </>
          )}
          {game.status === "scheduled" && (
            <>
              <p className={`text-xs font-bold text-bauhaus-black uppercase`}>
                {getGameDay(game.dateUTC)}
              </p>
              <p className={`text-xs font-bold text-bauhaus-black`}>
                {getGameTime(game.dateUTC)}
              </p>
              <p className={`text-xs font-bold text-bauhaus-black`}>
                Línea: {game.spreadLine || "—"}
              </p>
            </>
          )}
          {game.status === "final" && (
            <p className={`text-xs text-bauhaus-black opacity-70`}>FINAL</p>
          )}
        </div>

        {/* HOME TEAM */}
        <div className="flex-1 min-w-0 flex items-center justify-end gap-1 sm:gap-3">
          <div className="min-w-0 text-right flex-1">
            <h3 className="truncate text-bauhaus-black" style={estiloEquipo}>
              {game.homeTeam.abbr}
            </h3>
            <p className={`text-xs sm:text-sm text-bauhaus-black/60 truncate hidden sm:block`}>
              {getTeamCity(game.homeTeam.abbr)}
            </p>
            <p style={estiloMarcador(puntosLocal, puntosVisita)}>
              {arrancado ? puntosLocal : "—"}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Image
              src={`/helmets/${game.homeTeam.abbr}.png`}
              alt={game.homeTeam.abbr}
              width={56}
              height={56}
              className="w-8 h-8 sm:w-14 sm:h-14 object-contain"
              unoptimized={true}
            />
          </div>
        </div>

        {/* ARROW */}
        <ChevronRight className={`w-4 h-4 sm:w-6 sm:h-6 text-bauhaus-black flex-shrink-0`} />
      </div>
    </button>
  );
}
