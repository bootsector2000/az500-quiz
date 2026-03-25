"use client";

import { SavedState, deleteState } from "@/lib/storage";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { useEffect, useState } from "react";

type Props = {
  saves: SavedState[];
  onNew: () => void;
  onLoad: (s: SavedState) => void;
  onDelete: () => void;
};

export default function Menu({
    
  saves,
  onNew,
  onLoad,
  onDelete,
}: Props) {
    const [total, setTotal] = useState(0);
  useEffect(() => {
    fetchQuestions().then(q => setTotal(q.length));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96 space-y-4 text-black">

        <h2 className="text-xl font-semibold text-center">
          AZ-500 Quiz
        </h2>

        <button
          onClick={onNew}
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          Neuer Versuch
        </button>

        {saves.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="font-semibold">Gespeicherte Tests:</div>

            {saves.map((s) => (
              <div
                key={s.id}
                className="border p-2 rounded flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    Score: {s.score} / {total}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onLoad(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Laden
                  </button>

                  <button
                    onClick={() => {
                      if (!confirm("Delete save?")) return;
                      deleteState(s.id);
                      onDelete();
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}