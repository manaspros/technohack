"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

export default function BootSequence() {
  const [bootPhase, setBootPhase] = useState(0);
  const [booted, setBooted] = useState(false);
  const pathname = usePathname();

  // Reset boot sequence on navigation
  useEffect(() => {
    // Check local storage to see if we've already booted

    const bootSequence = [
      "Initializing core systems...",
      "Loading neural pathways...",
      "Calibrating multimodal processors...",
      "Establishing memory connections...",
      "Engaging vision modules...",
      "Starting audio analyzers...",
      "Loading UI components...",
      "System ready.",
    ];

    let currentPhase = 0;

    const advancePhase = () => {
      if (currentPhase < bootSequence.length - 1) {
        currentPhase++;
        setBootPhase(currentPhase);
        setTimeout(
          advancePhase,
          currentPhase === bootSequence.length - 2 ? 1000 : 300
        );
      } else {
        setTimeout(() => {
          setBooted(true);
          // Store boot state in local storage
        }, 3200);
      }
    };

    // Start boot sequence after a small delay
    setTimeout(advancePhase, 600);

    // Cleanup
    return () => {
      currentPhase = bootSequence.length;
    };
  }, []);

  const bootSequence = [
    "Initializing core systems...",
    "Loading neural pathways...",
    "Calibrating multimodal processors...",
    "Establishing memory connections...",
    "Engaging vision modules...",
    "Starting audio analyzers...",
    "Loading UI components...",
    "System ready.",
  ];

  // Skip boot on page navigation/reload
  if (booted) return null;

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black z-[999] flex flex-col items-center justify-center"
        >
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h1 className="font-pixel text-green-500 text-xl md:text-2xl mb-2">
                RETRO PIXEL AI
              </h1>
              <p className="font-mono text-green-400 text-sm">
                v1.0.2 BOOTING SEQUENCE
              </p>
            </div>

            <div className="bg-gray-900 border-2 border-green-500/30 p-4 font-mono text-sm">
              <div className="h-48 overflow-hidden">
                {bootSequence.slice(0, bootPhase + 1).map((text, index) => (
                  <div key={index} className="flex mb-2">
                    <span className="text-green-500 mr-2">&gt;</span>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-green-300 ${
                        index === bootPhase
                          ? 'after:content-["_"] after:animate-blink'
                          : ""
                      }`}
                    >
                      {text}
                    </motion.div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-green-500/30 pt-4">
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (bootPhase + 1) * (100 / bootSequence.length)
                      }%`,
                    }}
                    className="h-full bg-green-500"
                  />
                </div>
                <div className="mt-2 text-right text-green-400 text-xs">
                  {Math.round((bootPhase + 1) * (100 / bootSequence.length))}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
