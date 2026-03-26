"use client";

import { SavedState, deleteState } from "@/lib/storage";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { useEffect, useState } from "react";

type Props = {
  saves: SavedState[];
  onNew: (skipSim: boolean, range: string) => void;
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
  const [skipSim, setSkipSim] = useState(false);
  const [simCount, setSimCount] = useState(0);
  const [range, setRange] = useState("1-");

  useEffect(() => {
    fetchQuestions().then(q => {
      setTotal(q.length);
      setRange(`1-${q.length}`); // 🔥 Default setzen

      const sims = q.filter(q =>
        q.question.trim().toUpperCase().startsWith("SIMULATION")
      );

      setSimCount(sims.length);
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96 space-y-4 text-black">

        <div className="text-center">
          <h2 className="text-xl font-semibold">
            AZ-500 Quiz
          </h2>

          <div className="text-sm text-gray-600">
            {total} Questions
          </div>
        </div>

        <button
          onClick={() => onNew(skipSim, range)}
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          Neuer Versuch
        </button>

        {/* 🔥 Select Questions */}
        <div className="flex flex-col gap-1 text-sm">
          <label>Select questions</label>
          <input
            type="text"
            value={range}
            onChange={e => setRange(e.target.value)}
            className="border p-2 rounded"
            placeholder="1-60"
          />
        </div>

        {/* Skip Simulation */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={skipSim}
              onChange={(e) => setSkipSim(e.target.checked)}
            />
            Skip Simulation ({simCount})
          </label>
        </div>

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
                  {s.range && (
                    <div className="text-xs text-gray-500">
                      Questions {s.range}
                    </div>
                  )}
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