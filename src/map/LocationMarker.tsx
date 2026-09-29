import { memo } from 'react'
import type { Location } from '../types'
import { TYPE_PATHS, TYPE_COLOR_VAR } from './icons'

interface Props {
  location: Location
  selected: boolean
  onSelect: (id: string) => void
}

function LocationMarkerImpl({ location, selected, onSelect }: Props) {
  const color = TYPE_COLOR_VAR[location.type]
  const w = Math.max(58, location.name.length * 6.4 + 20)
  const paths = TYPE_PATHS[location.type]

  return (
    <g
      className={`marker${selected ? ' is-selected' : ''}`}
      transform={`translate(${location.x} ${location.y})`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(location.id)
      }}
      role="button"
      tabIndex={0}
      aria-label={location.name}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(location.id)
        }
      }}
    >
      <g className="marker-label">
        <rect className="marker-chip" x={-w / 2} y={-64} width={w} height={20} rx={6} />
        <text className="marker-chip-text" y={-50}>
          {location.name}
        </text>
      </g>

      <g className="marker-pin">
        <circle className="marker-halo" cy={-22} r={14} />
        <path d="M0 0 L-6.5 -11 L6.5 -11 Z" className="marker-body" />
        <circle className="marker-body" cy={-22} r={13.5} />
        <g
          className="marker-icon"
          stroke={selected ? '#080b12' : color}
          transform="translate(0 -22) scale(0.56) translate(-12 -12)"
        >
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
    </g>
  )
}

export const LocationMarker = memo(LocationMarkerImpl)
