import React, { useEffect, useState, useRef, useMemo } from 'react';
import { analyzeVibe, VIBE_CONFIG } from '@/lib/vibeAnalyzer';
import './VibeMeter.css';

/* ─── tiny sparkle particles ─── */
function Sparkle({ color, delay, x, y }) {
  return (
    <span
      className="vibe-sparkle"
      style={{
        '--sparkle-color': color,
        '--sparkle-delay': `${delay}ms`,
        '--sparkle-x': `${x}%`,
        '--sparkle-y': `${y}%`,
      }}
    />
  );
}

/* ─── individual vibe pill chip ─── */
function VibeChip({ vibe, score, maxScore, isActive }) {
  const cfg = VIBE_CONFIG[vibe];
  const fill = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;

  return (
    <div
      className={`vibe-chip ${isActive ? 'vibe-chip--active' : ''}`}
      style={{
        '--chip-color': cfg.textColor,
        '--chip-glow': cfg.bgGlow,
        '--chip-gradient': cfg.gradient,
      }}
    >
      <div className="vibe-chip__bar" style={{ width: `${fill}%` }} />
      <span className="vibe-chip__emoji">{cfg.emoji}</span>
      <span className="vibe-chip__label">{cfg.label}</span>
    </div>
  );
}

/* ═══════════ MAIN VibeMeter ═══════════ */
export default function VibeMeter({ text }) {
  const [result, setResult] = useState({ dominant: null, confidence: 0, scores: {} });
  const [visible, setVisible] = useState(false);
  const prevDominant = useRef(null);
  const [pulse, setPulse] = useState(false);

  // Debounced analysis
  useEffect(() => {
    const id = setTimeout(() => {
      const r = analyzeVibe(text);
      setResult(r);
      setVisible(!!r.dominant);

      if (r.dominant && r.dominant !== prevDominant.current) {
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
      prevDominant.current = r.dominant;
    }, 200);
    return () => clearTimeout(id);
  }, [text]);

  // Generate sparkles for the active vibe
  const sparkles = useMemo(() => {
    if (!result.dominant) return [];
    const cfg = VIBE_CONFIG[result.dominant];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      color: cfg.particleColor,
      delay: i * 120,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    }));
  }, [result.dominant]);

  if (!visible) return null;

  const activeCfg = VIBE_CONFIG[result.dominant];
  const maxScore = Math.max(...Object.values(result.scores), 1);

  return (
    <div className={`vibe-meter ${pulse ? 'vibe-meter--pulse' : ''}`}>
      {/* ── Sparkles ── */}
      <div className="vibe-meter__sparkles">
        {sparkles.map((s) => (
          <Sparkle key={s.id} {...s} />
        ))}
      </div>

      {/* ── Header ── */}
      <div className="vibe-meter__header">
        <div className="vibe-meter__title-row">
          <span className="vibe-meter__icon">⚡</span>
          <span className="vibe-meter__title">Vibe Meter</span>
        </div>
        <div
          className="vibe-meter__badge"
          style={{ background: activeCfg.gradient }}
        >
          <span>{activeCfg.emoji}</span>
          <span>{activeCfg.label}</span>
        </div>
      </div>

      {/* ── Description ── */}
      <p className="vibe-meter__desc" style={{ color: activeCfg.textColor }}>
        {activeCfg.description}
      </p>

      {/* ── Confidence bar ── */}
      <div className="vibe-meter__confidence">
        <div className="vibe-meter__conf-track">
          <div
            className="vibe-meter__conf-fill"
            style={{
              width: `${result.confidence}%`,
              background: activeCfg.gradient,
            }}
          />
        </div>
        <span className="vibe-meter__conf-label" style={{ color: activeCfg.textColor }}>
          {result.confidence}% confident
        </span>
      </div>

      {/* ── Breakdown chips ── */}
      <div className="vibe-meter__chips">
        {Object.entries(result.scores)
          .sort(([, a], [, b]) => b - a)
          .map(([vibe, score]) => (
            <VibeChip
              key={vibe}
              vibe={vibe}
              score={score}
              maxScore={maxScore}
              isActive={vibe === result.dominant}
            />
          ))}
      </div>
    </div>
  );
}
