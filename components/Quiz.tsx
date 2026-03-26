"use client";

import { useEffect, useState } from "react";
import { Question } from "@/lib/parseCsv";
import { renderRichText } from "@/lib/renderRichText";
import AnswerRenderer from "@/components/answers/AnswerRenderer";
import { useQuiz } from "@/context/QuizContext";
import { useQuizEngine } from "@/hooks/useQuizEngine";
import { useQuestionLoader } from "@/hooks/useQuestionLoader";

import QuizHeader from "@/components/quiz/QuizHeader";
import QuizNavigation from "@/components/quiz/QuizNavigation";

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
  if (initialState) {
    setScore(initialState.score || 0);
  } else {
    setScore(0);
  }
}, [initialState]);

  if (!questions.length || !q) return <div>Loading...</div>;

  const isLast = index === questions.length - 1;

  const percent = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

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

        <QuizHeader index={index} total={questions.length} />

        <div className="mb-4">
          {renderRichText(q.question, q.images)}
        </div>

        <AnswerRenderer
          q={q}
          selected={selected}
          toggleAnswer={toggleAnswer}
          checked={checked}
          yesNoAnswers={yesNoAnswers}
          setYesNo={setYesNo}
          ordered={ordered}
          setOrdered={setOrdered}
          multiAnswers={multiAnswers}
          setMultiAnswer={setMultiAnswer}
        />

        {!checked && (
          <>
            <label className="flex items-center gap-2 mt-4 text-sm">
              <input
                type="checkbox"
                checked={marked.includes(q.id)}
                onChange={toggleMark}
              />
              Mark question
            </label>

            <button
              onClick={checkAnswer}
              className="mt-2 w-full bg-blue-600 text-white p-2 rounded"
            >
              Check
            </button>
          </>
        )}

        {checked && (
          <>
            <div className="mt-4 p-3 border rounded bg-gray-50">
              {renderRichText(q.explanation, q.images)}
            </div>

            <QuizNavigation
              index={index}
              total={questions.length}
              score={score}
              onNext={next}
              onPrevious={previous}
              onSave={saveAndExit}
            />
          </>
        )}

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