"use client";

import { useState, useMemo, useEffect } from "react";
import { offensiveContent } from "@/lib/tactics/offensive-content";
import { defensiveContent } from "@/lib/tactics/defensive-content";
import { TacticDiagrams } from "./TacticDiagrams";
import { ChevronLeft, ChevronRight, X, Zap } from "lucide-react";

type TabType = "offensive" | "defensive" | "penalties";
type OffensiveCategory = "personnel" | "formations" | "gap-scheme" | "aerial" | "ground" | "protections" | "sistemas";
type DefensiveCategory = "formations" | "fronts" | "coverage" | "blitz" | "glossary";
type PenaltiesCategory = "offensive" | "defensive";

const OFFENSIVE_CATEGORIES: Record<OffensiveCategory, { label: string; icon: string; description: string }> = {
  personnel: { label: "Personal", icon: "👥", description: "Agrupaciones de jugadores" },
  formations: { label: "Formaciones", icon: "📐", description: "Alineaciones base" },
  "gap-scheme": { label: "Gap Scheme", icon: "🔲", description: "Sistema de gaps" },
  aerial: { label: "Conceptos Aéreos", icon: "📡", description: "Rutas y pases" },
  ground: { label: "Conceptos Terrestres", icon: "🏃", description: "Carreras" },
  protections: { label: "Protecciones", icon: "🛡️", description: "Defensa de QB" },
  sistemas: { label: "Sistemas Ofensivos", icon: "🎯", description: "Filosofías de equipo" },
};

const DEFENSIVE_CATEGORIES: Record<DefensiveCategory, { label: string; icon: string; description: string }> = {
  formations: { label: "Formaciones", icon: "🏴", description: "Estructuras defensivas" },
  fronts: { label: "Frentes", icon: "⚔️", description: "Alineaciones DL" },
  coverage: { label: "Coberturas", icon: "🎯", description: "Cobertura de DBs" },
  blitz: { label: "Blitz/Presiones", icon: "⚡", description: "Presión defensiva" },
  glossary: { label: "Glosario", icon: "📚", description: "Terminología" },
};

const PENALTIES_CATEGORIES: Record<PenaltiesCategory, { label: string; icon: string; description: string }> = {
  offensive: { label: "Infracciones Ofensivas", icon: "📋", description: "" },
  defensive: { label: "Infracciones Defensivas", icon: "🚩", description: "" },
};

// ─────────────────────────────────────────────────────────────────────────────
// INLINE STYLES - GameModal Architecture Reference
// ─────────────────────────────────────────────────────────────────────────────

const MODAL_CONTAINER_STYLES: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const OVERLAY_STYLES: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  zIndex: 1,
};

const MODAL_STYLES: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "90%",
  maxWidth: "600px",
  maxHeight: "90vh",
  backgroundColor: "white",
  border: "4px solid #121212",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  overflow: "auto",
};

const HEADER_STYLES: React.CSSProperties = {
  backgroundColor: "#D02020",
  border: "4px solid #121212",
  borderBottom: "4px solid #121212",
  padding: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0",
};

const HEADER_INFO_STYLES: React.CSSProperties = {
  color: "white",
};

const HEADER_TITLE_STYLES: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "900",
  textTransform: "uppercase",
  margin: "0 0 8px 0",
};

const HEADER_STATUS_STYLES: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase",
  margin: "0",
  marginBottom: "8px",
};

const CLOSE_BUTTON_STYLES: React.CSSProperties = {
  padding: "8px",
  backgroundColor: "white",
  border: "2px solid #121212",
  cursor: "pointer",
  fontSize: "28px",
  color: "#D02020",
  fontWeight: "bold",
  lineHeight: 1,
};

const CONTENT_STYLES: React.CSSProperties = {
  padding: "24px",
};

const DIVIDER_TITLE_STYLES: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase",
  borderBottom: "2px solid #121212",
  paddingBottom: "8px",
  marginBottom: "12px",
  color: "#121212",
  margin: "0 0 12px 0",
};

const CONCEPT_SECTION_STYLES: React.CSSProperties = {
  marginBottom: "24px",
};

const CONCEPT_TITLE_STYLES: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "900",
  textTransform: "uppercase",
  marginBottom: "8px",
  color: "#121212",
};

const CONCEPT_DEFINITION_STYLES: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "500",
  color: "rgba(18, 18, 18, 0.7)",
  lineHeight: "1.6",
};

const NAVIGATION_FOOTER_STYLES: React.CSSProperties = {
  borderTop: "2px solid #121212",
  marginTop: "24px",
  paddingTop: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
};

const NAV_BUTTON_STYLES: React.CSSProperties = {
  padding: "8px 12px",
  border: "4px solid #121212",
  backgroundColor: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const DOTS_CONTAINER_STYLES: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
};

const DOT_STYLES = (isActive: boolean): React.CSSProperties => ({
  width: "12px",
  height: "12px",
  border: "2px solid #121212",
  backgroundColor: isActive ? "#121212" : "white",
  cursor: "pointer",
  transition: "all 0.2s",
});

const COUNTER_STYLES: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase",
  color: "#121212",
  textAlign: "center",
  marginTop: "12px",
};

const STRENGTHS_LIST_STYLES: React.CSSProperties = {
  marginTop: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const LIST_ITEM_STYLES: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#121212",
  display: "flex",
  gap: "8px",
};

const IDEAL_BOX_STYLES: React.CSSProperties = {
  backgroundColor: "#FFF3CD",
  border: "2px solid #121212",
  padding: "12px",
  marginTop: "12px",
};

const IDEAL_BOX_TITLE_STYLES: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase",
  marginBottom: "8px",
  color: "#121212",
};

const IDEAL_BOX_TEXT_STYLES: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#121212",
  lineHeight: "1.6",
};

const DIAGRAM_SECTION_STYLES: React.CSSProperties = {
  border: "2px solid #121212",
  padding: "12px",
  marginTop: "12px",
  backgroundColor: "white",
};

const DIAGRAM_LABEL_STYLES: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase",
  marginBottom: "12px",
  color: "#121212",
};

const DIAGRAM_CONTAINER_STYLES: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "192px",
  backgroundColor: "white",
  borderRadius: "0",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

const cleanPenaltyName = (name: string): string => {
  return name
    .replace(/\s*\(Ofensiva\)\s*/i, "")
    .replace(/\s*\(Defensiva\)\s*/i, "")
    .replace(/\s*\(Offensive\)\s*/i, "")
    .replace(/\s*\(Defensive\)\s*/i, "");
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TacticsExplorer() {
  const [activeTab, setActiveTab] = useState<TabType>("offensive");
  const [activeCategory, setActiveCategory] = useState<OffensiveCategory | DefensiveCategory | PenaltiesCategory>("personnel");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  const filteredConcepts = useMemo(() => {
    if (activeTab === "offensive") {
      return offensiveContent.filter((concept) => concept.category === activeCategory);
    } else if (activeTab === "defensive") {
      return defensiveContent.filter((concept) => concept.category === activeCategory);
    } else {
      // Penalties tab - filter by penalty type (offensive or defensive)
      // Only get penalties from defensive content (where all penalties are stored)
      const allPenalties = defensiveContent.filter(
        (concept) => concept.category === "penalties"
      );
      // Further filter based on activeCategory (offensive or defensive)
      return allPenalties.filter((concept) => {
        const definitionLower = (concept.definition || "").toLowerCase();
        const nameLower = (concept.name || "").toLowerCase();

        if (activeCategory === "offensive") {
          return definitionLower.includes("ofensiva") ||
                 definitionLower.includes("ofensivo") ||
                 nameLower.includes("ofensiva") ||
                 concept.id.includes("off");
        } else {
          return definitionLower.includes("defensiva") ||
                 definitionLower.includes("defensivo") ||
                 nameLower.includes("defensiva") ||
                 concept.id.includes("def");
        }
      });
    }
  }, [activeTab, activeCategory]);

  const categories =
    activeTab === "offensive"
      ? (["personnel", "formations", "gap-scheme", "aerial", "ground", "protections", "sistemas"] as OffensiveCategory[])
      : activeTab === "defensive"
      ? (["formations", "fronts", "coverage", "blitz", "glossary"] as DefensiveCategory[])
      : (["offensive", "defensive"] as PenaltiesCategory[]);

  const categoryInfo =
    activeTab === "offensive"
      ? OFFENSIVE_CATEGORIES
      : activeTab === "defensive"
      ? DEFENSIVE_CATEGORIES
      : PENALTIES_CATEGORIES;

  const currentConcept = filteredConcepts[carouselIndex] || null;

  // ─────────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "offensive") {
      setActiveCategory("personnel");
    } else if (tab === "defensive") {
      setActiveCategory("formations");
    } else {
      setActiveCategory("offensive");
    }
    setCarouselIndex(0);
  };

  const handleCategoryChange = (cat: OffensiveCategory | DefensiveCategory | PenaltiesCategory) => {
    setActiveCategory(cat);
    setCarouselIndex(0);
  };

  const handlePrevious = () => {
    setCarouselIndex((prev) => (prev === 0 ? filteredConcepts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === filteredConcepts.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (idx: number) => {
    setCarouselIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  // ESC key listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCarouselIndex(0);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      {/* PAGE HEADER */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "4px solid #121212",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <Zap style={{ width: "32px", height: "32px", color: "#FCC300" }} />
            <h1 style={{ fontSize: "32px", fontWeight: "900", textTransform: "uppercase", margin: 0 }}>XOs</h1>
          </div>
          <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#121212", margin: 0 }}>
            Guía táctica de esquemas ofensivos y defensivos
          </p>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ backgroundColor: "#D02020", borderBottom: "4px solid #121212", position: "sticky", top: "72px", zIndex: 40 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { id: "offensive" as TabType, label: "🔴 Ofensiva" },
            { id: "defensive" as TabType, label: "🔵 Defensiva" },
            { id: "penalties" as TabType, label: "⚠️ Penalidades" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                flex: 1,
                padding: "16px",
                fontWeight: "900",
                color: activeTab === tab.id ? "white" : "#121212",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                backgroundColor: activeTab === tab.id ? "#D02020" : "white",
                border: "none",
                borderRight: "4px solid #121212",
                cursor: "pointer",
                transition: "all 0.2s",
                fontSize: "14px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px", display: "grid", gridTemplateColumns: "1fr 3fr", gap: "24px" }}>
        {/* SIDEBAR - CATEGORIES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {categories.map((cat) => {
            const info = categoryInfo[cat as keyof typeof categoryInfo];
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px",
                  border: "2px solid #121212",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  fontSize: "12px",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  backgroundColor: isActive ? "#0066CC" : "white",
                  color: isActive ? "white" : "#121212",
                  boxShadow: isActive ? "2px 2px 0px #121212" : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>{info.icon}</div>
                <div>{info.label}</div>
                <div style={{ fontSize: "10px", color: isActive ? "rgba(255, 255, 255, 0.8)" : "rgba(18, 18, 18, 0.6)", marginTop: "2px" }}>
                  {info.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* MODAL CAROUSEL - GameModal Architecture */}
        <div>
          {filteredConcepts.length === 0 ? (
            <div style={{ ...MODAL_STYLES, padding: "32px", textAlign: "center" }}>
              <p style={{ fontWeight: "900", fontSize: "14px", textTransform: "uppercase", color: "#121212" }}>
                No se encontraron conceptos
              </p>
            </div>
          ) : (
            <div style={MODAL_STYLES}>
              {/* HEADER - GameModal Reference */}
              <div style={HEADER_STYLES}>
                <div style={HEADER_INFO_STYLES}>
                  <p style={HEADER_STATUS_STYLES}>
                    {activeTab === "offensive" ? "🔴 OFENSIVA" : activeTab === "defensive" ? "🔵 DEFENSIVA" : "⚠️ PENALIDADES"}
                  </p>
                  <h2 style={HEADER_TITLE_STYLES}>
                    {activeTab === "penalties" ? (activeCategory === "offensive" ? "Infracciones Ofensivas" : "Infracciones Defensivas") : categoryInfo[activeCategory as keyof typeof categoryInfo]?.label || activeCategory}
                  </h2>
                </div>
                <button
                  onClick={() => setCarouselIndex(0)}
                  style={{
                    ...CLOSE_BUTTON_STYLES,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFF3CD";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                  }}
                >
                  ✕
                </button>
              </div>

              {/* CONTENT */}
              <div style={CONTENT_STYLES} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {currentConcept && (
                  <>
                    {activeTab === "penalties" ? (
                      // SIMPLIFIED VIEW FOR PENALTIES
                      <div style={CONCEPT_SECTION_STYLES}>
                        <h3 style={CONCEPT_TITLE_STYLES}>{cleanPenaltyName(currentConcept.name)}</h3>
                        <p style={CONCEPT_DEFINITION_STYLES}>{currentConcept.definition}</p>
                      </div>
                    ) : (
                      // FULL VIEW FOR OFFENSIVE/DEFENSIVE CONCEPTS
                      <>
                        {/* CONCEPT TITLE & DEFINITION */}
                        <div style={CONCEPT_SECTION_STYLES}>
                          <h3 style={CONCEPT_TITLE_STYLES}>{currentConcept.name}</h3>
                          <p style={CONCEPT_DEFINITION_STYLES}>{currentConcept.definition}</p>
                        </div>

                        {/* DIAGRAM */}
                        {currentConcept.diagram && (
                          <div style={DIAGRAM_SECTION_STYLES}>
                            <div style={DIAGRAM_CONTAINER_STYLES}>
                              <TacticDiagrams diagramId={currentConcept.diagram} />
                            </div>
                          </div>
                        )}

                        {/* STRENGTHS */}
                        {currentConcept.strengths.length > 0 && (
                          <div style={CONCEPT_SECTION_STYLES}>
                            <p style={{ ...DIVIDER_TITLE_STYLES, color: "#D02020" }}>✓ Fortalezas</p>
                            <ul style={STRENGTHS_LIST_STYLES}>
                              {currentConcept.strengths.map((s, i) => (
                                <li key={i} style={LIST_ITEM_STYLES}>
                                  <span style={{ fontWeight: "900", color: "#D02020", flexShrink: 0 }}>•</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* WEAKNESSES */}
                        {currentConcept.weaknesses.length > 0 && (
                          <div style={CONCEPT_SECTION_STYLES}>
                            <p style={{ ...DIVIDER_TITLE_STYLES, color: "#0066CC" }}>✗ Debilidades</p>
                            <ul style={STRENGTHS_LIST_STYLES}>
                              {currentConcept.weaknesses.map((w, i) => (
                                <li key={i} style={LIST_ITEM_STYLES}>
                                  <span style={{ fontWeight: "900", color: "#0066CC", flexShrink: 0 }}>•</span>
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* IDEAL FOR */}
                        <div style={IDEAL_BOX_STYLES}>
                          <p style={IDEAL_BOX_TITLE_STYLES}>💡 Situación Ideal</p>
                          <p style={IDEAL_BOX_TEXT_STYLES}>{currentConcept.idealFor}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* NAVIGATION FOOTER - GameModal Architecture */}
              <div style={NAVIGATION_FOOTER_STYLES}>
                <button
                  onClick={handlePrevious}
                  disabled={filteredConcepts.length <= 1}
                  style={{
                    ...NAV_BUTTON_STYLES,
                    opacity: filteredConcepts.length <= 1 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.hasAttribute("disabled")) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFF3CD";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                  }}
                >
                  <ChevronLeft style={{ width: "24px", height: "24px", color: "#121212" }} />
                </button>

                {/* DOTS INDICATOR */}
                <div style={DOTS_CONTAINER_STYLES}>
                  {filteredConcepts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDotClick(idx)}
                      style={DOT_STYLES(idx === carouselIndex)}
                      onMouseEnter={(e) => {
                        if (idx !== carouselIndex) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFF3CD";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (idx !== carouselIndex) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                        }
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={filteredConcepts.length <= 1}
                  style={{
                    ...NAV_BUTTON_STYLES,
                    opacity: filteredConcepts.length <= 1 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.hasAttribute("disabled")) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFF3CD";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                  }}
                >
                  <ChevronRight style={{ width: "24px", height: "24px", color: "#121212" }} />
                </button>
              </div>

              {/* COUNTER */}
              <div style={COUNTER_STYLES}>
                {carouselIndex + 1} / {filteredConcepts.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
