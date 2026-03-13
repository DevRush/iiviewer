import { useState, useCallback } from 'react'
import type { QuizState } from '@/types/quiz'
import { QUIZ_QUESTIONS } from '@/data/quiz-questions'

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}

export function useQuizState() {
  const [state, setState] = useState<QuizState>(() => ({
    questions: shuffleArray(QUIZ_QUESTIONS),
    currentIndex: 0,
    score: 0,
    answered: false,
    lastCorrect: null,
    completed: false,
  }))

  const currentQuestion = state.completed
    ? null
    : state.questions[state.currentIndex] ?? null

  const submitAnswer = useCallback((correct: boolean) => {
    setState(prev => ({
      ...prev,
      answered: true,
      lastCorrect: correct,
      score: correct ? prev.score + 1 : prev.score,
    }))
  }, [])

  const nextQuestion = useCallback(() => {
    setState(prev => {
      const nextIdx = prev.currentIndex + 1
      if (nextIdx >= prev.questions.length) {
        return { ...prev, completed: true, answered: false }
      }
      return { ...prev, currentIndex: nextIdx, answered: false, lastCorrect: null }
    })
  }, [])

  const resetQuiz = useCallback(() => {
    setState({
      questions: shuffleArray(QUIZ_QUESTIONS),
      currentIndex: 0,
      score: 0,
      answered: false,
      lastCorrect: null,
      completed: false,
    })
  }, [])

  return {
    state,
    currentQuestion,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    totalQuestions: state.questions.length,
  }
}
