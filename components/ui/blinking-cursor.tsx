import { motion } from "framer-motion";

export const BlinkingCursor = () => {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatDelay: 0.2,
      }}
      className="inline-block ml-1 w-3 h-5 bg-green-400"
    />
  );
};
