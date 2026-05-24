'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const QUESTIONS = [
  'Why is switching better?',
  'Is this actually proven?',
  "What if there were 100 doors?",
  "Doesn't it become 50/50 after reveal?",
]

const ANSWERS: Record<string, string> = {
  'Why is switching better?':
    "When you first pick a door, you have a 1/3 chance of being right. That means there's a 2/3 chance the car is behind one of the other two doors. Monty always reveals a goat — so that 2/3 probability gets concentrated onto the single remaining door. Switching gives you those 2/3 odds.",
  'Is this actually proven?':
    "Yes — it's mathematically proven with conditional probability (Bayes' theorem) and has been verified by computer simulations running millions of trials. Switching wins ~66.7% of the time, staying wins ~33.3%. The math is settled, even if it still feels wrong.",
  "What if there were 100 doors?":
    "It becomes even clearer! You pick 1 door (1% chance). Monty opens 98 doors showing goats. Now it's you vs one remaining door. There's a 99% chance the car is behind that last door. Switching is obviously right — the same logic applies to 3 doors, just less dramatically.",
  "Doesn't it become 50/50 after reveal?":
    "That's the most common intuition — and it's wrong. The key is that Monty's action is *not random*. He always knows where the car is and deliberately reveals a goat. His reveal carries information. If he picked randomly and happened to reveal a goat, then yes, it would be 50/50. But his constrained choice shifts the odds.",
}

interface AskAIPanelProps {
  className?: string
}

export function AskAIPanel({ className }: AskAIPanelProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function selectQuestion(q: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSelected(q)
    setDisplayed('')
    setTyping(true)
    const answer = ANSWERS[q] ?? ''
    let i = 0
    function tick() {
      i++
      setDisplayed(answer.slice(0, i))
      if (i < answer.length) {
        timerRef.current = setTimeout(tick, 12)
      } else {
        setTyping(false)
      }
    }
    timerRef.current = setTimeout(tick, 80)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Ask AI</span>
          <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono">optional</span>
        </div>
        <ChevronIcon
          className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Plain-English explanations of the Monty Hall problem.
          </p>

          {/* Question chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => selectQuestion(q)}
                className={cn(
                  'text-xs rounded-full border px-3 py-1 transition-all',
                  'hover:border-accent/50 hover:bg-accent/5',
                  selected === q
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border text-muted-foreground',
                )}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Answer */}
          {selected && (
            <div className="rounded-lg bg-muted/50 border border-border p-3 min-h-[80px]">
              <p className={cn('text-sm text-foreground leading-relaxed', typing && 'typing-cursor')}>
                {displayed}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
