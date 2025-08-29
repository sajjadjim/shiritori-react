import { TURN_SECONDS } from './constants'; // Import constants

export function TimerBar({ timeLeft }) {
  const pct = Math.max(0, Math.min(100, (timeLeft / TURN_SECONDS) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>Time left</span>
        <span className="font-mono">{timeLeft}s</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
