import { useState } from "react";
import { Question } from "@/lib/parseCsv";

type UseQuizEngineParams = {
  questions: Question[];
    resetState: () => void;
};

export function useQuizEngine({ questions, resetState }: UseQuizEngineParams) {
  const [index, setIndex] = useState(0);

function next() {
  resetState();
  setIndex(i => i + 1);
}

function previous() {
  resetState();
  setIndex(i => (i > 0 ? i - 1 : i));
}

function goToQuestion(num: number) {
  if (num < 1 || num > questions.length) return;
  resetState();
  setIndex(num - 1);
}

function resetIndex() {
  setIndex(0);
}

  const q = questions[index];

  return {
    index,
    q,
    next,
    previous,
    goToQuestion,
    resetIndex,
  };
}