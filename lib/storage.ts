export type SavedState = {
  id: string;
  name: string;
  date: string;

  index: number;
  score: number;

  selected: string[];
  ordered: string[];
  yesNoAnswers: Record<string, string>;
  multiAnswers: Record<string, string>;
  marked: string[];
};

const KEY = "quiz_saves";

/* ---------------- LOAD ALL ---------------- */

export function loadAllStates(): SavedState[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/* ---------------- SAVE NEW ---------------- */

export function saveState(state: Omit<SavedState, "id" | "date" | "name">) {
  const all = loadAllStates();

  const now = new Date();

  const newSave: SavedState = {
    ...state,
    id: crypto.randomUUID(),
    date: now.toISOString(),
    name: now.toLocaleString()
  };

  localStorage.setItem(KEY, JSON.stringify([newSave, ...all]));
}

/* ---------------- DELETE ---------------- */

export function deleteState(id: string) {
  const all = loadAllStates().filter(s => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}