import type { LocationType, NodeKind, Rect } from '../types'

/* ------------------------------------------------------------------ *
 *  DATASET MODEL (Phase 0.1)
 *  Types only — no data, no runtime code.
 *
 *  A CampusDataset is the single root object that describes one campus.
 *  The demo dataset and the future verified KKW dataset share this exact
 *  shape; only their contents differ. Nothing here invents campus facts.
 * ------------------------------------------------------------------ */

export type EntityStatus = 'demo' | 'unverified' | 'verified'

/** Provenance attached to every record collected from the real campus. */
export interface Provenance {
  status: EntityStatus
  source?: string
  verifiedOn?: string
  notes?: string
}

/** SVG viewport for the dataset. Replaces the hard-coded 1200 x 840. */
export interface MapFrame {
  width: number
  height: number
}

/** Decorative + structural site layer. Currently lives in src/map/MapBase.tsx. */
export interface SiteGeometry {
  boundary?: string
  roads: string[]
  paths?: string[]
  trees?: { x: number; y: number; r?: number }[]
  gateIds?: string[]
  overlays?: string[]
}

export interface BuildingV2 {
  id: string
  name: string
  short: string
  rect: Rect
  floorIds: string[]
  doorNodeId?: string
  status: EntityStatus
}

export interface FloorV2 {
  id: string
  buildingId: string
  level: number
  label: string
  shortLabel: string
}

export interface Corridor {
  id: string
  buildingId: string
  floorId: string
  rect?: Rect
  path?: { x: number; y: number }[]
  roomIds: string[]
}

export interface Room {
  id: string
  name: string
  buildingId: string
  floorId: string
  corridorId?: string
  roomNumber?: string
  type: LocationType
  tags: string[]
  description: string
  geometry: { x: number; y: number; rect?: Rect; footprint?: boolean }
  nodeId?: string
  status: EntityStatus
  provenance?: Provenance
}

export interface NavNode {
  id: string
  x: number
  y: number
  floorId: string
  kind: NodeKind
  label?: string
  roomId?: string
  status: EntityStatus
}

export interface NavEdge {
  from: string
  to: string
  kind?: 'walk' | 'stairs' | 'lift' | 'door'
  label?: string
}

export interface CampusDataset {
  id: string
  name: string
  meta: Provenance & { disclaimer?: string }
  frame: MapFrame
  unitsPerMetre?: number

  campus: {
    id: string
    name: string
    entranceIds: string[]
    defaultOriginId: string
  }

  buildings: BuildingV2[]
  floors: FloorV2[]
  corridors: Corridor[]
  rooms: Room[]
  site: SiteGeometry

  graph: {
    nodes: NavNode[]
    edges: NavEdge[]
  }
}
