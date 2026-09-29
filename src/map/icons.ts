import type { LocationType } from '../types'

/** Stroke path data drawn inside a 24×24 box. */
export const TYPE_PATHS: Record<LocationType, string[]> = {
  building: ['M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16', 'M15 21V9h4a1 1 0 0 1 1 1v11', 'M2 21h20', 'M8 8h3', 'M8 12h3', 'M8 16h3'],
  lab: ['M9 3h6', 'M10 3v6.2L4.7 18.6A2 2 0 0 0 6.4 21.6h11.2a2 2 0 0 0 1.7-3L14 9.2V3', 'M7.6 15h8.8'],
  classroom: ['M22 10 12 5 2 10l10 5 10-5Z', 'M6 12.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5'],
  hall: ['M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z', 'M19 10v1a7 7 0 0 1-14 0v-1', 'M12 19v3', 'M8 22h8'],
  library: ['M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5Z', 'M4 4.5v15', 'M8 6.5h8', 'M8 10.5h6'],
  canteen: ['M3 8h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z', 'M17 9h1.5a2.5 2.5 0 0 1 0 5H17', 'M6 2.5v2', 'M10 2.5v2', 'M14 2.5v2', 'M3.5 21.5h17'],
  entrance: ['M3 21V6l9-4 9 4v15', 'M3 21h18', 'M9 21v-6h6v6', 'M3 10.5h18'],
  office: ['M3 8h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z', 'M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M2 13.5h20'],
  department: ['M3 21V8l6-4 6 4v13', 'M15 21V12h6v9', 'M2 21h20', 'M7 12h.01', 'M7 16h.01', 'M11 12h.01', 'M11 16h.01', 'M18 15h.01', 'M18 18h.01'],
  facility: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
}

export const TYPE_COLOR_VAR: Record<LocationType, string> = {
  building: 'var(--t-building)',
  lab: 'var(--t-lab)',
  classroom: 'var(--t-classroom)',
  hall: 'var(--t-hall)',
  library: 'var(--t-library)',
  canteen: 'var(--t-canteen)',
  entrance: 'var(--t-entrance)',
  office: 'var(--t-office)',
  department: 'var(--t-department)',
  facility: 'var(--t-facility)',
}

export const LEGEND: { type: LocationType; label: string }[] = [
  { type: 'building', label: 'Buildings' },
  { type: 'lab', label: 'Labs' },
  { type: 'classroom', label: 'Classrooms' },
  { type: 'hall', label: 'Halls' },
  { type: 'library', label: 'Library' },
  { type: 'canteen', label: 'Canteen' },
  { type: 'entrance', label: 'Entrances' },
  { type: 'facility', label: 'Facilities' },
]
