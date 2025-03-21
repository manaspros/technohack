"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

export default function CrtEffect() {
  const [intensity, setIntensity] = useState(0.04); // Default subtle flicker
  const [active, setActive] = useState(true);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setIntensity(0.01); // Minimal effect for reduced motion preference
      setActive(false); // Disable scanlines for reduced motion
    }

    // Create random flicker effect
    const flickerInterval = setInterval(() => {
      // Random subtle flicker
      const randomFlicker = Math.random() * 0.03 + 0.02;
      setIntensity(randomFlicker);

      // Occasional more noticeable flicker
      if (Math.random() > 0.98) {
        setTimeout(() => {
          setIntensity(0.15);
          setTimeout(() => {
            setIntensity(0.04);
          }, 50);
        }, 50);
      }
    }, 5000);

    return () => clearInterval(flickerInterval);
  }, []);

  if (!active) return null;

  return (
    <>
      {/* CRT screen overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-overlay">
        {/* Scanlines */}
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 50%)`,
            backgroundSize: "100% 4px",
            opacity: 0.3,
          }}
        />

        {/* Screen flicker */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0"
          animate={{ opacity: [0, intensity, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            times: [0, 0.1, 0.2],
            repeatDelay: Math.random() * 5 + 5,
          }}
        />

        {/* CRT curvature vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.2) 100%)",
          }}
        />
      </div>
    </>
  );
}
