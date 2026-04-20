"use client";

import { useEffect, useState } from "react";
import { useQuiz } from "@/context/QuizContext";
import { useQuizEngine } from "@/hooks/useQuizEngine";
import { useQuestionLoader } from "@/hooks/useQuestionLoader";

import QuizHeader from "@/components/quiz/QuizHeader";
import QuestionCard from "@/components/quiz/QuestionCard";

type Props = {
  initialState?: any;
  skipSim?: boolean;
  range?: string;
  reviewMode?: "all" | "review";
  caseOnly?: boolean; // 🔥 NEW
};

export default function Quiz({
  initialState,
  skipSim,
  range,
  reviewMode,
  caseOnly,
}: Props) {
  const questions = useQuestionLoader({
    range,
    skipSim,
    reviewMode,
    initialState,
    caseOnly, // 🔥 NEW
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

  const isLast = index === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-black">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">

        <QuizHeader
          index={index}
          total={questions.length}
          questionId={q.id}
          score={score}
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

        <div className="my-6 border-t border-gray-200" />

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={previous}
            disabled={index === 0}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            ← Previous
          </button>

          <button
            onClick={saveAndExit}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
          >
            Save & Exit
          </button>

          {!isLast && (
            <button
              onClick={next}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
            >
              Next →
            </button>
          )}
        </div>

        <div className="mt-6 flex gap-2 items-center">
          <input
            type="number"
            placeholder="Go to Question..."
            value={jumpTo}
            onChange={e => setJumpTo(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-lg"
          />

          <button
            onClick={() => {
              goToQuestion(Number(jumpTo));
              setJumpTo("");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go
          </button>
        </div>

      </div>
    </div>
  );
}