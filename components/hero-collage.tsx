"use client";

import Image from "next/image";
import { motion } from "motion/react";

/**
 * Slow choreographed cycle. Only one pair animates at a time.
 * Phases (5 × 5s = 25s total):
 *  P1 left col  tile-0 grows, tile-1 shrinks
 *  P2 left col  tile-1 grows, tile-2 shrinks
 *  P3 right col tile-0 grows, tile-1 shrinks
 *  P4 right col tile-1 grows, tile-2 shrinks
 *  P5 columns   widths swap (left wide ↔ right wide)
 */
const CYCLE = 25;
const T = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] as const;
const tileTrans = {
  duration: CYCLE,
  repeat: Infinity,
  ease: "easeInOut" as const,
  times: [...T],
};

const tileKeys = {
  // index: [P1-start, P1-peak, P1-end, P2-peak, P2-end, P3-peak, P3-end, P4-peak, P4-end, P5-peak, end]
  L0: [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  L1: [1, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1],
  L2: [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  R0: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
  R1: [1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1],
  R2: [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
};

// Column widths animate only in P5 (peak at t=0.9, return at t=1)
const colKeys = {
  left: [1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 0.7, 1.4],
  right: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7, 1],
};

interface Tile {
  src: string;
  alt: string;
  priority?: boolean;
}

const leftTiles: Tile[] = [
  { src: "/hero-v3.jpg", alt: "Bangladesh market", priority: true },
  { src: "/hero-tile.jpg", alt: "Package exchange" },
  { src: "/hero-tile-5.jpg", alt: "Bicycle in Dhaka" },
];

const rightTiles: Tile[] = [
  { src: "/hero-tile-3.jpg", alt: "Classic cars Dhaka" },
  { src: "/hero-tile-2.jpg", alt: "Online shopping" },
  { src: "/hero-tile-4.jpg", alt: "Furniture" },
];

export function HeroCollage() {
  const leftKeys = [tileKeys.L0, tileKeys.L1, tileKeys.L2];
  const rightKeys = [tileKeys.R0, tileKeys.R1, tileKeys.R2];

  return (
    <div className="flex gap-3 h-[560px] md:h-[640px]">
      {/* LEFT column */}
      <motion.div
        animate={{ flexGrow: colKeys.left }}
        transition={tileTrans}
        className="flex flex-col gap-3 min-w-0"
        style={{ flexBasis: 0 }}
      >
        {leftTiles.map((t, i) => (
          <motion.div
            key={t.src}
            animate={{ flexGrow: leftKeys[i] }}
            transition={tileTrans}
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
        transition={tileTrans}
        className="flex flex-col gap-3 min-w-0"
        style={{ flexBasis: 0 }}
      >
        {rightTiles.map((t, i) => (
          <motion.div
            key={t.src}
            animate={{ flexGrow: rightKeys[i] }}
            transition={tileTrans}
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
