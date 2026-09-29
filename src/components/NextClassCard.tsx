import { Clock, Navigation } from 'lucide-react'
import { useCampus } from '../store'
import { NEXT_CLASS } from '../data/timetable'

export function NextClassCard() {
  const { startNav } = useCampus()
  const c = NEXT_CLASS

  return (
    <article className="card next-class">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <span className="kicker">My next class</span>
        <span className="tag-demo">Demo timetable</span>
      </div>

      <h3>{c.course}</h3>
      <div className="meta">
        {c.room} · {c.building}
        <br />
        {c.floor}
      </div>

      <div className="time">{c.time}</div>

      <div className="row">
        <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Clock size={12} />
          Starts in 42 min
        </span>
        <button className="btn btn-primary btn-sm" onClick={() => startNav(c.locationId)}>
          <Navigation size={15} />
          Navigate
        </button>
      </div>
    </article>
  )
}
