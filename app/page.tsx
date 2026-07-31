"use client";

import { useState, useCallback } from "react";

type UIState = "idle" | "loading" | "success" | "error";

interface ArcaPromptOutput {
  prompts: {
    system: string;
    build: string;
    ux: string;
    edge_cases: string;
  };
  tech_stack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  };
  domain_suggestions: string[];
  name_suggestions: string[];
  one_liner: string;
}

const EXAMPLES = [
  "A habit tracker that uses AI to suggest better habits based on your current ones",
  "A tool that lets solo founders build landing pages by just describing their product",
  "An AI journaling app that gives weekly mental health insights",
  "A marketplace where vibe coders can sell their prompt stacks",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [hasName, setHasName] = useState<boolean | null>(null);
  const [projectName, setProjectName] = useState("");
  const [uiState, setUiState] = useState<UIState>("idle");
  const [output, setOutput] = useState<ArcaPromptOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [exampleIdx, setExampleIdx] = useState(0);

  const handleGenerate = useCallback(async () => {
    if (!idea.trim() || idea.length < 20) return;
    setUiState("loading");
    setErrorMsg("");
    setOutput(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          projectName: hasName && projectName.trim() ? projectName.trim() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Something went wrong. Try again.");
        setUiState("error");
        return;
      }

      setOutput(data);
      setUiState("success");

      if (typeof window !== "undefined" && (window as any).umami) {
        (window as any).umami.track("prompt-generated");
      }
    } catch {
      setErrorMsg("Connection failed. The machine is not responding.");
      setUiState("error");
    }
  }, [idea, hasName, projectName]);

  const buildCopyBlock = () => {
    if (!output) return "";
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCAPROMPT OUTPUT — arcaprompt.arcapush.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IDEA: ${idea}

━━━ SYSTEM PROMPT ━━━
${output.prompts.system}

━━━ BUILD PROMPT ━━━
${output.prompts.build}

━━━ UX PROMPT ━━━
${output.prompts.ux}

━━━ EDGE CASES PROMPT ━━━
${output.prompts.edge_cases}

━━━ TECH STACK ━━━
Frontend:  ${output.tech_stack.frontend}
Backend:   ${output.tech_stack.backend}
Database:  ${output.tech_stack.database}
Auth:      ${output.tech_stack.auth}
Hosting:   ${output.tech_stack.hosting}

━━━ NAME SUGGESTIONS ━━━
${output.name_suggestions.join(" · ")}

━━━ DOMAIN SUGGESTIONS ━━━
${output.domain_suggestions.join(" · ")}

━━━ ONE-LINER ━━━
${output.one_liner}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by Gemini · Built by Arcapush.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildCopyBlock());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToX = () => {
    if (!output) return;
    const name = output.name_suggestions[0] || "my project";
    const text = `Just used ArcaPrompt to scaffold my idea "${name}" — got structured prompts, tech stack, and domain suggestions in seconds.\n\nPowered by @Arcapush 🔥\narcaprompt.arcapush.com`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const reset = () => {
    setUiState("idle");
    setOutput(null);
    setErrorMsg("");
    setIdea("");
    setProjectName("");
    setHasName(null);
  };

  const fillExample = () => {
    setIdea(EXAMPLES[exampleIdx % EXAMPLES.length]);
    setExampleIdx((i) => i + 1);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue:         #5b2bff;
          --blue-light:   #7c5fff;
          --blue-hi:      #b39dff;
          --blue-glow:    rgba(91,43,255,0.45);
          --bg:           #04030f;
          --surface:      #080616;
          --border:       rgba(91,43,255,0.22);
          --border-hi:    rgba(91,43,255,0.55);
          --text:         #ffffff;
          --muted:        rgba(255,255,255,0.38);
          --mono:         'DM Mono', 'Space Mono', monospace;
          --display:      'Syne', sans-serif;
        }

        html, body {
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          font-family: var(--mono);
          overflow-x: hidden;
        }

        /* ── GRID BG ── */
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px 80px;
          position: relative;
        }

        .page::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, rgba(91,43,255,0.25) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none; z-index: 0;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 40%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 40%, black 30%, transparent 100%);
        }

        .page::after {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(91,43,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,43,255,0.055) 1px, transparent 1px);
          background-size: 108px 108px;
          pointer-events: none; z-index: 0;
        }

        .orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none; z-index: 0;
        }
        .orb-1 { top: -250px; right: -200px; width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(91,43,255,0.18) 0%, transparent 68%);
          animation: orb 14s ease-in-out infinite alternate; }
        .orb-2 { bottom: -220px; left: -180px; width: 580px; height: 580px;
          background: radial-gradient(circle, rgba(67,20,220,0.13) 0%, transparent 68%);
          animation: orb 18s ease-in-out infinite alternate-reverse; }

        @keyframes orb {
          from { transform: translate(0,0); }
          to   { transform: translate(40px,30px); }
        }

        /* ── LAYOUT ── */
        .wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 780px;
          display: flex; flex-direction: column;
          align-items: center; gap: 48px;
        }

        /* ── HEADER ── */
        .header {
          text-align: center;
          display: flex; flex-direction: column;
          align-items: center; gap: 16px;
          animation: fade-up 0.6s ease both;
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-row {
          display: inline-flex; align-items: center; gap: 10px;
          text-decoration: none;
        }

        .logo-row img { height: 26px; width: auto; object-fit: contain; }

        .logo-word {
          font-family: var(--mono);
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase; color: #fff;
        }

        .tag {
          font-size: 10px; letter-spacing: 6px;
          color: var(--blue-light); text-transform: uppercase;
          padding: 5px 16px; border: 1px solid var(--border);
          position: relative;
          animation: pulse-b 3.5s ease-in-out infinite;
        }
        .tag::before { content: '◆ '; }
        .tag::after  { content: ' ◆'; }

        @keyframes pulse-b {
          0%,100% { border-color: rgba(91,43,255,0.22); }
          50%      { border-color: rgba(91,43,255,0.6); }
        }

        .title {
          font-family: var(--display);
          font-size: clamp(52px, 9vw, 92px);
          font-weight: 800; line-height: 0.88;
          letter-spacing: -3px;
          background: linear-gradient(135deg, #fff 0%, var(--blue-hi) 45%, var(--blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 12px; letter-spacing: 2.5px;
          color: var(--muted); text-transform: uppercase;
          max-width: 460px; line-height: 2;
        }

        /* ── CARD ── */
        .card {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 40px;
          position: relative;
          animation: fade-up 0.7s ease 0.1s both;
        }

        .card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--blue), var(--blue-light), transparent);
        }

        .card-corner {
          position: absolute; width: 18px; height: 18px;
          border-color: var(--blue); border-style: solid; opacity: 0.5;
        }
        .card-corner.tl { top:-1px; left:-1px; border-width:2px 0 0 2px; }
        .card-corner.br { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

        .field-label {
          font-size: 9px; letter-spacing: 4px;
          color: var(--blue-light); text-transform: uppercase;
          margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .field-label::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(90deg, var(--border), transparent);
        }

        .idea-input {
          width: 100%; min-height: 130px;
          background: transparent; border: none; outline: none;
          color: var(--text); font-family: var(--mono);
          font-size: 14px; line-height: 1.85; resize: vertical;
          caret-color: var(--blue-light);
        }
        .idea-input::placeholder { color: rgba(255,255,255,0.16); }

        .char-row {
          display: flex; justify-content: space-between;
          align-items: center; margin-top: 10px;
        }
        .char-count { font-size: 10px; color: var(--muted); letter-spacing: 1px; }

        .example-btn {
          font-size: 9px; letter-spacing: 2px;
          color: var(--blue-light); text-transform: uppercase;
          background: none; border: none; cursor: pointer;
          font-family: var(--mono); padding: 0;
          transition: color 0.2s;
        }
        .example-btn:hover { color: #fff; }

        .divider {
          width: 100%; height: 1px;
          background: var(--border);
          margin: 24px 0; position: relative;
        }
        .divider::after {
          content: '◆';
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%,-50%);
          font-size: 8px; color: var(--blue);
          background: var(--surface); padding: 0 8px;
        }

        /* Name toggle */
        .name-toggle {
          display: flex; gap: 12px; margin-bottom: 0;
        }

        .toggle-btn {
          flex: 1; padding: 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--mono); font-size: 11px;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .toggle-btn.active {
          border-color: var(--blue);
          color: var(--blue-light);
          background: rgba(91,43,255,0.08);
        }
        .toggle-btn:hover:not(.active) {
          border-color: rgba(91,43,255,0.4);
          color: rgba(255,255,255,0.6);
        }

        .name-input-wrap {
          margin-top: 16px;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease;
        }
        .name-input-wrap.open { max-height: 80px; }

        .name-input {
          width: 100%; background: transparent; border: none;
          border-bottom: 1px solid var(--border); outline: none;
          color: var(--text); font-family: var(--mono);
          font-size: 14px; padding: 8px 0;
          caret-color: var(--blue-light);
          transition: border-color 0.2s;
        }
        .name-input:focus { border-bottom-color: var(--blue-light); }
        .name-input::placeholder { color: rgba(255,255,255,0.16); }

        /* Generate button */
        .gen-btn {
          width: 100%; padding: 20px;
          background: var(--blue); border: none;
          color: #fff; font-family: var(--mono);
          font-size: 12px; letter-spacing: 5px;
          text-transform: uppercase; cursor: pointer;
          position: relative; overflow: hidden;
          transition: all 0.3s; margin-top: 24px;
        }

        .gen-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.3s;
        }
        .gen-btn::after {
          content: '';
          position: absolute; top: -100%; left: 0; right: 0; height: 100%;
          background: linear-gradient(transparent, rgba(255,255,255,0.06), transparent);
          transition: top 0.5s;
        }

        .gen-btn:hover:not(:disabled)::before { opacity: 1; }
        .gen-btn:hover:not(:disabled)::after  { top: 100%; }
        .gen-btn:hover:not(:disabled) {
          background: var(--blue-light);
          box-shadow: 0 0 40px rgba(91,43,255,0.55), 0 0 80px rgba(91,43,255,0.2);
          transform: translateY(-1px);
        }
        .gen-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .loading-bar {
          position: absolute; bottom: 0; left: 0;
          height: 2px; background: var(--blue-hi);
          animation: sweep 1.5s ease-in-out infinite;
        }
        @keyframes sweep {
          0%   { left:0;    width:0; }
          50%  { left:0;    width:100%; }
          100% { left:100%; width:0; }
        }

        /* ── OUTPUT CARD ── */
        .output-card {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          position: relative;
          animation: fade-up 0.5s ease both;
        }

        .output-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--blue), var(--blue-hi), transparent);
        }

        .output-header {
          padding: 28px 36px 20px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }

        .output-title-row {
          display: flex; flex-direction: column; gap: 4px;
        }

        .output-badge {
          font-size: 9px; letter-spacing: 4px;
          color: var(--blue-light); text-transform: uppercase;
        }

        .output-title {
          font-family: var(--display);
          font-size: 18px; font-weight: 700;
        }

        .output-section {
          padding: 24px 36px;
          border-bottom: 1px solid rgba(91,43,255,0.1);
        }
        .output-section:last-of-type { border-bottom: none; }

        .section-label {
          font-size: 9px; letter-spacing: 4px;
          color: var(--blue-light); text-transform: uppercase;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(90deg, var(--border), transparent);
        }

        .prompt-block {
          font-size: 13px; line-height: 1.9;
          color: rgba(255,255,255,0.75);
          white-space: pre-wrap; word-break: break-word;
          padding: 16px 20px;
          background: rgba(91,43,255,0.05);
          border-left: 2px solid var(--blue);
          margin-bottom: 16px;
        }
        .prompt-block:last-child { margin-bottom: 0; }

        .prompt-sub-label {
          font-size: 9px; letter-spacing: 3px;
          color: var(--muted); text-transform: uppercase;
          margin-bottom: 8px;
        }

        /* Stack grid */
        .stack-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .stack-item {
          padding: 14px 16px;
          border: 1px solid var(--border);
          background: rgba(91,43,255,0.04);
          display: flex; flex-direction: column; gap: 4px;
        }

        .stack-key {
          font-size: 9px; letter-spacing: 3px;
          color: var(--muted); text-transform: uppercase;
        }
        .stack-val {
          font-size: 13px; color: var(--blue-hi);
          letter-spacing: 0.5px;
        }

        /* Pills */
        .pill-row {
          display: flex; flex-wrap: wrap; gap: 10px;
        }

        .pill {
          padding: 6px 14px;
          border: 1px solid var(--border);
          font-size: 12px; color: rgba(255,255,255,0.6);
          background: rgba(91,43,255,0.06);
          letter-spacing: 0.5px;
          transition: all 0.2s; cursor: default;
        }

        .pill:hover {
          border-color: var(--blue-light);
          color: var(--blue-hi);
          background: rgba(91,43,255,0.12);
        }

        /* One liner */
        .one-liner {
          font-family: var(--display);
          font-size: 18px; font-weight: 700;
          line-height: 1.5;
          background: linear-gradient(135deg, #fff 0%, var(--blue-hi) 60%, var(--blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center; padding: 8px 0;
        }

        /* Actions */
        .output-actions {
          padding: 20px 36px 28px;
          display: flex; flex-direction: column; gap: 12px;
        }

        .btn-primary {
          padding: 16px; background: var(--blue); border: none;
          color: #fff; font-family: var(--mono);
          font-size: 11px; letter-spacing: 3px;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .btn-primary:hover {
          background: var(--blue-light);
          box-shadow: 0 0 28px rgba(91,43,255,0.45);
        }
        .btn-primary.copied {
          background: rgba(34,197,94,0.3);
          border: 1px solid rgba(34,197,94,0.5);
          color: #4ade80;
        }

        .btn-x {
          padding: 14px; background: transparent;
          border: 1px solid rgba(255,255,255,0.13);
          color: rgba(255,255,255,0.55); font-family: var(--mono);
          font-size: 11px; letter-spacing: 3px;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.3s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-x:hover { border-color: #1D9BF0; color: #1D9BF0; background: rgba(29,155,240,0.06); }

        .btn-ghost {
          padding: 14px; background: transparent;
          border: 1px solid rgba(255,255,255,0.07);
          color: var(--muted); font-family: var(--mono);
          font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: var(--border); color: rgba(255,255,255,0.55); }

        /* Error */
        .error-msg {
          width: 100%; padding: 20px 24px;
          border: 1px solid rgba(239,68,68,0.3);
          color: #EF4444; background: rgba(239,68,68,0.05);
          font-size: 13px; line-height: 1.7;
        }
        .error-prefix {
          font-size: 9px; letter-spacing: 4px;
          text-transform: uppercase; opacity: 0.6;
          display: block; margin-bottom: 6px;
        }

        /* Footer */
        .footer {
          text-align: center; font-size: 10px;
          letter-spacing: 2px; color: rgba(255,255,255,0.13);
          text-transform: uppercase; line-height: 2.2;
        }
        .footer a { color: var(--blue-light); text-decoration: none; opacity: 0.55; transition: opacity 0.2s; }
        .footer a:hover { opacity: 1; }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          .card, .output-section, .output-header, .output-actions { padding-left: 22px; padding-right: 22px; }
          .title { letter-spacing: -2px; }
          .stack-grid { grid-template-columns: 1fr 1fr; }
          .output-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="wrap">

          {/* ── HEADER ── */}
          <header className="header">
            <a href="https://arcapush.com" target="_blank" rel="noopener noreferrer" className="logo-row">
              <img src="/arcaprompt-logo.png" alt="ArcaPrompt" />
              <span className="logo-word">ArcaPrompt</span>
            </a>
            <div className="tag">Prompt Engineering</div>
            <h1 className="title">ArcaPrompt</h1>
            <p className="subtitle">
              Describe your idea. Get structured prompts,<br />
              a tech stack, and a name — ready to build.
            </p>
          </header>

          {/* ── INPUT CARD ── */}
          {uiState !== "success" && (
            <div className="card">
              <div className="card-corner tl" />
              <div className="card-corner br" />

              <div className="field-label">// What are you building?</div>
              <textarea
                className="idea-input"
                placeholder="e.g. A habit tracker that uses AI to suggest better habits based on your current ones and sends daily nudges via WhatsApp..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={uiState === "loading"}
                maxLength={5000}
              />
              <div className="char-row">
                <button className="example-btn" onClick={fillExample}>
                  ◆ Try an example
                </button>
                <span className="char-count">{idea.length} / 5000</span>
              </div>

              <div className="divider" />

              <div className="field-label">// Do you have a name already?</div>
              <div className="name-toggle">
                <button
                  className={`toggle-btn ${hasName === false ? "active" : ""}`}
                  onClick={() => setHasName(false)}
                  disabled={uiState === "loading"}
                >
                  Suggest one for me
                </button>
                <button
                  className={`toggle-btn ${hasName === true ? "active" : ""}`}
                  onClick={() => setHasName(true)}
                  disabled={uiState === "loading"}
                >
                  I have a name
                </button>
              </div>

              <div className={`name-input-wrap ${hasName === true ? "open" : ""}`}>
                <input
                  className="name-input"
                  placeholder="e.g. VibeTrack, Nudge, HabitOS..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={uiState === "loading"}
                  maxLength={60}
                />
              </div>

              <button
                className="gen-btn"
                onClick={handleGenerate}
                disabled={
                  uiState === "loading" ||
                  idea.trim().length < 20 ||
                  hasName === null
                }
              >
                {uiState === "loading" ? (
                  <>
                    <span>Building your prompt stack...</span>
                    <div className="loading-bar" />
                  </>
                ) : (
                  "Generate Prompt Stack →"
                )}
              </button>
            </div>
          )}

          {/* ── ERROR ── */}
          {uiState === "error" && (
            <div className="error-msg">
              <span className="error-prefix">// System Error</span>
              {errorMsg}
            </div>
          )}

          {/* ── OUTPUT ── */}
          {uiState === "success" && output && (
            <div className="output-card">
              <div className="output-header">
                <div className="output-title-row">
                  <span className="output-badge">✓ Prompt Stack Ready</span>
                  <span className="output-title">
                    {output.name_suggestions[0] || projectName || "Your Project"}
                  </span>
                </div>
              </div>

              {/* One liner */}
              <div className="output-section">
                <div className="section-label">// One-liner</div>
                <div className="one-liner">{output.one_liner}</div>
              </div>

              {/* Prompts */}
              <div className="output-section">
                <div className="section-label">// Prompt Stack</div>

                {[
                  { key: "system",      label: "System Prompt" },
                  { key: "build",       label: "Build Prompt" },
                  { key: "ux",          label: "UX & Design Prompt" },
                  { key: "edge_cases",  label: "Edge Cases Prompt" },
                ].map(({ key, label }) => (
                  <div key={key} style={{ marginBottom: "20px" }}>
                    <div className="prompt-sub-label">{label}</div>
                    <div className="prompt-block">
                      {output.prompts[key as keyof typeof output.prompts]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tech Stack */}
              <div className="output-section">
                <div className="section-label">// Tech Stack</div>
                <div className="stack-grid">
                  {Object.entries(output.tech_stack).map(([k, v]) => (
                    <div className="stack-item" key={k}>
                      <span className="stack-key">{k}</span>
                      <span className="stack-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Names */}
              {output.name_suggestions.length > 0 && (
                <div className="output-section">
                  <div className="section-label">// Name Suggestions</div>
                  <div className="pill-row">
                    {output.name_suggestions.map((n) => (
                      <span className="pill" key={n}>{n}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Domains */}
              {output.domain_suggestions.length > 0 && (
                <div className="output-section">
                  <div className="section-label">// Domain Suggestions</div>
                  <div className="pill-row">
                    {output.domain_suggestions.map((d) => (
                      <span className="pill" key={d}>{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="output-actions">
                <button
                  className={`btn-primary ${copied ? "copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? "✓ Copied to clipboard" : "↓ Copy full prompt stack"}
                </button>

                <button className="btn-x" onClick={shareToX}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </button>

                <button className="btn-ghost" onClick={reset}>
                  Build something else
                </button>
              </div>
            </div>
          )}

          {/* ── FOOTER ── */}
          <footer className="footer">
            <p>
              Powered by{" "}
              <a href="https://blindspotlab.xyz" target="_blank" rel="noopener noreferrer">blindspotlab.xyz</a>
              {" · "}
              Built by{" "}
              <a href="https://arcapush.com" target="_blank" rel="noopener noreferrer">Arcapush.com</a>
            </p>
            <p>
              Founder{" "}
              <a href="https://mojeeb.xyz" target="_blank" rel="noopener noreferrer">mojeeb.xyz</a>
              {" · "}
              <a href="https://x.com/MojeebMotion" target="_blank" rel="noopener noreferrer">@MojeebMotion</a>
              {" · "}
              Engine by{" "}
              <span style={{ color: "#4285F4", opacity: 0.7 }}>Gemini</span>
            </p>
          </footer>

        </div>
      </div>
    </>
  );
}