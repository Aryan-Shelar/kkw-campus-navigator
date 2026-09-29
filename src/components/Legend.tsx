import { LEGEND, TYPE_COLOR_VAR } from '../map/icons'

export function Legend() {
  return (
    <div className="map-legend">
      {LEGEND.map((l) => (
        <span className="legend-item" key={l.type}>
          <i className="legend-dot" style={{ background: TYPE_COLOR_VAR[l.type] }} />
          {l.label}
        </span>
      ))}
    </div>
  )
}
