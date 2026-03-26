import { Question } from "@/lib/parseCsv";
import { renderRichText } from "@/lib/renderRichText";

type Props = {
  q: Question;
  selected: string[];
  toggleAnswer: (key: string) => void;
  checked: boolean;
};

export default function MultipleChoice({
  q,
  selected,
  toggleAnswer,
  checked,
}: Props) {
  return (
    <>
      {q.answers.map(a => {
        const isSelected = selected.includes(a.key);
        const isCorrect = q.correctAnswers.includes(a.key);

        let state = "border-gray-300";

        if (!checked && isSelected) {
          state = "bg-blue-100 border-blue-400";
        }

        if (checked) {
          if (isCorrect) state = "bg-green-100 border-green-500";
          else if (isSelected) state = "bg-red-100 border-red-500";
        }

        return (
          <div
            key={a.key}
            className={`p-3 border rounded-lg cursor-pointer ${state}`}
            onClick={() => toggleAnswer(a.key)}
          >
            {renderRichText(`${a.key}. ${a.text}`, q.images ?? {})}
          </div>
        );
      })}
    </>
  );
}