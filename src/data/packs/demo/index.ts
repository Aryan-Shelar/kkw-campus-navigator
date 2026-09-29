import type { FloorId } from '../../../types'
import type { BuildingV2, CampusDataset, Corridor, FloorV2, NavEdge, NavNode, Room } from '../../model'
import { BUILDINGS, FLOOR_LABEL, LOCATIONS, LOCATION_BY_ID } from '../../campus'
import { GRAPH_EDGES, GRAPH_NODES } from '../../graph'

/* ------------------------------------------------------------------ *
 *  DEMO DATASET PACK (Phase 0.2)
 *  Builds a CampusDataset out of the EXISTING src/data/campus.ts and
 *  src/data/graph.ts. Nothing is moved, rewritten or duplicated here —
 *  both modules stay exactly as they are and remain the source of truth.
 *
 *  Every field below is derived from those two modules; no campus fact
 *  is invented. `site` geometry is intentionally empty until Phase 2.
 * ------------------------------------------------------------------ */

const STATUS = 'demo' as const
const SITE_ID = 'site'

const LEVEL: Record<FloorId, number> = { B: -1, G: 0, '1': 1, '2': 2, '3': 3 }

const floorIdOf = (buildingId: string, floor: FloorId): string => `${buildingId}-${floor}`

/** Floor keys used by the location records that belong to no building. */
const siteFloorKeys: FloorId[] = [
  ...new Set(LOCATIONS.filter((l) => l.buildingId === SITE_ID).map((l) => l.floor)),
].sort((a, b) => LEVEL[a] - LEVEL[b])

/** Campus extent implied by the data (union of every recorded rect). */
const siteRect = (() => {
  const rects = LOCATIONS.flatMap((l) => (l.rect ? [l.rect] : []))
  const minX = Math.min(...rects.map((r) => r.x))
  const minY = Math.min(...rects.map((r) => r.y))
  const maxX = Math.max(...rects.map((r) => r.x + r.w))
  const maxY = Math.max(...rects.map((r) => r.y + r.h))
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
})()

const entranceIds: string[] = LOCATIONS.filter((l) => l.type === 'entrance').map((l) => l.id)
const defaultOriginId: string = entranceIds[0] ?? LOCATIONS[0].id

/* ------------------------------ buildings ------------------------------ */

const buildingFloorKeys = new Map<string, FloorId[]>()
for (const b of BUILDINGS) buildingFloorKeys.set(b.id, b.floors)
buildingFloorKeys.set(SITE_ID, siteFloorKeys)

const buildings: BuildingV2[] = BUILDINGS.map((b) => ({
  id: b.id,
  name: b.name,
  short: b.short,
  rect: b.rect,
  floorIds: [],
  doorNodeId: b.doorNode,
  status: STATUS,
}))

buildings.push({
  id: SITE_ID,
  name: 'Campus grounds',
  short: 'SITE',
  rect: siteRect,
  floorIds: [],
  status: STATUS,
})

/* -------------------------------- floors ------------------------------- */

const floors: FloorV2[] = []
for (const b of buildings) {
  const keys = buildingFloorKeys.get(b.id) ?? []
  b.floorIds = keys.map((f) => {
    const id = floorIdOf(b.id, f)
    floors.push({
      id,
      buildingId: b.id,
      level: LEVEL[f],
      label: FLOOR_LABEL[f],
      shortLabel: f,
    })
    return id
  })
}

/* ------------------------------ corridors ------------------------------ */

const corridors: Corridor[] = []
for (const b of BUILDINGS) {
  if (!b.corridor) continue
  for (const f of b.floors) {
    corridors.push({
      id: `${b.id}-${f}-corridor`,
      buildingId: b.id,
      floorId: floorIdOf(b.id, f),
      rect: b.corridor,
      roomIds: LOCATIONS.filter(
        (l) => l.buildingId === b.id && l.floor === f && l.rect && !l.footprint,
      ).map((l) => l.id),
    })
  }
}

const corridorOfRoom = new Map<string, string>()
for (const c of corridors) for (const rid of c.roomIds) corridorOfRoom.set(rid, c.id)

/* --------------------------------- rooms ------------------------------- */

const rooms: Room[] = LOCATIONS.map((l) => ({
  id: l.id,
  name: l.name,
  buildingId: l.buildingId,
  floorId: floorIdOf(l.buildingId, l.floor),
  corridorId: corridorOfRoom.get(l.id),
  roomNumber: l.room,
  type: l.type,
  tags: l.tags,
  description: l.description,
  geometry: { x: l.x, y: l.y, rect: l.rect, footprint: l.footprint },
  nodeId: l.nodeId,
  status: STATUS,
}))

/* ------------------------------ nav graph ------------------------------ */

/** A node belongs to the building whose footprint contains it, else to the site. */
const buildingAt = (x: number, y: number): string => {
  for (const b of BUILDINGS) {
    const r = b.rect
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return b.id
  }
  return SITE_ID
}

const nodes: NavNode[] = GRAPH_NODES.map((n): NavNode => {
  const buildingId = buildingAt(n.x, n.y)
  return {
    id: n.id,
    x: n.x,
    y: n.y,
    floorId: floorIdOf(buildingId, n.floor),
    kind: n.kind,
    label: n.label,
    roomId: n.kind === 'room' && LOCATION_BY_ID[n.id] ? n.id : undefined,
    status: STATUS,
  }
})

const edges: NavEdge[] = GRAPH_EDGES.map((e): NavEdge => ({
  from: e.from,
  to: e.to,
  kind: e.label === 'Stairs' ? 'stairs' : e.label === 'Lift' ? 'lift' : 'walk',
  label: e.label,
}))

/* ------------------------------- dataset ------------------------------- */

export const demoDataset: CampusDataset = {
  id: 'demo',
  name: 'Demo Campus',
  meta: {
    status: STATUS,
    source: 'Hand-authored prototype data',
    disclaimer: 'DEMO CAMPUS PLAN · NOT A VERIFIED KKW LAYOUT',
  },
  frame: { width: 1200, height: 840 },

  campus: {
    id: 'demo-campus',
    name: 'Demo Campus',
    entranceIds,
    defaultOriginId,
  },

  buildings,
  floors,
  corridors,
  rooms,
  site: { roads: [] },

  graph: { nodes, edges },
}
