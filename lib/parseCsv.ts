import Papa from "papaparse";

type Answer = {
  key: string;
  text: string;
};

export type QuestionType = "mc" | "drag" | "yesno";

export type Question = {
  id: string;
  question: string;
  answers: Answer[];
  correctAnswers: string[];
  explanation: string;
  type: QuestionType;
  images: Record<string, string>;
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
      const match = line.match(/^([A-Z]|\d+)\.\s*(.*)$/);
      if (!match) return null;

      return {
        key: match[1],
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
      if (row["question-images"] || row["explanation-images"]) {
        return null;
      }

      const images: Record<string, string> = {};

      Object.keys(row).forEach(key => {
        const cleanKey = key.trim();
        if (cleanKey.startsWith("img") && row[key]) {
          images[cleanKey] = row[key].trim();
        }
      });

      const answers = parseAnswers(row["answers"]);
      const correctAnswers = parseCorrect(row["correct answers"]);

      let type: QuestionType = "mc";

      if (answers.length > 0 && answers[0].text.includes("<radio YN>")) {
        type = "yesno";
      } else if (answers.every(a => /^\d+$/.test(a.key))) {
        type = "drag";
      }

      return {
        id: row["question-id"],
        question: row["question"],
        answers,
        correctAnswers,
        explanation: row["explanation"],
        type,
        images,
      };
    })
    .filter((q): q is Question => q !== null);
}