'use client'

import { cn } from '@/lib/utils'

interface TopBarProps {
  theme: 'light' | 'dark'
  onThemeToggle: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onHome: () => void
}

export function TopBar({
  theme,
  onThemeToggle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onHome,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-12">
        {/* Title / Home */}
        <button
          onClick={onHome}
          className="flex items-center gap-2 group"
          aria-label="Go to home"
        >
          <DoorLogo className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold tracking-tight">Monty Hall</span>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <IconButton
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo"
          >
            <UndoIcon className="w-4 h-4" />
          </IconButton>
          <IconButton
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo"
          >
            <RedoIcon className="w-4 h-4" />
          </IconButton>
          <div className="w-px h-4 bg-border mx-1" />
          <IconButton
            onClick={onHome}
            aria-label="Reset to home"
            title="Reset"
          >
            <HomeIcon className="w-4 h-4" />
          </IconButton>
          <IconButton
            onClick={onThemeToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-4 h-4" />
            ) : (
              <SunIcon className="w-4 h-4" />
            )}
          </IconButton>
        </div>
      </div>
    </header>
  )
}

function IconButton({
  children,
  disabled,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground',
        'hover:bg-muted hover:text-foreground transition-colors',
        disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground',
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function DoorLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="2" width="14" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="5" width="3.5" height="5" rx="0.75" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="10.5" y="5" width="3.5" height="5" rx="0.75" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="11.5" cy="10.5" r="1" fill="currentColor" fillOpacity="0.5" />
    </svg>
  )
}

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 7H11C12.657 7 14 8.343 14 10C14 11.657 12.657 13 11 13H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 4L2 7L5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RedoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M13 7H5C3.343 7 2 8.343 2 10C2 11.657 3.343 13 5 13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 4L14 7L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1V2.5M8 13.5V15M15 8H13.5M2.5 8H1M12.5 3.5L11.5 4.5M4.5 11.5L3.5 12.5M12.5 12.5L11.5 11.5M4.5 4.5L3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M7 2C4.239 2 2 4.239 2 7C2 9.761 4.239 12 7 12C9.415 12 11.424 10.29 11.9 8C11.274 8.639 10.389 9 9.5 9C7.567 9 6 7.433 6 5.5C6 4.611 6.361 3.726 7 3.1V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
