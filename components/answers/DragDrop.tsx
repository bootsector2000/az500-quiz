"use client";

import { Question } from "@/lib/parseCsv";
import { renderRichText } from "@/lib/renderRichText";
import { useState } from "react";

type Props = {
  q: Question;
  checked: boolean;
  ordered: string[];
  setOrdered: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function DragDrop({
  q,
  checked,
  ordered,
  setOrdered,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const correctOrder = q.correctAnswers.map(x => x.trim());
  const normalizedOrdered = ordered.map(x => x.trim());

  const isCorrect =
    normalizedOrdered.length === correctOrder.length &&
    normalizedOrdered.every((val, i) => val === correctOrder[i]);

  function addToOrder(key: string) {
      setOrdered(prev => [...prev, key]);
  }

  function removeFromOrder(index: number) {
    setOrdered(prev => prev.filter((_, i) => i !== index));
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

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* LEFT */}
      <div className="space-y-2">
        {q.answers.map(a => (
          <div
            key={a.key}
            onClick={() => addToOrder(a.key)}
            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100"
          >
<span className="font-semibold">{a.key}.</span>{" "}
<span className="whitespace-pre-line [&>*]:inline [&>*]:m-0">
  {renderRichText(a.text, q.images)}
</span>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div>
        <div
          className={`space-y-2 border rounded-lg p-3 min-h-[150px] ${
            checked
              ? isCorrect
                ? "bg-green-100 border-green-500"
                : "bg-red-100 border-red-500"
              : "bg-gray-50"
          }`}
        >
          {ordered.map((key, i) => {
            const item = q.answers.find(a => a.key === key);

            return (
              <div
                key={`${key}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(i);
                }}
                onDragEnd={handleDragEnd}
                onClick={() => removeFromOrder(i)}
                className="p-2 border rounded bg-white cursor-move"
              >
                <span className="font-semibold">{key}.</span>{" "}
<span className="whitespace-pre-line [&>*]:inline [&>*]:m-0">
  {renderRichText(item?.text || "", q.images)}
</span>
              </div>
            );
          })}
        </div>

        {checked && !isCorrect && (
          <div className="mt-3 border rounded-lg p-3 bg-green-50">
            <div className="font-semibold mb-2">Correct Order:</div>
            {correctOrder.map((key, i) => {
              const item = q.answers.find(a => a.key === key);
              return (
                <div key={i} className="p-2 border rounded bg-green-100 mb-1">
                  <span className="font-semibold">{key}.</span>{" "}
<span className="whitespace-pre-line [&>*]:inline [&>*]:m-0">
  {renderRichText(item?.text || "", q.images)}
</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}