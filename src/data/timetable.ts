export interface TimetableEntry {
  id: string
  course: string
  room: string
  building: string
  floor: string
  time: string
  locationId: string
}

/** Demo timetable — replace with a real student timetable later. */
export const TIMETABLE: TimetableEntry[] = [
  {
    id: 't1',
    course: 'Engineering Mathematics',
    room: 'Room A-204',
    building: 'Academic Block A',
    floor: '1st Floor',
    time: '10:30 AM',
    locationId: 'a-204',
  },
  {
    id: 't2',
    course: 'Engineering Physics Practical',
    room: 'Physics Lab',
    building: 'Academic Block B',
    floor: 'Ground Floor',
    time: '11:45 AM',
    locationId: 'b-physics',
  },
  {
    id: 't3',
    course: 'Programming for Problem Solving',
    room: 'Computer Lab 2',
    building: 'Academic Block A',
    floor: 'Ground Floor',
    time: '02:15 PM',
    locationId: 'a-cpulab2',
  },
]

export const NEXT_CLASS = TIMETABLE[0]
