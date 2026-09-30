import { useCallback, useEffect, useRef, useState } from 'react'
import { useCampus } from '../store'
import { LOCATIONS, LOCATION_BY_ID, NODE_BY_ID } from '../data'
import { MapBase, Compass } from './MapBase'
import { BuildingsLayer, RoomsLayer, RouteLayer, YouAreHere } from './MapLayers'
import { LocationMarker } from './LocationMarker'
import { FloorSelector } from '../components/FloorSelector'
import { MapControls } from '../components/MapControls'
import { Legend } from '../components/Legend'

interface View {
  x: number
  y: number
  k: number
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const HOME: View = { x: 0, y: 0, k: 1 }

export function CampusMap({
  variant = 'full',
  children,
}: {
  variant?: 'full' | 'preview'
  children?: React.ReactNode
}) {
  const {
    floor,
    setFloor,
    selectedId,
    select,
    focusToken,
    nav,
    originId,
    startNav,
  } = useCampus()

  const svgRef = useRef<SVGSVGElement>(null)
  const [view, setView] = useState<View>(HOME)
  const [dragging, setDragging] = useState(false)
  const viewRef = useRef(view)
  viewRef.current = view

  const ptrs = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef(0)
  const moved = useRef(false)
  const anim = useRef<number | null>(null)

  const toVB = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = cx
    pt.y = cy
    const m = svg.getScreenCTM()
    if (!m) return { x: 0, y: 0 }
    const p = pt.matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }, [])

  const unitsPerPx = useCallback(() => {
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    return m && m.a ? 1 / m.a : 1
  }, [])

  const stopAnim = () => {
    if (anim.current !== null) cancelAnimationFrame(anim.current)
    anim.current = null
  }

  const animateTo = useCallback((target: View) => {
    stopAnim()
    const start = { ...viewRef.current }
    const t0 = performance.now()
    const dur = 520
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      setView({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        k: start.k + (target.k - start.k) * e,
      })
      if (p < 1) anim.current = requestAnimationFrame(tick)
      else anim.current = null
    }
    anim.current = requestAnimationFrame(tick)
  }, [])

  const zoomAtScreen = useCallback(
    (cx: number, cy: number, factor: number) => {
      stopAnim()
      const p = toVB(cx, cy)
      setView((v) => {
        const k = clamp(v.k * factor, 0.65, 5)
        const mx = (p.x - v.x) / v.k
        const my = (p.y - v.y) / v.k
        return { k, x: p.x - mx * k, y: p.y - my * k }
      })
    },
    [toVB],
  )

  const zoomStep = useCallback(
    (factor: number) => {
      const svg = svgRef.current
      if (!svg) return
      const r = svg.getBoundingClientRect()
      zoomAtScreen(r.left + r.width / 2, r.top + r.height / 2, factor)
    },
    [zoomAtScreen],
  )

  const reset = useCallback(() => animateTo(HOME), [animateTo])

  /* ------------------------------ wheel ------------------------------ */
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomAtScreen(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0016))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAtScreen])

  /* ---------------------------- focus on map -------------------------- */
  useEffect(() => {
    if (focusToken === 0) return
    let mx: number | undefined
    let my: number | undefined

    if (nav) {
      const step = nav.route.steps[Math.min(nav.step, nav.route.steps.length - 1)]
      const node = step ? NODE_BY_ID[step.nodeId] : undefined
      if (node) {
        mx = node.x
        my = node.y
        if (node.floor !== floor) setFloor(node.floor)
      }
    }

    if (mx === undefined && selectedId) {
      const l = LOCATION_BY_ID[selectedId]
      if (l) {
        mx = l.x
        my = l.y
        if (l.floor !== floor) setFloor(l.floor)
      }
    }

    if (mx === undefined || my === undefined) return
    const k = Math.max(viewRef.current.k, 1.75)
    animateTo({ k, x: 600 - mx * k, y: 420 - my * k })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusToken])

  /* ----------------------------- recenter ----------------------------- */
  useEffect(() => {
    const fn = () => {
      const n = NODE_BY_ID[originId]
      if (!n) return
      const k = Math.max(viewRef.current.k, 1.9)
      if (n.floor !== floor) setFloor(n.floor)
      animateTo({ k, x: 600 - n.x * k, y: 420 - n.y * k })
    }
    document.addEventListener('kkw:recenter', fn)
    return () => document.removeEventListener('kkw:recenter', fn)
  }, [originId, floor, setFloor, animateTo])

  /* ------------------------------ pointers ---------------------------- */
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    stopAnim()
    svgRef.current?.setPointerCapture(e.pointerId)
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    pinch.current = 0
    moved.current = false
    setDragging(true)
  }

  const onMove = (e: React.PointerEvent) => {
    const prev = ptrs.current.get(e.pointerId)
    if (!prev) return

    if (ptrs.current.size >= 2) {
      const [a, b] = [...ptrs.current.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinch.current && d > 0) {
        const mid = toVB((a.x + b.x) / 2, (a.y + b.y) / 2)
        setView((v) => {
          const k = clamp(v.k * (d / pinch.current), 0.65, 5)
          const mx = (mid.x - v.x) / v.k
          const my = (mid.y - v.y) / v.k
          return { k, x: mid.x - mx * k, y: mid.y - my * k }
        })
      }
      pinch.current = d
      moved.current = true
      ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      return
    }

    const dx = (e.clientX - prev.x) * unitsPerPx()
    const dy = (e.clientY - prev.y) * unitsPerPx()
    if (Math.abs(e.clientX - prev.x) + Math.abs(e.clientY - prev.y) > 2) moved.current = true
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
  }

  const onUp = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId)
    if (ptrs.current.size < 2) pinch.current = 0
    if (ptrs.current.size === 0) setDragging(false)
    try {
      svgRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const handleSelect = useCallback(
    (id: string) => {
      if (moved.current) return
      const l = LOCATION_BY_ID[id]
      if (l && l.floor !== floor) setFloor(l.floor)
      select(id)
    },
    [floor, setFloor, select],
  )

  const showLabels = view.k >= 1.3
  const markers = LOCATIONS.filter((l) => !l.footprint && l.floor === floor)
  const origin = NODE_BY_ID[originId]

  return (
    <div className={`mapview ${variant}`}>
      <svg
        ref={svgRef}
        className={`map-svg${dragging ? ' dragging' : ''}`}
        viewBox="0 0 1200 840"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={() => {
          if (moved.current) return
          if (selectedId && !nav) select(null)
        }}
        aria-label="Interactive demo campus map"
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <MapBase />
          <BuildingsLayer floor={floor} selectedId={selectedId} onSelect={handleSelect} />
          <RoomsLayer
            floor={floor}
            selectedId={selectedId}
            onSelect={handleSelect}
            showLabels={showLabels}
          />
          {nav && <RouteLayer nav={nav} floor={floor} />}
          <g className={showLabels ? 'show-labels' : ''}>
            {markers.map((l) => (
              <LocationMarker
                key={l.id}
                location={l}
                selected={selectedId === l.id}
                onSelect={handleSelect}
              />
            ))}
          </g>
          {origin && floor === 'G' && <YouAreHere x={origin.x} y={origin.y} />}
        </g>
        <Compass />
      </svg>

      {children}

      <FloorSelector />
      <MapControls zoomIn={() => zoomStep(1.35)} zoomOut={() => zoomStep(1 / 1.35)} reset={reset} zoom={view.k} />
      <Legend />
    </div>
  )
}
