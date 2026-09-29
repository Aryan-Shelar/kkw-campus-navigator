import { Search } from 'lucide-react'
import { CampusDirectory } from '../components/CampusDirectory'
import { useCampus } from '../store'

export function DirectoryPage() {
  const { setView, focusOn, setFloor, select } = useCampus()

  return (
    <div className="wrap section">
      <div className="section-head">
        <div>
          <span className="eyebrow">
            <Search size={12} />
            Campus directory
          </span>
          <h2 style={{ marginTop: 14 }}>Every demo location, in one list</h2>
          <p>Filter by category or search by room, building or tag.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setView('map')}>
          Open map
        </button>
      </div>

      <CampusDirectory
        onPick={(l) => {
          setFloor(l.floor)
          select(l.id)
          focusOn(l.id)
          setView('map')
        }}
      />

      <footer className="footer">
        <span>Prototype · Demo campus data</span>
        <span>Room numbers and routes are sample data, not verified KKW information.</span>
      </footer>
    </div>
  )
}
