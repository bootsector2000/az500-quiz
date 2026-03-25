import { Question } from "@/lib/parseCsv";
import MultipleChoice from "./MultipleChoice";
import YesNo from "./YesNo";

type Props = {
  q: Question;
  selected: string[];
  toggleAnswer: (key: string) => void;
  checked: boolean;

  yesNoAnswers: Record<string, string>;
  setYesNo: (key: string, value: "Yes" | "No") => void;
};

export default function AnswerRenderer(props: Props) {
  const { q } = props;

  const isYesNo = q.answers.every(a =>
    a.text.includes("<radio YN>")
  );

  if (isYesNo) {
    return <YesNo {...props} />;
  }

  return <MultipleChoice {...props} />;
}