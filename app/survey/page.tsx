"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";

const ENTRIES_RAW = [
  "###496939", "###531755", "###658965", "###462227", "###036894",
  "###285646", "###967073", "###556725", "###244031", "###405122",
  "###355026", "###244031", "###434664", "###599272", "###873879",
  "###532525", "###667443", "###316308", "###101110", "###667852",
  "###935760", "###270841", "###624857", "###189795", "###734955",
  "###145945", "###272117", "###234861", "###500814", "###731549",
  "###820841", "###149182", "###089537", "###822547", "###188444",
  "###386541", "###188299", "###180880", "###902290", "###610342",
  "###610342", "###040630", "###425396", "###244031", "###001807",
  "###340672", "###555372", "###365551", "###463047", "###644390",
  "###427461", "###743512", "###086205", "###500175", "###180154",
  "###846449", "###846449", "###486169", "###455320", "###187014",
  "###508495", "###070754", "###275306", "###088834", "###181884",
  "###578549", "###436751", "###281645", "###676282", "###692386",
  "###744941", "###744941", "###474794", "###243467", "###180600",
  "###669038", "###407710", "###022928", "###022928",
];

const ITEM_HEIGHT = 56;
const VISIBLE_COUNT = 9;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const CENTER_OFFSET = Math.floor(VISIBLE_COUNT / 2);

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#F7DC6F", "#BB8FCE"];
    const pieces: { x: number; y: number; w: number; h: number; color: string; vx: number; vy: number; rot: number; vr: number }[] = [];

    for (let i = 0; i < 250; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 14 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
      });
    }

    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height / 1.2);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

export default function SurveySpinnerPage() {
  const entries = useMemo(
    () => ENTRIES_RAW.map((display, i) => ({ id: i + 1, display })),
    []
  );

  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<(typeof entries)[0] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>(0);

  const totalHeight = entries.length * ITEM_HEIGHT;

  const wrapY = useCallback(
    (y: number) => ((y % totalHeight) + totalHeight) % totalHeight,
    [totalHeight]
  );

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    const winnerIdx = Math.floor(Math.random() * entries.length);
    const targetY = winnerIdx * ITEM_HEIGHT;

    // Spin at least 5 full loops + land on winner
    const fullLoops = 5 + Math.floor(Math.random() * 3);
    const currentWrapped = wrapY(scrollY);
    const distanceToTarget =
      fullLoops * totalHeight + ((targetY - currentWrapped + totalHeight) % totalHeight);

    const finalY = scrollY + distanceToTarget;
    const duration = 5000 + Math.random() * 1500;
    const startY = scrollY;
    const startTime = performance.now();

    // Custom easing: fast start, dramatic slow-down at the end
    const easeOutExpo = (t: number) => {
      if (t >= 0.85) {
        // Extra dramatic slowdown for final stretch
        const sub = (t - 0.85) / 0.15;
        const base = 1 - Math.pow(2, -10 * 0.85);
        const remaining = 1 - base;
        return base + remaining * (1 - Math.pow(1 - sub, 4));
      }
      return 1 - Math.pow(2, -10 * t);
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const currentY = startY + distanceToTarget * eased;

      setScrollY(currentY);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setScrollY(finalY);
        setSpinning(false);
        setWinner(entries[winnerIdx]);
        setTimeout(() => setShowConfetti(true), 200);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [spinning, scrollY, entries, totalHeight, wrapY]);

  const reset = useCallback(() => {
    setWinner(null);
    setShowConfetti(false);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Build the visible items based on scroll position
  const visibleItems = useMemo(() => {
    const wrapped = wrapY(scrollY);
    const centerIdx = wrapped / ITEM_HEIGHT;
    const items: { entry: (typeof entries)[0]; offsetPx: number; distFromCenter: number }[] = [];

    for (let i = -CENTER_OFFSET - 1; i <= CENTER_OFFSET + 1; i++) {
      const rawIdx = Math.floor(centerIdx) + i;
      const entryIdx = ((rawIdx % entries.length) + entries.length) % entries.length;
      const itemY = rawIdx * ITEM_HEIGHT;
      const offsetPx = itemY - wrapped;
      const distFromCenter = Math.abs(offsetPx) / ITEM_HEIGHT;
      items.push({ entry: entries[entryIdx], offsetPx, distFromCenter });
    }
    return items;
  }, [scrollY, entries, wrapY]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-4 overflow-hidden relative select-none">
      {showConfetti && <Confetti />}

      {/* Background pulses */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full border border-yellow-500/10 animate-ping"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full border border-yellow-500/5 animate-ping"
          style={{ animationDuration: "2s" }}
        />
      </div>

      {/* Title */}
      <div className="mb-10 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 tracking-tight">
          LUCKY DRAW
        </h1>
        <p className="text-gray-400 mt-2 text-lg tracking-widest uppercase">
          {entries.length} Participants
        </p>
      </div>

      {/* Spinner reel */}
      <div className="relative z-10 mb-8">
        <div
          className={`
            relative w-[320px] md:w-[400px] rounded-2xl overflow-hidden
            border-2 transition-all duration-700
            ${winner
              ? "border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)]"
              : "border-gray-700/80 shadow-2xl"
            }
            bg-gray-900/90 backdrop-blur-sm
          `}
          style={{ height: VIEWPORT_HEIGHT }}
        >
          {/* Reel items */}
          <div className="relative w-full h-full">
            {visibleItems.map(({ entry, offsetPx, distFromCenter }, i) => {
              const y = VIEWPORT_HEIGHT / 2 + offsetPx - ITEM_HEIGHT / 2;
              const opacity = Math.max(0, 1 - distFromCenter * 0.28);
              const scale = 1 - distFromCenter * 0.08;
              const blur = distFromCenter * 1.8;
              const isCenter = distFromCenter < 0.5;

              return (
                <div
                  key={i}
                  className="absolute left-0 right-0 flex items-center justify-center gap-3"
                  style={{
                    height: ITEM_HEIGHT,
                    top: 0,
                    transform: `translateY(${y}px) scale(${scale})`,
                    opacity,
                    filter: `blur(${blur}px)`,
                    willChange: "transform, opacity, filter",
                  }}
                >
                  <span className="text-gray-500 font-mono text-sm w-8 text-right tabular-nums">
                    {String(entry.id).padStart(2, "0")}
                  </span>
                  <span
                    className={`
                      font-mono text-2xl md:text-3xl font-bold tracking-widest
                      ${isCenter
                        ? winner
                          ? "text-yellow-400 drop-shadow-[0_0_16px_rgba(250,204,21,0.7)]"
                          : "text-white"
                        : "text-gray-500"
                      }
                    `}
                  >
                    {entry.display}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center selector bar */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: VIEWPORT_HEIGHT / 2 - ITEM_HEIGHT / 2,
              height: ITEM_HEIGHT,
            }}
          >
            <div
              className={`
                w-full h-full border-y-2 transition-all duration-500
                ${winner
                  ? "border-yellow-400/70 bg-yellow-400/[0.06]"
                  : "border-amber-500/25 bg-white/[0.015]"
                }
              `}
            />
          </div>

          {/* Gradient masks */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-900 via-gray-900/80 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pointer-events-none" />

          {/* Side glow lines */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-14 bg-gradient-to-b from-transparent via-yellow-400/80 to-transparent rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-14 bg-gradient-to-b from-transparent via-yellow-400/80 to-transparent rounded-full" />
        </div>

        {/* Pointer triangle */}
        <div className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-20">
          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[14px] border-r-yellow-400 rotate-180 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
        </div>
        <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-20">
          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[14px] border-r-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
        </div>
      </div>

      {/* Winner announcement */}
      {winner && (
        <div className="relative z-10 mb-6 text-center animate-in fade-in zoom-in-95 duration-500">
          <p className="text-gray-400 text-sm uppercase tracking-[0.3em] mb-2">
            Winner
          </p>
          <p className="text-5xl md:text-6xl font-black text-yellow-400 font-mono tracking-widest drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-pulse">
            {winner.display}
          </p>
          <p className="text-gray-500 text-sm mt-2">Entry #{winner.id}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="relative z-10 flex gap-4">
        <button
          onClick={spin}
          disabled={spinning}
          className={`
            px-14 py-4 rounded-xl text-lg font-bold uppercase tracking-widest
            transition-all duration-300
            ${spinning
              ? "bg-gray-700 text-gray-400 cursor-not-allowed scale-95"
              : "bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 hover:from-yellow-400 hover:to-amber-400 hover:scale-105 hover:shadow-[0_0_40px_rgba(250,204,21,0.3)] active:scale-95"
            }
          `}
        >
          {spinning ? "Spinning..." : winner ? "Spin Again" : "Spin"}
        </button>
        {winner && !spinning && (
          <button
            onClick={reset}
            className="px-6 py-4 rounded-xl text-lg font-bold uppercase tracking-widest bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {/* Footer badge */}
      <div className="relative z-10 mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-gray-400 text-sm font-mono">
          {entries.length} entries loaded
        </span>
      </div>
    </div>
  );
}
