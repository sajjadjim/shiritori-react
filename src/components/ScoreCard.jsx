export function ScoreCard({ name, score, active }) {
  return (
    <div className={`flex-1 rounded-2xl md:p-4 p-3 shadow-sm border ${active ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'}`}>
      <div className="text-sm text-slate-500">{active ? 'Your turn' : 'Player'}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="md:text-xl text-lg font-semibold">{name}</div>
        {active && <span className="text-xs rounded-full px-2 py-0.5 bg-indigo-600 text-white">active</span>}
      </div>
      <div className="mt-2 md:text-3xl text-xl font-bold tabular-nums">{score}</div>
    </div>
  );
}
