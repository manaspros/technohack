"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface PixelSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  type?: "spinner" | "dots" | "blocks" | "scan";
  color?: string;
  className?: string;
}

export function PixelSpinner({
  size = "md",
  type = "spinner",
  color = "#4ade80",
  className,
}: PixelSpinnerProps) {
  // Size mappings
  const sizeMap = {
    xs: {
      container: "w-4 h-4",
      pixel: "w-1 h-1",
    },
    sm: {
      container: "w-6 h-6",
      pixel: "w-1.5 h-1.5",
    },
    md: {
      container: "w-8 h-8",
      pixel: "w-2 h-2",
    },
    lg: {
      container: "w-12 h-12",
      pixel: "w-3 h-3",
    },
  };

  if (type === "dots") {
    return (
      <div
        className={cn("flex space-x-1 items-center justify-center", className)}
      >
        <div className="pixel-loading-dots flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(sizeMap[size].pixel, "bg-current rounded-sm")}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "blocks") {
    return (
      <div
        className={cn(
          "grid grid-cols-3 grid-rows-3 gap-0.5",
          sizeMap[size].container,
          className
        )}
      >
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-current rounded-sm"
            style={{ backgroundColor: color }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "scan") {
    return (
      <div
        className={cn("relative", sizeMap[size].container, className)}
        style={{ borderColor: color }}
      >
        <div
          className="absolute inset-0 border-2 rounded"
          style={{ borderColor: color }}
        ></div>
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1/3 bg-current opacity-40"
          style={{ backgroundColor: color }}
          animate={{
            left: ["0%", "66%", "0%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  // Default spinner (rotating pixels)
  return (
    <div className={cn("relative", sizeMap[size].container, className)}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.div
            key={i}
            className={cn("absolute", sizeMap[size].pixel)}
            style={{
              backgroundColor: color,
              top: "0px",
              left: "50%",
              marginLeft: `-${
                parseInt(sizeMap[size].pixel.split("w-")[1]) / 2
              }rem`,
              transformOrigin: `50% ${
                parseInt(sizeMap[size].container.split("w-")[1]) / 2
              }rem`,
              transform: `rotate(${angle}deg) translateY(${
                parseInt(sizeMap[size].container.split("w-")[1]) / 4
              }rem)`,
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
