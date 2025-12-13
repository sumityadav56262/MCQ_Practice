import { create } from 'zustand';

export const useQuizStore = create((set) => ({
    // State
    currentQuiz: null,
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswers: new Map(),
    attempt: null,
    timeRemaining: 0,

    // Actions
    setQuiz: (quiz, questions) => set({
        currentQuiz: quiz,
        questions,
        timeRemaining: quiz.duration_minutes * 60,
    }),

    setAttempt: (attempt) => set({ attempt }),

    selectAnswer: (questionId, optionIds) => set((state) => {
        const newAnswers = new Map(state.selectedAnswers);
        newAnswers.set(questionId, optionIds);
        return { selectedAnswers: newAnswers };
    }),

    nextQuestion: () => set((state) => ({
        currentQuestionIndex: Math.min(
            state.currentQuestionIndex + 1,
            state.questions.length - 1
        ),
    })),

    previousQuestion: () => set((state) => ({
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),

    decrementTime: () => set((state) => ({
        timeRemaining: Math.max(state.timeRemaining - 1, 0),
    })),

    resetQuiz: () => set({
        currentQuiz: null,
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswers: new Map(),
        attempt: null,
        timeRemaining: 0,
    }),
}));
