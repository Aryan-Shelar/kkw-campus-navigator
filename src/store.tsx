import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { FloorId, Location, NavRoute, ViewId } from './types'
import { LOCATION_BY_ID } from './data/campus'
import { buildRoute } from './lib/path'
import { demoAssistant, type AssistantReply } from './data/assistant'

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  reply?: AssistantReply
}

interface CampusState {
  view: ViewId
  theme: 'dark' | 'light'
  floor: FloorId
  selectedId: string | null
  originId: string
  focusToken: number
  nav: { destId: string; route: NavRoute; step: number } | null
  aiOpen: boolean
  chat: ChatMessage[]
  chatBusy: boolean
  setView: (v: ViewId) => void
  toggleTheme: () => void
  setFloor: (f: FloorId) => void
  select: (id: string | null) => void
  setOrigin: (id: string) => void
  focusOn: (id: string) => void
  startNav: (destId: string, fromId?: string) => void
  exitNav: () => void
  setStep: (i: number) => void
  setAiOpen: (v: boolean) => void
  sendChat: (text: string) => void
}

const Ctx = createContext<CampusState | null>(null)

const readTheme = (): 'dark' | 'light' => {
  try {
    const saved = localStorage.getItem('kkw-theme')
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    /* ignore */
  }
  return 'dark'
}

export function CampusProvider({ children }: { children: ReactNode }) {
  const [view, setViewRaw] = useState<ViewId>('home')
  const [theme, setTheme] = useState<'dark' | 'light'>(readTheme)
  const [floor, setFloor] = useState<FloorId>('G')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [originId, setOriginId] = useState('main-gate')
  const [focusToken, setFocusToken] = useState(0)
  const [nav, setNav] = useState<{ destId: string; route: NavRoute; step: number } | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      id: 'm0',
      role: 'ai',
      text: 'Hi — I am the KKW AI campus assistant. Ask me where a lab, hall, classroom or building is. Everything here is demo campus data.',
    },
  ])
  const [chatBusy, setChatBusy] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('kkw-theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (nav) setNav(null)
        else if (selectedId) setSelectedId(null)
        else if (aiOpen) setAiOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav, selectedId, aiOpen])

  const select = useCallback((id: string | null) => {
    setSelectedId(id)
    if (id) setFocusToken((t) => t + 1)
  }, [])

  const focusOn = useCallback((id: string) => {
    setSelectedId(id)
    setFocusToken((t) => t + 1)
  }, [])

  const setView = useCallback((v: ViewId) => {
    setViewRaw(v)
    try {
      window.history.replaceState(null, '', v === 'home' ? '#/' : `#/${v}`)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const h = window.location.hash.replace('#/', '')
    if (h === 'map' || h === 'directory') setViewRaw(h)
  }, [])

  const startNav = useCallback(
    (destId: string, fromId?: string) => {
      const fromLoc = LOCATION_BY_ID[fromId ?? originId]
      const destLoc = LOCATION_BY_ID[destId]
      if (!destLoc) return
      const route = buildRoute(fromLoc?.nodeId ?? originId, destLoc.nodeId)
      if (!route) return
      if (fromId) setOriginId(fromId)
      if (destLoc.floor) setFloor(destLoc.floor)
      setNav({ destId, route, step: 0 })
      setSelectedId(destId)
      setFocusToken((t) => t + 1)
      setViewRaw('map')
    },
    [originId],
  )

  const exitNav = useCallback(() => setNav(null), [])

  const setStep = useCallback(
    (i: number) => {
      if (!nav) return
      const step = Math.max(0, Math.min(nav.route.steps.length - 1, i))
      const node = nav.route.steps[step]
      if (node) setFloor(node.floor)
      setNav({ ...nav, step })
      setFocusToken((t) => t + 1)
    },
    [nav],
  )

  const sendChat = useCallback((text: string) => {
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', text }
    setChat((c) => [...c, userMsg])
    setChatBusy(true)
    const result = demoAssistant.reply(text)
    const deliver = (reply: AssistantReply) => {
      setChat((c) => [...c, { id: `a${Date.now()}`, role: 'ai', text: reply.text, reply }])
      setChatBusy(false)
    }
    if (result instanceof Promise) result.then(deliver)
    else setTimeout(() => deliver(result), 480)
  }, [])

  const value = useMemo<CampusState>(
    () => ({
      view,
      theme,
      floor,
      selectedId,
      originId,
      focusToken,
      nav,
      aiOpen,
      chat,
      chatBusy,
      setView,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      setFloor,
      select,
      setOrigin: setOriginId,
      focusOn,
      startNav,
      exitNav,
      setStep,
      setAiOpen,
      sendChat,
    }),
    [view, theme, floor, selectedId, originId, focusToken, nav, aiOpen, chat, chatBusy, setView, select, focusOn, startNav, exitNav, setStep, sendChat],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCampus(): CampusState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCampus must be used inside CampusProvider')
  return ctx
}
