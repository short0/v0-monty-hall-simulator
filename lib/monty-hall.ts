export type GamePhase = 'idle' | 'choosing' | 'revealed' | 'final' | 'result'
export type DoorContent = 'car' | 'goat'
export type FinalChoice = 'stay' | 'switch'

export interface GameState {
  phase: GamePhase
  doors: DoorContent[] // [0, 1, 2]
  chosenDoor: number | null
  revealedDoor: number | null
  finalDoor: number | null
  finalChoice: FinalChoice | null
  won: boolean | null
  learnMode: boolean
}

export interface SimStats {
  stayWins: number
  stayTotal: number
  switchWins: number
  switchTotal: number
}

export const INITIAL_STATS: SimStats = {
  stayWins: 0,
  stayTotal: 0,
  switchWins: 0,
  switchTotal: 0,
}

export const INITIAL_GAME: GameState = {
  phase: 'idle',
  doors: ['goat', 'goat', 'goat'],
  chosenDoor: null,
  revealedDoor: null,
  finalDoor: null,
  finalChoice: null,
  won: null,
  learnMode: false,
}

/** Place the car behind a random door, return the new doors array */
export function buildDoors(): DoorContent[] {
  const carPos = Math.floor(Math.random() * 3)
  return [0, 1, 2].map((i) => (i === carPos ? 'car' : 'goat')) as DoorContent[]
}

/** Monty reveals a goat door that is neither chosen nor the car */
export function pickRevealedDoor(doors: DoorContent[], chosen: number): number {
  const candidates = [0, 1, 2].filter(
    (i) => i !== chosen && doors[i] === 'goat'
  )
  return candidates[Math.floor(Math.random() * candidates.length)]
}

/** Given stay/switch, return the final door index */
export function resolveFinalDoor(
  chosen: number,
  revealed: number,
  choice: FinalChoice
): number {
  if (choice === 'stay') return chosen
  return [0, 1, 2].find((i) => i !== chosen && i !== revealed)!
}

/** Run n simulations, returning delta stats */
export function runBatch(
  n: number,
  choice: FinalChoice
): { wins: number; total: number } {
  let wins = 0
  for (let i = 0; i < n; i++) {
    const doors = buildDoors()
    const chosen = Math.floor(Math.random() * 3)
    const revealed = pickRevealedDoor(doors, chosen)
    const final = resolveFinalDoor(chosen, revealed, choice)
    if (doors[final] === 'car') wins++
  }
  return { wins, total: n }
}

export function winRate(wins: number, total: number): number {
  if (total === 0) return 0
  return wins / total
}

export function pct(wins: number, total: number): string {
  if (total === 0) return '—'
  return `${Math.round((wins / total) * 100)}%`
}
