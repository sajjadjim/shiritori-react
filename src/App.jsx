import React, { useEffect, useState, useRef } from "react";
import { TURN_SECONDS, MIN_LEN, ALPHABET } from './components/constants'; // Import constants
import { ScoreCard } from "./components/ScoreCard";
import { TimerBar } from "./components/TimerBar";
import { History } from "./components/History";
import { WordValidation } from "./components/WordValidation";
import { FaPlay, FaRedoAlt, FaEdit } from 'react-icons/fa';  // Importing React Icons

// --- Helpers ---
const randLetter = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
const lastAlpha = (w) => {
  const m = (w || "").toLowerCase().match(/[a-z](?=[^a-z]*$)/);
  return m ? m[0] : "";
};
const onlyLetters = (w) => (w || "").toLowerCase().replace(/[^a-z]/g, "");

export default function App() {
  const [players, setPlayers] = useState([
    
    { name: "Player 1", score: 0 },
    { name: "Player 2", score: 0 },
  ]);
  const [turn, setTurn] = useState(0); // index into players
  const [startLetter, setStartLetter] = useState(randLetter()); // The letter the first word starts with
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null); // Track which player is editing their name
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
  const used = useRef(new Set()); // case-insensitive used words

  const requiredLetter = startLetter;
  const lastWord = history.findLast?.((h) => h.valid) || [...history].reverse().find((h) => h.valid);

  // Countdown per turn
  useEffect(() => {
    if (!gameStarted) return;
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
  }, [turn, gameStarted]);

  const switchTurn = () => setTurn((t) => (t === 0 ? 1 : 0));

  function enforceStructure(raw) {
    const word = (raw || "").trim().toLowerCase();
    const letters = onlyLetters(word);
    if (letters.length < MIN_LEN) return { ok: false, reason: `min ${MIN_LEN} letters` };
    const mustStartWith = lastWord ? lastAlpha(lastWord.word) : requiredLetter;
    if (letters[0] !== mustStartWith) return { ok: false, reason: `must start with '${mustStartWith}'` };
    if (used.current.has(letters)) return { ok: false, reason: "already used" };
    return { ok: true, word: letters };
  }

  async function validateWithDictionary(word) {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) return { ok: false };
      const data = await res.json();
      const firstMeaning = data?.[0]?.meanings?.[0];
      const def = firstMeaning?.definitions?.[0]?.definition;
      if (def && typeof def === "string" && def.length > 0) {
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
      applyResult({ valid: false, reason: s.reason, definition: "" }, startedAt, input);
      return;
    }

    setLoading(true);
    setMessage("Validating with dictionary…");
    const v = await validateWithDictionary(s.word);
    setLoading(false);

    if (!v.ok) {
      applyResult({ valid: false, reason: "not in dictionary", definition: "" }, startedAt, s.word);
      return;
    }

    applyResult({ valid: true, reason: "", definition: v.definition }, startedAt, s.word);
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
      next[by].score += result.valid ? 1 : -1;
      return next;
    });

    if (result.valid) {
      used.current.add(onlyLetters(rawWord));
      setStartLetter(lastAlpha(rawWord));
      setMessage(<span style={{ color: "limegreen" }}>Nice! +1 point.</span>);
    } else {
      setMessage(`Oops (${result.reason}). -1 point.`);
    }

    setInput("");
    switchTurn();
  }

  function handleTimeout() {
    setHistory((h) => [
      ...h,
      { word: "⏰ timeout", valid: false, reason: "timeout", by: turn, timeTaken: TURN_SECONDS, definition: "" },
    ]);
    setPlayers((ps) => {
      const next = ps.map((p) => ({ ...p }));
      next[turn].score -= 1;
      return next;
    });
    setMessage("Time's up! -1 point.");
    switchTurn();
  }

  const onRandomizeLetter = () => {
    if (!lastWord) setStartLetter(randLetter());
  };

  // const turnPlayer = players[turn];

  // New Game function (make sure it's defined)
  const newGame = () => {
    setPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })));
    setTurn(0);
    setStartLetter(randLetter());
    setInput("");
    setTimeLeft(TURN_SECONDS);
    setHistory([]);
    setMessage("");
    used.current = new Set();
  };

  // Handle pass turn functionality
  const passTurn = () => {
    setPlayers((ps) => {
      const next = ps.map((p) => ({ ...p }));
      next[turn].score -= 1; // Penalty for passing
      return next;
    });
    setMessage("You passed your turn! -1 point.");
    switchTurn();
  };

  // Handle name change
  const handleNameChange = (playerIndex, newName) => {
    setPlayers((ps) => {
      const updatedPlayers = [...ps];
      updatedPlayers[playerIndex].name = newName;
      return updatedPlayers;
    });
  };

  // Start editing player name
  const startEditing = (playerIndex) => {
    setEditing(playerIndex);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditing(null);
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="bg-gradient-to-b from-blue-950 via-indigo-900 to-indigo-900 min-h-screen">
      <div className="min-h-screen md:p-6 p-3 flex items-center justify-center">
        <div className="mx-auto max-w-5xl space-y-6 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {!gameStarted ? (
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">Welcome to Shiritori!</h1>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer text-white font-bold text-lg transition-all"
              >
                Start Game
              </button>
              <div className="mt-6 text-lg">
                <h2 className="font-semibold">Game Rules:</h2>
                <ul className="list-disc ml-6 text-left">
                  <li>Players take turns to submit words.</li>
                  <li>Each word must start with the last letter of the previous word.</li>
                  <li>Words must be at least 4 letters long.</li>
                  <li>Words cannot be repeated.</li>
                  <li>If a player passes, they lose 1 point and the next player takes their turn.</li>
                  <li>Each player has a limited time to submit a word before their turn is over.</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between">
                <h1 className="2xl:text-4xl md:text-2xl text-xl font-bold tracking-tight text-center text-white">Shiritori — 2‑Player</h1>
                <div className="flex gap-2">
                  <button onClick={newGame} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg transition-all">
                    <FaRedoAlt className="inline-block mr-2 cursor-pointer" /> New Game
                  </button>
                  <button onClick={onRandomizeLetter} className="px-4 py-2 rounded-xl bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-all text-sm shadow-lg">
                    <FaPlay className="inline-block mr-2 cursor-pointer" /> Randomize Start Letter
                  </button>
                </div>
              </header>

              {/* Display the starting letter */}
              <div className="mb-6 text-center">
                <p className="text-xl text-white">The word must start with the letter: <strong className="text-2xl font-bold">{requiredLetter.toUpperCase()}</strong></p>
              </div>

              {/* Player Names and Edit */}
              <div className="mb-6 text-center text-black">
                {players.map((player, index) => (
                  <div key={index} className="mb-3">
                    {editing === index ? (
                      <div className="flex items-center   justify-center gap-2">
                        <input
                          type="text"
                          className="p-2 border text-white border-white rounded-md"
                          value={player.name}
                          onChange={(e) => handleNameChange(index, e.target.value)}
                        />
                        <button className="bg-indigo-600 text-white px-3 cursor-pointer py-1 rounded-md" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold">{player.name}</span>
                        <button onClick={() => startEditing(index)} className="text-indigo-500">
                          <FaEdit />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Scoreboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ScoreCard name={players[0].name} score={players[0].score} active={turn === 0} />
                <ScoreCard name={players[1].name} score={players[1].score} active={turn === 1} />
              </div>

{/* Display the starting letter */}
              <div className="mb-6 text-center md:hidden block">
                <p className="text-md text-white">The word must start with the letter: <strong className="text-lg font-bold">{requiredLetter.toUpperCase()}</strong></p>
              </div>

                                {/* Timer */}
              <div className="block md:hidden"><TimerBar className="" timeLeft={timeLeft} /></div>
              {/* Word Submission */}
              <div className="mt-4 text-center text-white">
                <form onSubmit={submitWord} className="space-x-3">
                  <input
                    className="border p-3 rounded-xl text-lg w-3/4"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Enter a word starting with ${requiredLetter}`}
                  />

                  <button type="submit" className="px-6 py-3 md:mt-0 mt-2 bg-indigo-600 cursor-pointer hover:bg-indigo-700 rounded-xl text-white font-bold text-lg transition-all">
                    Submit
                  </button>
                </form>
                {message && <div className="mt-3 text-red-400 text-lg">{message}</div>}
              </div>

              {/* Pass Turn Button */}
              <div className="text-center mt-4">
                <button
                  onClick={passTurn}
                  className="px-6 py-3 bg-red-600 cursor-pointer hover:bg-red-700 rounded-xl text-white font-bold text-lg transition-all"
                >
                  Pass Turn
                </button>
              </div>

              {/* Timer */}
              <div className="hidden md:block"><TimerBar className="" timeLeft={timeLeft} /></div>

              {/* Word History */}
              <History items={history} />

              {/* Word Details (from dictionary API) */}
              {message && <WordValidation className="text-white" wordDetails={history.slice(-1)[0]} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
