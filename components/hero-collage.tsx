"use client";

import Image from "next/image";
import { motion } from "motion/react";

/**
 * Pattern per swap: zoom-in (1.5s) → HOLD at zoomed (3s) → zoom-out (1.5s) → REST (2s).
 * 4 swaps × 8s = 32s cycle.
 *  P1 (0–8s)   L0 zoom-in / L1 collapse
 *  P2 (8–16s)  R0 zoom-in / R1 collapse
 *  P3 (16–24s) R1 zoom-in / R2 collapse
 *  P4 (24–32s) column widths swap
 */
const CYCLE = 32;

// 17 keyframe timestamps, normalized 0..1
// per phase: start, peak, hold-end, return, rest-end
const T = [
  0,
  1.5  / 32,  // P1 peak
  4.5  / 32,  // P1 hold-end
  6    / 32,  // P1 return
  8    / 32,  // P1 rest-end / P2 start
  9.5  / 32,  // P2 peak
  12.5 / 32,  // P2 hold-end
  14   / 32,  // P2 return
  16   / 32,  // P2 rest-end / P3 start
  17.5 / 32,  // P3 peak
  20.5 / 32,  // P3 hold-end
  22   / 32,  // P3 return
  24   / 32,  // P3 rest-end / P4 start
  25.5 / 32,  // P4 peak
  28.5 / 32,  // P4 hold-end
  30   / 32,  // P4 return
  1,          // cycle end
];

const trans = {
  duration: CYCLE,
  repeat: Infinity,
  ease: "easeInOut" as const,
  times: T,
};

const tileKeys = {
  // grows during P1 (positions 1–2 at value 2)
  L0: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  L1: [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // grows during P2
  R0: [1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // collapses P2, grows P3
  R1: [1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1],
  // collapses P3
  R2: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
};

const colKeys = {
  // col widths swap during P4 (positions 13–14)
  left:  [1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 0.7, 0.7, 1.4, 1.4],
  right: [1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1.7, 1.7, 1,   1],
};

interface Tile {
  src: string;
  alt: string;
  priority?: boolean;
}

const leftTiles: Tile[] = [
  { src: "/hero-v3.jpg", alt: "Bangladesh market", priority: true },
  { src: "/hero-tile.jpg", alt: "Package exchange" },
];

const rightTiles: Tile[] = [
  { src: "/hero-tile-3.jpg", alt: "Classic cars Dhaka" },
  { src: "/hero-tile-2.jpg", alt: "Online shopping" },
  { src: "/hero-tile-4.jpg", alt: "Furniture" },
];

export function HeroCollage() {
  const leftKeys = [tileKeys.L0, tileKeys.L1];
  const rightKeys = [tileKeys.R0, tileKeys.R1, tileKeys.R2];

  return (
    <div className="flex gap-3 h-[560px] md:h-[640px]">
      {/* LEFT column */}
      <motion.div
        animate={{ flexGrow: colKeys.left }}
        transition={trans}
        className="flex flex-col gap-3 min-w-0"
        style={{ flexBasis: 0 }}
      >
        {leftTiles.map((t, i) => (
          <motion.div
            key={t.src}
            animate={{ flexGrow: leftKeys[i] }}
            transition={trans}
            className="relative overflow-hidden bg-neutral-100 min-h-0"
          >
            <Image
              src={t.src}
              alt={t.alt}
              fill
              priority={t.priority}
              sizes="(min-width: 1024px) 30vw, 60vw"
              className="object-cover"
              quality={90}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* RIGHT column */}
      <motion.div
        animate={{ flexGrow: colKeys.right }}
        transition={trans}
        className="flex flex-col gap-3 min-w-0"
        style={{ flexBasis: 0 }}
      >
        {rightTiles.map((t, i) => (
          <motion.div
            key={t.src}
            animate={{ flexGrow: rightKeys[i] }}
            transition={trans}
            className="relative overflow-hidden bg-neutral-100 min-h-0"
          >
            <Image
              src={t.src}
              alt={t.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
              quality={90}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
