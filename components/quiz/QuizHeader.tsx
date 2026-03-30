type Props = {
  index: number;
  total: number;
  questionId: string;
};

export default function QuizHeader({ index, total, questionId }: Props) {
  return (
    <h2 className="text-xl font-semibold mb-4">
      Question {index + 1} / {total}{" "}
      <span className="text-sm font-normal text-gray-500">
        (PDF Q #{questionId})
      </span>
    </h2>
  );
}