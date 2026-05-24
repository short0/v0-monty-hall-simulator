'use client'

import { cn } from '@/lib/utils'
import type { DoorContent } from '@/lib/monty-hall'

interface DoorProps {
  index: number
  content: DoorContent
  isChosen: boolean
  isRevealed: boolean
  isFinal: boolean
  isOpen: boolean // show what's behind
  phase: string
  onClick?: () => void
  disabled?: boolean
}

const DoorNumbers = ['I', 'II', 'III']

export function Door({
  index,
  content,
  isChosen,
  isRevealed,
  isFinal,
  isOpen,
  phase,
  onClick,
  disabled,
}: DoorProps) {
  const clickable = !disabled && !!onClick

  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-label={`Door ${index + 1}${isChosen ? ', your choice' : ''}${isRevealed ? ', revealed goat' : ''}`}
      className={cn(
        'relative flex flex-col items-center justify-between rounded-xl border-2 transition-all duration-300 select-none',
        'w-full aspect-[3/5] min-h-[160px] max-h-[280px] p-3 sm:p-4',
        // border colors
        isRevealed && 'border-door-revealed opacity-60',
        isChosen && !isRevealed && 'border-door-selected shadow-md shadow-accent/20',
        isFinal && 'border-door-selected ring-2 ring-accent/30',
        !isChosen && !isRevealed && !isFinal && 'border-door-border',
        // backgrounds
        isRevealed ? 'bg-door-revealed' : 'bg-door-bg',
        isFinal && !isRevealed && 'bg-accent/5',
        // hover
        clickable && !isRevealed && 'cursor-pointer hover:border-accent/60 hover:scale-[1.02] active:scale-[0.98]',
        disabled && 'cursor-default',
      )}
    >
      {/* Door number */}
      <span
        className={cn(
          'text-xs font-mono font-semibold tracking-widest uppercase',
          isRevealed ? 'text-muted-foreground/50' : 'text-muted-foreground',
        )}
      >
        {DoorNumbers[index]}
      </span>

      {/* Door face / content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {isOpen ? (
          <div className={cn('flex flex-col items-center gap-1 transition-all duration-300', isOpen && 'door-anim')}>
            {content === 'car' ? (
              <>
                <CarIcon className={cn('w-12 h-12 sm:w-16 sm:h-16', isFinal ? 'text-accent' : 'text-foreground')} />
                <span className={cn('text-[10px] font-mono uppercase tracking-wider', isFinal ? 'text-accent' : 'text-foreground/60')}>
                  {isFinal ? 'You won!' : 'Car'}
                </span>
              </>
            ) : (
              <>
                <GoatIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/60" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">Goat</span>
              </>
            )}
          </div>
        ) : (
          <DoorFaceIcon
            className={cn(
              'w-10 h-14 sm:w-14 sm:h-20 transition-colors',
              isChosen ? 'text-accent' : 'text-foreground/20',
            )}
          />
        )}
      </div>

      {/* Status tag */}
      <div className="h-5 flex items-center justify-center">
        {isChosen && !isFinal && phase === 'revealed' && (
          <span className="text-[9px] font-mono uppercase tracking-widest text-accent">Your pick</span>
        )}
        {isFinal && (
          <span className="text-[9px] font-mono uppercase tracking-widest text-accent">Final pick</span>
        )}
        {isRevealed && !isFinal && (
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">Revealed</span>
        )}
      </div>
    </button>
  )
}

function DoorFaceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 80" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="52" height="76" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="8" y="10" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
      <rect x="32" y="10" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
      <rect x="8" y="44" width="16" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
      <rect x="32" y="44" width="16" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="30" cy="40" r="2.5" fill="currentColor" fillOpacity="0.6" />
    </svg>
  )
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 26L14 10H50L56 26"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
      />
      <rect x="4" y="24" width="56" height="12" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="38" r="5" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="48" cy="38" r="5" stroke="currentColor" strokeWidth="2.5" />
      <rect x="20" y="13" width="24" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function GoatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* body */}
      <ellipse cx="32" cy="40" rx="18" ry="12" stroke="currentColor" strokeWidth="2.5" />
      {/* head */}
      <circle cx="46" cy="22" r="9" stroke="currentColor" strokeWidth="2.5" />
      {/* ear */}
      <path d="M42 14 L38 8 L44 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M50 14 L54 8 L50 13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* neck */}
      <line x1="42" y1="30" x2="40" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* legs */}
      <line x1="22" y1="50" x2="20" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="51" x2="26" y2="63" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38" y1="51" x2="40" y2="63" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="50" x2="46" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* tail */}
      <path d="M14 38 Q8 34 10 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* eye */}
      <circle cx="48" cy="21" r="1.5" fill="currentColor" />
    </svg>
  )
}
