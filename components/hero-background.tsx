"use client";

import { motion } from "motion/react";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large blurred orb - top left */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-secondary/40 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Large blurred orb - bottom right */}
      <motion.div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Medium orb - center */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-72 h-72 bg-secondary/30 rounded-full blur-3xl"
        animate={{
          x: ["-50%", "-40%", "-50%"],
          y: ["-50%", "-60%", "-50%"],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small accent orb */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-48 h-48 bg-white/15 rounded-full blur-2xl"
        animate={{
          y: [0, -20, 0],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
