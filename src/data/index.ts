import type { Building, FloorId, GraphEdge, GraphNode, Location } from '../types'
import type { CampusDataset } from './model'
import { demoDataset } from './packs/demo'
import { TYPE_LABEL } from './campus'

/* ------------------------------------------------------------------ *
 *  DATA FACADE (Phase 0.3)
 *  Single import point for the app. ACTIVE_DATASET selects the pack;
 *  every legacy name the UI already imports is derived from it, so a
 *  dataset swap later changes the whole app from one line.
 *
 *  Derived values are identical to ./campus and ./graph today.
 * ------------------------------------------------------------------ */

export const ACTIVE_DATASET: CampusDataset = demoDataset

export { TYPE_LABEL }

const D: CampusDataset = ACTIVE_DATASET

const FLOORS_BY_ID = new Map(D.floors.map((f) => [f.id, f]))

const floorKeyOf = (floorId: string): FloorId =>
  (FLOORS_BY_ID.get(floorId)?.shortLabel ?? 'G') as FloorId

/* -------------------------------- floors ------------------------------- */

export const FLOOR_ORDER: FloorId[] = D.floors
  .slice()
  .sort((a, b) => a.level - b.level)
  .map((f) => f.shortLabel as FloorId)
  .filter((v, i, arr) => arr.indexOf(v) === i)

export const FLOOR_LABEL: Record<FloorId, string> = Object.fromEntries(
  D.floors.map((f) => [f.shortLabel, f.label]),
) as Record<FloorId, string>

/* ------------------------------ buildings ------------------------------ */

/** Legacy Building requires a doorNode, so buildings without one are not drawable. */
export const BUILDINGS: Building[] = D.buildings.flatMap((b): Building[] => {
  if (!b.doorNodeId) return []
  return [
    {
      id: b.id,
      name: b.name,
      short: b.short,
      rect: b.rect,
      floors: b.floorIds.map(floorKeyOf),
      doorNode: b.doorNodeId,
      corridor: D.corridors.find((c) => c.buildingId === b.id)?.rect,
    },
  ]
})

export const BUILDING_BY_ID: Record<string, Building> = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, b]),
)

/* -------------------------------- locations ---------------------------- */

export const LOCATIONS: Location[] = D.rooms.map((r) => ({
  id: r.id,
  name: r.name,
  type: r.type,
  buildingId: r.buildingId,
  floor: floorKeyOf(r.floorId),
  room: r.roomNumber,
  description: r.description,
  x: r.geometry.x,
  y: r.geometry.y,
  rect: r.geometry.rect,
  nodeId: r.nodeId ?? r.id,
  demo: r.status === 'demo',
  tags: r.tags,
  footprint: r.geometry.footprint,
}))

export const LOCATION_BY_ID: Record<string, Location> = Object.fromEntries(
  LOCATIONS.map((l) => [l.id, l]),
)

/* ------------------------------- nav graph ----------------------------- */

export const GRAPH_NODES: GraphNode[] = D.graph.nodes.map((n) => ({
  id: n.id,
  x: n.x,
  y: n.y,
  floor: floorKeyOf(n.floorId),
  kind: n.kind,
  label: n.label,
}))

export const GRAPH_EDGES: GraphEdge[] = D.graph.edges.map((e) => ({
  from: e.from,
  to: e.to,
  label: e.label,
}))

export const NODE_BY_ID: Record<string, GraphNode> = Object.fromEntries(
  GRAPH_NODES.map((n) => [n.id, n]),
)

export const ADJACENCY: Record<string, { to: string; label?: string }[]> = (() => {
  const a: Record<string, { to: string; label?: string }[]> = {}
  for (const n of GRAPH_NODES) a[n.id] = []
  for (const e of GRAPH_EDGES) {
    a[e.from]?.push({ to: e.to, label: e.label })
    a[e.to]?.push({ to: e.from, label: e.label })
  }
  return a
})()

export const ALL_BUILDINGS = BUILDINGS
