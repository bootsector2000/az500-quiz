import { Question } from "@/lib/parseCsv";
import { renderRichText } from "@/lib/renderRichText";
import AnswerRenderer from "@/components/answers/AnswerRenderer";

type Props = {
  q: Question;

  checked: boolean;
  selected: string[];
  ordered: string[];
  yesNoAnswers: Record<string, string>;
  multiAnswers: Record<string, string>;
  marked: string[];

  toggleAnswer: (key: string) => void;
  setYesNo: (key: string, value: "Yes" | "No") => void;
  setOrdered: React.Dispatch<React.SetStateAction<string[]>>;
  setMultiAnswer: (box: string, value: string) => void;

  toggleMark: () => void;
  checkAnswer: () => void;
};

export default function QuestionCard({
  q,
  checked,
  selected,
  ordered,
  yesNoAnswers,
  multiAnswers,
  marked,
  toggleAnswer,
  setYesNo,
  setOrdered,
  setMultiAnswer,
  toggleMark,
  checkAnswer,
}: Props) {
  return (
    <>
      <div className="mb-4">
        {renderRichText(q.question, q.images)}
      </div>

      <AnswerRenderer
        q={q}
        selected={selected}
        toggleAnswer={toggleAnswer}
        checked={checked}
        yesNoAnswers={yesNoAnswers}
        setYesNo={setYesNo}
        ordered={ordered}
        setOrdered={setOrdered}
        multiAnswers={multiAnswers}
        setMultiAnswer={setMultiAnswer}
      />

      {!checked && (
        <>
          <label className="flex items-center gap-2 mt-4 text-sm">
            <input
              type="checkbox"
              checked={marked.includes(q.id)}
              onChange={toggleMark}
            />
            Mark question
          </label>

          <button
            onClick={checkAnswer}
            className="mt-2 w-full bg-blue-600 text-white p-2 rounded"
          >
            Check
          </button>
        </>
      )}

      {checked && (
        <>
          <div className="mt-4 p-3 border rounded bg-gray-50">
            {renderRichText(q.explanation, q.images)}
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={marked.includes(q.id)}
                onChange={toggleMark}
              />
              Mark question
            </label>
          </div>
        </>
      )}
    </>
  );
}