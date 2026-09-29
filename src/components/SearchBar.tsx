import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, CornerDownLeft, MapPin } from 'lucide-react'
import { searchLocations, suggestLabel } from '../lib/search'
import { TYPE_LABEL } from '../data/campus'
import { TYPE_COLOR_VAR } from '../map/icons'
import type { Location } from '../types'

interface Props {
  placeholder?: string
  autoFocus?: boolean
  variant?: 'header' | 'hero'
  onPick?: (loc: Location) => void
  onSubmitEmpty?: () => void
}

export function SearchBar({
  placeholder = 'Where do you want to go?',
  variant = 'header',
  onPick,
}: Props) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchLocations(q, 7), [q])

  useEffect(() => setActive(0), [q])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (loc: Location) => {
    setQ('')
    setOpen(false)
    onPick?.(loc)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      if (results[active]) pick(results[active].location)
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className={`searchbar ${variant === 'hero' ? 'searchbar-hero' : ''}`} ref={rootRef}>
      <div className="search-field">
        <Search size={16} color="var(--ink-3)" />
        <input
          ref={inputRef}
          value={q}
          placeholder={placeholder}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Search campus locations"
          autoComplete="off"
        />
        {q && (
          <span className="search-kbd" aria-hidden>
            ⏎
          </span>
        )}
        {!q && variant === 'header' && (
          <span className="search-kbd" aria-hidden>
            /
          </span>
        )}
      </div>

      {open && q.trim() !== '' && (
        <div className="search-results" role="listbox">
          {results.length === 0 && (
            <div className="search-empty">
              No demo location matches “{q}”. Try <b>library</b>, <b>AIDS Lab</b>,{' '}
              <b>introduction hall</b> or <b>canteen</b>.
            </div>
          )}
          {results.map((r, i) => {
            const l = r.location
            return (
              <button
                key={l.id}
                className="search-result"
                data-active={i === active}
                style={{ animationDelay: `${i * 26}ms`, color: TYPE_COLOR_VAR[l.type] }}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(l)}
                role="option"
                aria-selected={i === active}
              >
                <span className="result-ico">
                  <MapPin size={16} />
                </span>
                <span style={{ color: 'var(--ink)', minWidth: 0 }}>
                  <span className="result-name">{l.name}</span>
                  <span className="result-meta">
                    {suggestLabel(l)}
                    {l.room ? ` · ${l.room}` : ''} · {TYPE_LABEL[l.type]}
                  </span>
                </span>
                {i === active && (
                  <CornerDownLeft
                    size={14}
                    color="var(--ink-3)"
                    style={{ marginLeft: 'auto', flexShrink: 0 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
