import { X, Navigation, Layers3, MapPin } from 'lucide-react'
import { useCampus } from '../store'
import { BUILDING_BY_ID, FLOOR_LABEL, TYPE_LABEL } from '../data/campus'
import { TYPE_COLOR_VAR } from '../map/icons'
import type { Location } from '../types'

export function LocationPanel({ location }: { location: Location }) {
  const { select, setFloor, startNav, setView } = useCampus()
  const building = BUILDING_BY_ID[location.buildingId]
  const color = TYPE_COLOR_VAR[location.type]

  return (
    <div className="panel" style={{ position: 'relative' }}>
      <button className="panel-close" onClick={() => select(null)} aria-label="Close panel">
        <X size={15} />
      </button>

      <div className="panel-head">
        <span className="loc-type" style={{ color }}>
          <MapPin size={13} />
          {TYPE_LABEL[location.type]}
        </span>
        <h2 className="loc-name">{location.name}</h2>
        <div className="chip-row">
          <span className="tag-demo">Demo location</span>
          <span className="chip">Prototype data</span>
        </div>
      </div>

      <div className="panel-body panel-scroll">
        <div className="loc-grid">
          <div className="loc-cell">
            <span>Building</span>
            <b>{building?.name ?? 'Campus grounds'}</b>
          </div>
          <div className="loc-cell">
            <span>Floor</span>
            <b>{FLOOR_LABEL[location.floor]}</b>
          </div>
          <div className="loc-cell">
            <span>Room</span>
            <b>{location.room ?? '—'}</b>
          </div>
          <div className="loc-cell">
            <span>Type</span>
            <b>{TYPE_LABEL[location.type]}</b>
          </div>
        </div>

        <p className="loc-desc">{location.description}</p>

        {location.tags.length > 0 && (
          <div className="chip-row">
            {location.tags.slice(0, 5).map((t) => (
              <span className="chip" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="panel-actions">
          <button className="btn btn-primary" onClick={() => startNav(location.id)}>
            <Navigation size={16} />
            Navigate Here
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setFloor(location.floor)
              setView('map')
            }}
          >
            <Layers3 size={16} />
            View Floor
          </button>
        </div>
      </div>
    </div>
  )
}
