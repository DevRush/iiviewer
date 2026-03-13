export interface AngleState {
  /** -90 (RAO 90) to +90 (LAO 90). 0 = AP. Positive = LAO, Negative = RAO */
  raoLao: number
  /** -45 (Caudal 45) to +45 (Cranial 45). 0 = Straight. Positive = Cranial, Negative = Caudal */
  cranialCaudal: number
}

export type DominanceType = 'right' | 'left' | 'codominant'
export type ViewMode = 'fluoroscopy' | 'schematic'
export type AppMode = 'explore' | 'guided' | 'quiz'
export type CoronarySystem = 'both' | 'left' | 'right'

export interface PresetView {
  id: string
  name: string
  shortName: string
  raoLao: number
  cranialCaudal: number
  targetSystem: 'left' | 'right' | 'both'
  description: string
  angleRange: string
  objective: string
  clinicalNotes: string
  expectedFindings: string[]
  practicePrompt: string
  targetSegments: string[]
}
