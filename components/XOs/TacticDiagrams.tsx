// Diagramas tácticos SVG mejorados para XOs

const COLORS = {
  // Campo
  field: "#2d5016",
  fieldLight: "rgba(45, 80, 22, 0.35)", // Oscurecido para mejor contraste
  line: "rgba(255, 255, 255, 1)", // Blanco 100% para LOS y líneas (antes 20%)
  hashmark: "rgba(255, 255, 255, 0.15)",

  // Ofensiva - Posiciones
  ol: "#e5e7eb", // OL gris claro
  qb: "#60a5fa", // QB azul claro
  rb: "#34d399", // RB verde claro
  wr: "#fbbf24", // WR amarillo/oro
  te: "#c084fc", // TE púrpura
  fb: "#f97316", // FB naranja

  // Defensiva - Posiciones (diferenciadas por rol)
  dl: "#ef4444", // DL rojo puro
  lb: "#f97316", // LB naranja (diferente de DL)
  db: "#a855f7", // DB púrpura (diferente)
  safety: "#fbbf24", // Safety amarillo/oro (diferente)

  // Legacy para compatibilidad
  def: "#ef4444", // Rojo para defensores genéricos
  defSecondary: "rgba(239, 68, 68, 0.6)", // Deprecado

  // Rutas, bloques, gaps - anotaciones (100% opacidad para legibilidad)
  route: "#fbbf24", // Rutas amarillo 100% (antes 70%)
  block: "rgba(255, 255, 255, 0.6)", // Bloques blanco 60%
  gap: "#3b82f6", // Gaps azul 100% (antes 30%)

  // Texto y anotaciones
  textLabel: "#fbbf24", // Labels de posición en amarillo 100% para contraste
  textCaption: "rgba(255, 255, 255, 1)", // Captions en blanco 100%
};

interface TacticDiagramsProps {
  diagramId: string;
}

export function TacticDiagrams({ diagramId }: TacticDiagramsProps) {
  const diagram = diagramMap[diagramId];

  if (!diagram) {
    return (
      <div className="text-center text-gray-500 text-sm py-8">
        Diagrama no disponible: {diagramId}
      </div>
    );
  }

  return diagram;
}

function FieldBase() {
  return (
    <>
      <defs>
        <pattern id="hash" x="0" y="0" width="40" height="200" patternUnits="userSpaceOnUse">
          <line x1="20" y1="0" x2="20" y2="200" stroke={COLORS.hashmark} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="320" height="200" fill={COLORS.fieldLight} stroke={COLORS.line} strokeWidth="1" />
      <rect width="320" height="200" fill="url(#hash)" />
      <line x1="160" y1="0" x2="160" y2="200" stroke={COLORS.line} strokeWidth="1.5" strokeDasharray="3,3" />
      <text x="5" y="12" fontSize="10" fill={COLORS.textCaption} fontWeight="bold">LOS</text>
    </>
  );
}

function Player({ x, y, color, label, size = 5 }: { x: number; y: number; color: string; label?: string; size?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={size} fill={color} stroke={COLORS.textCaption} strokeWidth="0.5" />
      {label && <text x={x} y={y + size + 8} fontSize="8" textAnchor="middle" fill={COLORS.textLabel} fontWeight="bold">{label}</text>}
    </g>
  );
}

function Block({ x, y, size = 8 }: { x: number; y: number; size?: number }) {
  return <rect x={x - size / 2} y={y - size / 2} width={size} height={size} fill={COLORS.block} stroke={COLORS.textCaption} strokeWidth="0.5" />;
}

const diagramMap: Record<string, React.ReactNode> = {
  // OFENSIVA - PERSONNEL
  "personnel-11": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      <Player x={160} y={155} color={COLORS.rb} label="RB" size={5} />
      <Player x={35} y={75} color={COLORS.wr} label="W1" size={5} />
      <Player x={160} y={55} color={COLORS.wr} label="S" size={5} />
      <Player x={285} y={75} color={COLORS.wr} label="W2" size={5} />
      <Player x={220} y={95} color={COLORS.te} label="TE" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">11 Personnel: Versatilidad máxima</text>
    </svg>
  ),

  "personnel-12": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      <Player x={160} y={155} color={COLORS.rb} label="RB" size={5} />
      <Player x={220} y={95} color={COLORS.te} label="TE1" size={5} />
      <Player x={260} y={95} color={COLORS.te} label="TE2" size={5} />
      <Player x={35} y={75} color={COLORS.wr} label="W1" size={5} />
      <Player x={285} y={75} color={COLORS.wr} label="W2" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">12 Personnel: Power bloqueo</text>
    </svg>
  ),

  "personnel-10": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      <Player x={160} y={155} color={COLORS.rb} label="RB" size={5} />
      <Player x={30} y={60} color={COLORS.wr} label="W1" size={5} />
      <Player x={100} y={50} color={COLORS.wr} label="W2" size={5} />
      <Player x={220} y={50} color={COLORS.wr} label="W3" size={5} />
      <Player x={290} y={60} color={COLORS.wr} label="W4" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">10 Personnel (Spread): Máximo pase</text>
    </svg>
  ),

  // OFENSIVA - FORMACIONES
  "formation-shotgun": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <line x1="160" y1="100" x2="160" y2="170" stroke={COLORS.line} strokeWidth="1" strokeDasharray="2,2" />
      <Player x={160} y={175} color={COLORS.qb} label="QB" size={6} />
      <text x="175" y="185" fontSize="7" fill={COLORS.textCaption}>5-7 yds</text>
      <Player x={160} y={150} color={COLORS.rb} label="RB" size={5} />
      <Player x={35} y={75} color={COLORS.wr} label="W1" size={5} />
      <Player x={160} y={55} color={COLORS.wr} label="S" size={5} />
      <Player x={285} y={75} color={COLORS.wr} label="W2" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Shotgun: Lectura máxima post-snap</text>
    </svg>
  ),

  "formation-i": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={100} color={COLORS.qb} label="QB" size={6} />
      <text x="170" y="105" fontSize="6" fill={COLORS.textCaption}>(centro)</text>
      <Player x={160} y={125} color={COLORS.fb} label="FB" size={5} />
      <Player x={160} y={150} color={COLORS.rb} label="RB" size={5} />
      <path d="M 160 100 L 160 150" stroke={COLORS.line} strokeWidth="1" strokeDasharray="2,2" />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">I-Form: Power bloqueo de potencia</text>
    </svg>
  ),

  "formation-pistol": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={108} color={COLORS.qb} label="QB" size={6} />
      <Player x={160} y={130} color={COLORS.fb} label="FB" size={5} />
      <Player x={160} y={155} color={COLORS.rb} label="RB" size={5} />
      <path d="M 160 108 L 160 155" stroke={COLORS.line} strokeWidth="1" strokeDasharray="2,2" />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Pistol: Balance poder/lectura</text>
    </svg>
  ),

  "formation-ace": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={100} color={COLORS.qb} label="QB" size={6} />
      <text x="170" y="105" fontSize="6" fill={COLORS.textCaption}>(centro)</text>
      <Player x={160} y={150} color={COLORS.rb} label="RB" size={5} />
      <Player x={220} y={95} color={COLORS.te} label="TE" size={5} />
      <Player x={35} y={75} color={COLORS.wr} label="W1" size={5} />
      <Player x={285} y={75} color={COLORS.wr} label="W2" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">ACE/Singlebank: Versatilidad moderna</text>
    </svg>
  ),

  // OFENSIVA - CONCEPTOS AÉREOS
  "aerial-dagger": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <marker id="arrow-d" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.route} />
        </marker>
      </defs>
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      <Player x={160} y={90} color={COLORS.te} label="TE" size={5} />
      <path d="M 160 95 L 160 30" stroke={COLORS.route} strokeWidth="1.5" markerEnd="url(#arrow-d)" />
      <Player x={110} y={25} color={COLORS.safety} label="S1" size={4} />
      <Player x={210} y={25} color={COLORS.safety} label="S2" size={4} />
      <rect x="155" y="20" width="10" height="80" fill="none" stroke={COLORS.gap} strokeWidth="1" strokeDasharray="2,2" />
      <text x="172" y="60" fontSize="7" fill={COLORS.textCaption}>SEAM</text>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Dagger: Explotar seam entre safeties</text>
    </svg>
  ),

  "aerial-four-verts": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <marker id="arrow-4v" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.route} />
        </marker>
      </defs>
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      {[50, 130, 190, 270].map((x, i) => (
        <g key={`vert-${i}`}>
          <Player x={x} y={90} color={i === 2 ? COLORS.te : COLORS.wr} size={5} />
          <path d={`M ${x} 95 L ${x} 20`} stroke={COLORS.route} strokeWidth="1.5" markerEnd="url(#arrow-4v)" />
        </g>
      ))}
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">4 Verts: Presión profunda en todo el campo</text>
    </svg>
  ),

  // OFENSIVA - CONCEPTOS TERRESTRES
  "ground-inside-zone": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => (
        <g key={`ol-${i}`}>
          <Block x={x} y={100} size={10} />
          <path d={`M ${x + (i < 2 ? 5 : -5)} 105 L ${x + (i < 2 ? 10 : -10)} 115`} stroke={COLORS.block} strokeWidth="0.8" />
        </g>
      ))}
      <Player x={160} y={150} color={COLORS.rb} label="RB" size={5} />
      <path d="M 160 145 Q 175 125 180 110" stroke={COLORS.route} strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
      <rect x="110" y="90" width="100" height="25" fill={COLORS.gap} />
      <text x="160" y="108" fontSize="8" textAnchor="middle" fill={COLORS.textCaption} fontWeight="bold">ZONA</text>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.route} />
        </marker>
      </defs>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Inside Zone: RB lee bloques y fluye</text>
    </svg>
  ),

  "ground-outside-zone": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <marker id="arrow-oz" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.route} />
        </marker>
      </defs>
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => (
        <g key={`ol-${i}`}>
          <Block x={x} y={100} size={10} />
          <path d={`M ${x + 5} 105 L ${x + 15} 105`} stroke={COLORS.block} strokeWidth="0.8" />
        </g>
      ))}
      <Player x={160} y={150} color={COLORS.rb} label="RB" size={5} />
      <path d="M 160 145 Q 200 130 270 100" stroke={COLORS.route} strokeWidth="1.5" fill="none" markerEnd="url(#arrow-oz)" />
      <text x="215" y="115" fontSize="8" fill={COLORS.textCaption} fontWeight="bold">EDGE</text>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Outside Zone: RB corre hacia edge</text>
    </svg>
  ),

  "ground-power": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <marker id="arrow-pw" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.route} />
        </marker>
      </defs>
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={110} y={115} color={COLORS.fb} label="FB" size={5} />
      <path d="M 110 120 L 130 110" stroke={COLORS.block} strokeWidth="1" markerEnd="url(#arrow-pw)" />
      <path d="M 100 105 L 130 105" stroke={COLORS.block} strokeWidth="1" markerEnd="url(#arrow-pw)" />
      <Player x={160} y={150} color={COLORS.rb} label="RB" size={5} />
      <path d="M 160 145 L 130 110" stroke={COLORS.route} strokeWidth="1.5" markerEnd="url(#arrow-pw)" />
      <circle cx="130" cy="108" r="8" fill="none" stroke={COLORS.gap} strokeWidth="1" strokeDasharray="2,2" />
      <text x="150" y="95" fontSize="8" fill={COLORS.textCaption} fontWeight="bold">ATAQUE</text>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Power: Dos bloqueadores en movimiento</text>
    </svg>
  ),

  // OFENSIVA - GAP SCHEME
  "gap-scheme-intro": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      {[80, 140, 200, 240].map((x, i) => <Player key={`dl-${i}`} x={x} y={85} color={COLORS.dl} size={4} />)}
      {[[80, "A"], [140, "B"], [200, "B"], [240, "C"]].map(([x, label], i) => (
        <text key={`gap-${i}`} x={x as number} y={70} fontSize="10" textAnchor="middle" fill={COLORS.textCaption} fontWeight="bold">{label}</text>
      ))}
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Gap Scheme: Cada OL asignado un gap</text>
    </svg>
  ),

  "gap-scheme-power": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <marker id="arrow-gp" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.block} />
        </marker>
      </defs>
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={100} y={115} color={COLORS.fb} label="FB" size={5} />
      <Player x={130} y={105} color={COLORS.ol} label="G" size={5} />
      <path d="M 100 115 L 140 105" stroke={COLORS.block} strokeWidth="1.2" markerEnd="url(#arrow-gp)" />
      <path d="M 130 105 L 150 95" stroke={COLORS.block} strokeWidth="1.2" markerEnd="url(#arrow-gp)" />
      <Player x={160} y={150} color={COLORS.rb} label="RB" size={5} />
      <path d="M 160 145 L 150 110" stroke={COLORS.route} strokeWidth="1.5" markerEnd="url(#arrow-gp)" />
      <circle cx="150" cy="105" r="12" fill="none" stroke={COLORS.gap} strokeWidth="1" strokeDasharray="2,2" />
      <text x="165" y="95" fontSize="8" fill={COLORS.textCaption} fontWeight="bold">PUNTO ATAQUE</text>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Power Run (Gap): FB + Guard seal hole</text>
    </svg>
  ),

  // OFENSIVA - PROTECCIONES
  "protection-man": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      {[80, 140, 200, 240].map((x, i) => <Player key={`dl-${i}`} x={x} y={85} color={COLORS.dl} size={4} />)}
      {[[60, 80], [100, 140], [220, 200], [260, 240]].map(([ol, dl], i) => (
        <line key={`assign-${i}`} x1={ol} y1={105} x2={dl} y2={89} stroke={COLORS.textCaption} strokeWidth="0.7" strokeDasharray="2,2" />
      ))}
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Man Protection: Asignación 1-v-1</text>
    </svg>
  ),

  "protection-zone": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      <rect x="30" y="80" width="130" height="40" fill={COLORS.gap} stroke={COLORS.textCaption} strokeWidth="1" strokeDasharray="2,2" />
      <text x="80" y="105" fontSize="9" textAnchor="middle" fill={COLORS.textCaption} fontWeight="bold">LEFT</text>
      <rect x="160" y="80" width="130" height="40" fill={COLORS.gap} stroke={COLORS.textCaption} strokeWidth="1" strokeDasharray="2,2" />
      <text x="210" y="105" fontSize="9" textAnchor="middle" fill={COLORS.textCaption} fontWeight="bold">RIGHT</text>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Zone Protection: Protección por zonas</text>
    </svg>
  ),

  // DEFENSIVA - FORMACIONES
  "def-form-43": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      {[80, 120, 200, 240].map((x, i) => <Player key={`dl-${i}`} x={x} y={85} color={COLORS.dl} label="DL" size={5} />)}
      <Player x={160} y={120} color={COLORS.lb} label="MLB" size={5} />
      <Player x={110} y={135} color={COLORS.lb} label="SLB" size={5} />
      <Player x={210} y={135} color={COLORS.lb} label="WLB" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">4-3 Defense: Balance run/pass</text>
    </svg>
  ),

  "def-form-34": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      {[100, 160, 220].map((x, i) => <Player key={`dl-${i}`} x={x} y={85} color={COLORS.dl} label="DL" size={5} />)}
      <Player x={80} y={125} color={COLORS.lb} label="LB" size={5} />
      <Player x={140} y={135} color={COLORS.lb} label="LB" size={5} />
      <Player x={180} y={135} color={COLORS.lb} label="LB" size={5} />
      <Player x={240} y={125} color={COLORS.lb} label="LB" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">3-4 Defense: Presión LB</text>
    </svg>
  ),

  "def-form-nickel": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      {[100, 160, 220].map((x, i) => <Player key={`dl-${i}`} x={x} y={85} color={COLORS.dl} label="DL" size={5} />)}
      <Player x={130} y={118} color={COLORS.lb} label="LB" size={5} />
      <Player x={190} y={118} color={COLORS.lb} label="LB" size={5} />
      {[40, 80, 160, 240, 280].map((x, i) => <Player key={`db-${i}`} x={x} y={145} color={COLORS.db} label="DB" size={4} />)}
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Nickel Package: 3 DL + 2 LB + 5 DBs</text>
    </svg>
  ),

  "def-form-dime": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      {[100, 160, 220].map((x, i) => <Player key={`dl-${i}`} x={x} y={85} color={COLORS.dl} label="DL" size={5} />)}
      <Player x={160} y={118} color={COLORS.lb} label="LB" size={5} />
      {[30, 70, 120, 200, 250, 290].map((x, i) => <Player key={`db-${i}`} x={x} y={145} color={COLORS.db} label="DB" size={4} />)}
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Dime Package: 3 DL + 1 LB + 6 DBs</text>
    </svg>
  ),

  // DEFENSIVA - FRENTES
  "front-under": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={120} y={85} color={COLORS.dl} label="DL" size={5} />
      <Player x={80} y={85} color={COLORS.dl} label="DL" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Under Front: DL lado débil</text>
    </svg>
  ),

  "front-over": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={200} y={85} color={COLORS.dl} label="DL" size={5} />
      <Player x={240} y={85} color={COLORS.dl} label="DL" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Over Front: DL lado fuerte</text>
    </svg>
  ),

  // DEFENSIVA - COBERTURAS
  "cov-cover-0": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      {[80, 140, 180, 240].map((x, i) => <Player key={`dl-${i}`} x={x} y={85} color={COLORS.dl} label="RUSH" size={5} />)}
      {[40, 100, 160, 220, 280].map((x, i) => <Player key={`db-${i}`} x={x} y={40} color={COLORS.db} label="MAN" size={4} />)}
      <text x="160" y="20" fontSize="14" textAnchor="middle" fill={COLORS.textCaption} fontWeight="bold">NO SAFETY</text>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 0: Man free (máxima presión)</text>
    </svg>
  ),

  "cov-cover-1": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      {[50, 110, 160, 210, 270].map((x, i) => <Player key={`db-${i}`} x={x} y={50} color={COLORS.db} label="MAN" size={4} />)}
      <Player x={160} y={20} color={COLORS.safety} label="S" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 1: Man + safety sobre</text>
    </svg>
  ),

  "cov-cover-2": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={90} y={20} color={COLORS.safety} label="S" size={5} />
      <Player x={230} y={20} color={COLORS.safety} label="S" size={5} />
      {[50, 110, 160, 210, 270].map((x, i) => (
        <rect key={`zone-${i}`} x={x - 15} y={50} width={30} height={40} fill="none" stroke={COLORS.textCaption} strokeWidth="0.5" strokeDasharray="2,2" />
      ))}
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 2: Safeties split, zona bajo</text>
    </svg>
  ),

  "cov-cover-3": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={60} y={30} color={COLORS.safety} label="C" size={5} />
      <Player x={160} y={20} color={COLORS.safety} label="S" size={5} />
      <Player x={260} y={30} color={COLORS.safety} label="C" size={5} />
      <Player x={120} y={110} color={COLORS.lb} label="LB" size={5} />
      <Player x={200} y={110} color={COLORS.lb} label="LB" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 3: Tres altos, dos LBs zona</text>
    </svg>
  ),

  "cov-cover-4": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={50} y={30} color={COLORS.safety} label="Q" size={5} />
      <Player x={120} y={30} color={COLORS.safety} label="Q" size={5} />
      <Player x={200} y={30} color={COLORS.safety} label="Q" size={5} />
      <Player x={270} y={30} color={COLORS.safety} label="Q" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 4: Cuatro altos (cada cuarto)</text>
    </svg>
  ),

  "cov-cover-5": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={90} y={20} color={COLORS.safety} label="S" size={5} />
      <Player x={230} y={20} color={COLORS.safety} label="S" size={5} />
      <Player x={40} y={50} color={COLORS.safety} label="Box" size={4} />
      <Player x={280} y={50} color={COLORS.safety} label="Box" size={4} />
      <rect x="70" y="30" width="50" height="40" fill="none" stroke={COLORS.textCaption} strokeWidth="0.5" strokeDasharray="2,2" />
      <rect x="200" y="30" width="50" height="40" fill="none" stroke={COLORS.textCaption} strokeWidth="0.5" strokeDasharray="2,2" />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 5: Dos medios + box support</text>
    </svg>
  ),

  "cov-cover-6": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <line x1="160" y1="0" x2="160" y2="200" stroke={COLORS.textCaption} strokeWidth="2" />
      <Player x={80} y={25} color={COLORS.safety} label="2" size={5} />
      <Player x={240} y={35} color={COLORS.safety} label="Q" size={5} />
      <text x="60" y="50" fontSize="8" fill={COLORS.textCaption} fontWeight="bold">COVER 2</text>
      <text x="200" y="50" fontSize="8" fill={COLORS.textCaption} fontWeight="bold">COVER 4</text>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 6: Split Cover 2/Cover 4</text>
    </svg>
  ),

  "cov-cover-7": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={60} y={30} color={COLORS.safety} label="C" size={5} />
      <Player x={160} y={20} color={COLORS.safety} label="C" size={5} />
      <Player x={260} y={30} color={COLORS.safety} label="C" size={5} />
      <Player x={110} y={65} color={COLORS.db} label="Z" size={4} />
      <Player x={210} y={65} color={COLORS.db} label="Z" size={4} />
      <Player x={100} y={110} color={COLORS.db} label="Blitz" size={4} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 7: Tres profundos + zona + blitz</text>
    </svg>
  ),

  "cov-cover-8": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      {[80, 120, 160, 200, 240, 110].map((x, i) => (
        <Player key={`rush-${i}`} x={x} y={85} color={COLORS.dl} label="R" size={5} />
      ))}
      <Player x={90} y={20} color={COLORS.safety} label="S" size={5} />
      <Player x={230} y={20} color={COLORS.safety} label="S" size={5} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 8: Máximo blitz + skeleton coverage</text>
    </svg>
  ),

  "cov-cover-9": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={50} y={50} color={COLORS.wr} label="X" size={5} />
      <Player x={40} y={45} color={COLORS.db} label="DB" size={4} />
      <Player x={60} y={45} color={COLORS.db} label="DB" size={4} />
      <circle cx="50" cy="50" r="10" fill="none" stroke={COLORS.textCaption} strokeWidth="1" strokeDasharray="2,2" />
      <text x="30" y="20" fontSize="8" fill={COLORS.textCaption} fontWeight="bold">DOBLE</text>
      <Player x={270} y={50} color={COLORS.wr} label="Z" size={5} />
      <Player x={270} y={70} color={COLORS.safety} label="S" size={4} />
      <text x="250" y="20" fontSize="8" fill={COLORS.textCaption} fontWeight="bold">SINGLE</text>
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Cover 9: Doble cobertura selectiva</text>
    </svg>
  ),

  // DEFENSIVA - BLITZ
  "blitz-corner": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <marker id="arrow-cb" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.route} />
        </marker>
      </defs>
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={40} y={40} color={COLORS.db} label="CB" size={5} />
      <path d="M 40 45 L 30 100" stroke={COLORS.route} strokeWidth="1.5" markerEnd="url(#arrow-cb)" />
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Corner Blitz: CB desde profundidad</text>
    </svg>
  ),

  "blitz-safety": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <marker id="arrow-sf" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.route} />
        </marker>
      </defs>
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={15} color={COLORS.safety} label="S" size={5} />
      <path d="M 160 20 L 160 85" stroke={COLORS.route} strokeWidth="1.5" markerEnd="url(#arrow-sf)" />
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Safety Blitz: S desde profundidad</text>
    </svg>
  ),

  "blitz-mike": (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <marker id="arrow-mb" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={COLORS.route} />
        </marker>
      </defs>
      <FieldBase />
      {[60, 100, 160, 220, 260].map((x, i) => <Block key={`ol-${i}`} x={x} y={100} size={10} />)}
      <Player x={160} y={115} color={COLORS.lb} label="MLB" size={5} />
      <path d="M 160 115 L 160 90" stroke={COLORS.route} strokeWidth="1.5" markerEnd="url(#arrow-mb)" />
      <Player x={160} y={135} color={COLORS.qb} label="QB" size={6} />
      <text x="10" y="190" fontSize="9" fill={COLORS.textCaption} fontWeight="bold">Mike Blitz: MLB ataca hacia QB</text>
    </svg>
  ),
};
