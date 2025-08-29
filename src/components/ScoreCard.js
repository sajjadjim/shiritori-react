export function ScoreCard({ name, score, active }) {
  return (
    <div className={`flex-1 p-4 shadow-sm border ${active ? 'bg-indigo-50' : 'bg-white'}`}>
      <div>{active ? 'Your turn' : 'Player'}</div>
      <div className="text-xl font-semibold">{name}</div>
      <div className="text-3xl font-bold">{score}</div>
    </div>
  );
}
