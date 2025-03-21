"use client";
import { cn } from "@/lib/utils";
import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import React from "react";

export const HeroHighlight = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  // Enhanced SVG patterns that are more visible
  const dotPatterns = {
    light: {
      default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='rgba(212,212,212,0.7)' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
      hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Crect fill='rgba(74,222,128,0.9)' id='pattern-square' x='8' y='8' width='4' height='4'%3E%3C/rect%3E%3C/svg%3E")`,
    },
    dark: {
      default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Crect fill='rgba(64,64,64,0.7)' id='pattern-square' x='8' y='8' width='4' height='4'%3E%3C/rect%3E%3C/svg%3E")`,
      hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Crect fill='rgba(74,222,128,0.9)' id='pattern-square' x='8' y='8' width='4' height='4'%3E%3C/rect%3E%3C/svg%3E")`,
    },
  };

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative flex h-[40rem] w-full items-center justify-center bg-gray-900 dark:bg-black overflow-hidden",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Enhanced background with a subtle linear gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 z-0"></div>

      {/* Background scanlines for retro effect - enhanced visibility */}
      <div className="absolute inset-0 z-0 bg-[length:4px_4px] opacity-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.5)_50%,rgba(255,255,255,0)_100%)]"></div>

      <div
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          backgroundImage: dotPatterns.light.default,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: dotPatterns.dark.default,
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 dark:hidden"
        style={{
          backgroundImage: dotPatterns.light.hover,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 hidden opacity-0 transition duration-300 group-hover:opacity-100 dark:block"
        style={{
          backgroundImage: dotPatterns.dark.hover,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
        }}
      />

      <div className={cn("relative z-20", className)}>{children}</div>
    </div>
  );
};

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  // Using a different animation approach to achieve a similar pixelated effect
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    // Start animation after a delay
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className={cn(
        `relative inline-block rounded-lg px-3 py-1.5 font-pixel overflow-hidden`,
        className
      )}
    >
      {/* Enhanced background animation with increased visibility */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ width: "0%" }}
        animate={{
          width: isAnimating ? "100%" : "0%",
          background: isAnimating
            ? [
                "linear-gradient(90deg, #4ade80 0%, #4ade80 100%)",
                "linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #4ade80 100%)",
                "linear-gradient(90deg, #4ade80 0%, #10b981 50%, #4ade80 100%)",
              ]
            : "linear-gradient(90deg, #4ade80 0%, #4ade80 100%)",
        }}
        transition={{
          width: {
            duration: 1.5,
            ease: [0, 0.5, 0.5, 1],
          },
          background: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
      />

      {/* Add subtle pixelated noise pattern for texture */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-repeat bg-[length:4px_4px] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 2 2%22%3E%3Cpath d=%22M1 2V1H0v1zm1-1V0H1v1z%22 fill=%22%23fff%22/%3E%3C/svg%3E')] -z-10"></div>

      {/* Add inner shadow for depth */}
      <div className="absolute inset-0 shadow-[inset_0_0_4px_rgba(0,0,0,0.3)] -z-10"></div>

      {/* Enhanced text with better contrast */}
      <span className="relative z-10 font-bold tracking-wider">{children}</span>
    </span>
  );
};
