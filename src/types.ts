export type FloorId = 'B' | 'G' | '1' | '2' | '3'

export type LocationType =
  | 'building'
  | 'lab'
  | 'classroom'
  | 'hall'
  | 'library'
  | 'canteen'
  | 'entrance'
  | 'office'
  | 'department'
  | 'facility'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Building {
  id: string
  name: string
  short: string
  rect: Rect
  floors: FloorId[]
  corridor?: Rect
  doorNode: string
}

export interface Location {
  id: string
  name: string
  type: LocationType
  buildingId: string
  floor: FloorId
  room?: string
  description: string
  x: number
  y: number
  rect?: Rect
  nodeId: string
  demo: boolean
  tags: string[]
  /** true when the location is represented by a building footprint instead of a pin */
  footprint?: boolean
}

export type NodeKind = 'entrance' | 'junction' | 'corridor' | 'stairs' | 'elevator' | 'room'

export interface GraphNode {
  id: string
  x: number
  y: number
  floor: FloorId
  kind: NodeKind
  label?: string
}

export interface GraphEdge {
  from: string
  to: string
  label?: string
}

export type StepKind = 'start' | 'move' | 'stairs' | 'elevator' | 'exit' | 'arrive'

export interface NavStep {
  kind: StepKind
  text: string
  nodeId: string
  floor: FloorId
}

export interface NavRoute {
  path: string[]
  nodes: GraphNode[]
  steps: NavStep[]
  distance: number
}

export type ViewId = 'home' | 'map' | 'directory'
