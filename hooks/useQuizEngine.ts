import { useState } from "react";
import { Question } from "@/lib/parseCsv";
import { useQuiz } from "@/context/QuizContext";
import { saveState } from "@/lib/storage";

type UseQuizEngineParams = {
  questions: Question[];
  range?: string;
};

export function useQuizEngine({ questions, range }: UseQuizEngineParams) {
  const { score, setScore, checked, setChecked, registerResult, resetAnswerLock } = useQuiz();

  const [index, setIndex] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [ordered, setOrdered] = useState<string[]>([]);
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, "correct" | "wrong">>({});
  const [marked, setMarked] = useState<string[]>([]);

  const q = questions[index];

  function resetState() {
    setSelected([]);
    setOrdered([]);
    setYesNoAnswers({});
    setMultiAnswers({});
    setChecked(false);
    resetAnswerLock();
  }

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

  function toggleMark() {
    setMarked(prev =>
      prev.includes(q.id)
        ? prev.filter(id => id !== q.id)
        : [...prev, q.id]
    );
  }

  function checkAnswer() {
    let isCorrect = false;

    if (q.type === "multibox") {
      const correct = q.multiCorrect || {};
      isCorrect = Object.entries(correct).every(
        ([box, val]) => multiAnswers[box] === val
      );
    } else if (q.type === "yesno") {
      const parsed = [];

      for (let i = 0; i < q.correctAnswers.length; i += 2) {
        parsed.push({
          key: String(q.correctAnswers[i]).trim(),
          value: String(q.correctAnswers[i + 1]).trim(),
        });
      }

      isCorrect = parsed.every(entry =>
        yesNoAnswers[entry.key] === entry.value
      );
    } else if (q.type === "drag") {
      const correctOrder = q.correctAnswers.map(x => x.trim());
      const userOrder = ordered.map(x => x.trim());

      isCorrect =
        userOrder.length === correctOrder.length &&
        userOrder.every((val, i) => val === correctOrder[i]);
    } else {
      const correct = q.correctAnswers.sort().join(",");
      const user = [...selected].sort().join(",");
      isCorrect = correct === user;
    }

    registerResult(isCorrect);

    setResults(prev => ({
      ...prev,
      [q.id]: isCorrect ? "correct" : "wrong",
    }));
  }

  function saveAndExit() {
    saveState({
      index,
      score,
      selected,
      ordered,
      yesNoAnswers,
      multiAnswers,
      marked,
      range,
      results,
    });

    window.location.reload();
  }

  return {
    q,
    index,
    score,
    checked,

    selected,
    ordered,
    yesNoAnswers,
    multiAnswers,
    marked,

    setSelected,
    setOrdered,
    setYesNoAnswers,
    setMultiAnswers,

    next,
    previous,
    goToQuestion,
    resetIndex,

    toggleMark,
    checkAnswer,
    saveAndExit,
  };
}