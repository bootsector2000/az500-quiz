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
  const [skipSim, setSkipSim] = useState(false);
  const [range, setRange] = useState<string>("1-");
  const [reviewMode, setReviewMode] = useState<"all" | "review">("all");

  useEffect(() => {
    setSaves(loadAllStates());
  }, []);

  if (mode === "menu") {
    return (
      <Menu
        saves={saves}
        onNew={(skip, r) => {
          setSkipSim(skip);
          setRange(r);
          setActiveSave(null);
          setMode("quiz");
        }}
onLoad={(s, mode) => {
  setActiveSave(s);
  setReviewMode(mode);

  // 🔥 DAS IST DER FIX
  setRange(s.range || "1-");

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
    <Quiz
      initialState={activeSave}
      skipSim={skipSim}
      range={range}
      reviewMode={reviewMode}
    />
    </QuizProvider>
  );
}