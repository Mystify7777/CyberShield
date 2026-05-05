import { useEffect, useState } from "react";

const verdictClasses = {
  DANGEROUS: "text-red-700",
  RISKY: "text-red-600",
  CAUTION: "text-amber-600",
  SAFE: "text-emerald-600",
  STRONG: "text-blue-700"
};

const verdictCopy = {
  DANGEROUS: "Dangerous",
  RISKY: "Risky",
  CAUTION: "Caution",
  SAFE: "Safe",
  STRONG: "Strong"
};

export default function ScoreRing({ score = 0, verdict = "CAUTION" }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const startTime = performance.now();
    const durationMs = 900;

    const animate = (now) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(safeScore * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [safeScore]);

  const zoneStyle = {
    background: "conic-gradient(from 225deg, #ef4444 0deg 72deg, #f59e0b 72deg 144deg, #22c55e 144deg 252deg, #3b82f6 252deg 360deg)"
  };

  const markerAngle = 225 + safeScore * 2.7;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)]">
      <div className="rounded-2xl bg-linear-to-br from-slate-50 to-white p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold text-center">Risk Gauge</p>

        <div className="relative mx-auto mt-4 h-56 w-56">
          <div className="absolute inset-0 rounded-full p-[10px]" style={zoneStyle}>
            <div className="h-full w-full rounded-full bg-white shadow-inner" />
          </div>

          <div
            className="absolute left-1/2 top-1/2 h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-100 bg-white shadow-xs"
          />

          <div className="absolute inset-0 rounded-full">
            <div
              className="absolute left-1/2 top-1/2 h-[126px] w-[4px] -translate-x-1/2 -translate-y-1/2 origin-bottom rounded-full bg-slate-900/80 transition-transform duration-700 ease-out"
              style={{ transform: `translate(-50%, -100%) rotate(${markerAngle}deg)` }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-slate-900 bg-white shadow-md transition-transform duration-700 ease-out"
              style={{ transform: `translate(-50%, -50%) rotate(${markerAngle}deg) translateY(-112px)` }}
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-black tracking-tight text-slate-950">{displayScore}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">/ 100</p>
              <p className={`mt-4 text-sm font-bold uppercase tracking-[0.2em] ${verdictClasses[verdict] || "text-slate-700"}`}>
                {verdictCopy[verdict] || String(verdict).replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
          <span>Red</span>
          <span>Amber</span>
          <span>Green</span>
          <span>Blue</span>
        </div>
      </div>
    </div>
  );
}
