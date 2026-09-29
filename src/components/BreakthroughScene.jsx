import { useEffect, useState } from "react";

export default function BreakthroughScene({ result, onDone }) {
  const [phase, setPhase] = useState("charge"); // charge → burst → reveal

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("burst"), 800);
    const t2 = setTimeout(() => setPhase("reveal"), 1800);
    const t3 = setTimeout(() => onDone(), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div className="bt-scene" data-phase={phase}>
      {/* Layer 1: Backdrop */}
      <div className="bt-backdrop" />

      {/* Layer 2: Partikel Qi */}
      <div className="bt-particles">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="bt-particle"
            style={{
              "--angle": `${i * 15}deg`,
              "--delay": `${(i % 8) * 0.15}s`,
              "--dist": `${120 + (i % 5) * 40}px`,
            }}
          />
        ))}
      </div>

      {/* Layer 3: Karakter dengan efek */}
      <div className="bt-char-wrap">
        <div className="bt-halo" />
        <img
          src="/characters/breakthrough.png"
          alt="Breakthrough"
          className="bt-char"
        />
        <div className="bt-shockwave" />
      </div>

      {/* Layer 4: Teks */}
      <div className="bt-text">
        {phase !== "charge" && (
          <>
            <div className="bt-title">BREAKTHROUGH</div>
            <div className="bt-sub">{result.realmName}</div>
            <div className="bt-level">{result.levelLabel}</div>
          </>
        )}
      </div>

      {/* Layer 5: Flash */}
      <div className="bt-flash" />
    </div>
  );
}
