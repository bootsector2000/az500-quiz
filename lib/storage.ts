export type SavedState = {
  index: number;
  score: number;
  selected: string[];
  ordered: string[];
  yesNoAnswers: Record<string, string>;
  multiAnswers: Record<string, string>;
  marked: string[]; // question ids
};

const KEY = "quiz_state";

export function saveState(state: SavedState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadState(): SavedState | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}