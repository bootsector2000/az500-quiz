"use client";

import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { Question } from "@/lib/parseCsv";

function renderRichText(text: string, images: Record<string, string>) {
  if (!text) return null;

  const parts = text.split(/(<img\d+>|https?:\/\/[^\s]+)/g);

  return (
    <div className="text-black">
      {parts.map((part, index) => {
        const imgMatch = part.trim().match(/<img(\d+)>/i);

        if (imgMatch) {
          const key = `img${imgMatch[1]}`;
          const src = images[key]?.trim();
          if (!src) return null;

          return (
            <div key={index} className="my-4">
              <img src={src} alt={key} className="w-full rounded-lg border" />
            </div>
          );
        }

        if (part.match(/^https?:\/\//)) {
          return (
            <div key={index} className="mt-3">
              <a href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {part}
              </a>
            </div>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [jumpTo, setJumpTo] = useState("");

  const [ordered, setOrdered] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // 👉 NEW: Yes/No State
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  if (!questions.length) return <div>Loading...</div>;

  if (index >= questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Finished</h2>
          <p className="text-lg">Score: {score} / {questions.length}</p>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const isMultiple = q.correctAnswers.length > 1;
  const isNumeric = q.answers.every(a => /^\d+$/.test(a.key));

  // 👉 NEW: Yes/No detection
  const isYesNo = q.answers.every(a => a.text.includes("<radio YN>"));

  const correctOrder = q.correctAnswers.map(x => x.trim()).filter(Boolean);
  const normalizedOrdered = ordered.map(x => x.trim());

  const isCorrectNumeric =
    normalizedOrdered.length === correctOrder.length &&
    normalizedOrdered.every((val, i) => val === correctOrder[i]);

  function toggleAnswer(key: string) {
    if (checked) return;

    if (isMultiple) {
      setSelected(prev =>
        prev.includes(key)
          ? prev.filter(k => k !== key)
          : [...prev, key]
      );
    } else {
      setSelected([key]);
    }
  }

  function setYesNo(key: string, value: "Yes" | "No") {
    if (checked) return;

    setYesNoAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function addToOrder(key: string) {
    if (ordered.includes(key)) return;
    setOrdered(prev => [...prev, key]);
  }

  function removeFromOrder(key: string) {
    setOrdered(prev => prev.filter(k => k !== key));
  }

  function handleDragStart(i: number) {
    setDragIndex(i);
  }

  function handleDragOver(i: number) {
    if (dragIndex === null || dragIndex === i) return;

    const updated = [...ordered];
    const item = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(i, 0, item);

    setDragIndex(i);
    setOrdered(updated);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  function checkAnswer() {
    let isCorrectAnswer = false;

    if (isYesNo) {
      isCorrectAnswer = q.correctAnswers.every(entry => {
const parts = entry.trim().split(/\s+/);
const key = parts[0];
const value = parts[1];

return yesNoAnswers[key]?.trim() === value?.trim();
      });
    } else if (isNumeric) {
      isCorrectAnswer = isCorrectNumeric;
    } else {
      const correct = q.correctAnswers.sort().join(",");
      const user = [...selected].sort().join(",");
      isCorrectAnswer = correct === user;
    }

    if (isCorrectAnswer) setScore(s => s + 1);
    setChecked(true);
  }

  function next() {
    setSelected([]);
    setChecked(false);
    setOrdered([]);
    setYesNoAnswers({});
    setIndex(i => i + 1);
  }

  function previous() {
    if (index === 0) return;
    setSelected([]);
    setChecked(false);
    setOrdered([]);
    setYesNoAnswers({});
    setIndex(i => i - 1);
  }

  function goToQuestion(num: number) {
    if (num < 1 || num > questions.length) return;
    setIndex(num - 1);
    setSelected([]);
    setChecked(false);
    setOrdered([]);
    setYesNoAnswers({});
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
            {renderRichText(q.question, q.images ?? {})}
          </div>
        </div>

        {/* Answers */}
        <div className="mb-6">

          {/* 👉 YES / NO */}
          {isYesNo ? (
            <div className="space-y-3">
              {q.answers.map(a => {
                const selected = yesNoAnswers[a.key];
                const correctEntry = q.correctAnswers.find(c => c.startsWith(a.key));
                const correctValue = correctEntry?.split(" ")[1];

                let bg = "";
                if (checked) {
                  bg = selected === correctValue ? "bg-green-100" : "bg-red-100";
                }

                return (
                  <div key={a.key} className={`p-3 border rounded-lg ${bg}`}>
                    <div className="flex justify-between items-center">

                      <span>{a.key}.</span>

                      <div className="flex gap-4">
                        <label>
                          <input
                            type="radio"
                            name={a.key}
                            checked={selected === "Yes"}
                            onChange={() => setYesNo(a.key, "Yes")}
                          /> Yes
                        </label>

                        <label>
                          <input
                            type="radio"
                            name={a.key}
                            checked={selected === "No"}
                            onChange={() => setYesNo(a.key, "No")}
                          /> No
                        </label>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : isNumeric ? (
            // 👉 DEIN BESTEHENDER NUMERIC BLOCK (UNVERÄNDERT)
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {q.answers.map(a => (
                  <div key={a.key} onClick={() => addToOrder(a.key)} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100">
                    <span className="font-semibold">{a.key}.</span> {a.text}
                  </div>
                ))}
              </div>

              <div>
                <div className={`space-y-2 border rounded-lg p-3 min-h-[150px] ${
                  checked
                    ? isCorrectNumeric
                      ? "bg-green-100 border-green-500"
                      : "bg-red-100 border-red-500"
                    : "bg-gray-50"
                }`}>
{/* Correct Order */}
{checked && !isCorrectNumeric && (
  <div className="mt-3 border rounded-lg p-3 bg-green-50">
    <div className="font-semibold mb-2">Correct Order:</div>

    {correctOrder.map((key, i) => {
      const item = q.answers.find(a => a.key === key);

      return (
        <div key={i} className="p-2 border rounded bg-green-100 mb-1">
          <span className="font-semibold">{key}.</span> {item?.text}
        </div>
      );
    })}
  </div>
)}


                  {ordered.map((key, i) => {
                    const item = q.answers.find(a => a.key === key);

                    return (
                      <div key={key} draggable onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => { e.preventDefault(); handleDragOver(i); }}
                        onDragEnd={handleDragEnd}
                        onClick={() => removeFromOrder(key)}
                        className="p-2 border rounded bg-white cursor-move">
                        <span className="font-semibold">{key}.</span> {item?.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // 👉 MC bleibt gleich
            q.answers.map(a => {
              const isSelected = selected.includes(a.key);
              const isCorrect = q.correctAnswers.includes(a.key);

              let state = "border-gray-300";

              if (!checked && isSelected) state = "bg-blue-100 border-blue-400";
              if (checked) {
                if (isCorrect) state = "bg-green-100 border-green-500";
                else if (isSelected) state = "bg-red-100 border-red-500";
              }

              return (
                <div key={a.key} className={`p-3 border rounded-lg cursor-pointer ${state}`} onClick={() => toggleAnswer(a.key)}>
                  <span className="font-semibold text-black">{a.key}.</span> {a.text}
                </div>
              );
            })
          )}
        </div>

        {!checked && (
          <button onClick={checkAnswer} className="w-full bg-blue-600 text-white py-2 rounded-lg">
            Check
          </button>
        )}

        {checked && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <p className="font-semibold mb-2">Explanation</p>
            {renderRichText(q.explanation, q.images ?? {})}
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

    <div className="text-right text-gray-600">
      Score: {score} / {questions.length}
    </div>

  </div>
)}


      </div>
    </div>
  );
}