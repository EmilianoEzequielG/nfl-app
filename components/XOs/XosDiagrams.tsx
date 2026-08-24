// Diagramas SVG para Rutas Ofensivas, Esquemas de Carrera y Presión Defensiva

const W = 240;
const svgProps = (h = 150) => ({ viewBox: `0 0 ${W} ${h}`, className: "w-full" });

const C = {
  route: "#C9B99A",
  route2: "#f97316",
  deep: "rgba(59,130,246,0.15)",
  under: "rgba(34,197,94,0.10)",
  vuln: "rgba(251,191,36,0.18)",
  vulnStr: "rgba(251,191,36,0.5)",
  blitz: "rgba(239,68,68,0.7)",
  blitzBg: "rgba(239,68,68,0.12)",
  run: "rgba(34,197,94,0.8)",
  pull: "rgba(251,191,36,0.8)",
  block: "rgba(255,255,255,0.15)",
  blockStr: "rgba(255,255,255,0.3)",
  hash: "rgba(255,255,255,0.07)",
  wr: "rgba(201,185,154,0.9)",
  rb: "rgba(34,197,94,0.9)",
  def: "rgba(239,68,68,0.5)",
  defRing: "rgba(239,68,68,0.3)",
  ol: "rgba(255,255,255,0.6)",
  t: (opacity = 0.35, size = 7) => ({
    fill: `rgba(255,255,255,${opacity})`,
    fontSize: size,
    textAnchor: "middle" as const,
  }),
  label: (color = "#C9B99A", size = 7) => ({
    fill: color,
    fontSize: size,
    textAnchor: "middle" as const,
    fontWeight: "bold" as const,
  }),
};

function Arr({ id, color = C.route }: { id: string; color?: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
      </marker>
    </defs>
  );
}

function WR({ x, y, label = "W" }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={6} fill={C.wr} stroke="rgba(201,185,154,0.4)" strokeWidth={0.5} />
      <text x={x} y={y + 3} style={C.t(0.9, 6)}>
        {label}
      </text>
    </g>
  );
}

function OL({ x, y, label = "O" }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <rect
        x={x - 7}
        y={y - 5}
        width={14}
        height={10}
        rx={2}
        fill={C.block}
        stroke={C.blockStr}
        strokeWidth={0.8}
      />
      <text x={x} y={y + 3} style={C.t(0.7, 6)}>
        {label}
      </text>
    </g>
  );
}

function RB({ x, y, label = "RB" }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={6} fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth={0.8} />
      <text x={x} y={y + 3} style={{ ...C.t(0.8, 6), fill: "rgba(34,197,94,0.9)" }}>
        {label}
      </text>
    </g>
  );
}

function QB({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={6} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />
      <text x={x} y={y + 3} style={C.t(0.7, 6)}>
        QB
      </text>
    </g>
  );
}

function FieldBase({ los = 105, h = 150 }: { los?: number; h?: number }) {
  return (
    <>
      <rect width={W} height={h} fill="rgba(255,255,255,0.015)" rx={5} />
      <line
        x1={0}
        y1={los}
        x2={W}
        y2={los}
        stroke="rgba(201,185,154,0.3)"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <text x={6} y={los - 3} style={C.t(0.25, 6)}>
        LOS
      </text>
      <line x1={80} y1={0} x2={80} y2={h} stroke={C.hash} strokeWidth={1} />
      <line x1={160} y1={0} x2={160} y2={h} stroke={C.hash} strokeWidth={1} />
    </>
  );
}

export function FourVerticalsDiagram() {
  const id1 = "fv1";
  const id2 = "fv2";
  const los = 105;
  const h = 150;
  return (
    <svg {...svgProps(h)}>
      <Arr id={id1} />
      <Arr id={id2} color={C.route2} />
      <FieldBase los={los} h={h} />
      <rect
        x={65}
        y={10}
        width={45}
        height={72}
        rx={2}
        fill={C.vuln}
        stroke={C.vulnStr}
        strokeWidth={1}
        strokeDasharray="2,2"
      />
      <rect
        x={130}
        y={10}
        width={45}
        height={72}
        rx={2}
        fill={C.vuln}
        stroke={C.vulnStr}
        strokeWidth={1}
        strokeDasharray="2,2"
      />
      <text x={87} y={25} style={C.t(0.5, 6)}>
        Seam
      </text>
      <text x={152} y={25} style={C.t(0.5, 6)}>
        Seam
      </text>
      {[80, 93, 106, 120, 133].map((x, i) => (
        <OL key={i} x={x} y={los} label={["LT", "LG", "C", "RG", "RT"][i]} />
      ))}
      <QB x={106} y={los + 14} />
      <WR x={20} y={los} label="W1" />
      <WR x={65} y={los} label="SL" />
      <WR x={175} y={los} label="SR" />
      <WR x={220} y={los} label="W2" />
      <path
        d={`M 20 ${los} L 20 12`}
        stroke={C.route}
        strokeWidth={1.5}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <path
        d={`M 65 ${los} L 75 12`}
        stroke={C.route2}
        strokeWidth={1.5}
        fill="none"
        markerEnd={`url(#${id2})`}
      />
      <path
        d={`M 175 ${los} L 165 12`}
        stroke={C.route2}
        strokeWidth={1.5}
        fill="none"
        markerEnd={`url(#${id2})`}
      />
      <path
        d={`M 220 ${los} L 220 12`}
        stroke={C.route}
        strokeWidth={1.5}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
    </svg>
  );
}

export function MeshDiagram() {
  const id1 = "m1";
  const id2 = "m2";
  const los = 105;
  const h = 150;
  return (
    <svg {...svgProps(h)}>
      <Arr id={id1} />
      <Arr id={id2} color={C.route2} />
      <FieldBase los={los} h={h} />
      {[80, 93, 106, 120, 133].map((x, i) => (
        <OL key={i} x={x} y={los} label={["LT", "LG", "C", "RG", "RT"][i]} />
      ))}
      <QB x={106} y={los + 14} />
      <WR x={45} y={los} label="W1" />
      <WR x={195} y={los} label="W2" />
      <path d={`M 45 ${los} L 185 78`} stroke={C.route} strokeWidth={1.5} fill="none" markerEnd={`url(#${id1})`} />
      <path d={`M 195 ${los} L 55 78`} stroke={C.route2} strokeWidth={1.5} fill="none" markerEnd={`url(#${id2})`} />
      <ellipse
        cx={120}
        cy={83}
        rx={45}
        ry={15}
        fill={C.vuln}
        stroke={C.vulnStr}
        strokeWidth={1}
        strokeDasharray="2,2"
      />
      <text x={120} y={87} style={C.t(0.5, 6)}>
        Pick Zone
      </text>
      <RB x={106} y={los + 8} />
      <path
        d={`M 106 ${los + 8} L 40 ${los + 6}`}
        stroke="rgba(34,197,94,0.5)"
        strokeWidth={1}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
    </svg>
  );
}

export function SmashDiagram() {
  const id1 = "sm1";
  const id2 = "sm2";
  const los = 105;
  const h = 150;
  return (
    <svg {...svgProps(h)}>
      <Arr id={id1} />
      <Arr id={id2} color={C.route2} />
      <FieldBase los={los} h={h} />
      {[80, 93, 106, 120, 133].map((x, i) => (
        <OL key={i} x={x} y={los} label={["LT", "LG", "C", "RG", "RT"][i]} />
      ))}
      <QB x={106} y={los + 14} />
      <WR x={185} y={los} label="W1" />
      <WR x={215} y={los} label="W2" />
      <path
        d={`M 215 ${los} L 215 82 L 215 ${los - 5}`}
        stroke={C.route2}
        strokeWidth={1.4}
        fill="none"
        strokeDasharray="2,2"
      />
      <text x={228} y={85} style={{ ...C.t(0.5, 6), fill: "rgba(249,115,22,0.7)" }}>
        Hitch
      </text>
      <path
        d={`M 185 ${los} L 185 72 L 235 30`}
        stroke={C.route}
        strokeWidth={1.8}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <text x={232} y={27} style={C.label()}>
        Corner
      </text>
    </svg>
  );
}

export function FloodDiagram() {
  const id1 = "fl1";
  const los = 105;
  const h = 150;
  return (
    <svg {...svgProps(h)}>
      <Arr id={id1} />
      <FieldBase los={los} h={h} />
      {[80, 93, 106, 120, 133].map((x, i) => (
        <OL key={i} x={x} y={los} label={["LT", "LG", "C", "RG", "RT"][i]} />
      ))}
      <QB x={106} y={los + 14} />
      <WR x={20} y={los} label="W1" />
      <WR x={50} y={los} label="W2" />
      <WR x={155} y={los} label="TE" />
      <path
        d={`M 20 ${los} L 15 15`}
        stroke={C.route}
        strokeWidth={1.6}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <text x={10} y={12} style={C.t(0.4, 6)}>
        Fade
      </text>
      <path
        d={`M 50 ${los} L 50 68 L 12 68`}
        stroke={C.route}
        strokeWidth={1.4}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <text x={8} y={65} style={C.t(0.35, 6)}>
        Out
      </text>
      <path
        d={`M 155 ${los} L 12 ${los - 2}`}
        stroke={C.route}
        strokeWidth={1.3}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <text x={8} y={los - 6} style={C.t(0.35, 6)}>
        Flat
      </text>
      <text x={55} y={18} style={C.t(0.3, 6)}>
        3 niveles
      </text>
      <text x={55} y={26} style={C.t(0.3, 6)}>
        → siempre 1 libre
      </text>
    </svg>
  );
}

export function SpacingDiagram() {
  const id1 = "sp1";
  const los = 105;
  const h = 150;
  return (
    <svg {...svgProps(h)}>
      <Arr id={id1} />
      <FieldBase los={los} h={h} />
      {[80, 93, 106, 120, 133].map((x, i) => (
        <OL key={i} x={x} y={los} label={["LT", "LG", "C", "RG", "RT"][i]} />
      ))}
      <QB x={106} y={los + 14} />
      {[18, 58, 106, 162, 210].map((x, i) => (
        <g key={i}>
          <WR x={x} y={los} label="W" />
          <path
            d={`M ${x} ${los} L ${x} ${los - 22}`}
            stroke={C.route}
            strokeWidth={1.3}
            fill="none"
            markerEnd={`url(#${id1})`}
          />
        </g>
      ))}
      <text x={120} y={20} style={C.t(0.3, 6)}>
        Cada zona ocupada
      </text>
      <text x={120} y={28} style={C.t(0.3, 6)}>
        por un receptor
      </text>
    </svg>
  );
}

export function CurlFlatDiagram() {
  const id1 = "cf1";
  const id2 = "cf2";
  const los = 105;
  const h = 150;
  return (
    <svg {...svgProps(h)}>
      <Arr id={id1} />
      <Arr id={id2} color="rgba(34,197,94,0.8)" />
      <FieldBase los={los} h={h} />
      {[80, 93, 106, 120, 133].map((x, i) => (
        <OL key={i} x={x} y={los} label={["LT", "LG", "C", "RG", "RT"][i]} />
      ))}
      <QB x={106} y={los + 14} />
      <WR x={30} y={los} label="W" />
      <path
        d={`M 30 ${los} L 30 48 L 38 54`}
        stroke={C.route}
        strokeWidth={1.6}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <text x={14} y={52} style={C.label()}>
        Curl
      </text>
      <RB x={106} y={los + 8} />
      <path
        d={`M 106 ${los + 8} L 40 ${los + 4}`}
        stroke="rgba(34,197,94,0.7)"
        strokeWidth={1.5}
        fill="none"
        markerEnd={`url(#${id2})`}
      />
      <text x={62} y={los + 14} style={{ ...C.t(0.5, 6), fill: "rgba(34,197,94,0.7)" }}>
        Flat
      </text>
      <rect
        x={22}
        y={46}
        width={56}
        height={los - 46 - 10}
        rx={2}
        fill={C.vuln}
        stroke={C.vulnStr}
        strokeWidth={1}
        strokeDasharray="2,2"
      />
    </svg>
  );
}

export function SailDiagram() {
  const id1 = "sa1";
  const los = 105;
  const h = 150;
  return (
    <svg {...svgProps(h)}>
      <Arr id={id1} />
      <FieldBase los={los} h={h} />
      {[80, 93, 106, 120, 133].map((x, i) => (
        <OL key={i} x={x} y={los} label={["LT", "LG", "C", "RG", "RT"][i]} />
      ))}
      <QB x={106} y={los + 14} />
      <WR x={190} y={los} label="W1" />
      <WR x={215} y={los} label="W2" />
      <RB x={106} y={los + 8} />
      <path
        d={`M 190 ${los} L 225 15`}
        stroke={C.route}
        strokeWidth={1.6}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <text x={230} y={13} style={C.t(0.4, 6)}>
        Fade
      </text>
      <path
        d={`M 215 ${los} L 215 68 L 235 68`}
        stroke={C.route}
        strokeWidth={1.4}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <text x={237} y={71} style={C.t(0.35, 6)}>
        Out
      </text>
      <path
        d={`M 106 ${los + 8} L 235 ${los + 5}`}
        stroke={C.route}
        strokeWidth={1.2}
        fill="none"
        markerEnd={`url(#${id1})`}
      />
      <text x={200} y={los + 14} style={C.t(0.35, 6)}>
        Flat
      </text>
    </svg>
  );
}
