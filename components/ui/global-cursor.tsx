"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue } from "motion/react";

export default function GlobalCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => {
      cursorX.set(-100);
      cursorY.set(-100);
      setIsVisible(false);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        x: cursorX,
        y: cursorY,
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isClicking ? 0.8 : 1,
      }}
      transition={{
        scale: {
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        },
        opacity: {
          duration: 0.2,
        },
      }}
    >
      {/* Simple pixel-art cursor - no rotation */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 -translate-x-1/2 -translate-y-1/2"
      >
        {/* Main cursor shape */}
        <rect x="9" y="6" width="6" height="3" fill="#4ade80" />
        <rect x="6" y="9" width="12" height="6" fill="#4ade80" />
        <rect x="9" y="15" width="6" height="3" fill="#4ade80" />

        {/* Inner cursor detail */}
        <rect x="9" y="9" width="6" height="6" fill="#111827" />
      </svg>
    </motion.div>
  );
}
