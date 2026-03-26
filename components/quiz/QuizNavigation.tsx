type Props = {
  index: number;
  total: number;
  score: number;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
};

export default function QuizNavigation({
  index,
  total,
  score,
  onNext,
  onPrevious,
  onSave,
}: Props) {
  const isLast = index === total - 1;

  const percent = total
    ? Math.round((score / total) * 100)
    : 0;

  return (
    <div className="mt-6 flex flex-col gap-3">

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={index === 0}
          className="bg-gray-300 px-4 py-2 rounded-lg"
        >
          Previous
        </button>

        {!isLast && (
          <button
            onClick={onNext}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Next
          </button>
        )}
      </div>

      <button
        onClick={onSave}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Save & Exit
      </button>

      <div className="text-right text-gray-600">
        Score: {score} / {total} ({percent}%)
      </div>
    </div>
  );
}