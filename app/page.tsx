"use client";

import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { Question } from "@/lib/parseCsv";

function renderExplanation(text: string) {
  if (!text) return null;

  // Split bei "Reference:" (case-insensitive)
  const match = text.match(/(.*?)(Reference:\s*)(https?:\/\/\S+)/i);

  if (!match) {
    return <p>{text}</p>;
  }

  const mainText = match[1].trim();
  const link = match[3].trim();

  return (
    <div>
      <p>{mainText}</p>

      <div style={{ marginTop: 10 }}>
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      </div>
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
      <div style={{ padding: 20 }}>
        <h2>Finished</h2>
        <p>
          Score: {score} / {questions.length}
        </p>
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
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      
      {/* a) Question */}
      <div style={{ marginBottom: 20 }}>
        <h2>
          Question {index + 1} / {questions.length}
        </h2>
        <p style={{ fontSize: 18 }}>{q.question}</p>
      </div>

      {/* b) Answers */}
      <div style={{ marginBottom: 20 }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {q.answers.map(a => {
            const isSelected = selected.includes(a.key);
            const isCorrect = q.correctAnswers.includes(a.key);

            let style: any = {
              padding: "10px",
              border: "1px solid #ccc",
              marginBottom: 8,
              cursor: "pointer",
            };

            if (!checked && isSelected) {
              style.background = "#ddd";
            }

            if (checked) {
              if (isCorrect) style.background = "lightgreen";
              else if (isSelected) style.background = "salmon";
            }

            return (
              <li
                key={a.key}
                style={style}
                onClick={() => toggleAnswer(a.key)}
              >
                <strong>{a.key}.</strong> {a.text}
              </li>
            );
          })}
        </ul>
      </div>

      {/* c) Check */}
      {!checked && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={checkAnswer}>Check</button>
        </div>
      )}

      {/* d) Explanation */}
      {checked && (
        <div style={{ marginBottom: 20 }}>
          <strong>Explanation:</strong>
          {renderExplanation(q.explanation)}
        </div>
      )}

      {/* e) Next + Score */}
      {checked && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={next}>Next</button>
          <span>
            Score: {score} / {questions.length}
          </span>
        </div>
      )}
    </div>
  );
}