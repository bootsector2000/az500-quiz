import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/fetchQuestions";
import { Question } from "@/lib/parseCsv";

type Params = {
  range?: string;
  skipSim?: boolean;
  reviewMode?: "all" | "review";
  initialState?: any;
};

export function useQuestionLoader({
  range,
  skipSim,
  reviewMode,
  initialState,
}: Params) {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchQuestions().then(allQuestions => {

      // 🔥 PATH 1: LOAD FROM SAVE (deterministic)
      if (initialState?.questionIds) {
        const idSet = new Set(initialState.questionIds);

        let q = allQuestions.filter(q => idSet.has(q.id));

        // 🔥 REVIEW MODE auf gespeichertes Set anwenden
        if (reviewMode === "review") {
          const results = initialState.results || {};
          const marked = new Set(initialState.marked || []);

          q = q.filter(question => {
            const result = results[question.id];
            const isWrong = result === "wrong";
            const isUnanswered = !result;
            const isMarked = marked.has(question.id);

            return isWrong || isUnanswered || isMarked;
          });
        }

        setQuestions(q);
        return;
      }

      // 🔥 PATH 2: NORMAL FLOW (unverändert)
      let q = [...allQuestions];

      // RANGE
      if (range) {
        const parts = range.split("-").map(n => parseInt(n.trim(), 10));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const start = Math.max(parts[0], 1);
          const end = Math.min(parts[1], q.length);
          q = q.slice(start - 1, end);
        }
      }

      // SKIP SIM
      if (skipSim) {
        q = q.filter(q =>
          !q.question.trim().toUpperCase().startsWith("SIMULATION")
        );
      }

      // REVIEW MODE (nur für neuen Run relevant)
      if (reviewMode === "review" && initialState) {
        const results = initialState.results || {};
        const marked = new Set(initialState.marked || []);

        q = q.filter(question => {
          const result = results[question.id];
          const isWrong = result === "wrong";
          const isUnanswered = !result;
          const isMarked = marked.has(question.id);
          return isWrong || isUnanswered || isMarked;
        });
      }

      setQuestions(q);
    });
  }, [range, skipSim, reviewMode, initialState]);

  return questions;
}