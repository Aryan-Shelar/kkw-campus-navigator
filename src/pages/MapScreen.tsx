import { useCampus } from '../store'
import { LOCATION_BY_ID } from '../data/campus'
import { CampusMap } from '../map/CampusMap'
import { LocationPanel } from '../components/LocationPanel'
import { NavigationPanel } from '../components/NavigationPanel'

export function MapScreen({ variant }: { variant: 'full' | 'preview' }) {
  const { selectedId, nav } = useCampus()
  const location = selectedId ? LOCATION_BY_ID[selectedId] : null

  return (
    <CampusMap variant={variant}>
      <div className="panel-dock">
        {nav ? <NavigationPanel /> : location ? <LocationPanel location={location} /> : null}
      </div>
    </CampusMap>
  )
}
