export function History({ items }) {
  if (!items.length) return <div className="text-slate-500 text-sm">No words yet — be the first!</div>;
  return (
    <ol className="space-y-2 max-h-64 overflow-auto pr-1">
      {items.map((h, i) => (
        <li key={i} className={`rounded-xl border p-3 ${h.valid ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
          <div className="flex justify-between">
            <div className="font-semibold">{i + 1}. {h.word} <span className={`ml-2 text-xs ${h.valid ? "text-emerald-700" : "text-rose-700"}`}>{h.valid ? "valid" : h.reason || "invalid"}</span></div>
            <div className="text-xs text-slate-600">by P{h.by + 1} · {h.timeTaken}s</div>
          </div>
          {h.definition && (
            <p className="text-sm mt-1 text-slate-700 line-clamp-2">{h.definition}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
