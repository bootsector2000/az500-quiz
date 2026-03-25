import { Question } from "@/lib/parseCsv";
import MultipleChoice from "./MultipleChoice";
import YesNo from "./YesNo";
import DragDrop from "./DragDrop";

type Props = {
  q: Question;
  selected: string[];
  toggleAnswer: (key: string) => void;
  checked: boolean;

  yesNoAnswers: Record<string, string>;
  setYesNo: (key: string, value: "Yes" | "No") => void;

  // 👉 NEU
  ordered: string[];
  setOrdered: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function AnswerRenderer(props: Props) {
  const { q } = props;

  switch (q.type) {
    case "yesno":
      return <YesNo {...props} />;

    case "drag":
      return (
        <DragDrop
          q={q}
          checked={props.checked}
          ordered={props.ordered}
          setOrdered={props.setOrdered}
        />
      );

    default:
      return <MultipleChoice {...props} />;
  }
}