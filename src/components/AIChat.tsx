import { useEffect, useRef, useState } from 'react'
import { X, Sparkles, Send, MapPinned, Navigation, Bot } from 'lucide-react'
import { useCampus } from '../store'
import { QUICK_PROMPTS } from '../data/assistant'

export function AIChat() {
  const { aiOpen, setAiOpen, chat, chatBusy, sendChat, focusOn, startNav, setView } = useCampus()
  const [draft, setDraft] = useState('')
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [chat, chatBusy, aiOpen])

  const submit = (text: string) => {
    const t = text.trim()
    if (!t || chatBusy) return
    sendChat(t)
    setDraft('')
  }

  if (!aiOpen) {
    return (
      <button className="ai-fab" onClick={() => setAiOpen(true)}>
        <Sparkles size={17} />
        Ask KKW AI
      </button>
    )
  }

  return (
    <div className="ai-panel" role="dialog" aria-label="KKW AI campus assistant">
      <div className="ai-head">
        <span className="ai-avatar">
          <Bot size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>KKW AI Assistant</b>
          <span>Simulated replies · demo campus data</span>
        </div>
        <button className="panel-close" style={{ position: 'static' }} onClick={() => setAiOpen(false)} aria-label="Close assistant">
          <X size={15} />
        </button>
      </div>

      <div className="ai-log" ref={logRef}>
        {chat.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            {m.text}
            {m.role === 'ai' && m.reply?.locationId && (
              <div className="msg-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    focusOn(m.reply!.locationId!)
                    setView('map')
                    setAiOpen(false)
                  }}
                >
                  <MapPinned size={14} />
                  Show on Map
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    startNav(m.reply!.locationId!)
                    setAiOpen(false)
                  }}
                >
                  <Navigation size={14} />
                  Navigate
                </button>
              </div>
            )}
          </div>
        ))}
        {chatBusy && (
          <div className="typing" aria-label="Assistant is typing">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className="ai-suggest">
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => submit(p)}>
            {p}
          </button>
        ))}
      </div>

      <form
        className="ai-input"
        onSubmit={(e) => {
          e.preventDefault()
          submit(draft)
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about labs, halls, classrooms…"
          aria-label="Message the assistant"
        />
        <button className="ai-send" type="submit" aria-label="Send message">
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}
