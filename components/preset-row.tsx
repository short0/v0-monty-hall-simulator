'use client'

import { cn } from '@/lib/utils'

export interface Preset {
  id: string
  label: string
  description: string
}

export const PRESETS: Preset[] = [
  {
    id: 'quick',
    label: 'Quick Play',
    description: 'One guided round',
  },
  {
    id: 'ten',
    label: '10 Rounds',
    description: 'Fast batch',
  },
  {
    id: 'thousand',
    label: '1,000 Rounds',
    description: 'See convergence',
  },
  {
    id: 'learn',
    label: 'Learn Mode',
    description: 'Step-by-step hints',
  },
]

interface PresetRowProps {
  activePreset: string | null
  onSelect: (preset: Preset) => void
}

export function PresetRow({ activePreset, onSelect }: PresetRowProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Simulation presets">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset)}
          aria-pressed={activePreset === preset.id}
          className={cn(
            'flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-all duration-150',
            'hover:border-accent/50 hover:bg-accent/5 active:scale-[0.98]',
            activePreset === preset.id
              ? 'border-accent bg-accent/10 text-foreground'
              : 'border-border bg-card text-foreground',
          )}
        >
          <span className="text-xs font-semibold leading-tight">{preset.label}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">{preset.description}</span>
        </button>
      ))}
    </div>
  )
}
