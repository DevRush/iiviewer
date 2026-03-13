export type QuizQuestionType = 'identify-view' | 'identify-vessel' | 'angle-target'

export interface QuizQuestion {
  id: string
  type: QuizQuestionType
  prompt: string
  options?: string[]
  answer?: string
  targetAngles?: {
    raoLao: number
    cranialCaudal: number
    tolerance: number
  }
  explanation: string
}

export interface QuizState {
  questions: QuizQuestion[]
  currentIndex: number
  score: number
  answered: boolean
  lastCorrect: boolean | null
  completed: boolean
}
