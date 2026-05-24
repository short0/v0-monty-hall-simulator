'use client'

import { cn } from '@/lib/utils'
import { pct, winRate, type SimStats } from '@/lib/monty-hall'

interface ResultsPanelProps {
  stats: SimStats
  lastWon: boolean | null
  lastChoice: 'stay' | 'switch' | null
}

export function ResultsPanel({ stats, lastWon, lastChoice }: ResultsPanelProps) {
  const stayRate = winRate(stats.stayWins, stats.stayTotal)
  const switchRate = winRate(stats.switchWins, stats.switchTotal)
  const total = stats.stayTotal + stats.switchTotal

  return (
    <div className="w-full space-y-4">
      {/* Last result banner */}
      {lastWon !== null && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3 transition-all',
            lastWon
              ? 'border-win/30 bg-win-bg text-win'
              : 'border-loss/30 bg-loss-bg text-loss',
          )}
        >
          <span className="text-lg font-bold">{lastWon ? '✓' : '✗'}</span>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {lastWon ? 'You won the car!' : 'Goat behind that door.'}
            </p>
            <p className="text-xs opacity-70">
              {lastChoice === 'stay' ? 'You stayed' : 'You switched'}
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Stay strategy"
          wins={stats.stayWins}
          total={stats.stayTotal}
          rate={stayRate}
          target={1 / 3}
          color="accent"
        />
        <StatCard
          label="Switch strategy"
          wins={stats.switchWins}
          total={stats.switchTotal}
          rate={switchRate}
          target={2 / 3}
          color="win"
        />
      </div>

      {/* Insight */}
      {total >= 5 && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {switchRate > stayRate
              ? `Switching is winning ${pct(stats.switchWins, stats.switchTotal)} of the time — approaching the theoretical 2/3.`
              : total < 20
              ? 'Keep playing — with more rounds, switching converges to a 2/3 win rate.'
              : `Interesting run! Statistically, switching should converge toward 67%.`}
          </p>
        </div>
      )}

      {total === 0 && (
        <p className="text-center text-xs text-muted-foreground py-2">
          Play a round to start tracking statistics.
        </p>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  wins: number
  total: number
  rate: number
  target: number
  color: 'accent' | 'win'
}

function StatCard({ label, wins, total, rate, target, color }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span
          className={cn(
            'text-xl font-bold font-mono tabular-nums',
            color === 'accent' ? 'text-accent' : 'text-win',
          )}
        >
          {pct(wins, total)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
        {/* Target line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-foreground/20 z-10"
          style={{ left: `${target * 100}%` }}
        />
        {/* Actual bar */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            color === 'accent' ? 'bg-accent' : 'bg-win',
          )}
          style={{ width: `${rate * 100}%` }}
        />
      </div>

      {/* Sub-stats */}
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span>{wins}W / {total - wins}L</span>
        <span>{total} played</span>
      </div>

      {/* Target annotation */}
      <div className="flex items-center gap-1">
        <div className="h-px flex-1 bg-foreground/10" />
        <span className="text-[9px] text-muted-foreground/60 font-mono">
          Theory: {Math.round(target * 100)}%
        </span>
        <div className="h-px flex-1 bg-foreground/10" />
      </div>
    </div>
  )
}
