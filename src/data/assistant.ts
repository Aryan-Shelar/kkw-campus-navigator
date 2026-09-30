import { searchLocations } from '../lib/search'
import { BUILDING_BY_ID, FLOOR_LABEL, TYPE_LABEL, LOCATION_BY_ID } from '.'

export interface AssistantReply {
  text: string
  locationId?: string
  actions?: { label: 'map' | 'navigate' }[]
}

/**
 * Assistant provider contract. The demo implementation below is entirely
 * local + rule based. Swap in an LLM-backed provider later without
 * touching any UI component.
 */
export interface AssistantProvider {
  reply(message: string): AssistantReply | Promise<AssistantReply>
}

export const QUICK_PROMPTS = [
  'Where is the introduction hall?',
  'Where is my physics practical?',
  'Where is the library?',
  'Show me the nearest lab',
  'Where is AIDS Lab 2?',
  'Where is Academic Block A?',
]

const FACTS: { match: RegExp; text: string; locationId?: string }[] = [
  {
    match: /introduction hall|orientation hall|intro hall|introduce/i,
    text: 'The Introduction Hall is a standalone demo building in the south-east of campus, to the right of the main entry road. This prototype currently uses demo campus data. Would you like me to show the route?',
    locationId: 'intro-hall',
  },
  {
    match: /physics/i,
    text: 'Physics Lab is in Academic Block B, on the Ground Floor. This prototype currently uses demo campus data. Would you like me to show the route?',
    locationId: 'b-physics',
  },
  {
    match: /seminar/i,
    text: 'Seminar Hall A is on the Ground Floor of Academic Block A. There is also Seminar Room B on the second floor. Demo data only.',
    locationId: 'a-seminar',
  },
  {
    match: /nearest (lab|laboratory)|nearest lab/i,
    text: 'Computer Lab 1 in Academic Block A is the closest demo laboratory to the Main Gate. This prototype currently uses demo campus data.',
    locationId: 'a-cpulab1',
  },
  {
    match: /wifi|wi-fi|internet/i,
    text: 'Demo answer: Wi-Fi is shown as available in the Library and the Student Activity Center. This is sample data, not verified campus information.',
    locationId: 'library',
  },
  {
    match: /canteen|food|eat|hungry/i,
    text: 'The Canteen sits in the south-east of the demo campus, right of the main entry road. Would you like me to show the route?',
    locationId: 'canteen',
  },
  {
    match: /parking|car|vehicle/i,
    text: 'Visitor Parking is the demo bay north of Academic Block A. Would you like me to show it on the map?',
    locationId: 'parking',
  },
  {
    match: /sport|ground|play/i,
    text: 'The Sports Ground is the demo open area in the north-east corner of campus.',
    locationId: 'sports',
  },
  {
    match: /timetable|next class|schedule/i,
    text: 'Your demo timetable shows Engineering Mathematics next, in Room A-204. Sample data only.',
    locationId: 'a-204',
  },
]

function locationAnswer(id: string): AssistantReply {
  const l = LOCATION_BY_ID[id]
  if (!l) return { text: 'I could not find that location in the demo dataset.' }
  const b = BUILDING_BY_ID[l.buildingId]
  const where = [b?.name, FLOOR_LABEL[l.floor], l.room].filter(Boolean).join(', ')
  return {
    text: `${l.name} is at ${where}. This prototype currently uses demo campus data.`,
    locationId: l.id,
    actions: [{ label: 'map' }, { label: 'navigate' }],
  }
}

const STOPWORDS =
  /\b(where|whats|what|is|are|the|my|me|at|to|a|an|of|please|find|show|do|does|you|can|i|in|on|for|how|near|nearest|locate|located|get|go|want|need)\b/g

function coreQuery(m: string): string {
  return m
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(STOPWORDS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const demoAssistant: AssistantProvider = {
  reply(message: string): AssistantReply {
    const m = message.trim()
    if (!m) return { text: 'Ask me anything about the demo campus — rooms, labs, halls or buildings.' }

    const fact = FACTS.find((f) => f.match.test(m))
    if (fact)
      return {
        text: fact.text,
        locationId: fact.locationId,
        actions: fact.locationId ? [{ label: 'map' }, { label: 'navigate' }] : undefined,
      }

    const results = searchLocations(m, 1)
    const fallback = results.length ? results : searchLocations(coreQuery(m), 1)
    if (fallback.length) {
      const l = fallback[0].location
      const b = BUILDING_BY_ID[l.buildingId]
      const where = [b?.name, FLOOR_LABEL[l.floor], l.room].filter(Boolean).join(', ')
      return {
        text: `${l.name} is in ${where} · ${TYPE_LABEL[l.type]}. This prototype currently uses demo campus data. Would you like me to show the route?`,
        locationId: l.id,
        actions: [{ label: 'map' }, { label: 'navigate' }],
      }
    }

    if (/where am i|who are you|what is this|help/i.test(m)) {
      return {
        text: 'I am the KKW AI campus assistant (simulated for this prototype). Ask me where a lab, hall, classroom or building is and I will point you to it on the demo map.',
      }
    }

    return {
      text: 'I could not match that in the demo campus dataset yet. Try “library”, “AIDS Lab 2”, “canteen”, “introduction hall” or “physics practical”.',
    }
  },
}
