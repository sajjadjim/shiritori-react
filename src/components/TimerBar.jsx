import React from 'react';

export function TimerBar({ timeLeft }) {
  const pct = Math.max(0, Math.min(100, (timeLeft / 15) * 100));

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between text-lg text-white font-semibold mb-2">
        <span>Time Left</span>
        <span className="font-mono">{timeLeft}s</span>
      </div>
      <div className="relative h-2 bg-gray-300 rounded-full overflow-hidden shadow-lg">
        <div
          className="absolute h-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 transition-all"
          style={{ width: `${pct}%`, transition: 'width 1s ease-in-out' }}
        />
      </div>
      <div className="mt-4 text-center text-4xl font-extrabold text-white">
        {timeLeft === 0 ? (
          <span className="text-read-400">Time's Up!</span>
        ) : (
          <span className="text-white">{timeLeft}</span>
        )}
      </div>
    </div>
  );
}
