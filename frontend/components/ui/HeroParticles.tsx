"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 4 + (i % 4) * 2,
  left: `${8 + (i * 7) % 85}%`,
  top: `${10 + (i * 11) % 80}%`,
  delay: i * 0.4,
  duration: 4 + (i % 3),
}));

export function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-brand-secondary/30"
          style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
