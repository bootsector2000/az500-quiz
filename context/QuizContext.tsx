"use client";

import { createContext, useContext, useState, useRef } from "react";

type QuizContextType = {
  score: number;
  checked: boolean;

  setChecked: (v: boolean) => void;
  registerResult: (isCorrect: boolean) => void;
  resetAnswerLock: () => void;
  setScore: (v: number) => void;
};

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);

  // 🔥 verhindert doppelte Bewertung (synchron!)
  const hasAnsweredRef = useRef(false);

  function registerResult(isCorrect: boolean) {
    if (hasAnsweredRef.current) return;

    hasAnsweredRef.current = true;

    if (isCorrect) {
      setScore(s => s + 1);
    }

    setChecked(true);
  }

  function resetAnswerLock() {
    hasAnsweredRef.current = false;
  }

  return (
    <QuizContext.Provider
    value={{
    score,
    setScore,
    checked,
    setChecked,
    registerResult,
    resetAnswerLock,
    }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside QuizProvider");
  return ctx;
}