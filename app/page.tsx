"use client";

import { useState, useEffect } from "react";
import Menu from "@/components/Menu";
import Quiz from "@/components/Quiz";
import { loadState } from "@/lib/storage";
import { QuizProvider } from "@/context/QuizContext";

export default function Home() {
  const [mode, setMode] = useState<"menu" | "quiz">("menu");
  const [saved, setSaved] = useState<any>(null);

  useEffect(() => {
    const s = loadState();
    if (s) setSaved(s);
  }, []);

  if (mode === "menu") {
    return (
      <Menu
        hasSave={!!saved}
        onNew={() => setMode("quiz")}
        onResume={() => setMode("quiz")}
      />
    );
  }

  return (
    <QuizProvider>
      <Quiz />
    </QuizProvider>
  );
}