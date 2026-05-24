'use client'

import { cn } from '@/lib/utils'
import type { GamePhase } from '@/lib/monty-hall'

const HINTS: Partial<Record<GamePhase, string>> = {
  choosing:
    'Pick any door — each has a 1 in 3 chance of hiding the car. Your initial choice locks in a 33% probability.',
  revealed:
    "Monty just revealed a goat. He always knows where the car is — his reveal is not random. This shifts the odds.",
  final:
    "Staying keeps your original 1/3 odds. Switching captures the remaining 2/3 probability. The math favors switching.",
  result:
    "Over many rounds, switching wins ~67% of the time and staying wins ~33%. This matches the theory.",
}

interface LearnHintProps {
  phase: GamePhase
  active: boolean
}

export function LearnHint({ phase, active }: LearnHintProps) {
  const hint = HINTS[phase]
  if (!active || !hint) return null

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
      )}
      role="status"
    >
      <LightbulbIcon className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
      <p className="text-xs text-foreground/80 leading-relaxed">{hint}</p>
    </div>
  )
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 2C5.791 2 4 3.791 4 6C4 7.48 4.804 8.77 6 9.464V11H10V9.464C11.196 8.77 12 7.48 12 6C12 3.791 10.209 2 8 2Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M6.5 13H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 14.5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
