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
  images?: Record<string, string>; // 👈 NEU
};

function parseAnswers(raw: string): Answer[] {
  if (!raw) return [];

  const cleaned = raw.replace(/^"|"$/g, "");

  const lines = cleaned
    .replace(/\\n/g, "\n")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return lines
    .map(line => {
      // 👇 NEU: akzeptiert A. oder 1.
      const match = line.match(/^([A-Z]|\d+)\.\s*(.*)$/);
      if (!match) return null;

      return {
        key: match[1],   // kann jetzt "A" oder "1" sein
        text: match[2].trim(),
      };
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
      // 👉 Skip alte Bildfelder (lassen wir drin)
      if (row["question-images"] || row["explanation-images"]) {
        return null;
      }

      // 👉 Dynamisch alle imgX Felder einsammeln
      const images: Record<string, string> = {};

        Object.keys(row).forEach(key => {
        const cleanKey = key.trim();

        if (cleanKey.startsWith("img") && row[key]) {
            images[cleanKey] = row[key].trim();
        }
        });

      return {
        id: row["question-id"],
        question: row["question"],
        answers: parseAnswers(row["answers"]),
        correctAnswers: parseCorrect(row["correct answers"]),
        explanation: row["explanation"],
        images, // 👈 NEU
      };
    })
    .filter(Boolean);
}