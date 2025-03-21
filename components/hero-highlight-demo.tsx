"use client";
import { motion } from "motion/react";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { BlinkingCursor } from "@/components/ui/blinking-cursor";

export default function HeroHighlightDemo() {
  return (
    <HeroHighlight containerClassName="h-[30rem] md:h-[35rem] relative">
      {/* Add gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900/90 z-0"></div>

      {/* Add scanlines for retro effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20 z-0"></div>

      <div className="flex flex-col pt-6 items-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 w-24 h-24 bg-black rounded-lg border-4 border-green-400 flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.8)_0%,transparent_70%)]"></div>
          <div className="w-16 h-16 relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-green-400 animate-ping opacity-30"></div>
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10 text-green-400 fill-current drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
            >
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z"></path>
            </svg>
          </div>
        </motion.div>

        {/* Add a light backdrop for text contrast */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-gray-900/80 opacity-80 z-0"></div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1], delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-6xl font-bold text-green-400 max-w-4xl font-pixel mb-4 text-center leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] z-10"
        >
          Multimodal AI
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1], delay: 0.6 }}
          className="text-xl md:text-2xl lg:text-3xl font-bold text-green-400 dark:text-green-400 max-w-4xl text-center font-pixel mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10"
        >
          Can{" "}
          <Highlight className="text-black dark:text-black bg-green-500 px-4 py-1.5 rounded-md outline outline-2 outline-green-300 shadow-[0_0_10px_rgba(74,222,128,0.8)]">
            See • Hear • Understand
          </Highlight>{" "}
          Everything
        </motion.h2>

        {/* Add glowing box around text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="bg-gray-900/80 border-2 border-green-500/50 px-6 py-4 rounded-lg shadow-[0_0_15px_rgba(74,222,128,0.3)] mb-8 backdrop-blur-sm"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="text-lg md:text-xl font-mono text-green-300 flex items-center"
          >
            Ready to analyze your content <BlinkingCursor />
          </motion.p>
        </motion.div>
      </div>
    </HeroHighlight>
  );
}
