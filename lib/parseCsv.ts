import Papa from "papaparse";

type Answer = {
  key: string;
  text: string;
};

export type Question = {
  id: string;
  question: string;
  answers: Answer[];
  correctAnswers: string[];
  explanation: string;
};

function parseAnswers(raw: string): Answer[] {
  if (!raw) return [];

  return raw
    .split(/\n|\r\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^([A-Z])\.\s*(.*)$/);
      if (!match) return null;
      return { key: match[1], text: match[2] };
    })
    .filter(Boolean) as Answer[];
}

function parseCorrect(raw: string): string[] {
  if (!raw) return [];

  return raw
    .split(/[\s,;]+/)
    .map(x => x.trim())
    .filter(Boolean);
}

export function parseCsv(csv: string): Question[] {
  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return (parsed.data as any[])
    .map(row => {
      // 👉 Skip Bildfragen
      if (row["question-images"] || row["explanation-images"]) {
        return null;
      }

      return {
        id: row["question-id"],
        question: row["question"],
        answers: parseAnswers(row["answers"]),
        correctAnswers: parseCorrect(row["correct answers"]),
        explanation: row["explanation"],
      };
    })
    .filter(Boolean);
}