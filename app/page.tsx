"use client";

import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { Question } from "@/lib/parseCsv";

function renderRichText(
  text: string,
  images: Record<string, string>
) {
  if (!text) return null;

  const parts = text.split(/(<img\d+>|https?:\/\/[^\s]+)/g);
  console.log("TEXT:", text);
  console.log("IMAGES:", images);
  console.log("PARTS:", parts);


  return (
    <div className="text-black">
      {parts.map((part, index) => {
        // 👉 IMAGE
        const imgMatch = part.trim().match(/<img(\d+)>/i);
        if (imgMatch) {
          console.log("IMG MATCH:", part, "->", imgMatch[1]);
        }
        if (imgMatch) {
          const key = `img${imgMatch[1]}`;
          const src = images[key]?.trim();
          console.log("IMG KEY:", key, "SRC:", src);

          if (!src) return null;

          return (
            <div key={index} className="my-4">
              <img
                src={src}
                alt={key}
                className="w-full rounded-lg border"
              />
            </div>
          );
        }

        // 👉 LINK
        if (part.match(/^https?:\/\//)) {
          return (
            <div key={index} className="mt-3">
              <a
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {part}
              </a>
            </div>
          );
        }

        // 👉 TEXT
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}

function renderExplanation(text: string) {
  if (!text) return null;

  // Regex für alle URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(urlRegex);

  return (
    <div className="text-black">
      {parts.map((part, index) => {
        // Wenn Teil ein Link ist
        if (part.match(urlRegex)) {
          return (
            <div key={index} className="mt-3">
              <a
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {part}
              </a>
            </div>
          );
        }

        // Normaler Text
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
  const isMultiple = q.correctAnswers.length > 1;

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

  function checkAnswer() {
    const correct = q.correctAnswers.sort().join(",");
    const user = [...selected].sort().join(",");

    if (correct === user) {
      setScore(s => s + 1);
    }

    setChecked(true);
  }

  function next() {
    setSelected([]);
    setChecked(false);
    setIndex(i => i + 1);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-black">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">
        
        {/* a) Question */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Question {index + 1} / {questions.length}
          </h2>
          <p className="mt-2 text-lg text-black">{q.question}</p>
        </div>

        {/* b) Answers */}
        <div className="mb-6 space-y-2">
          {q.answers.map(a => {
            const isSelected = selected.includes(a.key);
            const isCorrect = q.correctAnswers.includes(a.key);

            let base =
              "p-3 border rounded-lg cursor-pointer transition";

            let state = "border-gray-300";

            if (!checked && isSelected) {
              state = "bg-blue-100 border-blue-400";
            }

            if (checked) {
              if (isCorrect) {
                state = "bg-green-100 border-green-500";
              } else if (isSelected) {
                state = "bg-red-100 border-red-500";
              }
            }

            return (
              <div
                key={a.key}
                className={`${base} ${state}`}
                onClick={() => toggleAnswer(a.key)}
              >
                <span className="font-semibold text-black">{a.key}.</span>{" "}
                <span className="text-black">{a.text}</span>
              </div>
            );
          })}
        </div>

        {/* c) Check */}
        {!checked && (
          <button
            onClick={checkAnswer}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Check
          </button>
        )}

        {/* d) Explanation */}
        {checked && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <p className="font-semibold mb-2">Explanation</p>
            {renderRichText(q.explanation, q.images ?? {})}
          </div>
        )}

        {/* e) Next + Score */}
        {checked && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={next}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
            >
              Next
            </button>

            <span className="text-gray-600 font-medium">
              Score: {score} / {questions.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
