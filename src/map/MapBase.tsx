const ROADS = [
  'M60 620 H1140',
  'M60 300 H1140',
  'M600 60 V620',
  'M600 620 V812',
]

const treeX: number[] = []
for (let x = 60; x <= 1140; x += 54) treeX.push(x)
const treeY: number[] = []
for (let y = 44; y <= 806; y += 48) treeY.push(y)

const trees: { x: number; y: number; r: number }[] = []
treeX.forEach((x) => {
  trees.push({ x, y: 42, r: 6 })
  trees.push({ x, y: 806, r: 6 })
})
treeY.forEach((y) => {
  trees.push({ x: 44, y, r: 6 })
  trees.push({ x: 1156, y, r: 6 })
})
// a few extra clusters near the gate plaza
;[
  [540, 760],
  [660, 760],
  [540, 700],
  [660, 700],
  [520, 826],
  [680, 826],
].forEach(([x, y]) => trees.push({ x, y, r: 7 }))

export function MapBase() {
  return (
    <g className="map-base">
      <rect x={20} y={20} width={1160} height={800} rx={30} className="lawn" />

      <g>
        {Array.from({ length: 29 }, (_, i) => (
          <line key={`gv${i}`} className="grid-line" x1={60 + i * 40} y1={24} x2={60 + i * 40} y2={816} />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`gh${i}`} className="grid-line" x1={24} y1={40 + i * 40} x2={1176} y2={40 + i * 40} />
        ))}
      </g>

      <g>
        {ROADS.map((d, i) => (
          <path key={`re${i}`} className="road-edge" d={d} />
        ))}
        {ROADS.map((d, i) => (
          <path key={`r${i}`} className="road" d={d} />
        ))}
        {ROADS.map((d, i) => (
          <path key={`rd${i}`} className="road-dash" d={d} />
        ))}
      </g>

      <rect x={548} y={768} width={104} height={48} rx={14} fill="var(--map-path)" opacity={0.9} />

      <g>
        {trees.map((t, i) => (
          <circle key={i} className="tree" cx={t.x} cy={t.y} r={t.r} />
        ))}
      </g>

      <rect x={20} y={20} width={1160} height={800} rx={30} className="boundary" />

      {/* main gate structure */}
      <g>
        <path
          d="M556 806 h-8 v-34 h8 M644 806 h8 v-34 h-8"
          fill="none"
          stroke="var(--t-entrance)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path d="M548 772 h104" stroke="var(--t-entrance)" strokeWidth={3} strokeLinecap="round" opacity={0.55} />
      </g>

      <text x={36} y={812} className="bldg-label-sub" style={{ fontSize: 9 }}>
        DEMO CAMPUS PLAN · NOT A VERIFIED KKW LAYOUT
      </text>
    </g>
  )
}

/** Fixed overlay — drawn outside the pan/zoom transform. */
export function Compass() {
  return (
    <g transform="translate(1146 74)" opacity={0.9} style={{ pointerEvents: 'none' }}>
      <circle r={17} fill="var(--panel-solid)" stroke="var(--line-strong)" />
      <path d="M0 -10 L5 6 L0 2 L-5 6 Z" fill="var(--accent)" />
      <text y={-22} textAnchor="middle" className="bldg-label-sub" style={{ fontSize: 8 }}>
        N
      </text>
    </g>
  )
}
