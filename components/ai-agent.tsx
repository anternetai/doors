'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send } from 'lucide-react'
import { DoorsIcon } from '@/components/doors-icon'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const PUBLIC_ROUTES = ['/', '/login', '/signup']

export function AIAgent() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Hide on public routes
  if (PUBLIC_ROUTES.includes(pathname)) return null

  // Auto-scroll to bottom on new messages
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when opened
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const welcomeMessage: Message = {
    role: 'assistant',
    content:
      "Hey! I'm Doors. Ask me anything — where to knock, your stats, commission, whatever you need.",
  }

  function handleOpen() {
    setIsOpen(true)
    if (messages.length === 0) {
      setMessages([welcomeMessage])
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.response }])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "Sorry, I hit an error. Try again in a second.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        aria-label="Open Doors AI"
        className="fixed bottom-20 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e] text-[#0a0a0a] transition-all hover:scale-105 active:scale-95"
        style={{ boxShadow: '0 0 24px rgba(34,197,94,0.3)' }}
      >
        {isOpen ? <X size={22} strokeWidth={2.5} /> : <MessageCircle size={22} strokeWidth={2.5} />}
      </button>

      {/* Bottom sheet panel */}
      <div
        className="fixed inset-x-0 bottom-0 z-[55] flex flex-col rounded-t-2xl border-t border-white/[0.08] backdrop-blur-xl transition-transform duration-300 ease-out"
        style={{
          height: '70vh',
          background: 'rgba(17, 17, 24, 0.95)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <DoorsIcon size={20} />
            <span className="text-sm font-semibold text-foreground">Doors</span>
            <span className="text-[10px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-1.5 py-0.5 rounded-md font-medium">
              AI Coach
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#22c55e] text-[#0a0a0a] font-medium'
                    : 'bg-white/[0.05] border border-white/[0.06] text-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white/[0.05] border border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#22c55e] opacity-60"
                      style={{
                        animation: 'typing-dot 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-white/[0.06] px-4 py-3 pb-safe">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about territories, stats, commission…"
              disabled={isLoading}
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-[#22c55e]/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/30 transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22c55e] text-[#0a0a0a] transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{ boxShadow: input.trim() ? '0 0 16px rgba(34,197,94,0.25)' : 'none' }}
            >
              <Send size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Typing animation keyframes */}
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  )
}
