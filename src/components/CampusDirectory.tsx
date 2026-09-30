import { useMemo, useState } from 'react'
import { MapPin, ArrowUpRight } from 'lucide-react'
import { LOCATIONS, BUILDING_BY_ID, FLOOR_LABEL, TYPE_LABEL } from '../data'
import { TYPE_COLOR_VAR } from '../map/icons'
import type { Location, LocationType } from '../types'

export type DirCategory = 'All' | 'Classrooms' | 'Labs' | 'Departments' | 'Halls' | 'Facilities' | 'Offices'

const CATEGORIES: DirCategory[] = ['All', 'Classrooms', 'Labs', 'Departments', 'Halls', 'Facilities', 'Offices']

const CATEGORY_TYPES: Record<Exclude<DirCategory, 'All'>, LocationType[]> = {
  Classrooms: ['classroom'],
  Labs: ['lab'],
  Departments: ['department', 'building'],
  Halls: ['hall'],
  Facilities: ['facility', 'library', 'canteen', 'entrance'],
  Offices: ['office'],
}

export function CampusDirectory({ onPick }: { onPick?: (l: Location) => void }) {
  const [cat, setCat] = useState<DirCategory>('All')
  const [q, setQ] = useState('')

  const items = useMemo(() => {
    const query = q.trim().toLowerCase()
    return LOCATIONS.filter((l) => {
      if (cat !== 'All' && !CATEGORY_TYPES[cat].includes(l.type)) return false
      if (!query) return true
      const hay = `${l.name} ${l.room ?? ''} ${BUILDING_BY_ID[l.buildingId]?.name ?? ''} ${l.tags.join(' ')} ${TYPE_LABEL[l.type]}`.toLowerCase()
      return hay.includes(query)
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [cat, q])

  return (
    <div>
      <div className="dir-chips" role="tablist">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className="dir-chip"
            role="tab"
            aria-selected={cat === c}
            data-active={cat === c}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="search-field" style={{ marginTop: 14 }}>
        <MapPin size={15} color="var(--ink-3)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter the campus directory…"
          aria-label="Filter directory"
        />
        <span className="search-kbd">{items.length}</span>
      </div>

      <div className="dir-list">
        {items.map((l, i) => {
          const b = BUILDING_BY_ID[l.buildingId]
          const color = TYPE_COLOR_VAR[l.type]
          return (
            <button
              key={l.id}
              className="dir-card"
              style={{ animationDelay: `${Math.min(i, 14) * 22}ms`, color }}
              onClick={() => onPick?.(l)}
            >
              <span className="dir-ico">
                <MapPin size={17} />
              </span>
              <span style={{ color: 'var(--ink)', minWidth: 0, flex: 1 }}>
                <h4>{l.name}</h4>
                <p>
                  {b?.name ?? 'Campus grounds'} · {FLOOR_LABEL[l.floor]}
                  {l.room ? ` · ${l.room}` : ''}
                </p>
                <span className="dir-tags">
                  {TYPE_LABEL[l.type]} · demo
                </span>
              </span>
              <ArrowUpRight size={15} color="var(--ink-3)" style={{ flexShrink: 0 }} />
            </button>
          )
        })}
        {items.length === 0 && (
          <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
            Nothing matches that filter in the demo dataset.
          </p>
        )}
      </div>
    </div>
  )
}
