import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export function History({ items }) {
  if (!items.length) {
    return <div className="text-white text-sm">No words yet — be the first!</div>;
  }

  return (
    <ol className="space-y-4 max-h-64 overflow-auto pr-1">
      {items.map((h, i) => (
        <li
          key={i}
          className={`rounded-xl border p-4 transition-all duration-300 ease-in-out transform  shadow-lg ${
            h.valid
              ? "bg-gradient-to-r from-green-200 to-green-100 border-emerald-300 hover:border-emerald-400"
              : "bg-gradient-to-r from-red-200 to-red-100 border-rose-300 hover:border-rose-400"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="font-semibold text-lg">{i + 1}. {h.word}</div>
              <span
                className={`ml-2 text-xs font-medium ${
                  h.valid ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {h.valid ? (
                  <FaCheckCircle className="inline-block mr-1 text-emerald-700" />
                ) : (
                  <FaTimesCircle className="inline-block mr-1 text-rose-700" />
                )}
                {h.valid ? "valid" : h.reason || "invalid"}
              </span>
            </div>
            <div className="text-xs text-slate-600">
              by P{h.by + 1} · {h.timeTaken}s
            </div>
          </div>
          {h.definition && (
            <p className="text-sm mt-1 text-slate-700 line-clamp-2">
              {h.definition}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
