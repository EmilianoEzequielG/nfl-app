"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Scoreboard } from "@/components/Scoreboard/Scoreboard";
import { PowerRanking } from "@/components/PowerRanking/PowerRanking";
import { XOs } from "@/components/XOs/XOs";
import { Week } from "@/types";
import { loadWeekData } from "@/lib/data";
import { ArrowLeft } from "lucide-react";

type Section = "scoreboard" | "power-ranking" | "xos";

export default function Home() {
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeSection, setActiveSection] = useState<Section>("scoreboard");
  const [fumblesData, setFumblesData] = useState<any>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  // Una sola funcion de carga. En modo silencioso no toca `loading`, para que el
  // refresco automatico no reemplace la grilla por el cartel de "Cargando...".
  const cargarSemana = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setLoading(true);
      const data = await loadWeekData(currentWeek);
      setWeek(data);
      setUltimaActualizacion(new Date());
      if (!silencioso) setLoading(false);
    },
    [currentWeek]
  );

  useEffect(() => {
    cargarSemana();
  }, [cargarSemana]);

  // Con partidos en juego el marcador cambia solo; con partidos cuya hora ya
  // paso conviene mirar mas espaciado para detectar el kickoff. Fuera de esos
  // dos casos no se consulta nada, para no pegarle a ESPN de gusto.
  const hayEnVivo = !!week?.games.some((g) => g.status === "live");
  const porArrancar = !!week?.games.some((g) => {
    if (g.status !== "scheduled" || !g.dateUTC) return false;
    const faltan = new Date(g.dateUTC).getTime() - Date.now();
    // Sin el limite inferior, un partido que ya deberia haber arrancado pero
    // quedo con status "scheduled" (por ejemplo, porque el fetch a ESPN vino
    // fallando) daba una resta muy negativa que igual es "< 30 min": el
    // sistema creia para siempre que estaba por arrancar un partido de hace
    // dos dias, en vez de reconocer que algo no esta actualizando el estado.
    return faltan > 0 && faltan < 30 * 60 * 1000;
  });

  useEffect(() => {
    if (activeSection !== "scoreboard") return;
    if (!hayEnVivo && !porArrancar) return;

    const cada = hayEnVivo ? 30_000 : 60_000;
    const id = setInterval(() => cargarSemana(true), cada);
    return () => clearInterval(id);
  }, [hayEnVivo, porArrancar, activeSection, cargarSemana]);

  useEffect(() => {
    async function loadFumbles() {
      try {
        const response = await fetch("/data/fumbles_contador.json");
        const data = await response.json();
        setFumblesData(data);
      } catch (error) {
        console.error("Error loading fumbles data:", error);
      }
    }
    loadFumbles();
  }, []);

  return (
    <div className="min-h-screen bg-bauhaus-bg">
      {/* Navigation Header - Bauhaus */}
      <div className="sticky top-0 z-30 bg-white border-b-4 border-bauhaus-black">
        <div className="container-geo">
          {/* Row 1: Logo + Fumbles */}
          <div className="flex items-center justify-between py-3 gap-2 border-b-2 border-bauhaus-black/10">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo2.png"
                alt="Balón Suelto"
                width={120}
                height={60}
                className="h-10 w-auto sm:h-12"
                priority
                unoptimized
              />
            </div>

            {/* Contador de fumbles: visible tambien en mobile, con tipografia y
                separacion reducidas para que entre al lado del logo */}
            {fumblesData && (
              <div className="flex gap-4 sm:gap-8 flex-shrink-0 border-l-2 border-bauhaus-black/10 pl-3 sm:pl-4">
                <div className="text-center">
                  <p className="m-0 text-[9px] sm:text-[10px] text-[#888] uppercase tracking-wide">Fumbles</p>
                  <p className="mt-0.5 mb-0 font-bold text-xs sm:text-sm text-[#1a1a1a] tabular-nums">
                    {fumblesData.historico.total_fumbles.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="m-0 text-[9px] sm:text-[10px] text-[#888] uppercase tracking-wide">Perdidos</p>
                  <p className="mt-0.5 mb-0 font-bold text-xs sm:text-sm text-[#e74c3c] tabular-nums">
                    {fumblesData.historico.total_fumbles_perdidos.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Tabs */}
          <div className="flex gap-0 divide-x-4 divide-bauhaus-black py-2">
            {[
              { id: "scoreboard" as Section, label: "Partidos" },
              { id: "power-ranking" as Section, label: "Ranking" },
              { id: "xos" as Section, label: "Tácticas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider transition-colors ${
                  activeSection === tab.id
                    ? "bg-bauhaus-red text-white"
                    : "text-bauhaus-black hover:bg-bauhaus-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeSection === "scoreboard" && (
        <div className="section">
          <div className="container-geo">
            {/* Week Controls - Geometric */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
                className="btn-outline px-4 py-3 sm:px-6 text-sm sm:text-base disabled:opacity-30"
              >
                ← ANTERIOR
              </button>
              <button
                onClick={() => setCurrentWeek(Math.min(21, currentWeek + 1))}
                disabled={currentWeek === 21}
                className="btn-outline px-4 py-3 sm:px-6 text-sm sm:text-base disabled:opacity-30"
              >
                PRÓXIMA →
              </button>
            </div>

            {/* Solo cuando hay algo que seguir: avisa que se actualiza sin recargar */}
            {(hayEnVivo || porArrancar) && ultimaActualizacion && (
              <div className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-bauhaus-black/60">
                <span className={hayEnVivo ? "text-bauhaus-red animate-pulse" : ""}>●</span>
                <span>
                  {hayEnVivo ? "En vivo · actualiza solo" : "Por comenzar"} ·{" "}
                  {ultimaActualizacion.toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block w-16 h-16 border-4 border-bauhaus-black border-t-bauhaus-red animate-spin rounded-none mb-4" />
                  <p className="font-black text-lg uppercase">Cargando...</p>
                </div>
              </div>
            ) : week ? (
              <Scoreboard week={week} />
            ) : (
              <div className="text-center py-12">
                <p className="font-black uppercase">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "power-ranking" && <PowerRanking />}
      {activeSection === "xos" && <XOs />}
    </div>
  );
}
