"use client";

import { createContext, useContext, useState } from "react";

type QuizContextType = {
  score: number;
  setScore: (fn: (prev: number) => number) => void;

  checked: boolean;
  setChecked: (v: boolean) => void;

  registerResult: (isCorrect: boolean) => void;
};

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);

  function registerResult(isCorrect: boolean) {
    if (isCorrect) {
      setScore(s => s + 1);
    }
    setChecked(true);
  }

  return (
    <QuizContext.Provider
      value={{
        score,
        setScore,
        checked,
        setChecked,
        registerResult,
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