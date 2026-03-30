"use client";

import { useEffect, useState } from "react";
import { useQuiz } from "@/context/QuizContext";
import { useQuizEngine } from "@/hooks/useQuizEngine";
import { useQuestionLoader } from "@/hooks/useQuestionLoader";

import QuizHeader from "@/components/quiz/QuizHeader";
import QuizNavigation from "@/components/quiz/QuizNavigation";
import QuestionCard from "@/components/quiz/QuestionCard";

type Props = {
  initialState?: any;
  skipSim?: boolean;
  range?: string;
  reviewMode?: "all" | "review";
};

export default function Quiz({ initialState, skipSim, range, reviewMode }: Props) {
  const questions = useQuestionLoader({
    range,
    skipSim,
    reviewMode,
    initialState,
  });

  const [jumpTo, setJumpTo] = useState("");

  const { setScore } = useQuiz();

  const {
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
    saveAndExit
  } = useQuizEngine({ questions, range });

  useEffect(() => {
    if (questions.length) {
      resetIndex();
    }
  }, [questions]);

useEffect(() => {
  // always reset score on load to avoid accumulation
  setScore(0);
}, [initialState]);

  if (!questions.length || !q) return <div>Loading...</div>;

  function toggleAnswer(key: string) {
    if (checked) return;

    setSelected(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  }

  function setYesNo(key: string, value: "Yes" | "No") {
    if (checked) return;

    setYesNoAnswers(prev => ({
      ...prev,
      [key]: value,
    }));
  }

  function setMultiAnswer(box: string, value: string) {
    if (checked) return;

    setMultiAnswers(prev => ({
      ...prev,
      [box]: value,
    }));
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-black">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">

        <QuizHeader
          index={index}
          total={questions.length}
          questionId={q.id}
        />

        <QuestionCard
          q={q}
          checked={checked}
          selected={selected}
          ordered={ordered}
          yesNoAnswers={yesNoAnswers}
          multiAnswers={multiAnswers}
          marked={marked}
          toggleAnswer={toggleAnswer}
          setYesNo={setYesNo}
          setOrdered={setOrdered}
          setMultiAnswer={setMultiAnswer}
          toggleMark={toggleMark}
          checkAnswer={checkAnswer}
        />

        {/* ✅ FIX: Navigation IMMER rendern */}
        <QuizNavigation
          index={index}
          total={questions.length}
          score={score}
          onNext={next}
          onPrevious={previous}
          onSave={saveAndExit}
        />

        {/* Jump */}
        <div className="mt-6 flex gap-2">
          <input
            type="number"
            placeholder="Go to question..."
            value={jumpTo}
            onChange={e => setJumpTo(e.target.value)}
            className="border p-2 rounded-lg w-full"
          />

          <button
            onClick={() => {
              goToQuestion(Number(jumpTo));
              setJumpTo("");
            }}
            className="bg-blue-600 text-white px-4 rounded-lg"
          >
            Go
          </button>
        </div>

      </div>
    </div>
  );
}