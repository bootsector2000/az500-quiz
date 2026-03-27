"use client";

import { Question } from "@/lib/parseCsv";

type Props = {
  q: Question;
  checked: boolean;
  multiAnswers: Record<string, string>;
  setMultiAnswer: (box: string, value: string) => void;
};

export default function MultiBox({
  q,
  checked,
  multiAnswers,
  setMultiAnswer,
}: Props) {
  return (
    <div className="space-y-4">
      {q.multiBoxes?.map(box => {
        const correct = q.multiCorrect?.[box.id];
        const selected = multiAnswers[box.id];

        const isCorrect = selected === correct;

        let boxState = "";

        if (checked) {
          boxState = isCorrect
            ? "bg-green-100 border-green-500"
            : "bg-red-100 border-red-500";
        }

        return (
          <div key={box.id} className="grid grid-cols-2 gap-4">

            {/* 🔹 LEFT: User Answer */}
            <div className={`p-3 border rounded-lg ${boxState}`}>
              <div className="font-semibold mb-2">
                {box.id.toUpperCase()}
              </div>

              {box.answers.map(a => (
                <label key={a.key} className="block">
                  <input
                    type="radio"
                    name={box.id}
                    checked={selected === a.key}
                    onChange={() => setMultiAnswer(box.id, a.key)}
                  />{" "}
                  {a.key}. {a.text}
                </label>
              ))}
            </div>

            {/* 🔹 RIGHT: Correct Answer (only if wrong) */}
            {checked && !isCorrect && (
              <div className="p-3 border rounded-lg bg-yellow-100 border-yellow-500">
                <div className="font-semibold mb-2">
                  Correct ({box.id.toUpperCase()})
                </div>

                {box.answers.map(a => (
                  <div
                    key={a.key}
                    className={`p-1 ${
                      a.key === correct
                        ? "font-bold"
                        : "opacity-50"
                    }`}
                  >
                    {a.key}. {a.text}
                  </div>
                ))}
              </div>
            )}

            {/* 🔹 Spacer wenn korrekt (damit Layout stabil bleibt) */}
            {checked && isCorrect && <div />}
          </div>
        );
      })}
    </div>
  );
}