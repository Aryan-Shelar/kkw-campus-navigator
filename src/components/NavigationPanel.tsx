import { X, LogOut, Crosshair, Footprints, MoveUpRight, Flag, MapPin } from 'lucide-react'
import { useCampus } from '../store'
import { BUILDING_BY_ID, FLOOR_LABEL, LOCATIONS, LOCATION_BY_ID } from '../data'
import type { NavStep } from '../types'

const ORIGIN_CHOICES = ['main-gate', 'block-a', 'block-b', 'library', 'canteen', 'admin', 'sac', 'aids-dept', 'intro-hall', 'parking']

function stepIcon(kind: NavStep['kind']) {
  switch (kind) {
    case 'start':
      return <MapPin size={14} />
    case 'stairs':
      return <Footprints size={14} />
    case 'elevator':
      return <MoveUpRight size={14} />
    case 'exit':
      return <LogOut size={14} />
    case 'arrive':
      return <Flag size={14} />
    default:
      return <MoveUpRight size={14} />
  }
}

export function NavigationPanel() {
  const { nav, exitNav, setStep, originId, setOrigin, startNav } = useCampus()
  if (!nav) return null

  const dest = LOCATION_BY_ID[nav.destId]
  const origin = LOCATION_BY_ID[originId]
  const destBuilding = dest ? BUILDING_BY_ID[dest.buildingId] : undefined

  const changeOrigin = (id: string) => {
    startNav(nav.destId, id)
  }

  return (
    <div className="panel" style={{ position: 'relative' }}>
      <button className="panel-close" onClick={exitNav} aria-label="Exit navigation">
        <X size={15} />
      </button>

      <div className="nav-head">
        <div className="nav-title">
          <h3>Navigation</h3>
        </div>

        <div className="od">
          <div className="od-rail">
            <span className="od-node" />
            <span className="od-line" />
            <span className="od-node end" />
          </div>
          <div className="od-text">
            <div className="od-block">
              <span>From</span>
              <b>{origin?.name ?? 'Main Gate'}</b>
            </div>
            <div className="od-block">
              <span>To</span>
              <b>{dest?.name ?? '—'}</b>
            </div>
          </div>
        </div>

        <div className="nav-meta">
          <span className="badge warn">Demo route</span>
          <span className="badge">{nav.route.steps.length} steps</span>
          {dest && <span className="badge">{FLOOR_LABEL[dest.floor]}</span>}
        </div>

        <select
          className="origin-select"
          value={originId}
          onChange={(e) => changeOrigin(e.target.value)}
          aria-label="Starting point"
        >
          {ORIGIN_CHOICES.filter((id) => LOCATION_BY_ID[id]).map((id) => (
            <option key={id} value={id}>
              Start: {LOCATION_BY_ID[id].name}
            </option>
          ))}
        </select>
      </div>

      <ol className="steps panel-scroll">
        {nav.route.steps.map((s, i) => (
          <li key={`${s.nodeId}-${i}`}>
            <button className="step" data-active={i === nav.step} onClick={() => setStep(i)}>
              <span className="step-ico">{stepIcon(s.kind)}</span>
              <span>
                <span className="step-txt">{s.text}</span>
                <span className="step-floor">
                  {FLOOR_LABEL[s.floor]}
                  {i === nav.step ? ' · current step' : ''}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="nav-footer">
        <button className="btn btn-quiet btn-sm" onClick={exitNav}>
          <LogOut size={15} />
          Exit Navigation
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setStep(nav.step)}>
          <Crosshair size={15} />
          Recenter
        </button>
      </div>

      <p
        style={{
          margin: 0,
          padding: '10px 14px 14px',
          fontSize: 11.5,
          color: 'var(--ink-3)',
          lineHeight: 1.5,
        }}
      >
        Route is simulated from demo waypoint data for {dest?.name ?? 'the destination'}
        {destBuilding ? ` in ${destBuilding.name}` : ''}. No real walking distance or arrival time is
        claimed.
      </p>
    </div>
  )
}
