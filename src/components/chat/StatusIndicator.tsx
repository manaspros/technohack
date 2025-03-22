import { motion, AnimatePresence } from "motion/react";
import { ChevronUp } from "lucide-react";

interface StatusIndicatorProps {
  showStatusMessage: boolean;
  statusMessage: string;
  showScrollTop: boolean;
  onScrollToTop: () => void;
}

export function StatusIndicator({
  showStatusMessage,
  statusMessage,
  showScrollTop,
  onScrollToTop,
}: StatusIndicatorProps) {
  return (
    <>
      {/* Scroll to top button - only visible when scrolled down */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-4 p-2 rounded-full bg-gray-800 text-green-400 border border-green-500/30 shadow-lg z-10 touch-manipulation"
            onClick={onScrollToTop}
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Status message display */}
      <AnimatePresence>
        {showStatusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-green-400 px-3 py-1.5 rounded-md border border-green-500/30 font-mono text-xs shadow-lg z-50"
          >
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
