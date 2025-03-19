"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface PixelLoaderProps {
  size?: "small" | "medium" | "large";
  color?: string;
  className?: string;
  text?: string;
}

export default function PixelLoader({
  size = "medium",
  color = "#4ade80",
  className,
  text = "Loading",
}: PixelLoaderProps) {
  const [dots, setDots] = useState("");

  // Make loading dots animate
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Calculate pixel size and grid based on the size prop
  const getPixelSize = () => {
    switch (size) {
      case "small":
        return {
          blockSize: "4px",
          containerSize: "40px",
          thickness: "4px",
        };
      case "large":
        return {
          blockSize: "8px",
          containerSize: "80px",
          thickness: "8px",
        };
      default:
        return {
          blockSize: "6px",
          containerSize: "60px",
          thickness: "6px",
        };
    }
  };

  const { blockSize, containerSize, thickness } = getPixelSize();

  const pixelGrid = [
    // Outer border - top
    { x: 0, y: 0, width: 11, height: 1 },
    // Outer border - left
    { x: 0, y: 0, width: 1, height: 11 },
    // Outer border - bottom
    { x: 0, y: 10, width: 11, height: 1 },
    // Outer border - right
    { x: 10, y: 0, width: 1, height: 11 },
    // Inner animation elements
    { x: 2, y: 2, width: 3, height: 3, animate: true, delay: 0 },
    { x: 6, y: 2, width: 3, height: 3, animate: true, delay: 0.2 },
    { x: 2, y: 6, width: 3, height: 3, animate: true, delay: 0.4 },
    { x: 6, y: 6, width: 3, height: 3, animate: true, delay: 0.6 },
  ];

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className="relative"
        style={{ width: containerSize, height: containerSize }}
      >
        {pixelGrid.map((pixel, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: `calc(${pixel.x} * ${blockSize})`,
              top: `calc(${pixel.y} * ${blockSize})`,
              width: `calc(${pixel.width} * ${blockSize})`,
              height: `calc(${pixel.height} * ${blockSize})`,
              backgroundColor: color,
            }}
            animate={
              pixel.animate
                ? {
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }
                : {}
            }
            transition={
              pixel.animate
                ? {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: pixel.delay,
                  }
                : {}
            }
          />
        ))}
      </div>

      {text && (
        <div className="font-pixel text-center text-green-400">
          {text}
          <span>{dots}</span>
        </div>
      )}
    </div>
  );
}
