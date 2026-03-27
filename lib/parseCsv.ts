import Papa from "papaparse";

type Answer = {
  key: string;
  text: string;
};

type MultiBox = {
  id: string;
  answers: Answer[];
};

export type QuestionType = "mc" | "drag" | "yesno" | "multibox";

export type Question = {
  id: string;
  question: string;
  answers: Answer[];
  correctAnswers: string[];
  explanation: string;
  type: QuestionType;
  images: Record<string, string>;

  multiBoxes?: MultiBox[];
  multiCorrect?: Record<string, string>;
};

/* ---------------- MULTIBOX ---------------- */

function parseMultiBoxAnswers(raw: string): MultiBox[] {
  if (!raw) return [];

  const lines = raw
    .replace(/\\n/g, "\n")
    .split("\n")
    .map(l => l.trim());

  const boxes: MultiBox[] = [];
  let currentBox: MultiBox | null = null;

  for (const line of lines) {
    if (!line) continue;

    const boxMatch = line.match(/^B(\d+):/i);
    if (boxMatch) {
      currentBox = {
        id: `b${boxMatch[1]}`,
        answers: [],
      };
      boxes.push(currentBox);
      continue;
    }

    if (currentBox) {
      const match = line.match(/^([a-z])\.\s*(.*)$/i);
      if (match) {
        currentBox.answers.push({
          key: match[1].toLowerCase(),
          text: match[2],
        });
      }
    }
  }

  return boxes;
}

function parseMultiBoxCorrect(raw: string): Record<string, string> {
  const map: Record<string, string> = {};

  if (!raw) return map;

  raw.split(/\s+/).forEach(part => {
    const [box, val] = part.split(":");
    if (box && val) {
      map[box.toLowerCase()] = val.toLowerCase();
    }
  });

  return map;
}

/* ---------------- NORMAL ---------------- */

function parseAnswers(raw: string): Answer[] {
  if (!raw) return [];

  const cleaned = raw.replace(/^"|"$/g, "");

  const lines = cleaned
    .replace(/\\n/g, "\n")
    .split(/\r?\n/);

  const answers: Answer[] = [];
  let current: Answer | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^([A-Z]|\d+)\.\s*(.*)$/);

    if (match) {
      // neue Antwort beginnt
      current = {
        key: match[1],
        text: match[2],
      };
      answers.push(current);
    } else if (current) {
      // continuation line → anhängen!
      current.text += "\n" + trimmed;
    }
  }

  return answers;
}

function parseCorrect(raw: string): string[] {
  if (!raw) return [];

  return raw
    .split(/[\s,;]+/)
    .map(x => x.trim())
    .filter(Boolean);
}

/* ---------------- MAIN ---------------- */

export function parseCsv(csv: string): Question[] {
  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return (parsed.data as any[])
    .map((row): Question | null => {
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

      const multiBoxes = parseMultiBoxAnswers(row["answers"]);

      // 🔥 WICHTIG: MultiBox zuerst!
      if (multiBoxes.length > 0) {
        return {
          id: row["question-id"],
          question: row["question"],
          answers: [],
          correctAnswers: [],
          explanation: row["explanation"],
          type: "multibox" as QuestionType,
          images,
          multiBoxes,
          multiCorrect: parseMultiBoxCorrect(row["correct answers"]),
        };
      }

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