import { Question } from "@/lib/parseCsv";

type Props = {
  q: Question;
  yesNoAnswers: Record<string, string>;
  setYesNo: (key: string, value: "Yes" | "No") => void;
  checked: boolean;
};

type YesNoPair = {
  key: string;
  value: string;
};

export default function YesNo({
  q,
  yesNoAnswers,
  setYesNo,
  checked,
}: Props) {
  const parsedYesNo: YesNoPair[] = [];

  for (let i = 0; i < q.correctAnswers.length; i += 2) {
    parsedYesNo.push({
      key: String(q.correctAnswers[i]).trim(),
      value: String(q.correctAnswers[i + 1]).trim(),
    });
  }

  return (
    <div className="space-y-3">

      {q.answers.map(a => {
        const selected = yesNoAnswers[a.key];

        const match = parsedYesNo.find(x => x.key === String(a.key));
        const correctValue = match?.value;

        let bg = "";
        if (checked) {
          bg = selected === correctValue ? "bg-green-100" : "bg-red-100";
        }

        return (
          <div key={a.key} className={`p-3 border rounded-lg ${bg}`}>
            <div className="flex justify-between items-center">
              <span>{a.key}.</span>

              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    name={a.key}
                    checked={selected === "Yes"}
                    onChange={() => setYesNo(a.key, "Yes")}
                  />{" "}
                  Yes
                </label>

                <label>
                  <input
                    type="radio"
                    name={a.key}
                    checked={selected === "No"}
                    onChange={() => setYesNo(a.key, "No")}
                  />{" "}
                  No
                </label>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}