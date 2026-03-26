type Props = {
  index: number;
  total: number;
};

export default function QuizHeader({ index, total }: Props) {
  return (
    <h2 className="text-xl font-semibold mb-4">
      Question {index + 1} / {total}
    </h2>
  );
}