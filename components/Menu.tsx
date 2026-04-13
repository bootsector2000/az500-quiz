"use client";

import { SavedState, deleteState } from "@/lib/storage";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { useEffect, useState } from "react";

type Props = {
  saves: SavedState[];
  onNew: (skipSim: boolean, range: string) => void;
  onLoad: (s: SavedState, mode: "all" | "review") => void;
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

  const [modeMap, setModeMap] = useState<Record<string, "all" | "review">>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetchQuestions().then(q => {
      setTotal(q.length);
      setRange(`1-${q.length}`);

      const sims = q.filter(q =>
        q.question.trim().toUpperCase().startsWith("SIMULATION")
      );

      setSimCount(sims.length);
      setLoading(false);
    });
  }, []);

  function getRangeCount(range?: string, total?: number) {
    if (!range) return total || 0;

    const parts = range.split("-").map(n => parseInt(n.trim(), 10));

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[1] - parts[0] + 1;
    }

    return total || 0;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <div className="text-gray-600">Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96 space-y-4 text-black">

        <div className="text-center">
          <h2 className="text-xl font-semibold">AZ-500 Quiz</h2>
          <div className="text-sm text-gray-600">{total} Questions</div>
        </div>

        <button
          onClick={() => onNew(skipSim, range)}
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          Neuer Versuch
        </button>

        {/* Range */}
        <div className="flex flex-col gap-1 text-sm">
          <label>Select questions</label>
          <input
            type="text"
            value={range}
            onChange={e => setRange(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* Skip Sim */}
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

            {saves.map((s) => {
              const max = s.questionIds?.length ?? getRangeCount(s.range, total);
              const percent = max ? Math.round((s.score / max) * 100) : 0;

              const results = s.results || {};
              const resultIds = Object.keys(results);
              const markedSet = new Set(s.marked || []);

              const isValid = (id: string) =>
                !s.questionIds || s.questionIds.includes(id);

              // WRONG
              let wrong = 0;
              for (const qid of resultIds) {
                if (results[qid] === "wrong" && isValid(qid)) {
                  wrong++;
                }
              }

              // UNANSWERED
              const validResultCount = resultIds.filter(isValid).length;
              const unanswered = max - validResultCount;

              // MARKED
              const marked = [...markedSet].filter(isValid).length;

              // 🔥 SKIPPED
              const baseTotal = getRangeCount(s.range, total);
              const skipped = s.questionIds
                ? Math.max(baseTotal - s.questionIds.length, 0)
                : 0;

              return (
                <div key={s.id} className="border p-2 rounded space-y-2">

                  <div>
                    <div className="text-sm font-medium">{s.name}</div>

                    {s.range && (
                      <div className="text-xs text-gray-500">
                        Questions {s.range}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>
                        Score: {s.score} / {max} ({percent}%)
                      </span>

                      <span className="relative group cursor-default">
                        m: {marked} | w: {wrong} | u: {unanswered} | s: {skipped}

                        <span className="absolute hidden group-hover:block bottom-full mb-1 right-0 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap leading-tight">
                          m: marked<br />
                          w: wrong<br />
                          u: unanswered<br />
                          s: skipped
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* MODE */}
                  <div className="flex gap-3 text-xs">
                    <label className="flex gap-1">
                      <input
                        type="radio"
                        name={`mode-${s.id}`}
                        checked={(modeMap[s.id] || "all") === "all"}
                        onChange={() =>
                          setModeMap(prev => ({ ...prev, [s.id]: "all" }))
                        }
                      />
                      All
                    </label>

                    <div className="relative group flex gap-1 items-center">
                      <label className="flex gap-1 items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`mode-${s.id}`}
                          checked={(modeMap[s.id] || "all") === "review"}
                          onChange={() =>
                            setModeMap(prev => ({ ...prev, [s.id]: "review" }))
                          }
                        />
                        Review
                      </label>

                      <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10">
                        <div className="bg-black text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                          load marked, wrong and unanswered questions only
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => onLoad(s, modeMap[s.id] || "all")}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}