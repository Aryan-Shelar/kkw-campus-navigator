import { LocateFixed, Minus, Plus, RotateCcw } from 'lucide-react'

interface Props {
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  zoom: number
}

export function MapControls({ zoomIn, zoomOut, reset, zoom }: Props) {
  return (
    <div className="map-float map-controls">
      <span className="map-zoom-readout">{Math.round(zoom * 100)}%</span>
      <div className="map-ctrl-group">
        <button className="map-ctrl" onClick={zoomIn} aria-label="Zoom in" title="Zoom in">
          <Plus size={17} />
        </button>
        <button className="map-ctrl" onClick={zoomOut} aria-label="Zoom out" title="Zoom out">
          <Minus size={17} />
        </button>
        <button className="map-ctrl" onClick={reset} aria-label="Reset map" title="Reset map">
          <RotateCcw size={16} />
        </button>
        <button
          className="map-ctrl"
          onClick={() => document.dispatchEvent(new CustomEvent('kkw:recenter'))}
          aria-label="Recenter on you"
          title="Recenter on you"
        >
          <LocateFixed size={16} />
        </button>
      </div>
    </div>
  )
}
