import { useState, useEffect, useRef, useCallback } from "react";
import { FaJava } from "react-icons/fa";

// ─── Questions ────────────────────────────────────────────────────────────────
const Qs = [
  {
    q: "Which of the following is a feature of Java?",
    code: null,
    opts: ["Pointer-based memory access", "Manual memory management", "Goto statements", "Object-oriented"], // Only last is correct
    ans: [3],  // "Object-oriented" is correct
    diff: "Medium",
  },
  {
    q: "What is the primary role of the JVM in Java?",
    code: null,
    opts: ["Compiles Java source code to bytecode", "Executes Java bytecode", "Provides development tools like compiler and debugger", "Manages JDK installation"],
    ans: 1,
    diff: "Easy",
  },
  {
    q: "Which of the following is valid in Java?",
    code: null,
    opts: ["int 1num = 10;", "int num_1 = 10;", "int num-1 = 10;", "int num 1 = 10;"],
    ans: 1,
    diff: "Easy",
  },
  {
    q: "Which is a correct array declaration in Java?",
    code: null,
    opts: ["int arr[]", "int[] arr", "Both A and B are correct", "None of the above"],
    ans: 2,
    diff: "Easy",
  },
  {
    q: "What does the final keyword mean in Java?",
    code: null,
    opts: ["Changeable variable", "Constant / cannot reassign", "Loop terminator", "Class type"],
    ans: 1,
    diff: "Easy",
  },
  {
    q: "What is the output of the following Java code?",
    code: "int x = 5;\nSystem.out.println(x << 1);",
    opts: ["2", "5", "10", "1"],
    ans: 2,
    diff: "Medium",
  },
  {
    q: "Which access modifier makes a member accessible only within the same package?",
    code: null,
    opts: ["public", "private", "protected", "default"],
    ans: 3,
    diff: "Medium",
  },
  {
    q: "What is the output? (For loop with condition)",
    code: `for(int i = 0; i < 5; i++) {\n    if(i % 2 == 0)\n        System.out.print(i);\n}`,
    opts: ["024", "123", "01234", "135"],
    ans: 0,
    diff: "Medium",
  },
  {
    q: "What is the output? (Break statement)",
    code: `for(int i = 1; i <= 5; i++) {\n    if(i == 3) break;\n    System.out.print(i);\n}`,
    opts: ["12345", "12", "123", "45"],
    ans: 1,
    diff: "Medium",
  },
  {
    q: "What is the output? (Operators)",
    code: `int x = 5;\nSystem.out.println(x++ + ++x);`,
    opts: ["10", "11", "12", "13"],
    ans: 2,
    diff: "Medium",
  },
];

const TOTAL = Qs.length;
const TIMER_SECONDS = 60;
const LETTERS = ["A", "B", "C", "D"];
const CIRCUM = 2 * Math.PI * 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isCorrectAnswer(qIdx, optIdx) {
  const ans = Qs[qIdx].ans;
  if (Array.isArray(ans)) return ans.includes(optIdx);
  return optIdx === ans;
}

function getResultMsg(score) {
  const pct = (score / TOTAL) * 100;
  if (pct >= 85) return { emoji: "🏆", title: "Outstanding!" };
  if (pct >= 70) return { emoji: "🎉", title: "Great Work!" };
  if (pct >= 55) return { emoji: "👍", title: "Good Effort!" };
  if (pct >= 40) return { emoji: "📚", title: "Keep Practising!" };
  return { emoji: "💪", title: "Review & Retry!" };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f7f5f0;
    --surface: #ffffff;
    --ink: #1a1a2e;
    --ink2: #4a4a6a;
    --border: #e0ddd8;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --correct: #059669;
    --correct-bg: #ecfdf5;
    --wrong: #dc2626;
    --wrong-bg: #fef2f2;
    --timer-ok: #2563eb;
    --timer-warn: #f39c12;
    --timer-danger: #dc2626;
    --code-bg: #1e1e2e;
    --code-txt: #cdd6f4;
    --radius: 16px;
    --sans: 'Outfit', sans-serif;
    --mono: 'IBM Plex Mono', monospace;
  }

  body {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--ink);
    min-height: 100vh;
  }

  /* ── Layout Shell ── */
  .quiz-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  /* ── Top Bar ── */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    gap: 16px;
  }
  .topbar-left {
    font-family: var(--mono);
    font-size: .75rem;
    color: var(--ink2);
    font-weight: 600;
    letter-spacing: .06em;
    white-space: nowrap;
  }
  .topbar-left strong { color: var(--ink); }
  .dot-row {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    max-width: 420px;
    justify-content: center;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--border);
    transition: background .3s, transform .2s;
    flex-shrink: 0;
  }
  .dot.done-correct { background: var(--correct); }
  .dot.done-wrong { background: var(--wrong); }
  .dot.current { background: var(--accent); transform: scale(1.4); }
  .dot.skipped { background: #f59e0b; }
  .score-chip {
    font-family: var(--mono);
    font-size: .8rem;
    font-weight: 600;
    padding: 5px 14px;
    border-radius: 999px;
    background: var(--accent-light);
    color: var(--accent);
    white-space: nowrap;
  }

  /* ── Stage ── */
  .stage {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  .slide {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 20px;
    opacity: 0;
    pointer-events: none;
    transform: translateX(60px);
    transition: opacity .3s ease, transform .3s ease;
    overflow-y: auto;
  }
  .slide.active {
    opacity: 1;
    pointer-events: all;
    transform: translateX(0);
  }
  .slide.exit-left {
    opacity: 0;
    transform: translateX(-60px);
    pointer-events: none;
  }

  /* ── Card ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    width: 100%;
    max-width: 720px;
    padding: 32px 36px 28px;
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .q-strip {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
  }
  .q-num-badge {
    font-family: var(--mono);
    font-size: .72rem;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 8px;
    background: var(--ink);
    color: #fff;
    letter-spacing: .04em;
  }
  .diff-badge {
    font-family: var(--mono);
    font-size: .68rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  .diff-easy { background: #d1fae5; color: #065f46; }
  .diff-medium { background: #fef3c7; color: #92400e; }
  .q-text {
    font-size: 1.08rem;
    font-weight: 600;
    line-height: 1.6;
    color: var(--ink);
  }
  .code-block {
    font-family: var(--mono);
    font-size: .8rem;
    line-height: 1.75;
    background: var(--code-bg);
    color: var(--code-txt);
    border-radius: 10px;
    padding: 16px 18px;
    margin: 16px 0 0;
    overflow-x: auto;
    white-space: pre;
    border-left: 3px solid var(--accent);
  }

  /* ── Options ── */
  .options {
    display: flex;
    flex-direction: column;
    gap: 9px;
    margin-top: 20px;
  }
  .opt {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    transition: border-color .15s, background .15s, transform .1s;
    font-size: .95rem;
    color: var(--ink);
    background: var(--bg);
    user-select: none;
    font-family: var(--sans);
    text-align: left;
    width: 100%;
  }
  .opt:hover:not(.locked) {
    border-color: var(--accent);
    background: var(--accent-light);
    transform: translateX(3px);
  }
  .opt.locked { cursor: default; pointer-events: none; }
  .opt-letter {
    font-family: var(--mono);
    font-size: .72rem;
    font-weight: 700;
    min-width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    background: var(--border);
    color: var(--ink2);
    transition: all .15s;
    flex-shrink: 0;
  }
  .opt-text { line-height: 1.4; flex: 1; }
  .opt.selected { border-color: var(--accent); background: var(--accent-light); }
  .opt.selected .opt-letter { background: var(--accent); color: #fff; }
  .opt.correct { border-color: var(--correct); background: var(--correct-bg); color: var(--ink); }
  .opt.correct .opt-letter { background: var(--correct); color: #fff; }
  .opt.wrong { border-color: var(--wrong); background: var(--wrong-bg); color: var(--ink); }
  .opt.wrong .opt-letter { background: var(--wrong); color: #fff; }

  /* ── Feedback ── */
  .feedback {
    display: flex;
    margin-top: 16px;
    padding: 12px 15px;
    border-radius: 10px;
    font-size: .85rem;
    line-height: 1.6;
    gap: 10px;
    align-items: flex-start;
  }
  .fb-ok { background: var(--correct-bg); border: 1px solid #a7f3d0; color: #064e3b; }
  .fb-no { background: var(--wrong-bg); border: 1px solid #fecaca; color: #7f1d1d; }
  .fb-skip { background: #fffbeb; border: 1px solid #fde68a; color: #78350f; }
  .fb-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }

  /* ── Bottom Bar ── */
  .bottombar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    gap: 16px;
  }
  .timer-wrap { display: flex; align-items: center; gap: 10px; }
  .timer-ring { position: relative; width: 48px; height: 48px; flex-shrink: 0; }
  .timer-ring svg { transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: var(--border); stroke-width: 4; }
  .ring-fill { fill: none; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 125.7; transition: stroke-dashoffset 1s linear, stroke .3s; }
  .timer-num {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: .78rem;
    font-weight: 700;
  }
  .timer-label { font-size: .78rem; color: var(--ink2); font-family: var(--mono); }
  .btn-row { display: flex; gap: 10px; align-items: center; }
  .btn-next {
    font-family: var(--sans);
    font-size: .92rem;
    font-weight: 700;
    padding: 12px 28px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    background: var(--accent);
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background .2s, transform .15s, box-shadow .2s;
    letter-spacing: .02em;
  }
  .btn-next:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.3); }
  .btn-next:disabled { opacity: .45; cursor: not-allowed; transform: none; }
  .btn-secondary {
    font-family: var(--sans);
    font-size: .85rem;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: transparent;
    color: var(--ink2);
    cursor: pointer;
    transition: all .2s;
  }
  .btn-secondary:hover:not(:disabled) { border-color: var(--ink2); color: var(--ink); }
  .btn-secondary:disabled { opacity: .35; cursor: not-allowed; }

  /* ── Start Screen ── */
  .start-screen {
    position: fixed;
    inset: 0;
    background: var(--bg);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .start-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    max-width: 520px;
    width: 100%;
    padding: 48px 44px;
    box-shadow: 0 8px 40px rgba(0,0,0,.08);
    text-align: center;
  }
  .start-icon { font-size: 2.8rem; margin-bottom: 16px; }
  .start-title { font-size: 2rem; font-weight: 800; letter-spacing: -.02em; margin-bottom: 8px; }
  .start-title span { color: var(--accent); }
  .start-sub { color: var(--ink2); font-size: .95rem; margin-bottom: 28px; line-height: 1.6; }
  .start-meta { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
  .sm-chip {
    font-family: var(--mono);
    font-size: .75rem;
    padding: 6px 14px;
    border-radius: 8px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--ink2);
  }
  .btn-start {
    font-family: var(--sans);
    font-size: 1.05rem;
    font-weight: 700;
    padding: 15px 40px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: #fff;
    cursor: pointer;
    transition: all .2s;
    letter-spacing: .02em;
  }
  .btn-start:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,.3); }

  /* ── Result Screen ── */
  .result-screen {
    position: fixed;
    inset: 0;
    background: var(--bg);
    z-index: 200;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 40px 20px;
  }
  .result-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    max-width: 560px;
    width: 100%;
    padding: 44px 40px;
    box-shadow: 0 8px 40px rgba(0,0,0,.08);
    text-align: center;
  }
  .result-emoji { font-size: 3rem; margin-bottom: 12px; }
  .result-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; color: var(--ink); }
  .result-sub { font-size: .9rem; color: var(--ink2); margin-bottom: 28px; }
  .big-score { font-family: var(--mono); font-size: 4.5rem; font-weight: 700; line-height: 1; color: var(--accent); margin-bottom: 4px; }
  .big-score span { font-size: 2rem; color: var(--ink2); }
  .stat-row { display: flex; justify-content: center; gap: 20px; margin: 24px 0 32px; flex-wrap: wrap; }
  .stat-box { border-radius: 12px; padding: 14px 22px; min-width: 100px; text-align: center; }
  .sb-ok { background: var(--correct-bg); border: 1px solid #a7f3d0; }
  .sb-no { background: var(--wrong-bg); border: 1px solid #fecaca; }
  .sb-sk { background: #fffbeb; border: 1px solid #fde68a; }
  .sb-val { font-family: var(--mono); font-size: 1.8rem; font-weight: 700; }
  .sb-ok .sb-val { color: var(--correct); }
  .sb-no .sb-val { color: var(--wrong); }
  .sb-sk .sb-val { color: #d97706; }
  .sb-lbl { font-size: .72rem; text-transform: uppercase; letter-spacing: .1em; margin-top: 3px; opacity: .8; }
  .btn-restart {
    font-family: var(--sans);
    font-size: 1rem;
    font-weight: 700;
    padding: 14px 36px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: #fff;
    cursor: pointer;
    transition: all .2s;
    letter-spacing: .02em;
  }
  .btn-restart:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,.3); }

  @media(max-width:600px) {
    .card { padding: 22px 18px 20px; }
    .topbar, .bottombar { padding: 10px 14px; }
    .dot-row { max-width: 220px; }
    .big-score { font-size: 3rem; }
    .result-card, .start-card { padding: 32px 22px; }
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuizApp() {
  const [phase, setPhase] = useState("start"); // "start" | "quiz" | "result"
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState(new Array(TOTAL).fill(null)); // null | 'correct' | 'wrong' | 'skipped'
  const [chosen, setChosen] = useState(new Array(TOTAL).fill(-1));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [slideDir, setSlideDir] = useState("forward"); // for animation
  const [prevIdx, setPrevIdx] = useState(null);
  const timerRef = useRef(null);

  const score = status.filter((s) => s === "correct").length;
  const answeredCount = status.filter((s) => s !== null).length;
  const skippedCount = status.filter((s) => s === "skipped").length;
  const wrongCount = status.filter((s) => s === "wrong").length;

  const isAnswered = status[current] !== null;

  // ── Timer ──
  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer]);

  // Auto time-up
  useEffect(() => {
    if (phase !== "quiz") return;
    if (timeLeft === 0 && !isAnswered) {
      setStatus((prev) => {
        const next = [...prev];
        next[current] = "skipped";
        return next;
      });
      stopTimer();
    }
  }, [timeLeft, isAnswered, current, phase, stopTimer]);

  // Start timer when question changes (and not answered)
  useEffect(() => {
    if (phase !== "quiz") return;
    if (!isAnswered) {
      startTimer();
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [current, phase, isAnswered, startTimer, stopTimer]);

  // ── Select answer ──
  const selectOpt = (optIdx) => {
    if (isAnswered) return;
    stopTimer();
    const correct = isCorrectAnswer(current, optIdx);
    setChosen((prev) => {
      const next = [...prev];
      next[current] = optIdx;
      return next;
    });
    setStatus((prev) => {
      const next = [...prev];
      next[current] = correct ? "correct" : "wrong";
      return next;
    });
  };

  // ── Skip ──
  const skip = () => {
    if (isAnswered) return;
    stopTimer();
    setStatus((prev) => {
      const next = [...prev];
      next[current] = "skipped";
      return next;
    });
  };

  // ── Navigate ──
  const goNext = () => {
    if (current >= TOTAL - 1) {
      stopTimer();
      setPhase("result");
      return;
    }
    setSlideDir("forward");
    setPrevIdx(current);
    setCurrent((c) => c + 1);
    setTimeLeft(TIMER_SECONDS);
  };

  const goPrev = () => {
    if (current <= 0) return;
    setSlideDir("backward");
    setPrevIdx(current);
    setCurrent((c) => c - 1);
    setTimeLeft(TIMER_SECONDS);
  };

  // ── Restart ──
  const restart = () => {
    stopTimer();
    setStatus(new Array(TOTAL).fill(null));
    setChosen(new Array(TOTAL).fill(-1));
    setCurrent(0);
    setTimeLeft(TIMER_SECONDS);
    setPrevIdx(null);
    setPhase("start");
  };

  const startQuiz = () => {
    setPhase("quiz");
  };

  // ── Timer visuals ──
  const timerPct = timeLeft / TIMER_SECONDS;
  const dashOffset = CIRCUM * (1 - timerPct);
  const timerColor =
    timeLeft <= 10 ? "var(--timer-danger)" : timeLeft <= 20 ? "var(--timer-warn)" : "var(--timer-ok)";

  // ── Feedback ──
  const getFeedback = (qIdx) => {
    const s = status[qIdx];
    if (!s) return null;
    if (s === "correct") return { cls: "fb-ok", icon: "✅", text: "Correct! Well done." };
    if (s === "wrong") return { cls: "fb-no", icon: "❌", text: "Incorrect." };
    return { cls: "fb-skip", icon: "⏱", text: "Time's up!." };
  };

  const { emoji, title } = getResultMsg(score);

  return (
    <>
      <style>{styles}</style>

      {/* ── Start Screen ── */}
      {phase === "start" && (
        <div className="start-screen">
          <div className="start-card">
            <div className="start-icon text-6xl text-orange-500">
              <FaJava />
            </div> <div className="start-title">
              CS4001NT <span>Java Quiz</span>
            </div>
            <div className="start-sub">
              Test your Java knowledge — Basics and OOP concepts.
              <br />
              Each question has a 1-minute timer. Read carefully!
            </div>
            <div className="start-meta">
              <span className="sm-chip">10 Questions</span>
              <span className="sm-chip">10 Marks</span>
              <span className="sm-chip">1 min / question</span>
              <span className="sm-chip">Java Core Topics</span>
            </div>
            <button className="btn-start" onClick={startQuiz}>
              Start Quiz →
            </button>
          </div>
        </div>
      )}

      {/* ── Result Screen ── */}
      {phase === "result" && (
        <div className="result-screen">
          <div className="result-card">
            <div className="result-emoji">{emoji}</div>
            <div className="result-title">{title}</div>
            <div className="result-sub">CS4001NT Programming · Java Core Topics</div>
            <div className="big-score">
              {score}
              <span>/{TOTAL}</span>
            </div>
            <div className="stat-row">
              <div className="stat-box sb-ok">
                <div className="sb-val">{score}</div>
                <div className="sb-lbl">Correct</div>
              </div>
              <div className="stat-box sb-no">
                <div className="sb-val">{wrongCount}</div>
                <div className="sb-lbl">Wrong</div>
              </div>
              <div className="stat-box sb-sk">
                <div className="sb-val">{skippedCount}</div>
                <div className="sb-lbl">Skipped / Timeout</div>
              </div>
            </div>
            <button className="btn-restart" onClick={restart}>
              ↺ Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── Quiz Shell ── */}
      {phase === "quiz" && (
        <div className="quiz-shell">
          {/* Top Bar */}
          <div className="topbar">
            <div className="topbar-left">
              <strong>Q{current + 1}</strong> of {TOTAL}
            </div>
            <div className="dot-row">
              {status.map((s, i) => {
                let cls = "dot";
                if (i === current) cls += " current";
                else if (s === "correct") cls += " done-correct";
                else if (s === "wrong") cls += " done-wrong";
                else if (s === "skipped") cls += " skipped";
                return <div key={i} className={cls} />;
              })}
            </div>
            <div className="score-chip">
              Score: {score} / {answeredCount}
            </div>
          </div>

          {/* Stage */}
          <div className="stage">
            {Qs.map((q, idx) => {
              const active = idx === current;
              const exiting = idx === prevIdx && !active;
              let cls = "slide";
              if (active) cls += " active";
              else if (exiting) cls += slideDir === "forward" ? " exit-left" : " exit-right";

              const fb = getFeedback(idx);
              const qStatus = status[idx];

              return (
                <div key={idx} className={cls}>
                  <div className="card">
                    <div className="q-strip">
                      <span className="q-num-badge">
                        Q{idx + 1} / {TOTAL}
                      </span>
                      <span className={`diff-badge ${q.diff === "Easy" ? "diff-easy" : "diff-medium"}`}>
                        {q.diff}
                      </span>
                    </div>
                    <div className="q-text">{q.q}</div>
                    {q.code && <pre className="code-block">{q.code}</pre>}

                    <div className="options">
                      {q.opts.map((opt, oi) => {
                        let cls = "opt";
                        if (qStatus !== null) {
                          cls += " locked";
                          if (chosen[idx] === oi && qStatus === "correct") cls += " correct";
                          else if (chosen[idx] === oi && qStatus === "wrong") cls += " wrong";
                        }
                        return (
                          <button key={oi} className={cls} onClick={() => selectOpt(oi)}>
                            <span className="opt-letter">{LETTERS[oi]}</span>
                            <span className="opt-text">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {fb && (
                      <div className={`feedback ${fb.cls}`}>
                        <span className="fb-icon">{fb.icon}</span>
                        <span>{fb.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar */}
          <div className="bottombar">
            <div className="timer-wrap">
              <div className="timer-ring">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle className="ring-bg" cx="24" cy="24" r="20" />
                  <circle
                    className="ring-fill"
                    cx="24"
                    cy="24"
                    r="20"
                    style={{
                      strokeDashoffset: dashOffset,
                      stroke: timerColor,
                    }}
                  />
                </svg>
                <div
                  className="timer-num"
                  style={{ color: timeLeft <= 10 ? "var(--timer-danger)" : "var(--ink)" }}
                >
                  {timeLeft}
                </div>
              </div>
              <div className="timer-label">
                seconds
                <br />
                remaining
              </div>
            </div>

            <div className="btn-row">
              <button
                className="btn-secondary"
                disabled={current === 0}
                onClick={goPrev}
              >
                ← Back
              </button>
              <button
                className="btn-secondary"
                disabled={isAnswered}
                onClick={skip}
              >
                Skip →
              </button>
              <button
                className="btn-next"
                disabled={!isAnswered}
                onClick={goNext}
              >
                {current === TOTAL - 1 ? "Finish →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}