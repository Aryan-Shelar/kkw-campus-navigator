import { BUILDINGS, LOCATIONS, LOCATION_BY_ID } from '../data'
import type { FloorId, NavRoute } from '../types'

/* ------------------------------- buildings ------------------------------ */

export function BuildingsLayer({
  floor,
  selectedId,
  onSelect,
}: {
  floor: FloorId
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <g className="buildings">
      {BUILDINGS.map((b) => {
        const loc = LOCATIONS.find((l) => l.id === b.id)
        const selected = !!loc && selectedId === loc.id
        const active = b.floors.includes(floor)
        const w = Math.max(64, b.name.length * 7 + 26)
        const cx = b.rect.x + b.rect.w / 2
        const y = b.rect.y

        return (
          <g
            key={b.id}
            className={`bldg${selected ? ' is-selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              if (loc) onSelect(loc.id)
            }}
            style={{ cursor: 'pointer' }}
          >
            <rect
              className={`bldg-shape${active ? '' : ' is-dim'}`}
              x={b.rect.x}
              y={y}
              width={b.rect.w}
              height={b.rect.h}
              rx={14}
            />
            <rect
              className="bldg-top"
              x={b.rect.x + 6}
              y={y + 6}
              width={b.rect.w - 12}
              height={5}
              rx={3}
            />

            <g className="bldg-chip">
              <rect
                x={cx - w / 2}
                y={y - 12}
                width={w}
                height={24}
                rx={8}
                fill="var(--panel-solid)"
                stroke={selected ? 'var(--accent)' : 'var(--line-strong)'}
                strokeWidth={selected ? 1.6 : 1}
              />
              <text
                x={cx}
                y={y + 4.5}
                textAnchor="middle"
                className="bldg-label"
                style={{ fontSize: 12.5 }}
              >
                {b.name}
              </text>
              <title>{`${b.name} · floors ${b.floors.join(', ')}`}</title>
            </g>

            <rect
              className="bldg-hit"
              x={b.rect.x}
              y={y}
              width={b.rect.w}
              height={b.rect.h}
              rx={14}
            />
          </g>
        )
      })}
    </g>
  )
}

/* --------------------------------- rooms -------------------------------- */

export function RoomsLayer({
  floor,
  selectedId,
  onSelect,
  showLabels,
}: {
  floor: FloorId
  selectedId: string | null
  onSelect: (id: string) => void
  showLabels: boolean
}) {
  const rooms = LOCATIONS.filter((l) => l.rect && !l.footprint && l.floor === floor && l.buildingId !== 'site')

  return (
    <g className="map-fade" key={floor}>
      {BUILDINGS.filter((b) => b.floors.includes(floor) && b.corridor).map((b) => (
        <rect
          key={`cor-${b.id}`}
          className="corridor"
          x={b.corridor!.x}
          y={b.corridor!.y}
          width={b.corridor!.w}
          height={b.corridor!.h}
          rx={6}
        />
      ))}

      {rooms.map((l) => {
        const selected = selectedId === l.id
        return (
          <g
            key={l.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(l.id)
            }}
            style={{ cursor: 'pointer' }}
          >
            <rect
              className={`room${selected ? ' is-selected' : ''}`}
              x={l.rect!.x}
              y={l.rect!.y}
              width={l.rect!.w}
              height={l.rect!.h}
              rx={6}
            />
            {(showLabels || selected) && (
              <text
                className={`room-label${selected ? ' is-selected' : ''}`}
                x={l.x}
                y={l.y + 3.5}
                style={{ fontSize: Math.min(11, Math.max(8, l.rect!.w / (l.name.length * 0.62))) }}
              >
                {l.name}
              </text>
            )}
            <title>{l.name}</title>
          </g>
        )
      })}
    </g>
  )
}

/* --------------------------------- route -------------------------------- */

export function RouteLayer({ nav, floor }: { nav: { destId: string; route: NavRoute; step: number }; floor: FloorId }) {
  const { route } = nav
  const nodes = route.nodes
  const d = nodes.map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x} ${n.y}`).join(' ')

  return (
    <g className="route" key={`${nav.destId}-${route.path.length}`}>
      {nodes.slice(1).map((n, i) => {
        const a = nodes[i]
        const on = a.floor === floor && n.floor === floor
        return (
          <line
            key={`s${i}`}
            className={`route-seg${on ? '' : ' off'}`}
            x1={a.x}
            y1={a.y}
            x2={n.x}
            y2={n.y}
            pathLength={1}
            style={{ animationDelay: `${Math.min(i * 45, 900)}ms` }}
          />
        )
      })}

      {route.steps.map((s, i) => {
        const n = nodes.find((nn) => nn.id === s.nodeId)
        if (!n) return null
        const active = i === nav.step
        return (
          <g key={`st${i}`}>
            <circle
              className={`route-step${active ? ' is-active' : ''}`}
              cx={n.x}
              cy={n.y}
              r={active ? 9.5 : 7.5}
            />
            <text className="route-step-text" x={n.x} y={n.y}>
              {i + 1}
            </text>
          </g>
        )
      })}

      <circle className="route-pulse" r={5}>
        <animateMotion dur="6s" repeatCount="indefinite" path={d} />
      </circle>
    </g>
  )
}

/* ------------------------------ you are here ---------------------------- */

export function YouAreHere({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="here-ring" r={13} />
      <circle className="here-ring delay" r={13} />
      <circle className="here-dot" r={7} />
      <text className="here-label" y={-24}>
        You are here
      </text>
    </g>
  )
}

/* -------------------------------- helpers ------------------------------- */

export function locationById(id: string) {
  return LOCATION_BY_ID[id]
}
