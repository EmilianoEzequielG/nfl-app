"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loadWeekData } from "@/lib/data";
import { GameModal } from "@/components/GameModal/GameModal";
import { Game } from "@/types";

/**
 * Pagina de un partido puntual, para poder compartir el link de un resultado
 * (por WhatsApp, etc.) en vez de solo poder verlo abriendo la app y buscando
 * la tarjeta a mano. Reutiliza GameModal tal cual - misma vista que se abre
 * desde Partidos, no una duplicada.
 *
 * gameId sigue el formato "{temporada}_{semana}_{visitante}_{local}"
 * (ej. "2026_01_NE_SEA"): la semana se extrae de ahi mismo para saber que
 * archivo de datos pedir, sin necesitar un endpoint aparte.
 */
export function PartidoClient({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let vigente = true;
    async function cargar() {
      const partes = gameId.split("_");
      const semana = parseInt(partes[1], 10);
      if (!Number.isFinite(semana)) {
        if (vigente) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }
      const data = await loadWeekData(semana);
      const encontrado = data?.games.find((g) => g.id === gameId) ?? null;
      if (vigente) {
        setGame(encontrado);
        setNotFound(!encontrado);
        setLoading(false);
      }
    }
    cargar();
    return () => {
      vigente = false;
    };
  }, [gameId]);

  const volver = () => router.push("/");

  if (loading) {
    return (
      <div className="min-h-screen bg-bauhaus-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-bauhaus-black border-t-bauhaus-red animate-spin rounded-none mb-4" />
          <p className="font-black text-lg uppercase">Cargando...</p>
        </div>
      </div>
    );
  }

  if (notFound || !game) {
    return (
      <div className="min-h-screen bg-bauhaus-bg flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Image
            src="/logo2.png"
            alt="Balón Suelto"
            width={120}
            height={60}
            className="h-12 w-auto mx-auto mb-6"
            unoptimized
          />
          <p className="font-black text-xl uppercase mb-2">Partido no encontrado</p>
          <p className="text-sm text-bauhaus-black/60 mb-6">
            El link puede estar mal escrito o ser de una semana que todavía no existe.
          </p>
          <button onClick={volver} className="btn-primary px-6 py-3">
            Ir a Partidos
          </button>
        </div>
      </div>
    );
  }

  // El fondo detras del modal es la propia pagina - GameModal ya trae su
  // overlay oscuro, asi que alcanza con un fondo simple debajo.
  return (
    <div className="min-h-screen bg-bauhaus-bg">
      <GameModal game={game} onClose={volver} />
    </div>
  );
}
