import { BUILDINGS, BUILDING_BY_ID, FLOOR_ORDER } from './campus'
import type { FloorId, GraphEdge, GraphNode } from '../types'

/* ------------------------------------------------------------------ *
 *  DEMO NAVIGATION GRAPH
 *  A small graph of waypoints. Swap this file for a verified campus
 *  graph later — the pathfinder only depends on nodes + edges.
 * ------------------------------------------------------------------ */

const nodes: GraphNode[] = []
const edges: GraphEdge[] = []

const N = (id: string, x: number, y: number, floor: FloorId, kind: GraphNode['kind'], label?: string) => {
  nodes.push({ id, x, y, floor, kind, label })
}
const E = (from: string, to: string, label?: string) => edges.push({ from, to, label })

/* ---------------------------- walkways ---------------------------- */

const S1_X = [120, 182, 317, 486, 600, 786, 877, 1025, 1120]
const S2_X = [120, 235, 500, 600, 824, 1030, 1120]

S1_X.forEach((x, i) => N(`s1-${i}`, x, 620, 'G', 'junction'))
S2_X.forEach((x, i) => N(`s2-${i}`, x, 300, 'G', 'junction'))
for (let i = 0; i < S1_X.length - 1; i++) E(`s1-${i}`, `s1-${i + 1}`)
for (let i = 0; i < S2_X.length - 1; i++) E(`s2-${i}`, `s2-${i + 1}`)

N('main-gate', 600, 800, 'G', 'entrance', 'Main Gate')
N('gate-plaza', 600, 700, 'G', 'junction')
N('spine-c', 600, 620, 'G', 'junction')
N('v-n', 600, 300, 'G', 'junction')
E('main-gate', 'gate-plaza')
E('gate-plaza', 'spine-c')
E('spine-c', 's1-4')
E('spine-c', 'v-n')
E('v-n', 's2-3')

/* -------------------------- block builder ------------------------- */

interface BlockRooms {
  [floor: string]: {
    top: { id: string; name: string }[]
    bot: { id: string; name: string }[]
  }
}

interface G {
  cy: number
  cols: { cx: number }[]
  topY: number
  topH: number
  botY: number
  botH: number
  stairsNode: { x: number; y: number }
  elevNode: { x: number; y: number }
}

function genBlock(
  buildingId: string,
  rect: { x: number; y: number; w: number; h: number },
  g: G,
  rooms: BlockRooms,
  doorColIndex: number,
) {
  const b = BUILDING_BY_ID[buildingId]
  const floors = Object.keys(rooms) as FloorId[]

  for (const f of floors) {
    const spec = rooms[f]
    const corridor: string[] = g.cols.map((_, i) => `${buildingId}-${f}-c${i}`)

    g.cols.forEach((c, i) => N(corridor[i], c.cx, g.cy, f, 'corridor'))
    const st = `${buildingId}-${f}-st`
    const el = `${buildingId}-${f}-el`
    N(st, g.stairsNode.x, g.stairsNode.y, f, 'stairs', 'Stairs')
    N(el, g.elevNode.x, g.elevNode.y, f, 'elevator', 'Lift')

    E(st, corridor[0])
    E(el, corridor[corridor.length - 1])
    for (let i = 0; i < corridor.length - 1; i++) E(corridor[i], corridor[i + 1])

    spec.top.forEach((m, i) => {
      N(m.id, g.cols[i].cx, g.topY + g.topH / 2, f, 'room', m.name)
      E(m.id, corridor[i])
    })
    spec.bot.forEach((m, i) => {
      N(m.id, g.cols[i].cx, g.botY + g.botH / 2, f, 'room', m.name)
      E(m.id, corridor[i])
    })

    if (f === 'G') {
      const doorX = g.cols[doorColIndex].cx
      N(b.doorNode, doorX, rect.y + rect.h, 'G', 'entrance', `${b.name} entrance`)
      const anchor = spec.bot[doorColIndex]?.id ?? corridor[doorColIndex]
      E(b.doorNode, anchor)
    }
  }

  const order = FLOOR_ORDER.filter((f) => floors.includes(f))
  for (let i = 0; i < order.length - 1; i++) {
    const a = order[i]
    const c = order[i + 1]
    E(`${buildingId}-${a}-st`, `${buildingId}-${c}-st`, 'Stairs')
    E(`${buildingId}-${a}-el`, `${buildingId}-${c}-el`, 'Lift')
  }
}

/* floors on which the generic room grid is drawn */
const BLOCK_A: BlockRooms = {
  G: { top: [{ id: 'a-seminar', name: 'Seminar Hall A' }, { id: 'a-cpulab1', name: 'Computer Lab 1' }, { id: 'a-cpulab2', name: 'Computer Lab 2' }], bot: [{ id: 'a-101', name: 'Room A-101' }, { id: 'a-lobby', name: 'Block A Lobby' }, { id: 'a-staff', name: 'Staff Room A' }] },
  '1': { top: [{ id: 'a-aids1', name: 'AIDS Lab 1' }, { id: 'a-aids2', name: 'AIDS Lab 2' }, { id: 'a-204', name: 'Room A-204' }], bot: [{ id: 'a-chem', name: 'Chemistry Lab' }, { id: 'a-graphics', name: 'Engineering Graphics Lab' }, { id: 'a-facroom', name: 'Block A Staff Room' }] },
  '2': { top: [{ id: 'a-201', name: 'Room A-201' }, { id: 'a-202', name: 'Room A-202' }, { id: 'a-203', name: 'Seminar Room A-203' }], bot: [{ id: 'a-project', name: 'Project Lab A' }, { id: 'a-206', name: 'Tutorial Room A-206' }, { id: 'a-207', name: 'Faculty Cabin A-207' }] },
  '3': { top: [{ id: 'a-301', name: 'Room A-301' }, { id: 'a-302', name: 'Room A-302' }, { id: 'a-303', name: 'Room A-303' }], bot: [{ id: 'a-innov', name: 'Innovation Lab' }, { id: 'a-305', name: 'Discussion Room A-305' }, { id: 'a-306', name: 'Department Library A' }] },
  B: { top: [{ id: 'a-archive', name: 'Block A Archive' }, { id: 'a-av', name: 'Audio Visual Store' }, { id: 'a-store', name: 'Maintenance Store' }], bot: [] },
}

const BLOCK_B: BlockRooms = {
  G: { top: [{ id: 'b-physics', name: 'Physics Lab' }, { id: 'b-sci', name: 'Engineering Science Lab' }, { id: 'b-drawing', name: 'Drawing Hall B' }], bot: [{ id: 'b-101', name: 'Room B-101' }, { id: 'b-lobby', name: 'Block B Lobby' }, { id: 'b-office', name: 'Block B Office' }] },
  '1': { top: [{ id: 'b-201', name: 'Room B-201' }, { id: 'b-202', name: 'Room B-202' }, { id: 'b-dslab', name: 'Data Science Lab' }], bot: [{ id: 'b-aillab', name: 'AI & ML Lab' }, { id: 'b-eclab', name: 'Electronics Lab' }, { id: 'b-faculty', name: 'Block B Staff Room' }] },
  '2': { top: [{ id: 'b-301', name: 'Room B-301' }, { id: 'b-302', name: 'Room B-302' }, { id: 'b-semb', name: 'Seminar Room B' }], bot: [{ id: 'b-project', name: 'Project Lab B' }, { id: 'b-conf', name: 'Conference Room B' }, { id: 'b-hod', name: 'HOD Cabin B' }] },
  B: { top: [{ id: 'b-workshop', name: 'Workshop' }, { id: 'b-machine', name: 'Machine Shop' }, { id: 'b-store', name: 'Block B Store' }], bot: [] },
}

const DEPT: BlockRooms = {
  G: { top: [{ id: 'dept-office', name: 'AI & DS Department Office' }, { id: 'dept-conf', name: 'Conference Room' }], bot: [{ id: 'dept-reception', name: 'Department Reception' }, { id: 'dept-lobby', name: 'Dept. Lobby' }] },
  '1': { top: [{ id: 'aids-research', name: 'AI Research Lab' }, { id: 'data-lab', name: 'Data Analytics Lab' }], bot: [{ id: 'd-class1', name: 'Classroom D-101' }, { id: 'd-store1', name: 'Project Store' }] },
  '2': { top: [{ id: 'd-class2', name: 'Classroom D-201' }, { id: 'd-proj', name: 'Project Lab D' }], bot: [{ id: 'd-ai', name: 'AI Innovation Lab' }, { id: 'd-meet', name: 'Meeting Room D' }] },
  '3': { top: [{ id: 'd-server', name: 'Server Room' }, { id: 'd-director', name: 'HOD Cabin' }], bot: [{ id: 'd-seminar', name: 'Seminar Room D' }, { id: 'd-archive', name: 'Department Archive' }] },
}

function mk(bx: number, by: number, bw: number, bh: number, n: number) {
  const cy = by + bh / 2
  const seg = (bw - 16) / n
  const w = seg - 6
  const cols = Array.from({ length: n }, (_, i) => ({ x: bx + 8 + i * seg, w, cx: bx + 8 + i * seg + w / 2 }))
  const topY = by + 14
  const topH = cy - 13 - 14 - topY
  const botY = cy + 13 + 14
  const botH = by + bh - 14 - botY
  return { cy, cols, topY, topH, botY, botH, stairsNode: { x: bx + 21, y: cy }, elevNode: { x: bx + bw - 21, y: cy } }
}

genBlock('block-a', { x: 70, y: 330, w: 500, h: 260 }, mk(70, 330, 500, 260, 3), BLOCK_A, 1)
genBlock('block-b', { x: 630, y: 330, w: 500, h: 260 }, mk(630, 330, 500, 260, 3), BLOCK_B, 1)
genBlock('aids-dept', { x: 630, y: 70, w: 270, h: 200 }, mk(630, 70, 270, 200, 2), DEPT, 1)

/* ----------------------------- library ---------------------------- */

N('lib-door', 235, 270, 'G', 'entrance', 'Library entrance')
N('lib-c', 235, 199, 'G', 'corridor')
N('lib-cw', 160, 199, 'G', 'corridor')
N('lib-ce', 330, 199, 'G', 'corridor')
N('lib-stairs-g', 102, 199, 'G', 'stairs', 'Stairs')
N('lib-reading', 235, 134, 'G', 'room', 'Main Reading Hall')
N('lib-circ', 146, 239, 'G', 'room', 'Circulation Desk')
N('lib-digital', 327, 239, 'G', 'room', 'Digital Library')
E('lib-door', 'lib-c')
E('lib-c', 'lib-cw')
E('lib-c', 'lib-ce')
E('lib-cw', 'lib-stairs-g')
E('lib-cw', 'lib-circ')
E('lib-ce', 'lib-digital')
E('lib-c', 'lib-reading')

N('lib-stairs-1', 102, 199, '1', 'stairs', 'Stairs')
N('lib1-c', 235, 199, '1', 'corridor')
N('lib-stack', 235, 134, '1', 'room', 'Reference & Book Stack')
E('lib-stairs-g', 'lib-stairs-1', 'Stairs')
E('lib-stairs-1', 'lib1-c')
E('lib1-c', 'lib-stack')

N('lib-stairs-2', 375, 174, '2', 'stairs', 'Stairs')
N('lib2-c', 351, 174, '2', 'corridor')
N('lib-study', 146, 174, '2', 'room', 'Silent Study Zone')
N('lib-journal', 276, 174, '2', 'room', 'Journal Room')
E('lib-stairs-1', 'lib-stairs-2', 'Stairs')
E('lib-stairs-2', 'lib2-c')
E('lib2-c', 'lib-journal')
E('lib-journal', 'lib-study')

N('lib-stairs-b', 374, 174, 'B', 'stairs', 'Stairs')
N('lib-b-c', 349, 174, 'B', 'corridor')
N('lib-archive', 210, 174, 'B', 'room', 'Basement Archive')
E('lib-stairs-g', 'lib-stairs-b', 'Stairs')
E('lib-stairs-b', 'lib-b-c')
E('lib-b-c', 'lib-archive')

E('lib-door', 's2-1')

/* ------------------- small standalone buildings ------------------- */

function room(id: string, x: number, y: number, name: string) {
  N(id, x, y, 'G', 'room', name)
}

// Administration
N('admin-door', 182, 650, 'G', 'entrance', 'Administration entrance')
N('admin-c', 182, 720, 'G', 'corridor')
room('admin-accounts', 130, 720, 'Accounts & Fees Counter')
room('admin-principal', 236, 691, "Principal's Office")
room('admin-registrar', 236, 751, 'Registrar Office')
E('admin-door', 'admin-c')
E('admin-c', 'admin-accounts')
E('admin-c', 'admin-principal')
E('admin-c', 'admin-registrar')
E('admin-door', 's1-1')

// Student Activity Center
N('sac-door', 486, 650, 'G', 'entrance', 'SAC entrance')
N('sac-c', 486, 720, 'G', 'corridor')
room('sac-hall', 417, 720, 'Activity Hall')
room('sac-common', 524, 720, 'Student Common Room')
E('sac-door', 'sac-c')
E('sac-c', 'sac-hall')
E('sac-c', 'sac-common')
E('sac-door', 's1-3')

// Canteen
N('canteen-door', 786, 650, 'G', 'entrance', 'Canteen entrance')
N('canteen-c', 786, 720, 'G', 'corridor')
room('canteen-main', 712, 720, 'Canteen Counter')
room('canteen-seat', 829, 720, 'Outdoor Seating')
E('canteen-door', 'canteen-c')
E('canteen-c', 'canteen-main')
E('canteen-c', 'canteen-seat')
E('canteen-door', 's1-5')

// Introduction Hall
N('intro-door', 1025, 650, 'G', 'entrance', 'Introduction Hall entrance')
room('intro-main', 1025, 720, 'Introduction Hall Stage')
E('intro-door', 'intro-main')
E('intro-door', 's1-7')

// Parking + Sports
N('park-door', 500, 270, 'G', 'entrance', 'Parking entrance')
E('park-door', 's2-2')
N('sports-door', 1030, 270, 'G', 'entrance', 'Sports ground entrance')
E('sports-door', 's2-5')

E('block-a-door', 's1-2')
E('block-b-door', 's1-6')
E('aids-dept-door', 's2-4')

/* ----------------------------- exports ---------------------------- */

export const GRAPH_NODES: GraphNode[] = nodes
export const GRAPH_EDGES: GraphEdge[] = edges
export const NODE_BY_ID: Record<string, GraphNode> = Object.fromEntries(nodes.map((n) => [n.id, n]))

export const ADJACENCY: Record<string, { to: string; label?: string }[]> = (() => {
  const a: Record<string, { to: string; label?: string }[]> = {}
  for (const n of nodes) a[n.id] = []
  for (const e of edges) {
    a[e.from]?.push({ to: e.to, label: e.label })
    a[e.to]?.push({ to: e.from, label: e.label })
  }
  return a
})()

export const ALL_BUILDINGS = BUILDINGS
