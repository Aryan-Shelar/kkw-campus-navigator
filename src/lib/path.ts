import { ADJACENCY, NODE_BY_ID, FLOOR_LABEL } from '../data'
import type { GraphNode, NavRoute, NavStep } from '../types'

const FALL_COST = 40
const FLOOR_CHANGE = 60

interface EdgeInfo {
  to: string
  label?: string
}

export function shortestPath(fromId: string, toId: string): string[] | null {
  if (!NODE_BY_ID[fromId] || !NODE_BY_ID[toId]) return null
  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  const visited = new Set<string>()
  const queue: string[] = []

  for (const id of Object.keys(ADJACENCY)) {
    dist[id] = Infinity
    prev[id] = null
  }
  dist[fromId] = 0
  queue.push(fromId)

  while (queue.length) {
    let best = 0
    for (let i = 1; i < queue.length; i++) if (dist[queue[i]] < dist[queue[best]]) best = i
    const cur = queue.splice(best, 1)[0]
    if (visited.has(cur)) continue
    visited.add(cur)
    if (cur === toId) break

    const edges: EdgeInfo[] = ADJACENCY[cur] ?? []
    for (const e of edges) {
      const a = NODE_BY_ID[cur]
      const b = NODE_BY_ID[e.to]
      if (!a || !b) continue
      const d = Math.hypot(b.x - a.x, b.y - a.y)
      const cross = a.floor !== b.floor ? FLOOR_CHANGE : 0
      const nd = dist[cur] + d + cross + (b.kind === 'room' ? FALL_COST : 0)
      if (nd < dist[e.to]) {
        dist[e.to] = nd
        prev[e.to] = cur
        queue.push(e.to)
      }
    }
  }

  if (dist[toId] === Infinity) return null
  const path: string[] = []
  let cur: string | null = toId
  while (cur) {
    path.unshift(cur)
    cur = prev[cur]
  }
  return path
}

function edgeLabel(a: GraphNode, b: GraphNode): string | undefined {
  const list = ADJACENCY[a.id] ?? []
  return list.find((e) => e.to === b.id)?.label
}

function stepText(prev: GraphNode | undefined, node: GraphNode, next?: GraphNode): string {
  if (!prev) return `Start at ${node.label ?? describe(node)}.`
  if (node.floor !== prev.floor) {
    const dir = FLOOR_ORDER_INDEX[node.floor] > FLOOR_ORDER_INDEX[prev.floor] ? 'up' : 'down'
    const how = edgeLabel(prev, node) === 'Lift' ? 'Take the lift' : 'Take the stairs'
    return `${how} ${dir} to the ${FLOOR_LABEL[node.floor]}.`
  }
  if (node.kind === 'stairs' || node.kind === 'elevator') return `Head towards the ${node.label ?? 'stairs'}.`
  if (node.kind === 'entrance') return `Exit through the ${node.label ?? 'entrance'}.`
  if (node.kind === 'corridor') return `Follow the corridor${next && next.kind === 'room' ? ` towards ${next.label ?? 'the room'}` : ''}.`
  if (node.kind === 'room') return `Arrive at ${node.label ?? 'the destination'}.`
  if (node.kind === 'junction') return 'Follow the campus path.'
  return `Continue to ${node.label ?? 'the waypoint'}.`
}

const FLOOR_ORDER_INDEX: Record<string, number> = { B: 0, G: 1, '1': 2, '2': 3, '3': 4 }

function describe(n: GraphNode): string {
  if (n.label) return n.label
  return `waypoint (${n.floor})`
}

export function buildRoute(fromId: string, toId: string): NavRoute | null {
  const ids = shortestPath(fromId, toId)
  if (!ids || ids.length === 0) return null
  const nodes = ids.map((id) => NODE_BY_ID[id]).filter(Boolean)
  if (nodes.length < 2) return null

  const steps: NavStep[] = []
  let distance = 0

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    const prev = nodes[i - 1]
    const next = nodes[i + 1]
    if (i > 0 && prev) distance += Math.hypot(n.x - prev.x, n.y - prev.y)

    let kind: NavStep['kind'] = 'move'
    if (i === 0) kind = 'start'
    else if (i === nodes.length - 1) kind = 'arrive'
    else if (n.kind === 'stairs') kind = 'stairs'
    else if (n.kind === 'elevator') kind = 'elevator'
    else if (n.kind === 'entrance' && prev && prev.floor !== n.floor) kind = 'exit'
    else if (n.kind === 'entrance' && next && next.floor !== n.floor) kind = 'exit'

    steps.push({ kind, text: stepText(prev, n, next), nodeId: n.id, floor: n.floor })
  }

  // merge consecutive corridor "move" steps so the list stays readable
  const merged: NavStep[] = []
  for (const s of steps) {
    const last = merged[merged.length - 1]
    if (last && last.kind === 'move' && s.kind === 'move' && last.floor === s.floor && last.nodeId !== s.nodeId) {
      continue
    }
    merged.push(s)
  }

  return { path: ids, nodes, steps: merged.length ? merged : steps, distance }
}
