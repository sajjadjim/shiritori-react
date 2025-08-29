import React, { useEffect, useState, useRef } from 'react';

// --- Configurable constants ---
const TURN_SECONDS = 15; // countdown per turn
const MIN_LEN = 4; // minimum letters per word
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

// --- Helpers ---
const randLetter = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
const lastAlpha = (w) => {
  const m = (w || '').toLowerCase().match(/[a-z](?=[^a-z]*$)/);
  return m ? m[0] : '';
};
const onlyLetters = (w) => (w || '').toLowerCase().replace(/[^a-z]/g, '');

// --- UI Subcomponents ---
function ScoreCard({ name, score, active }) {
  return (
    <div
      className={`flex-1 rounded-2xl p-4 shadow-sm border ${
        active ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'
      }`}
    >
      <div className="text-sm text-slate-500">{active ? 'Your turn' : 'Player'}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-xl font-semibold">{name}</div>
        {active && (
          <span className="text-xs rounded-full px-2 py-0.5 bg-indigo-600 text-white">
            active
          </span>
        )}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{score}</div>
    </div>
  );
}

function TimerBar({ timeLeft }) {
  const pct = Math.max(0, Math.min(100, (timeLeft / TURN_SECONDS) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>Time left</span>
        <span className="font-mono">{timeLeft}s</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function History({ items }) {
  if (!items.length)
    return <div className="text-slate-500 text-sm">No words yet — be the first!</div>;

  return (
    <ol className="space-y-2 max-h-64 overflow-auto pr-1">
      {items.map((h, i) => (
        <li
          key={i}
          className={`rounded-xl border p-3 ${
            h.valid ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
          }`}
        >
          <div className="flex justify-between">
            <div className="font-semibold">
              {i + 1}. {h.word}
              <span
                className={`ml-2 text-xs ${h.valid ? 'text-emerald-700' : 'text-rose-700'}`}
              >
                {h.valid ? 'valid' : h.reason || 'invalid'}
              </span>
            </div>
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

export default function App() {
  // Game state
  const [players, setPlayers] = useState([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
  ]);
  const [turn, setTurn] = useState(0); // index into players
  const [startLetter, setStartLetter] = useState(randLetter());
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const used = useRef(new Set()); // case-insensitive used words

  const requiredLetter = startLetter; // what next word must start with
  const lastWord = history.findLast?.((h) => h.valid) || [...history].reverse().find((h) => h.valid);

  // Countdown per turn
  useEffect(() => {
    setTimeLeft(TURN_SECONDS);
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  const switchTurn = () => setTurn((t) => (t === 0 ? 1 : 0));

  function newGame() {
    setPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })));
    setTurn(0);
    setStartLetter(randLetter());
    setInput('');
    setTimeLeft(TURN_SECONDS);
    setHistory([]);
    setMessage('');
    used.current = new Set();
  }

  function enforceStructure(raw) {
    const word = (raw || '').trim().toLowerCase();
    const letters = onlyLetters(word);

    if (letters.length < MIN_LEN) return { ok: false, reason: `min ${MIN_LEN} letters` };

    // First move must match startLetter; otherwise must match last valid letter
    const mustStartWith = lastWord ? lastAlpha(lastWord.word) : requiredLetter;
    if (letters[0] !== mustStartWith) return { ok: false, reason: `must start with '${mustStartWith}'` };

    if (used.current.has(letters)) return { ok: false, reason: 'already used' };

    return { ok: true, word: letters };
  }

  async function validateWithDictionary(word) {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );
      if (!res.ok) return { ok: false };
      const data = await res.json();
      // Basic validity: has at least one meaning + definition string
      const firstMeaning = data?.[0]?.meanings?.[0];
      const def = firstMeaning?.definitions?.[0]?.definition;
      if (def && typeof def === 'string' && def.length > 0) {
        return { ok: true, definition: def };
      }
      return { ok: false };
    } catch (e) {
      return { ok: false };
    }
  }

  async function submitWord(e) {
    e?.preventDefault?.();
    if (loading) return;
    const s = enforceStructure(input);
    const startedAt = Date.now();

    if (!s.ok) {
      applyResult({ valid: false, reason: s.reason, definition: '' }, startedAt, input);
      return;
    }

    setLoading(true);
    setMessage('Validating with dictionary…');
    const v = await validateWithDictionary(s.word);
    setLoading(false);

    if (!v.ok) {
      applyResult({ valid: false, reason: 'not in dictionary', definition: '' }, startedAt, s.word);
      return;
    }

    applyResult({ valid: true, reason: '', definition: v.definition }, startedAt, s.word);
  }

  function applyResult(result, startedAt, rawWord) {
    const timeTaken = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    const by = turn;

    setHistory((h) => [
      ...h,
      { word: onlyLetters(rawWord), valid: result.valid, reason: result.reason, by, timeTaken, definition: result.definition },
    ]);

    setPlayers((ps) => {
      const next = ps.map((p) => ({ ...p }));
      next[by].score += result.valid ? 1 : -1; // +1 for valid, -1 for invalid
      return next;
    });

    if (result.valid) {
      used.current.add(onlyLetters(rawWord));
      setStartLetter(lastAlpha(rawWord));
      setMessage('Nice! +1 point.');
    } else {
      setMessage(`Oops (${result.reason}). -1 point.`);
    }

    setInput('');
    switchTurn();
  }

  function handleTimeout() {
    setHistory((h) => [
      ...h,
      { word: '⏰ timeout', valid: false, reason: 'timeout', by: turn, timeTaken: TURN_SECONDS, definition: '' },
    ]);
    setPlayers((ps) => {
      const next = ps.map((p) => ({ ...p }));
      next[turn].score -= 1; // -1 on timeout
      return next;
    });
    setMessage("Time's up! -1 point.");
    switchTurn();
  }

  const onRandomizeLetter = () => {
    // Only allowed if no valid words yet (to avoid breaking a chain)
    if (!lastWord) setStartLetter(randLetter());
  };

  const turnPlayer = players[turn];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Shiritori — 2‑Player (React)</h1>
          <div className="flex gap-2">
            <button
              onClick={newGame}
              className="px-3 py-2 rounded-xl bg-slate-900  text-white text-sm hover:bg-slate-800"
            >
              New Game
            </button>
            <button
              onClick={onRandomizeLetter}
              className="px-3 py-2 rounded-xl bg-white border text-sm hover:bg-slate-100"
              title="Allowed before the first valid word"
            >
              Randomize start letter
            </button>
          </div>
        </header>

        {/* Scoreboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScoreCard name={players[0].name} score={players[0].score} active={turn === 0} />
          <ScoreCard name={players[1].name} score={players[1].score} active={turn === 1} />
        </div>

        {/* Requirements row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="rounded-2xl p-4 bg-white border border-slate-200 space-y-3">
            <div className="text-xs text-slate-600">Required starting letter</div>
            <div className="text-5xl font-extrabold tracking-wider select-none">{requiredLetter}</div>
            <TimerBar timeLeft={timeLeft} />
          </div>

          <form
            onSubmit={submitWord}
            className="md:col-span-2 rounded-2xl p-4 bg-white border border-slate-200"
          >
            <div className="text-sm text-slate-600">
              Turn: <span className="font-semibold">{turnPlayer.name}</span> — Enter a word that starts with '{lastWord ? lastAlpha(lastWord.word) : requiredLetter}' (min {MIN_LEN} letters)
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="type your word…"
                disabled={loading}
                autoFocus
              />
              <button
                className="rounded-xl px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                disabled={loading || !input.trim()}
                type="submit"
              >
                {loading ? 'Checking…' : 'Submit'}
              </button>
            </div>
            {message && <div className="mt-2 text-sm text-slate-700">{message}</div>}
            <p className="mt-2 text-xs text-slate-500">
              Uses Free Dictionary API to validate meaning. Network hiccups may mark a real word invalid — try again.
            </p>
          </form>
        </div>

        {/* History */}
        <section className="rounded-2xl p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Word history</h2>
            <div className="text-xs text-slate-600">No repeats allowed</div>
          </div>
          <History items={history} />
        </section>

        {/* Rules */}
        <section className="rounded-2xl p-4 bg-white border border-slate-200 text-sm text-slate-700">
          <details>
            <summary className="cursor-pointer font-semibold">Rules & Scoring</summary>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Two players share the same screen and take turns.</li>
              <li>
                Word must start with the last letter of the previous valid word (first turn uses the shown start letter).
              </li>
              <li>Word must have at least {MIN_LEN} letters and not be previously used.</li>
              <li>
                We validate with{' '}
                <a className="text-indigo-600 underline" href="https://dictionaryapi.dev" target="_blank" rel="noreferrer">
                  Free Dictionary API
                </a>
                . If not found, the play is invalid.
              </li>
              <li>
                <span className="font-semibold">Scoring:</span> +1 for a valid word, −1 for an invalid word or a timeout.
              </li>
              <li>
                <span className="font-semibold">Timer:</span> {TURN_SECONDS}s per turn. Timeout auto‑switches turn and applies −1.
              </li>
            </ul>
          </details>
        </section>

        <footer className="text-xs text-slate-500 pb-8">
          Built with React + Tailwind. No external state libraries. All logic in one file for ease of review.
        </footer>
      </div>
    </div>
  );
}
