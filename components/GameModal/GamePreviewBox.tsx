"use client";

import { Game } from "@/types";

const COLORS = {
  ink: "#121212",
  red: "#D02020",
  yellow: "#F0C020",
  muted: "#666",
  hairline: "#ddd",
};

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <p
        style={{
          margin: "0 0 4px 0",
          fontSize: "10px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: COLORS.muted,
        }}
      >
        {icon} {label}
      </p>
      <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: COLORS.ink }}>{children}</p>
    </div>
  );
}

export function GamePreviewBox({ game }: { game: Game }) {
  const preview = game.preview;
  if (!preview) return null;

  const away = game.awayTeam;
  const home = game.homeTeam;

  // El JSON indexa "cómo gana" por abreviatura; si falta una, se omite ese lado
  // en vez de renderizar un bloque vacío.
  const sides = [away, home]
    .map((team) => ({ team, texto: preview.comoGana?.[team.abbr] }))
    .filter((s): s is { team: typeof away; texto: string } => !!s.texto);

  return (
    <div
      style={{
        border: `4px solid ${COLORS.ink}`,
        backgroundColor: "white",
        padding: "16px",
        marginBottom: "24px",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          borderBottom: `2px solid ${COLORS.ink}`,
          paddingBottom: "10px",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: COLORS.ink,
          }}
        >
          📋 Previa
        </span>
        {preview.primeTime && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1px",
              backgroundColor: COLORS.yellow,
              color: COLORS.ink,
              border: `2px solid ${COLORS.ink}`,
              padding: "2px 6px",
              whiteSpace: "nowrap",
            }}
          >
            🌙 Prime Time
          </span>
        )}
        <span
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            fontWeight: 700,
            color: COLORS.muted,
            whiteSpace: "nowrap",
          }}
        >
          {preview.cuando}
        </span>
      </div>

      <Section label="Introducción" icon="🎙️">
        {preview.introduccion}
      </Section>

      <Section label="Figura" icon="⭐">
        {preview.figura}
      </Section>

      <Section label="1 vs 1 a ver" icon="⚔️">
        {preview.duelo}
      </Section>

      {/* Cómo lo gana cada uno */}
      {sides.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "12px" }}>
          {sides.map(({ team, texto }) => (
            <div
              key={team.abbr}
              style={{
                borderLeft: `4px solid ${team.color}`,
                paddingLeft: "10px",
                marginBottom: "10px",
              }}
            >
              <p
                style={{
                  margin: "0 0 3px 0",
                  fontSize: "10px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: COLORS.ink,
                }}
              >
                📈 Cómo lo gana {team.abbr}
              </p>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: COLORS.ink }}>
                {texto}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Dato de contexto, al cierre */}
      {preview.aTenerEnCuenta && (
        <div
          style={{
            backgroundColor: "#FDF6DC",
            border: `2px solid ${COLORS.ink}`,
            padding: "10px 12px",
            marginTop: "4px",
          }}
        >
          <p
            style={{
              margin: "0 0 4px 0",
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: COLORS.ink,
            }}
          >
            💡 A tener en cuenta
          </p>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: COLORS.ink }}>
            {preview.aTenerEnCuenta}
          </p>
        </div>
      )}
    </div>
  );
}
