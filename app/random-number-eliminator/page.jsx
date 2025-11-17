"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function LotteryPage() {
  // ---------------- STATE ----------------
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(100);

  const generateEntries = (min, max) => {
    const count = max - min + 1;
    return Array.from({ length: count }, (_, i) => ({
      number: min + i,
      name: "",
      eliminated: false,
      excluded: false,
    }));
  };

  const [entries, setEntries] = useState(generateEntries(1, 100));
  const [running, setRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [speed, setSpeed] = useState(120);
  const [dramatic, setDramatic] = useState(true);
  const [styleMode, setStyleMode] = useState("grid");
  const [theme, setTheme] = useState("default");
  const [excludeInput, setExcludeInput] = useState("");
  const [title, setTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const intervalRef = useRef(null);
  const isDarkTheme = theme !== "default";

  // ---------------- THEME BACKGROUND ----------------
  const getBackgroundStyle = () => {
    if (theme === "holiday") {
      return { backgroundColor: "#024731" };
    }
    if (theme === "casino") {
      return {
        backgroundColor: "#7a0019",
        backgroundImage:
          "radial-gradient(circle at 0 0, rgba(255,255,255,0.06), transparent 35%), radial-gradient(circle at 100% 100%, rgba(0,0,0,0.45), transparent 40%)",
        backgroundAttachment: "fixed",
      };
    }
    return { backgroundColor: "#f3f4f6" };
  };

  // ---------------- LOCAL STORAGE ----------------
  useEffect(() => {
    const saved = localStorage.getItem("lottery-names");
    if (!saved) return;

    const parsed = JSON.parse(saved);

    setEntries((prev) =>
      prev.map((e, i) => ({
        ...e,
        name: parsed[i]?.name || "",
        excluded: parsed[i]?.excluded || false,
      }))
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "lottery-names",
      JSON.stringify(entries.map((e) => ({ name: e.name, excluded: e.excluded })))
    );
  }, [entries]);

  // ---------------- RANGE RESET ----------------
  useEffect(() => {
    setEntries(generateEntries(minNumber, maxNumber));
    setWinner(null);
    setHasStarted(false);
    setRunning(false);
    setExcludeInput("");
  }, [minNumber, maxNumber]);

  // ---------------- DRAMATIC SPEED ----------------
  const getIntervalSpeed = (aliveCount) => {
    if (!dramatic) return speed;
    if (aliveCount > 50) return speed;
    if (aliveCount > 20) return speed + 100;
    if (aliveCount > 10) return speed + 200;
    if (aliveCount > 5) return speed + 350;
    if (aliveCount > 2) return speed + 500;
    return speed + 900;
  };

  // ---------------- ELIMINATION ENGINE ----------------
  useEffect(() => {
    if (!running) return;

    const alive = entries.filter((e) => !e.eliminated && !e.excluded);
    const intervalMs = getIntervalSpeed(alive.length || 1);

    intervalRef.current = setInterval(() => {
      setEntries((prev) => {
        const aliveNow = prev.filter((e) => !e.eliminated && !e.excluded);

        if (aliveNow.length <= 1) {
          const win = aliveNow[0];
          setWinner(win || null);
          setRunning(false);
          clearInterval(intervalRef.current);

          if (win) {
            confetti({
              particleCount: 200,
              spread: 70,
              origin: { y: 0.6 },
            });
          }

          return prev;
        }

        const randomPick =
          aliveNow[Math.floor(Math.random() * aliveNow.length)].number;

        return prev.map((e) =>
          e.number === randomPick ? { ...e, eliminated: true } : e
        );
      });
    }, intervalMs);

    return () => clearInterval(intervalRef.current);
  }, [running, entries, speed, dramatic]);

  // ---------------- ACTIONS ----------------
  const startNewGame = () => {
    setWinner(null);
    setEntries((prev) =>
      prev.map((e) => ({ ...e, eliminated: false }))
    );
    setHasStarted(true);
    setRunning(true);
  };

  const togglePause = () => {
    if (!hasStarted || winner) return;
    setRunning((prev) => !prev);
  };

  const handleExcludeChange = (value) => {
    setExcludeInput(value);
    const nums = value
      .split(/[,\s]+/)
      .map((v) => parseInt(v, 10))
      .filter((n) => !isNaN(n) && n >= minNumber && n <= maxNumber);

    const setNums = new Set(nums);

    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        excluded: setNums.has(e.number),
      }))
    );
  };

  const closeWinnerPopup = () => setWinner(null);

  const aliveEntries = entries.filter((e) => !e.eliminated && !e.excluded);
  const eliminatedEntries = entries.filter((e) => e.eliminated);

  // ---------------- GRID MODE ----------------
  const renderGrid = () => (
    <div className="flex justify-center mt-6">
      <div
        className={`border-4 rounded-lg overflow-hidden shadow-2xl ${
          theme === "holiday" ? "border-yellow-400" : "border-white"
        } bg-white/90`}
      >
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10">
          {entries.map((e) => {
            const classes = e.excluded
              ? "bg-[#000000] text-black opacity-90" // EXCLUDED
              : e.eliminated
              ? theme === "holiday"
                ? "bg-[#003e1f] text-white opacity-90"
                : "bg-gray-500 text-white opacity-90"
              : theme === "holiday"
              ? "bg-[#f2e8cf] text-black"
              : "bg-white text-black";

            return (
              <div
                key={e.number}
                className={`p-2 sm:p-3 border border-gray-300 text-center text-xs sm:text-sm transition-all flex flex-col justify-center ${classes}`}
                style={{ height: "70px" }}
              >
                <div className="font-bold">{e.number}</div>

                <input
                  type="text"
                  disabled={running}
                  value={e.name}
                  placeholder="Name"
                  onChange={(ev) =>
                    setEntries((prev) =>
                      prev.map((x) =>
                        x.number === e.number
                          ? { ...x, name: ev.target.value }
                          : x
                      )
                    )
                  }
                  className="w-full mt-1 text-[0.65rem] sm:text-xs text-center font-bold bg-transparent border-none outline-none"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ---------------- LOTTERY MACHINE ----------------
  const renderLottoMachine = () => {
    const aliveCount = aliveEntries.length;
    const radius = 140;

    return (
      <div className="flex flex-col items-center mt-6 gap-6">
        {/* Ball Pool */}
        <div
          className="relative rounded-full border-4 border-gray-300 w-80 h-80 overflow-hidden bg-slate-50"
          style={{ boxShadow: "0 0 25px rgba(0,0,0,0.3)" }}
        >
          {aliveEntries.map((entry, index) => {
            const angle = (index / Math.max(aliveCount, 1)) * 2 * Math.PI;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={entry.number}
                className="absolute w-10 h-10 rounded-full text-black font-bold shadow-lg flex items-center justify-center"
                style={{
                  left: "50%",
                  top: "50%",
                  background:
                    "radial-gradient(circle, #fff8c4, #e0b400)",
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                }}
              >
                {entry.number}
              </div>
            );
          })}
        </div>

        {/* Drawn Balls */}
        <div className="w-full max-w-3xl">
          <h2 className="font-bold mb-2 text-center">Drawn Balls</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {eliminatedEntries.map((entry) => (
              <div
                key={entry.number}
                className="w-9 h-9 rounded-full bg-red-600 text-white font-bold shadow-md flex items-center justify-center"
              >
                {entry.number}
              </div>
            ))}

            {eliminatedEntries.length === 0 && (
              <span className="text-sm opacity-70">No balls drawn yet...</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---------------- MAIN UI ----------------
  return (
    <div
      className={`min-h-screen p-6 ${isDarkTheme ? "text-white" : "text-black"}`}
      style={getBackgroundStyle()}
    >
      {/* ------- TITLE ------- */}
      <div className="text-center mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add Title..."
          className={`text-3xl font-bold w-full bg-transparent outline-none border-b-2 pb-2 text-center ${
            isDarkTheme ? "border-white text-white" : "border-black text-black"
          }`}
        />
      </div>

      {/* ------- VISUALIZER (GRID or LOTTO) ------- */}
      {styleMode === "grid" ? renderGrid() : renderLottoMachine()}

      {/* ------- SIDEBAR TOGGLE BUTTON ------- */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        {sidebarOpen ? "Hide Settings" : "Show Settings"}
      </button>

      {/* ------- SIDEBAR PANEL ------- */}
      {sidebarOpen && (
        <div className="fixed bottom-16 right-4 bg-white text-black p-5 rounded-lg shadow-xl w-72 max-h-[72vh] overflow-auto z-40">
          <h2 className="text-lg font-bold mb-3">Settings</h2>

          <button
            onClick={startNewGame}
            className="w-full mb-3 px-4 py-2 bg-green-600 text-white rounded"
          >
            {hasStarted ? "Start New" : "Start"}
          </button>

          <button
            onClick={togglePause}
            disabled={!hasStarted || !!winner}
            className="w-full mb-3 px-4 py-2 bg-yellow-500 rounded"
          >
            {running ? "Pause" : "Resume"}
          </button>

          {/* Style */}
          <label className="font-semibold">Style</label>
          <select
            className="w-full p-2 border rounded mb-3"
            value={styleMode}
            onChange={(e) => setStyleMode(e.target.value)}
          >
            <option value="grid">Grid</option>
            <option value="lotto">Lottery Machine</option>
          </select>

          {/* Theme */}
          <label className="font-semibold">Theme</label>
          <select
            className="w-full p-2 border rounded mb-3"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="holiday">Holiday</option>
            <option value="casino">Casino</option>
          </select>

          {/* Range */}
          <label className="font-semibold">Number Range</label>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              className="w-1/2 p-2 border rounded"
              value={minNumber}
              onChange={(e) => setMinNumber(Number(e.target.value))}
              placeholder="Min"
            />
            <input
              type="number"
              className="w-1/2 p-2 border rounded"
              value={maxNumber}
              onChange={(e) => setMaxNumber(Number(e.target.value))}
              placeholder="Max"
            />
          </div>

          <p className="text-xs opacity-70 mb-3">
            The grid and machine update automatically.
          </p>

          {/* Speed */}
          <label className="font-semibold">Speed ({speed} ms)</label>
          <input
            type="range"
            className="w-full mb-3"
            min="50"
            max="600"
            step="10"
            disabled={running}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />

          {/* Dramatic */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={dramatic}
              onChange={() => setDramatic(!dramatic)}
              disabled={running}
            />
            <span className="font-semibold">Dramatic Slowdown</span>
          </div>

          {/* Exclusions */}
          <label className="font-semibold">Exclude Numbers</label>
          <input
            type="text"
            placeholder="e.g., 3, 18, 72"
            value={excludeInput}
            disabled={running}
            onChange={(e) => handleExcludeChange(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          />

          <p className="text-xs opacity-70">
            Excluded numbers will never be selected.
          </p>
        </div>
      )}

      {/* ------- WINNER POPUP ------- */}
      {winner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-2xl p-8 max-w-md w-[90%] text-center shadow-2xl">
            <h2 className="text-3xl font-extrabold mb-4">
              🎉 Winner!
            </h2>
            <div className="text-6xl font-black mb-3 text-green-600">
              #{winner.number}
            </div>
            {winner.name && (
              <div className="text-2xl font-semibold mb-6">
                {winner.name}
              </div>
            )}
            <button
              onClick={closeWinnerPopup}
              className="mt-2 px-5 py-2 rounded bg-blue-600 text-white font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
