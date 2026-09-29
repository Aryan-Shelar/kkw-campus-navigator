import type { Building, FloorId, Location, LocationType, Rect } from '../types'

/* ------------------------------------------------------------------ *
 *  DEMO / SAMPLE CAMPUS DATA
 *  Every room, floor and route below is fictional sample data created
 *  for this prototype. It does NOT describe the real K.K. Wagh campus.
 * ------------------------------------------------------------------ */

export const FLOOR_ORDER: FloorId[] = ['B', 'G', '1', '2', '3']

export const FLOOR_LABEL: Record<FloorId, string> = {
  B: 'Basement',
  G: 'Ground Floor',
  '1': 'First Floor',
  '2': 'Second Floor',
  '3': 'Third Floor',
}

export const TYPE_LABEL: Record<LocationType, string> = {
  building: 'Building',
  lab: 'Laboratory',
  classroom: 'Classroom',
  hall: 'Hall',
  library: 'Library',
  canteen: 'Canteen',
  entrance: 'Entrance',
  office: 'Office',
  department: 'Department',
  facility: 'Facility',
}

/* ---------------------------- geometry ---------------------------- */

interface Col {
  x: number
  w: number
  cx: number
}

interface BlockGeom {
  cy: number
  cols: Col[]
  topY: number
  topH: number
  botY: number
  botH: number
  cor: Rect
  stairsNode: { x: number; y: number }
  elevNode: { x: number; y: number }
}

function geom(bx: number, by: number, bw: number, bh: number, n: number): BlockGeom {
  const cy = by + bh / 2
  const seg = (bw - 16) / n
  const w = seg - 6
  const cols: Col[] = Array.from({ length: n }, (_, i) => {
    const x = bx + 8 + i * seg
    return { x, w, cx: x + w / 2 }
  })
  const topY = by + 14
  const topH = cy - 13 - 14 - topY
  const botY = cy + 13 + 14
  const botH = by + bh - 14 - botY
  return {
    cy,
    cols,
    topY,
    topH,
    botY,
    botH,
    cor: { x: bx + 8, y: cy - 13, w: bw - 16, h: 26 },
    stairsNode: { x: bx + 21, y: cy },
    elevNode: { x: bx + bw - 21, y: cy },
  }
}

/* ---------------------------- buildings --------------------------- */

const B = (
  id: string,
  name: string,
  short: string,
  rect: Rect,
  floors: FloorId[],
  doorNode: string,
  corridor?: Rect,
): Building => ({ id, name, short, rect, floors, doorNode, corridor })

export const BUILDINGS: Building[] = [
  B('library', 'Library', 'LIB', { x: 70, y: 70, w: 330, h: 200 }, ['B', 'G', '1', '2'], 'lib-door', {
    x: 86,
    y: 186,
    w: 298,
    h: 26,
  }),
  B('parking', 'Visitor Parking', 'P', { x: 430, y: 70, w: 140, h: 200 }, ['G'], 'park-door'),
  B('aids-dept', 'AI & Data Science Dept.', 'AIDS', { x: 630, y: 70, w: 270, h: 200 }, ['G', '1', '2', '3'], 'aids-dept-door', geom(630, 70, 270, 200, 2).cor),
  B('sports', 'Sports Ground', 'SP', { x: 930, y: 70, w: 200, h: 200 }, ['G'], 'sports-door'),
  B('block-a', 'Academic Block A', 'A', { x: 70, y: 330, w: 500, h: 260 }, ['B', 'G', '1', '2', '3'], 'block-a-door', geom(70, 330, 500, 260, 3).cor),
  B('block-b', 'Academic Block B', 'B', { x: 630, y: 330, w: 500, h: 260 }, ['B', 'G', '1', '2'], 'block-b-door', geom(630, 330, 500, 260, 3).cor),
  B('admin', 'Administration Block', 'ADMIN', { x: 70, y: 650, w: 230, h: 140 }, ['G'], 'admin-door'),
  B('sac', 'Student Activity Center', 'SAC', { x: 340, y: 650, w: 230, h: 140 }, ['G'], 'sac-door'),
  B('canteen', 'Canteen', 'CAN', { x: 630, y: 650, w: 250, h: 140 }, ['G'], 'canteen-door'),
  B('intro-hall', 'Introduction Hall', 'IH', { x: 920, y: 650, w: 210, h: 140 }, ['G'], 'intro-door'),
]

export const BUILDING_BY_ID: Record<string, Building> = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, b]),
)

/* ------------------- generic block room layouts ------------------- */

const A_G = geom(70, 330, 500, 260, 3)
const B_G = geom(630, 330, 500, 260, 3)
const D_G = geom(630, 70, 270, 200, 2)

interface RoomMeta {
  id: string
  name: string
  type: LocationType
  room?: string
  desc: string
  tags?: string[]
}

const r = (id: string, name: string, type: LocationType, desc: string, room?: string, tags?: string[]): RoomMeta => ({
  id,
  name,
  type,
  desc,
  room,
  tags: tags ?? [],
})

interface BlockRooms {
  [floor: string]: { top: RoomMeta[]; bot: RoomMeta[] }
}

const BLOCK_A_ROOMS: BlockRooms = {
  G: {
    top: [
      r('a-seminar', 'Seminar Hall A', 'hall', 'Demo seminar hall on the ground floor of Academic Block A.', 'G-01', ['seminar', 'presentation', 'event']),
      r('a-cpulab1', 'Computer Lab 1', 'lab', 'Demo computer laboratory for programming practicals.', 'G-03', ['computer', 'practical', 'coding']),
      r('a-cpulab2', 'Computer Lab 2', 'lab', 'Demo computer laboratory for programming practicals.', 'G-05', ['computer', 'practical', 'coding']),
    ],
    bot: [
      r('a-101', 'Room A-101', 'classroom', 'Demo lecture classroom on the ground floor.', 'A-101', ['lecture', 'class']),
      r('a-lobby', 'Block A Lobby', 'facility', 'Ground floor entrance lobby of Academic Block A.', undefined, ['lobby', 'entrance', 'info']),
      r('a-staff', 'Staff Room A', 'office', 'Demo staff room for Block A faculty.', 'G-07', ['staff', 'faculty']),
    ],
  },
  '1': {
    top: [
      r('a-aids1', 'AIDS Lab 1', 'lab', 'Demo AI & Data Science laboratory.', 'A-103', ['aids', 'ai', 'data science', 'practical']),
      r('a-aids2', 'AIDS Lab 2', 'lab', 'Demo AI & Data Science laboratory used for first-year practicals.', 'A-105', ['aids', 'ai', 'data science', 'practical']),
      r('a-204', 'Room A-204', 'classroom', 'Demo lecture room used by first-year engineering classes.', 'A-204', ['maths', 'lecture', 'class']),
    ],
    bot: [
      r('a-chem', 'Chemistry Lab', 'lab', 'Demo chemistry practical laboratory.', 'A-112', ['chemistry', 'practical', 'science']),
      r('a-graphics', 'Engineering Graphics Lab', 'lab', 'Demo drafting and engineering graphics laboratory.', 'A-114', ['graphics', 'drawing', 'practical']),
      r('a-facroom', 'Block A Staff Room', 'office', 'Demo faculty room for Academic Block A.', 'A-116', ['staff', 'faculty']),
    ],
  },
  '2': {
    top: [
      r('a-201', 'Room A-201', 'classroom', 'Demo lecture classroom.', 'A-201', ['lecture', 'class']),
      r('a-202', 'Room A-202', 'classroom', 'Demo lecture classroom.', 'A-202', ['lecture', 'class']),
      r('a-203', 'Seminar Room A-203', 'hall', 'Demo seminar and discussion room.', 'A-203', ['seminar', 'discussion']),
    ],
    bot: [
      r('a-project', 'Project Lab A', 'lab', 'Demo project and prototype laboratory.', 'A-210', ['project', 'lab']),
      r('a-206', 'Tutorial Room A-206', 'classroom', 'Demo tutorial room.', 'A-206', ['tutorial', 'class']),
      r('a-207', 'Faculty Cabin A-207', 'office', 'Demo faculty cabin.', 'A-207', ['faculty', 'cabin']),
    ],
  },
  '3': {
    top: [
      r('a-301', 'Room A-301', 'classroom', 'Demo lecture classroom.', 'A-301', ['lecture', 'class']),
      r('a-302', 'Room A-302', 'classroom', 'Demo lecture classroom.', 'A-302', ['lecture', 'class']),
      r('a-303', 'Room A-303', 'classroom', 'Demo lecture classroom.', 'A-303', ['lecture', 'class']),
    ],
    bot: [
      r('a-innov', 'Innovation Lab', 'lab', 'Demo innovation and makerspace laboratory.', 'A-310', ['innovation', 'makerspace']),
      r('a-305', 'Discussion Room A-305', 'hall', 'Demo group discussion room.', 'A-305', ['discussion', 'group']),
      r('a-306', 'Department Library A', 'library', 'Demo department-level reading collection.', 'A-306', ['books', 'reference']),
    ],
  },
  B: {
    top: [
      r('a-archive', 'Block A Archive', 'facility', 'Demo storage archive in the basement.', 'B-02', ['store', 'archive']),
      r('a-av', 'Audio Visual Store', 'facility', 'Demo AV equipment store.', 'B-04', ['av', 'equipment']),
      r('a-store', 'Maintenance Store', 'facility', 'Demo maintenance store.', 'B-06', ['maintenance', 'store']),
    ],
    bot: [],
  },
}

const BLOCK_B_ROOMS: BlockRooms = {
  G: {
    top: [
      r('b-physics', 'Physics Lab', 'lab', 'Demo physics practical laboratory in Academic Block B.', 'B-01', ['physics', 'practical', 'science']),
      r('b-sci', 'Engineering Science Lab', 'lab', 'Demo general engineering science laboratory.', 'B-03', ['science', 'practical']),
      r('b-drawing', 'Drawing Hall B', 'hall', 'Demo drawing and drafting hall.', 'B-05', ['drawing', 'hall']),
    ],
    bot: [
      r('b-101', 'Room B-101', 'classroom', 'Demo lecture classroom.', 'B-101', ['lecture', 'class']),
      r('b-lobby', 'Block B Lobby', 'facility', 'Ground floor entrance lobby of Academic Block B.', undefined, ['lobby', 'entrance']),
      r('b-office', 'Block B Office', 'office', 'Demo department office in Academic Block B.', 'B-07', ['office', 'enquiry']),
    ],
  },
  '1': {
    top: [
      r('b-201', 'Room B-201', 'classroom', 'Demo lecture classroom.', 'B-201', ['lecture', 'class']),
      r('b-202', 'Room B-202', 'classroom', 'Demo lecture classroom.', 'B-202', ['lecture', 'class']),
      r('b-dslab', 'Data Science Lab', 'lab', 'Demo data science laboratory.', 'B-204', ['data', 'analytics', 'practical']),
    ],
    bot: [
      r('b-aillab', 'AI & Machine Learning Lab', 'lab', 'Demo artificial intelligence laboratory.', 'B-210', ['ai', 'machine learning', 'practical']),
      r('b-eclab', 'Electronics Lab', 'lab', 'Demo electronics practical laboratory.', 'B-212', ['electronics', 'practical']),
      r('b-faculty', 'Block B Staff Room', 'office', 'Demo faculty room for Academic Block B.', 'B-214', ['staff', 'faculty']),
    ],
  },
  '2': {
    top: [
      r('b-301', 'Room B-301', 'classroom', 'Demo lecture classroom.', 'B-301', ['lecture', 'class']),
      r('b-302', 'Room B-302', 'classroom', 'Demo lecture classroom.', 'B-302', ['lecture', 'class']),
      r('b-semb', 'Seminar Room B', 'hall', 'Demo seminar room in Academic Block B.', 'B-303', ['seminar', 'event']),
    ],
    bot: [
      r('b-project', 'Project Lab B', 'lab', 'Demo project laboratory.', 'B-310', ['project', 'lab']),
      r('b-conf', 'Conference Room B', 'hall', 'Demo conference room.', 'B-312', ['meeting', 'conference']),
      r('b-hod', 'HOD Cabin B', 'office', 'Demo head of department cabin.', 'B-314', ['hod', 'office']),
    ],
  },
  B: {
    top: [
      r('b-workshop', 'Workshop', 'lab', 'Demo workshop in the basement of Block B.', 'BB-01', ['workshop', 'practical']),
      r('b-machine', 'Machine Shop', 'lab', 'Demo machine shop.', 'BB-03', ['machine', 'shop']),
      r('b-store', 'Block B Store', 'facility', 'Demo material store.', 'BB-05', ['store']),
    ],
    bot: [],
  },
}

const DEPT_ROOMS: BlockRooms = {
  G: {
    top: [
      r('dept-office', 'AI & DS Department Office', 'office', 'Demo department office and enquiry counter.', 'D-01', ['office', 'enquiry', 'hod']),
      r('dept-conf', 'Conference Room', 'hall', 'Demo department conference room.', 'D-03', ['meeting', 'conference']),
    ],
    bot: [
      r('dept-reception', 'Department Reception', 'facility', 'Demo reception and waiting area.', undefined, ['reception', 'waiting']),
      r('dept-lobby', 'Dept. Lobby', 'facility', 'Demo ground floor lobby of the department.', undefined, ['lobby', 'entrance']),
    ],
  },
  '1': {
    top: [
      r('aids-research', 'AI Research Lab', 'lab', 'Demo artificial intelligence research laboratory.', 'D-105', ['ai', 'research']),
      r('data-lab', 'Data Analytics Lab', 'lab', 'Demo data analytics laboratory.', 'D-107', ['data', 'analytics']),
    ],
    bot: [
      r('d-class1', 'Classroom D-101', 'classroom', 'Demo lecture classroom.', 'D-101', ['lecture', 'class']),
      r('d-store1', 'Project Store', 'facility', 'Demo project material store.', 'D-110', ['store']),
    ],
  },
  '2': {
    top: [
      r('d-class2', 'Classroom D-201', 'classroom', 'Demo lecture classroom.', 'D-201', ['lecture', 'class']),
      r('d-proj', 'Project Lab D', 'lab', 'Demo student project laboratory.', 'D-203', ['project', 'lab']),
    ],
    bot: [
      r('d-ai', 'AI Innovation Lab', 'lab', 'Demo AI innovation laboratory.', 'D-210', ['ai', 'innovation']),
      r('d-meet', 'Meeting Room D', 'hall', 'Demo department meeting room.', 'D-212', ['meeting']),
    ],
  },
  '3': {
    top: [
      r('d-server', 'Server Room', 'facility', 'Demo department server room.', 'D-301', ['server', 'network']),
      r('d-director', 'HOD Cabin', 'office', 'Demo head of department cabin.', 'D-303', ['hod', 'office']),
    ],
    bot: [
      r('d-seminar', 'Seminar Room D', 'hall', 'Demo department seminar room.', 'D-310', ['seminar']),
      r('d-archive', 'Department Archive', 'facility', 'Demo records archive.', 'D-312', ['archive', 'records']),
    ],
  },
}

/* --------------------------- locations ---------------------------- */

const loc = (
  id: string,
  name: string,
  type: LocationType,
  buildingId: string,
  floor: FloorId,
  x: number,
  y: number,
  desc: string,
  opts: { room?: string; rect?: Rect; nodeId?: string; footprint?: boolean; tags?: string[] } = {},
): Location => ({
  id,
  name,
  type,
  buildingId,
  floor,
  room: opts.room,
  description: desc,
  x,
  y,
  rect: opts.rect,
  nodeId: opts.nodeId ?? id,
  demo: true,
  tags: opts.tags ?? [],
  footprint: opts.footprint,
})

const center = (rc: Rect) => ({ x: rc.x + rc.w / 2, y: rc.y + rc.h / 2 })

function blockLocations(
  buildingId: string,
  g: BlockGeom,
  rooms: BlockRooms,
  out: Location[],
) {
  for (const floor of Object.keys(rooms) as FloorId[]) {
    const spec = rooms[floor]
    spec.top.forEach((m, i) => {
      const c = g.cols[i]
      const rect: Rect = { x: c.x, y: g.topY, w: c.w, h: g.topH }
      const p = center(rect)
      out.push(loc(m.id, m.name, m.type, buildingId, floor, p.x, p.y, m.desc, { room: m.room, rect, tags: m.tags }))
    })
    spec.bot.forEach((m, i) => {
      const c = g.cols[i]
      const rect: Rect = { x: c.x, y: g.botY, w: c.w, h: g.botH }
      const p = center(rect)
      out.push(loc(m.id, m.name, m.type, buildingId, floor, p.x, p.y, m.desc, { room: m.room, rect, tags: m.tags }))
    })
  }
}

const list: Location[] = []

blockLocations('block-a', A_G, BLOCK_A_ROOMS, list)
blockLocations('block-b', B_G, BLOCK_B_ROOMS, list)
blockLocations('aids-dept', D_G, DEPT_ROOMS, list)

/* Library — open plan */
const LIB = {
  reading: { x: 86, y: 86, w: 298, h: 96 },
  stairs: { x: 86, y: 186, w: 32, h: 26 },
  cor: { x: 122, y: 186, w: 262, h: 26 },
  circ: { x: 86, y: 216, w: 120, h: 46 },
  digital: { x: 270, y: 216, w: 114, h: 46 },
  l1: { x: 86, y: 86, w: 298, h: 96 },
  l2a: { x: 86, y: 86, w: 120, h: 176 },
  l2b: { x: 216, y: 86, w: 120, h: 176 },
  l2cor: { x: 340, y: 86, w: 22, h: 176 },
  l2st: { x: 366, y: 86, w: 18, h: 176 },
  b1: { x: 86, y: 86, w: 248, h: 176 },
  bcor: { x: 338, y: 86, w: 22, h: 176 },
  bst: { x: 364, y: 86, w: 20, h: 176 },
}

function push(rc: Rect, id: string, name: string, type: LocationType, floor: FloorId, desc: string, room?: string, tags: string[] = []) {
  const p = center(rc)
  list.push(loc(id, name, type, 'library', floor, p.x, p.y, desc, { room, rect: rc, tags }))
}

push(LIB.reading, 'lib-reading', 'Main Reading Hall', 'library', 'G', 'Demo main reading hall on the ground floor of the library.', 'G-01', ['books', 'study', 'read'])
push(LIB.circ, 'lib-circ', 'Circulation Desk', 'facility', 'G', 'Demo issue and return counter.', undefined, ['issue', 'return', 'books'])
push(LIB.digital, 'lib-digital', 'Digital Library', 'facility', 'G', 'Demo digital library with computers and journals.', undefined, ['computer', 'digital', 'journal'])
push(LIB.l1, 'lib-stack', 'Reference & Book Stack', 'library', '1', 'Demo reference section and book stack on the first floor.', '1F-01', ['books', 'reference', 'stack'])
push(LIB.l2a, 'lib-study', 'Silent Study Zone', 'facility', '2', 'Demo silent study zone.', '2F-01', ['study', 'silent', 'exam'])
push(LIB.l2b, 'lib-journal', 'Journal Room', 'library', '2', 'Demo journal and periodical room.', '2F-02', ['journal', 'periodical'])
push(LIB.b1, 'lib-archive', 'Basement Archive', 'facility', 'B', 'Demo archival storage in the library basement.', 'B-01', ['archive', 'store'])

/* Standalone rooms */
function pushIn(buildingId: string, rc: Rect, id: string, name: string, type: LocationType, floor: FloorId, desc: string, room?: string, tags: string[] = []) {
  const p = center(rc)
  list.push(loc(id, name, type, buildingId, floor, p.x, p.y, desc, { room, rect: rc, tags }))
}

pushIn('admin', { x: 82, y: 664, w: 96, h: 112 }, 'admin-accounts', 'Accounts & Fees Counter', 'office', 'G', 'Demo fees and accounts counter.', 'A-01', ['fees', 'payment', 'accounts'])
pushIn('admin', { x: 186, y: 664, w: 100, h: 54 }, 'admin-principal', "Principal's Office", 'office', 'G', "Demo principal's office.", 'A-02', ['principal', 'office'])
pushIn('admin', { x: 186, y: 726, w: 100, h: 50 }, 'admin-registrar', 'Registrar Office', 'office', 'G', 'Demo registrar office.', 'A-03', ['registrar', 'records', 'office'])

pushIn('sac', { x: 352, y: 664, w: 130, h: 112 }, 'sac-hall', 'Activity Hall', 'hall', 'G', 'Demo hall for club activities and events.', 'S-01', ['club', 'event', 'activity'])
pushIn('sac', { x: 490, y: 664, w: 68, h: 112 }, 'sac-common', 'Student Common Room', 'facility', 'G', 'Demo student common room.', 'S-02', ['common', 'students', 'break'])

pushIn('canteen', { x: 642, y: 664, w: 140, h: 112 }, 'canteen-main', 'Canteen Counter', 'canteen', 'G', 'Demo canteen counter serving snacks and meals.', undefined, ['food', 'snacks', 'lunch', 'eat'])
pushIn('canteen', { x: 790, y: 664, w: 78, h: 112 }, 'canteen-seat', 'Outdoor Seating', 'facility', 'G', 'Demo open seating area next to the canteen.', undefined, ['seating', 'food', 'sit'])

pushIn('intro-hall', { x: 932, y: 664, w: 186, h: 112 }, 'intro-main', 'Introduction Hall Stage', 'hall', 'G', 'Demo stage and seating area of the Introduction Hall.', undefined, ['orientation', 'stage', 'event'])

/* Building-level / site locations (footprints) */
list.push(loc('main-gate', 'Main Gate', 'entrance', 'site', 'G', 600, 800, 'Demo main entrance gate of the campus. You are here.', { room: undefined, rect: { x: 552, y: 784, w: 96, h: 34 }, nodeId: 'main-gate', tags: ['gate', 'entry', 'entrance', 'start'] }))
list.push(loc('admin', 'Administration Block', 'office', 'admin', 'G', 185, 720, 'Demo administrative building housing accounts, registrar and the principal office.', { rect: BUILDING_BY_ID.admin.rect, nodeId: 'admin-door', footprint: true, tags: ['admin', 'office', 'fees', 'registrar'] }))
list.push(loc('sac', 'Student Activity Center', 'facility', 'sac', 'G', 455, 720, 'Demo student activity centre for clubs and events.', { rect: BUILDING_BY_ID.sac.rect, nodeId: 'sac-door', footprint: true, tags: ['club', 'activity', 'students'] }))
list.push(loc('canteen', 'Canteen', 'canteen', 'canteen', 'G', 755, 720, 'Demo campus canteen.', { rect: BUILDING_BY_ID.canteen.rect, nodeId: 'canteen-door', footprint: true, tags: ['food', 'eat', 'snacks'] }))
list.push(loc('intro-hall', 'Introduction Hall', 'hall', 'intro-hall', 'G', 1025, 720, 'Demo introduction and orientation hall used on the first day.', { rect: BUILDING_BY_ID['intro-hall'].rect, nodeId: 'intro-door', footprint: true, tags: ['orientation', 'introduction', 'intro', 'hall', 'event'] }))
list.push(loc('block-a', 'Academic Block A', 'building', 'block-a', 'G', 320, 460, 'Demo academic building with classrooms, computer labs and AIDS labs.', { rect: BUILDING_BY_ID['block-a'].rect, nodeId: 'block-a-door', footprint: true, tags: ['block a', 'academic', 'classroom'] }))
list.push(loc('block-b', 'Academic Block B', 'building', 'block-b', 'G', 880, 460, 'Demo academic building with science labs and lecture rooms.', { rect: BUILDING_BY_ID['block-b'].rect, nodeId: 'block-b-door', footprint: true, tags: ['block b', 'academic', 'physics'] }))
list.push(loc('library', 'Library', 'library', 'library', 'G', 235, 170, 'Demo campus library with reading halls and digital access.', { rect: BUILDING_BY_ID.library.rect, nodeId: 'lib-door', footprint: true, tags: ['library', 'books', 'study', 'read'] }))
list.push(loc('aids-dept', 'AI & Data Science Department', 'department', 'aids-dept', 'G', 761, 170, 'Demo department building for AI & Data Science.', { rect: BUILDING_BY_ID['aids-dept'].rect, nodeId: 'aids-dept-door', footprint: true, tags: ['aids', 'ai', 'data science', 'department'] }))
list.push(loc('parking', 'Visitor Parking', 'facility', 'parking', 'G', 500, 170, 'Demo visitor parking bay.', { rect: BUILDING_BY_ID.parking.rect, nodeId: 'park-door', footprint: true, tags: ['parking', 'car', 'vehicle'] }))
list.push(loc('sports', 'Sports Ground', 'facility', 'sports', 'G', 1030, 170, 'Demo open sports ground.', { rect: BUILDING_BY_ID.sports.rect, nodeId: 'sports-door', footprint: true, tags: ['sports', 'ground', 'play', 'field'] }))

export const LOCATIONS: Location[] = list
export const LOCATION_BY_ID: Record<string, Location> = Object.fromEntries(list.map((l) => [l.id, l]))
