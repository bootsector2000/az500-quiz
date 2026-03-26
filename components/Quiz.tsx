"use client";

import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { Question } from "@/lib/parseCsv";
import { renderRichText } from "@/lib/renderRichText";
import AnswerRenderer from "@/components/answers/AnswerRenderer";
import { useQuiz } from "@/context/QuizContext";
import { useQuizEngine } from "@/hooks/useQuizEngine";

type Props = {
  initialState?: any;
  skipSim?: boolean;
  range?: string;
  reviewMode?: "all" | "review";
};

export default function Quiz({ initialState, skipSim, range, reviewMode }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
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
    fetchQuestions().then(allQuestions => {
      let q = [...allQuestions];

      if (range) {
        const parts = range.split("-").map(n => parseInt(n.trim(), 10));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const start = Math.max(parts[0], 1);
          const end = Math.min(parts[1], q.length);
          q = q.slice(start - 1, end);
        }
      }

      if (skipSim) {
        q = q.filter(q =>
          !q.question.trim().toUpperCase().startsWith("SIMULATION")
        );
      }

      if (reviewMode === "review" && initialState) {
        const results = initialState.results || {};
        const marked = new Set(initialState.marked || []);

        q = q.filter(question => {
          const result = results[question.id];
          const isWrong = result === "wrong";
          const isUnanswered = !result;
          const isMarked = marked.has(question.id);
          return isWrong || isUnanswered || isMarked;
        });
      }

      setQuestions(q);
      resetIndex();

      if (!initialState) {
        setScore(0);
      }
    });
  }, [skipSim, range, reviewMode, initialState]);

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

        <h2 className="text-xl font-semibold mb-4">
          Question {index + 1} / {questions.length}
        </h2>

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

            <div className="mt-6 flex flex-col gap-3">

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={marked.includes(q.id)}
                  onChange={toggleMark}
                />
                Mark question
              </label>

              <div className="flex justify-between">
                <button
                  onClick={previous}
                  disabled={index === 0}
                  className="bg-gray-300 px-4 py-2 rounded-lg"
                >
                  Previous
                </button>

                {!isLast && (
                  <button
                    onClick={next}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                  >
                    Next
                  </button>
                )}
              </div>

              <button
                onClick={saveAndExit}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Save & Exit
              </button>

              <div className="text-right text-gray-600">
                Score: {score} / {questions.length} ({percent}%)
              </div>
            </div>
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