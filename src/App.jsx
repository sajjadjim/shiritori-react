import React, { useState, useEffect, useRef } from 'react';
import { WordValidation } from './components/WordValidation';
import { WordHistory } from './components/WordHistory';
import { ScoreCard } from './components/ScoreCard';
import { TimerBar } from './components/TimerBar';
import axios from 'axios';

// --- Configurable constants ---
const TURN_SECONDS = 15; // countdown per turn
const MIN_LEN = 4; // minimum letters per word
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

const randLetter = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
const onlyLetters = (w) => (w || '').toLowerCase().replace(/[^a-z]/g, '');

export default function App() {
  // Game state
  const [players, setPlayers] = useState([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
  ]);
  const [turn, setTurn] = useState(0);
  const [startLetter, setStartLetter] = useState(randLetter());
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const used = useRef(new Set());
  const [wordDetails, setWordDetails] = useState(null); // To store the word details from API

  const requiredLetter = startLetter;

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
  }, [turn]);

  const switchTurn = () => setTurn((t) => (t === 0 ? 1 : 0));

  function enforceStructure(raw) {
    const word = (raw || '').trim().toLowerCase();
    const letters = onlyLetters(word);

    if (letters.length < MIN_LEN) return { ok: false, reason: `min ${MIN_LEN} letters` };
    if (used.current.has(letters)) return { ok: false, reason: 'already used' };
    return { ok: true, word: letters };
  }

  async function validateWithDictionary(word) {
    try {
      const res = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );
      if (res.status !== 200) return { ok: false };
      const data = res.data[0];
      const meaning = data.meanings[0].definitions[0].definition;
      const phonetic = data.phonetic || 'N/A';
      const origin = data.origin || 'N/A';

      return { ok: true, definition: meaning, phonetic, origin };
    } catch (error) {
      console.error('Error fetching dictionary data:', error);
      return { ok: false };
    }
  }

  async function submitWord(e) {
    e.preventDefault();
    const s = enforceStructure(input);
    if (!s.ok) {
      setMessage(`Invalid word: ${s.reason}`);
      return;
    }

    const v = await validateWithDictionary(s.word);
    if (!v.ok) {
      setMessage('Word not found in dictionary!');
      return;
    }

    setWordDetails({
      definition: v.definition,
      phonetic: v.phonetic,
      origin: v.origin,
    });
    applyResult({ valid: true, reason: '', definition: v.definition });
  }

  function applyResult(result) {
    setHistory((h) => [...h, { word: input, valid: result.valid, definition: result.definition }]);
    setPlayers((ps) => {
      const next = [...ps];
      next[turn].score += result.valid ? 1 : -1;
      return next;
    });
    setInput('');
    switchTurn();
  }

  function handleTimeout() {
    setMessage("Time's up! -1 point.");
    switchTurn();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Shiritori — 2‑Player (React)</h1>
        </header>

        {/* Scoreboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScoreCard name={players[0].name} score={players[0].score} active={turn === 0} />
          <ScoreCard name={players[1].name} score={players[1].score} active={turn === 1} />
        </div>

        {/* Word Submission */}
        <div className="mt-4">
          <form onSubmit={submitWord}>
            <input
              className="border rounded p-2"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter a word starting with ${requiredLetter}`}
            />
            <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded">
              Submit
            </button>
          </form>
          {message && <div className="mt-2 text-red-500">{message}</div>}
        </div>

        {/* Timer */}
        <TimerBar timeLeft={timeLeft} />

        {/* Word History */}
        <WordHistory items={history} />

        {/* Word Details (from dictionary API) */}
        {wordDetails && <WordValidation wordDetails={wordDetails} />}
      </div>
    </div>
  );
}
