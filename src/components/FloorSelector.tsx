import { useCampus } from '../store'
import { FLOOR_ORDER, FLOOR_LABEL } from '../data'
import type { FloorId } from '../types'

const SHORT: Record<FloorId, string> = { B: 'B', G: 'G', '1': '1', '2': '2', '3': '3' }

export function FloorSelector() {
  const { floor, setFloor } = useCampus()

  return (
    <div className="map-float floor-selector">
      <div className="floor-rail" role="tablist" aria-label="Select floor">
        {[...FLOOR_ORDER].reverse().map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={floor === f}
            aria-label={FLOOR_LABEL[f]}
            className="floor-btn"
            data-active={floor === f}
            onClick={() => setFloor(f)}
            title={FLOOR_LABEL[f]}
          >
            {SHORT[f]}
          </button>
        ))}
      </div>
      <span className="floor-caption">{FLOOR_LABEL[floor]}</span>
    </div>
  )
}
