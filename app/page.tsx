"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await loadWeekData(currentWeek);
      setWeek(data);
      setLoading(false);
    }
    load();
  }, [currentWeek]);

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
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo2.png"
                alt="Balón Suelto"
                width={120}
                height={60}
                className="h-12 w-auto"
                priority
                unoptimized
              />
            </div>

            {/* Fumbles Counter */}
            {fumblesData && (
              <div style={{ display: "flex", gap: "30px", flex: 1, paddingLeft: "20px", borderLeft: "2px solid #ddd" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: "700", color: "#1a1a1a", margin: 0, fontSize: "14px" }}>{fumblesData.historico.total_fumbles.toLocaleString()}</p>
                  <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "10px" }}>Fumbles</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: "700", color: "#e74c3c", margin: 0, fontSize: "14px" }}>{fumblesData.historico.total_fumbles_perdidos.toLocaleString()}</p>
                  <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "10px" }}>Perdidos</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-0 border-l-4 border-bauhaus-black divide-x-4 divide-bauhaus-black flex-shrink-0">
              {[
                { id: "scoreboard" as Section, label: "Partidos" },
                { id: "power-ranking" as Section, label: "Ranking" },
                { id: "xos" as Section, label: "Tácticas" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-colors ${
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
