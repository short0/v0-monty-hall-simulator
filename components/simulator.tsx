'use client'

import { useCallback, useState, useEffect } from 'react'
import { Door } from './door'
import { ResultsPanel } from './results-panel'
import { PresetRow, PRESETS, type Preset } from './preset-row'
import { AskAIPanel } from './ask-ai-panel'
import { LearnHint } from './learn-hint'
import { TopBar } from './top-bar'
import { cn } from '@/lib/utils'
import {
  buildDoors,
  pickRevealedDoor,
  resolveFinalDoor,
  runBatch,
  INITIAL_GAME,
  INITIAL_STATS,
  type GameState,
  type SimStats,
  type FinalChoice,
} from '@/lib/monty-hall'

// Snapshot for undo/redo
interface Snapshot {
  game: GameState
  stats: SimStats
}

const MAX_HISTORY = 50

export default function Simulator() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [game, setGame] = useState<GameState>(INITIAL_GAME)
  const [stats, setStats] = useState<SimStats>(INITIAL_STATS)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [history, setHistory] = useState<Snapshot[]>([])
  const [future, setFuture] = useState<Snapshot[]>([])
  const [batchMessage, setBatchMessage] = useState<string | null>(null)

  // Persist theme to localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mh-theme') as 'light' | 'dark' | null
      if (stored) setTheme(stored)
      const storedPreset = localStorage.getItem('mh-preset')
      if (storedPreset) setActivePreset(storedPreset)
      const storedStats = localStorage.getItem('mh-stats')
      if (storedStats) setStats(JSON.parse(storedStats))
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem('mh-theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('mh-stats', JSON.stringify(stats)) } catch {}
  }, [stats])

  useEffect(() => {
    try { if (activePreset) localStorage.setItem('mh-preset', activePreset) } catch {}
  }, [activePreset])

  // Save snapshot before state mutation
  const saveSnapshot = useCallback((g: GameState, s: SimStats) => {
    setHistory((h) => [...h.slice(-MAX_HISTORY), { game: g, stats: s }])
    setFuture([])
  }, [])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setFuture((f) => [{ game, stats }, ...f])
      setGame(prev.game)
      setStats(prev.stats)
      setBatchMessage(null)
      return h.slice(0, -1)
    })
  }, [game, stats])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f
      const next = f[0]
      setHistory((h) => [...h, { game, stats }])
      setGame(next.game)
      setStats(next.stats)
      setBatchMessage(null)
      return f.slice(1)
    })
  }, [game, stats])

  const reset = useCallback(() => {
    saveSnapshot(game, stats)
    setGame({ ...INITIAL_GAME, learnMode: game.learnMode })
    setBatchMessage(null)
  }, [game, stats, saveSnapshot])

  const goHome = useCallback(() => {
    saveSnapshot(game, stats)
    setGame(INITIAL_GAME)
    setStats(INITIAL_STATS)
    setActivePreset(null)
    setBatchMessage(null)
    try { localStorage.removeItem('mh-stats') } catch {}
  }, [game, stats, saveSnapshot])

  // ── Phase: start a new round ──
  const startRound = useCallback(() => {
    saveSnapshot(game, stats)
    const doors = buildDoors()
    setGame({
      ...INITIAL_GAME,
      phase: 'choosing',
      doors,
      learnMode: game.learnMode,
    })
    setBatchMessage(null)
  }, [game, stats, saveSnapshot])

  // ── Phase: choose a door ──
  const chooseDoor = useCallback((idx: number) => {
    if (game.phase !== 'choosing') return
    saveSnapshot(game, stats)
    const revealed = pickRevealedDoor(game.doors, idx)
    setGame((g) => ({ ...g, phase: 'revealed', chosenDoor: idx, revealedDoor: revealed }))
  }, [game, stats, saveSnapshot])

  // ── Phase: stay or switch ──
  const makeFinalChoice = useCallback((choice: FinalChoice) => {
    if (game.phase !== 'revealed' || game.chosenDoor === null || game.revealedDoor === null) return
    saveSnapshot(game, stats)
    const finalDoor = resolveFinalDoor(game.chosenDoor, game.revealedDoor, choice)
    const won = game.doors[finalDoor] === 'car'

    setGame((g) => ({
      ...g,
      phase: 'result',
      finalDoor,
      finalChoice: choice,
      won,
    }))
    setStats((s) => ({
      stayWins: choice === 'stay' ? s.stayWins + (won ? 1 : 0) : s.stayWins,
      stayTotal: choice === 'stay' ? s.stayTotal + 1 : s.stayTotal,
      switchWins: choice === 'switch' ? s.switchWins + (won ? 1 : 0) : s.switchWins,
      switchTotal: choice === 'switch' ? s.switchTotal + 1 : s.switchTotal,
    }))
  }, [game, stats, saveSnapshot])

  // ── Preset handling ──
  const handlePreset = useCallback((preset: Preset) => {
    saveSnapshot(game, stats)
    setActivePreset(preset.id)
    setBatchMessage(null)

    if (preset.id === 'quick') {
      const doors = buildDoors()
      setGame({ ...INITIAL_GAME, phase: 'choosing', doors, learnMode: false })
      return
    }

    if (preset.id === 'learn') {
      const doors = buildDoors()
      setGame({ ...INITIAL_GAME, phase: 'choosing', doors, learnMode: true })
      return
    }

    const n = preset.id === 'ten' ? 10 : 1000
    const stayResult = runBatch(n, 'stay')
    const switchResult = runBatch(n, 'switch')
    setStats((s) => ({
      stayWins: s.stayWins + stayResult.wins,
      stayTotal: s.stayTotal + stayResult.total,
      switchWins: s.switchWins + switchResult.wins,
      switchTotal: s.switchTotal + switchResult.total,
    }))
    setGame({ ...INITIAL_GAME, learnMode: false })
    setBatchMessage(
      `Simulated ${n.toLocaleString()} rounds (${n} stay + ${n} switch). Results added to your stats.`
    )
  }, [game, stats, saveSnapshot])

  const isIdle = game.phase === 'idle'
  const isChoosing = game.phase === 'choosing'
  const isRevealed = game.phase === 'revealed'
  const isResult = game.phase === 'result'
  const totalGames = stats.stayTotal + stats.switchTotal

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={undo}
        onRedo={redo}
        onHome={goHome}
      />

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-balance">Monty Hall Simulator</h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty max-w-md">
            A host reveals a goat behind one of three doors. Should you stick with your choice or switch to the remaining door?
          </p>
        </section>

        {/* Presets */}
        <section aria-label="Presets">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Presets
          </p>
          <PresetRow activePreset={activePreset} onSelect={handlePreset} />
        </section>

        {/* Batch message */}
        {batchMessage && (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">{batchMessage}</p>
          </div>
        )}

        {/* Simulator panel */}
        <section aria-label="Simulator" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Simulator
            </p>
            {totalGames > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground">
                {totalGames} round{totalGames !== 1 ? 's' : ''} played
              </span>
            )}
          </div>

          {/* Step indicator */}
          <StepIndicator phase={game.phase} />

          {/* Learn hint */}
          <LearnHint phase={game.phase} active={game.learnMode} />

          {/* Doors */}
          {!isIdle && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[0, 1, 2].map((i) => (
                <Door
                  key={i}
                  index={i}
                  content={game.doors[i]}
                  isChosen={game.chosenDoor === i}
                  isRevealed={game.revealedDoor === i}
                  isFinal={game.finalDoor === i}
                  isOpen={
                    game.revealedDoor === i ||
                    (isResult && i === game.finalDoor)
                  }
                  phase={game.phase}
                  onClick={isChoosing ? () => chooseDoor(i) : undefined}
                  disabled={!isChoosing || game.revealedDoor === i}
                />
              ))}
            </div>
          )}

          {/* CTA area */}
          <div className="space-y-3">
            {isIdle && (
              <button
                onClick={startRound}
                className="w-full rounded-lg bg-foreground text-background py-3 text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
              >
                Start a Round
              </button>
            )}

            {isChoosing && (
              <p className="text-center text-xs text-muted-foreground animate-in fade-in">
                Click a door to make your initial choice.
              </p>
            )}

            {isRevealed && (
              <div className="space-y-2">
                <p className="text-center text-xs text-muted-foreground">
                  Monty revealed a goat. Stay with Door {(game.chosenDoor ?? 0) + 1}, or switch?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => makeFinalChoice('stay')}
                    className="rounded-lg border-2 border-border bg-card py-3 text-sm font-semibold hover:border-foreground/40 hover:bg-muted active:scale-[0.98] transition-all"
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => makeFinalChoice('switch')}
                    className="rounded-lg border-2 border-accent bg-accent/10 py-3 text-sm font-semibold text-accent hover:bg-accent/20 active:scale-[0.98] transition-all"
                  >
                    Switch
                  </button>
                </div>
              </div>
            )}

            {isResult && (
              <div className="space-y-2">
                <ResultOutcome won={game.won!} choice={game.finalChoice!} />
                <button
                  onClick={startRound}
                  className="w-full rounded-lg border border-border bg-card py-2.5 text-sm font-semibold hover:bg-muted active:scale-[0.99] transition-all"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Results panel */}
        {totalGames > 0 && (
          <section aria-label="Statistics">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Statistics
            </p>
            <ResultsPanel
              stats={stats}
              lastWon={isResult ? game.won : null}
              lastChoice={isResult ? game.finalChoice : null}
            />
          </section>
        )}

        {/* Ask AI */}
        <AskAIPanel />

        {/* Footer */}
        <footer className="pt-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground/50 font-mono text-center">
            The Monty Hall problem — named after the host of Let&apos;s Make a Deal (1963)
          </p>
        </footer>
      </main>
    </div>
  )
}

// ── Sub-components ──

function StepIndicator({ phase }: { phase: string }) {
  const steps = [
    { id: 'choosing', label: '1. Pick a door' },
    { id: 'revealed', label: '2. Stay or switch' },
    { id: 'result', label: '3. Result' },
  ]
  const active = steps.findIndex((s) => s.id === phase)

  if (phase === 'idle') return null

  return (
    <div className="flex items-center gap-2" aria-label="Game steps">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                i < active
                  ? 'bg-foreground/30'
                  : i === active
                  ? 'bg-accent scale-125'
                  : 'bg-border',
              )}
            />
            <span
              className={cn(
                'text-[10px] font-mono transition-colors',
                i === active ? 'text-foreground' : 'text-muted-foreground/50',
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('w-4 h-px', i < active ? 'bg-foreground/20' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  )
}

function ResultOutcome({ won, choice }: { won: boolean; choice: FinalChoice }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 text-center space-y-0.5',
        won ? 'border-win/30 bg-win-bg' : 'border-loss/30 bg-loss-bg',
      )}
    >
      <p className={cn('text-base font-bold', won ? 'text-win' : 'text-loss')}>
        {won ? 'You found the car!' : 'It was a goat.'}
      </p>
      <p className={cn('text-xs', won ? 'text-win/70' : 'text-loss/70')}>
        {choice === 'switch'
          ? won
            ? 'Switching paid off — as expected ~67% of the time.'
            : 'You switched, but this time the car stayed. Happens ~33% of the time.'
          : won
          ? 'You stayed and won — luck was on your side (~33% chance).'
          : 'Staying kept you at the original 1-in-3 odds.'}
      </p>
    </div>
  )
}
