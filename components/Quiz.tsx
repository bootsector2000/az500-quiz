"use client";

import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { Question } from "@/lib/parseCsv";
import { renderRichText } from "@/lib/renderRichText";
import AnswerRenderer from "@/components/answers/AnswerRenderer";
import { useQuiz } from "@/context/QuizContext";
import { saveState } from "@/lib/storage";

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [ordered, setOrdered] = useState<string[]>([]);
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string>>({});
  const [jumpTo, setJumpTo] = useState("");

  const { score, checked, setChecked, registerResult, resetAnswerLock } = useQuiz();

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  if (!questions.length) return <div>Loading...</div>;

  const q = questions[index];

  /* ---------------- RESET ---------------- */

  function resetState() {
    setSelected([]);
    setOrdered([]);
    setYesNoAnswers({});
    setMultiAnswers({});
    setChecked(false);
    resetAnswerLock();
  }

  /* ---------------- NAVIGATION ---------------- */

  function next() {
    resetState();
    setIndex(i => i + 1);
  }

  function previous() {
    if (index === 0) return;
    resetState();
    setIndex(i => i - 1);
  }

  function goToQuestion(num: number) {
    if (num < 1 || num > questions.length) return;
    resetState();
    setIndex(num - 1);
  }

  /* ---------------- SAVE ---------------- */

  function saveAndExit() {
    saveState({
      index,
      score,
      selected,
      ordered,
      yesNoAnswers,
      multiAnswers,
      marked: [],
    });

    window.location.reload();
  }

  /* ---------------- ANSWERS ---------------- */

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

  /* ---------------- CHECK ---------------- */

  function checkAnswer() {
    let isCorrectAnswer = false;

    if (q.type === "multibox") {
      const correct = q.multiCorrect || {};

      isCorrectAnswer = Object.entries(correct).every(
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

      isCorrectAnswer = parsed.every(entry => {
        return yesNoAnswers[entry.key] === entry.value;
      });

    } else if (q.type === "drag") {
      const correctOrder = q.correctAnswers.map(x => x.trim());
      const userOrder = ordered.map(x => x.trim());

      isCorrectAnswer =
        userOrder.length === correctOrder.length &&
        userOrder.every((val, i) => val === correctOrder[i]);

    } else {
      const correct = q.correctAnswers.sort().join(",");
      const user = [...selected].sort().join(",");
      isCorrectAnswer = correct === user;
    }

    registerResult(isCorrectAnswer);
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-black">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">

        {/* Question */}
        <h2 className="text-xl font-semibold mb-4">
          Question {index + 1} / {questions.length}
        </h2>

        <div className="mb-4">
          {renderRichText(q.question, q.images)}
        </div>

        {/* Answers */}
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

        {/* Check */}
        {!checked && (
          <button
            onClick={checkAnswer}
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded"
          >
            Check
          </button>
        )}

        {/* After Check */}
        {checked && (
          <>
            {/* Explanation */}
            <div className="mt-4 p-3 border rounded bg-gray-50">
              {renderRichText(q.explanation, q.images)}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex flex-col gap-3">

              <div className="flex justify-between">
                <button
                  onClick={previous}
                  disabled={index === 0}
                  className="bg-gray-300 px-4 py-2 rounded-lg"
                >
                  Previous
                </button>

                <button
                  onClick={next}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Next
                </button>
              </div>

              {/* Jump */}
              <div className="flex gap-2">
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

              {/* Save */}
              <button
                onClick={saveAndExit}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Save & Exit
              </button>

              {/* Score */}
              <div className="text-right text-gray-600">
                Score: {score} / {questions.length}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}