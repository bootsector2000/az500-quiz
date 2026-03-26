export function renderRichText(text: string, images: Record<string, string>) {
  if (!text) return null;

  // 🔥 FIX: Entfernt Linebreak nach A. B. C. D.
  //const cleaned = text.replace(/([A-D])\.\s+(?=\S)/g, "$1. ");
  const cleaned = text;

  const parts = cleaned.split(/(<img\d+>|https?:\/\/[^\s]+)/g);

  return (
    <div className="text-black whitespace-pre-line">
      {parts.map((part, index) => {
        const imgMatch = part.trim().match(/<img(\d+)>/i);

        if (imgMatch) {
          const key = `img${imgMatch[1]}`;
          const src = images[key]?.trim();
          if (!src) return null;

          return (
            <div key={index} className="my-4">
              <img src={src} alt={key} className="w-full rounded-lg border" />
            </div>
          );
        }

        if (part.match(/^https?:\/\//)) {
          return (
            <div key={index} className="mt-3">
              <a
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {part}
              </a>
            </div>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}