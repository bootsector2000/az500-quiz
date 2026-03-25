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

        let boxState = "";

        if (checked) {
          boxState =
            selected === correct
              ? "bg-green-100 border-green-500"
              : "bg-red-100 border-red-500";
        }

        return (
          <div key={box.id} className={`p-3 border rounded-lg ${boxState}`}>
            <div className="font-semibold mb-2">{box.id.toUpperCase()}</div>

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
        );
      })}
    </div>
  );
}