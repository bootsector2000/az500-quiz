import { Question } from "@/lib/parseCsv";
import MultipleChoice from "./MultipleChoice";
import YesNo from "./YesNo";
import DragDrop from "./DragDrop";
import MultiBox from "./MultiBox";

type Props = {
  q: Question;
  selected: string[];
  toggleAnswer: (key: string) => void;
  checked: boolean;
  yesNoAnswers: Record<string, string>;
  setYesNo: (key: string, value: "Yes" | "No") => void;
  ordered: string[];
  setOrdered: React.Dispatch<React.SetStateAction<string[]>>;
  multiAnswers: Record<string, string>;
  setMultiAnswer: (box: string, value: string) => void;
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
    case "multibox":
      return (
        <MultiBox
          q={q}
          checked={props.checked}
          multiAnswers={props.multiAnswers}
          setMultiAnswer={props.setMultiAnswer}
        />
  );

    default:
      return <MultipleChoice {...props} />;
  }
}