import { parseCsv } from "./parseCsv";

export async function fetchQuestions() {
  const res = await fetch(process.env.NEXT_PUBLIC_CSV_URL!);
  const text = await res.text();
  return parseCsv(text);
}