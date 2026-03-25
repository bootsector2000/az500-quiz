"use client";

import { useState, useEffect } from "react";
import Menu from "@/components/Menu";
import Quiz from "@/components/Quiz";
import { loadAllStates, SavedState } from "@/lib/storage";
import { QuizProvider } from "@/context/QuizContext";

export default function Home() {
  const [mode, setMode] = useState<"menu" | "quiz">("menu");
  const [saves, setSaves] = useState<SavedState[]>([]);
  const [activeSave, setActiveSave] = useState<SavedState | null>(null);

  useEffect(() => {
    setSaves(loadAllStates());
  }, []);

  if (mode === "menu") {
    return (
      <Menu
  saves={saves}
  onNew={() => {
    setActiveSave(null);
    setMode("quiz");
  }}
  onLoad={(s) => {
    setActiveSave(s);
    setMode("quiz");
  }}
  onDelete={() => {
    setSaves(loadAllStates());
  }}
/>
    );
  }

  return (
    <QuizProvider>
      <Quiz initialState={activeSave} />
    </QuizProvider>
  );
}