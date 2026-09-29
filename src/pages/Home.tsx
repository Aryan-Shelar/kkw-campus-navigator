import { ArrowRight, Search, Sparkles, Layers3, Map as MapIcon, BookOpen, FlaskConical } from 'lucide-react'
import { useCampus } from '../store'
import { SearchBar } from '../components/SearchBar'
import { NextClassCard } from '../components/NextClassCard'
import { MapScreen } from './MapScreen'

const CATEGORIES = [
  { icon: FlaskConical, title: 'Laboratories', note: 'Practical & computer labs', q: 'lab' },
  { icon: BookOpen, title: 'Library', note: 'Reading halls & stacks', q: 'library' },
  { icon: Layers3, title: 'Classrooms', note: 'Lecture rooms by floor', q: 'room' },
  { icon: MapIcon, title: 'Halls', note: 'Seminar & introduction halls', q: 'hall' },
]

export function Home() {
  const { setView, focusOn, setFloor, setAiOpen, select } = useCampus()

  return (
    <>
      <div className="wrap">
        <section className="hero">
          <div>
            <span className="eyebrow">
              <Sparkles size={12} />
              KKW NAV · Campus Navigation System
            </span>
            <h1>
              Find your way.
              <span className="dim">Know your campus.</span>
            </h1>
            <p className="hero-sub">
              Navigate classrooms, labs, halls and campus facilities without getting lost. Ask a
              question, pick a room, and get a clear step-by-step route.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => setView('map')}>
                <ArrowRight size={16} />
                Explore Campus
              </button>
              <button className="btn btn-ghost" onClick={() => setView('directory')}>
                <Search size={16} />
                Find a Location
              </button>
              <button className="btn btn-quiet" onClick={() => setAiOpen(true)}>
                <Sparkles size={16} />
                Ask KKW AI
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <b>{58}</b>
                <span>Demo locations</span>
              </div>
              <div className="stat">
                <b>10</b>
                <span>Campus blocks</span>
              </div>
              <div className="stat">
                <b>5</b>
                <span>Floors mapped</span>
              </div>
            </div>
          </div>

          <aside className="card" style={{ padding: 20 }}>
            <span className="eyebrow" style={{ marginBottom: 14 }}>
              <Search size={12} />
              Quick search
            </span>
            <SearchBar
              variant="hero"
              placeholder="Where do you want to go?"
              onPick={(l) => {
                setFloor(l.floor)
                select(l.id)
                setView('map')
              }}
            />
            <div className="quick-row">
              {['AIDS Lab', 'Computer Lab', 'Library', 'Seminar Hall', 'Canteen', 'Administration', 'Main Gate'].map(
                (q) => (
                  <button
                    key={q}
                    className="quick"
                    onClick={() => {
                      focusOn(q === 'Main Gate' ? 'main-gate' : q === 'Library' ? 'library' : q === 'Canteen' ? 'canteen' : q === 'Administration' ? 'admin' : q === 'AIDS Lab' ? 'a-aids2' : q === 'Computer Lab' ? 'a-cpulab1' : 'a-seminar')
                      setView('map')
                    }}
                  >
                    {q}
                  </button>
                ),
              )}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 0 }}>
              Prototype build. Every room, floor and route shown here is sample data created for this
              demo — not a verified K.K. Wagh campus plan.
            </p>
          </aside>
        </section>
      </div>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <h2>Campus map</h2>
            <p>Pan, zoom, switch floors and tap any marker to open its details.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setView('map')}>
            Open full map
            <ArrowRight size={15} />
          </button>
        </div>
        <MapScreen variant="preview" />
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="grid-3">
          <NextClassCard />

          <article className="card" style={{ padding: 20 }}>
            <div className="section-head" style={{ marginBottom: 10 }}>
              <div>
                <h2 style={{ fontSize: 18 }}>AI campus assistant</h2>
                <p>Simulated answers, real map actions.</p>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              Ask “Where is my physics practical?” and get the building, floor and a one-tap route.
              No external AI service is connected in this prototype.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setAiOpen(true)}>
              <Sparkles size={15} />
              Ask KKW AI
            </button>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <div className="section-head" style={{ marginBottom: 10 }}>
              <div>
                <h2 style={{ fontSize: 18 }}>Campus directory</h2>
                <p>Browse every demo location by category.</p>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              Classrooms, labs, departments, halls, offices and facilities — searchable and filterable
              in one place.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => setView('directory')}>
              Open directory
              <ArrowRight size={15} />
            </button>
          </article>
        </div>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <h2>Jump to a category</h2>
            <p>Fast paths to the places first-year students look for most.</p>
          </div>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <button
              key={c.title}
              className="cat-card"
              onClick={() => {
                setView('directory')
              }}
            >
              <span className="dir-ico" style={{ color: 'var(--accent)' }}>
                <c.icon size={18} />
              </span>
              <b>{c.title}</b>
              <span>{c.note}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="wrap footer">
        <span>KKW NAV — “Find your way. Know your campus.”</span>
        <span>Prototype · Demo campus data · No verified KKW layout claimed</span>
      </footer>
    </>
  )
}
