import { useEffect, useRef, useState } from "react";

export default function BreakthroughScene({ result, onDone }) {
  const [phase, setPhase] = useState("charge");
  const onDoneRef = useRef(onDone);

  // Simpan referensi terbaru TANPA trigger effect
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("burst"), 800);
    const t2 = setTimeout(() => setPhase("reveal"), 1800);
    const t3 = setTimeout(() => onDoneRef.current(), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []); // ← dependency KOSONG, hanya jalan sekali saat mount

  return (
    <div className="bt-scene" data-phase={phase}>
      <div className="bt-backdrop" />

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

      <div className="bt-char-wrap">
        <div className="bt-halo" />
        <img
          src="/characters/breakthrough.png"
          alt="Breakthrough"
          className="bt-char"
        />
        <div className="bt-shockwave" />
      </div>

      <div className="bt-text">
        {phase !== "charge" && (
          <>
            <div className="bt-title">BREAKTHROUGH</div>
            <div className="bt-sub">{result.realmName}</div>
            <div className="bt-level">{result.levelLabel}</div>
          </>
        )}
      </div>

      <div className="bt-flash" />
    </div>
  );
}
