import { LOCATIONS, TYPE_LABEL, BUILDING_BY_ID, FLOOR_LABEL } from '../data/campus'
import type { Location } from '../types'

export interface SearchResult {
  location: Location
  score: number
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function scoreOf(l: Location, q: string): number {
  const name = normalise(l.name)
  const building = normalise(BUILDING_BY_ID[l.buildingId]?.name ?? '')
  const room = normalise(l.room ?? '')
  const tags = normalise(l.tags.join(' '))
  const type = normalise(TYPE_LABEL[l.type])

  if (name === q) return 100
  if (room && room === q) return 95
  if (name.startsWith(q)) return 90
  if (room.startsWith(q)) return 85
  if (tags.startsWith(q)) return 80
  if (name.includes(q)) return 70
  if (room.includes(q)) return 65
  if (tags.includes(q)) return 60
  if (building.includes(q)) return 45
  if (type.includes(q)) return 40
  if (q.split(' ').every((w) => (name + ' ' + tags + ' ' + building + ' ' + type).includes(w))) return 35
  return 0
}

export function searchLocations(query: string, limit = 8): SearchResult[] {
  const q = normalise(query)
  if (!q) return []
  return LOCATIONS.map((location) => ({ location, score: scoreOf(location, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.location.name.localeCompare(b.location.name))
    .slice(0, limit)
}

export function suggestLabel(l: Location): string {
  const b = BUILDING_BY_ID[l.buildingId]
  return [b?.name, FLOOR_LABEL[l.floor]].filter(Boolean).join(' · ')
}
