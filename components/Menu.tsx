"use client";

type Props = {
  onNew: () => void;
  onResume: () => void;
  hasSave: boolean;
};

export default function Menu({ onNew, onResume, hasSave }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 space-y-4">

        <h2 className="text-xl font-semibold text-center">
          AZ-500 Quiz
        </h2>

        <button
          onClick={onNew}
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          Neuer Versuch
        </button>

        {hasSave && (
          <button
            onClick={onResume}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Gespeicherten laden
          </button>
        )}

      </div>
    </div>
  );
}