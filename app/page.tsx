"use client";

import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { Question } from "@/lib/parseCsv";
import { renderRichText } from "@/lib/renderRichText";
import AnswerRenderer from "@/components/answers/AnswerRenderer";
import { QuizProvider, useQuiz } from "@/context/QuizContext";

function QuizApp() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [ordered, setOrdered] = useState<string[]>([]);
  const [jumpTo, setJumpTo] = useState("");
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, string>>({});

  const { score, checked, setChecked, registerResult, resetAnswerLock } = useQuiz();

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  if (!questions.length) return <div>Loading...</div>;

  if (index >= questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Finished</h2>
          <p className="text-lg">
            Score: {score} / {questions.length}
          </p>
        </div>
      </div>
    );
  }

  const q = questions[index];

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

  function checkAnswer() {
    let isCorrectAnswer = false;

    if (q.type === "yesno") {
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

  function resetState() {
    setSelected([]);
    setOrdered([]);
    setYesNoAnswers({});
    setChecked(false);
    resetAnswerLock(); // 🔥 WICHTIG
  }

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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-black">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Question {index + 1} / {questions.length}
          </h2>

          <div className="mt-2 text-lg space-y-2">
            {renderRichText(q.question, q.images)}
          </div>
        </div>

        {/* Answers */}
        <div className="mb-6">
          <AnswerRenderer
            q={q}
            selected={selected}
            toggleAnswer={toggleAnswer}
            checked={checked}
            yesNoAnswers={yesNoAnswers}
            setYesNo={setYesNo}
            ordered={ordered}
            setOrdered={setOrdered}
          />
        </div>

        {/* Check */}
        {!checked && (
          <button
            onClick={checkAnswer}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Check
          </button>
        )}

        {/* Explanation */}
        {checked && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <p className="font-semibold mb-2">Explanation</p>
            {renderRichText(q.explanation, q.images)}
          </div>
        )}

        {/* Navigation */}
        {checked && (
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
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                Next
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
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

            <div className="text-right text-gray-600">
              Score: {score} / {questions.length}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function Home() {
  return (
    <QuizProvider>
      <QuizApp />
    </QuizProvider>
  );
}