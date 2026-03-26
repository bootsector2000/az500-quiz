"use client";

import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { Question } from "@/lib/parseCsv";
import { renderRichText } from "@/lib/renderRichText";
import AnswerRenderer from "@/components/answers/AnswerRenderer";
import { useQuiz } from "@/context/QuizContext";
import { saveState } from "@/lib/storage";

type Props = {
  initialState?: any;
  skipSim?: boolean;
  range?: string;
};

export default function Quiz({ initialState, skipSim, range }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [ordered, setOrdered] = useState<string[]>([]);
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string>>({});
  const [jumpTo, setJumpTo] = useState("");

  const { score, setScore, checked, setChecked, registerResult, resetAnswerLock } = useQuiz();

  useEffect(() => {
    fetchQuestions().then(q => {

      // 🔥 RANGE FILTER
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

      setQuestions(q);
    });
  }, [skipSim, range]);

  useEffect(() => {
    if (!initialState) return;

    setIndex(initialState.index || 0);
    setSelected(initialState.selected || []);
    setOrdered(initialState.ordered || []);
    setYesNoAnswers(initialState.yesNoAnswers || {});
    setMultiAnswers(initialState.multiAnswers || {});
    setScore(initialState.score || 0);
  }, [initialState]);

  if (!questions.length) return <div>Loading...</div>;

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
    if (index === 0) return;
    resetState();
    setIndex(i => i - 1);
  }

  function goToQuestion(num: number) {
    if (num < 1 || num > questions.length) return;
    resetState();
    setIndex(num - 1);
  }

  function saveAndExit() {
    saveState({
      index,
      score,
      selected,
      ordered,
      yesNoAnswers,
      multiAnswers,
      marked: [],
      range, // 🔥 speichern
    });

    window.location.reload();
  }

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

      isCorrectAnswer = parsed.every(entry =>
        yesNoAnswers[entry.key] === entry.value
      );

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
          <button
            onClick={checkAnswer}
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded"
          >
            Check
          </button>
        )}

        {checked && (
          <>
            <div className="mt-4 p-3 border rounded bg-gray-50">
              {renderRichText(q.explanation, q.images)}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-between">
                <button onClick={previous} disabled={index === 0} className="bg-gray-300 px-4 py-2 rounded-lg">
                  Previous
                </button>
                <button onClick={next} className="bg-black text-white px-4 py-2 rounded-lg">
                  Next
                </button>
              </div>

              <button onClick={saveAndExit} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Save & Exit
              </button>

              <div className="text-right text-gray-600">
                Score: {score} / {questions.length}
              </div>
            </div>
          </>
        )}

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