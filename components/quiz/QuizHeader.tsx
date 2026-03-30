type Props = {
  index: number;
  total: number;
  questionId: string;
  score: number;
};

export default function QuizHeader({
  index,
  total,
  questionId,
  score,
}: Props) {
  const progress = total ? ((index + 1) / total) * 100 : 0;

  return (
    <div className="flex items-center justify-between mb-4">

      {/* LEFT */}
      <h2 className="text-xl font-semibold">
        Question {index + 1} / {total}{" "}
        <span className="text-sm font-normal text-gray-500">
          (PDF Q #{questionId})
        </span>
      </h2>

      {/* RIGHT */}
      <div className="flex items-center gap-3 w-64">

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Score */}
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {score} / {total} ({Math.round((score / total) * 100)}%)
        </span>
      </div>

    </div>
  );
}