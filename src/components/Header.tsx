import { Moon, Sun, Sparkles } from 'lucide-react'
import { useCampus } from '../store'
import { SearchBar } from './SearchBar'
import type { ViewId } from '../types'

const NAV: { id: ViewId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'map', label: 'Campus Map' },
  { id: 'directory', label: 'Directory' },
]

export function Header() {
  const { view, setView, theme, toggleTheme, setAiOpen, focusOn, setFloor } = useCampus()

  return (
    <header className="header">
      <button className="brand" onClick={() => setView('home')} aria-label="KKW NAV home">
        <span className="brand-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 19V5l7 7 7-7v14" />
          </svg>
        </span>
        <span className="brand-text">
          <span className="brand-name">KKW NAV</span>
          <span className="brand-sub">Campus Navigation</span>
        </span>
      </button>

      <nav className="nav">
        {NAV.map((n) => (
          <button
            key={n.id}
            className="nav-btn"
            data-active={view === n.id}
            onClick={() => setView(n.id)}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <div className="header-right">
        <SearchBar
          onPick={(l) => {
            setFloor(l.floor)
            focusOn(l.id)
            setView('map')
          }}
        />
        <button
          className="icon-btn"
          onClick={() => setAiOpen(true)}
          aria-label="Ask KKW AI"
          title="Ask KKW AI"
        >
          <Sparkles size={16} />
        </button>
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}
