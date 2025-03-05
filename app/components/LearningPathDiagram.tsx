"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, Code, Lightbulb, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: "prerequisite" | "core" | "practice" | "advanced";
}

interface LearningPathDiagramProps {
  steps: LearningStep[];
  className?: string;
}

const iconMap = {
  prerequisite: <BookOpen className="h-4 w-4" />,
  core: <Code className="h-4 w-4" />,
  practice: <Zap className="h-4 w-4" />,
  advanced: <Lightbulb className="h-4 w-4" />,
};

const colorMap = {
  prerequisite: "from-blue-600 to-blue-800 border-blue-500",
  core: "from-green-600 to-green-800 border-green-500",
  practice: "from-yellow-600 to-yellow-800 border-yellow-500",
  advanced: "from-purple-600 to-purple-800 border-purple-500",
};

// Safely render text to ensure no markdown or HTML symbols remain
const SafeTextDisplay = ({ text }: { text: string }) => {
  // Final safety check to ensure no asterisks or markdown symbols remain
  const cleanedText = text
    .replace(/\*/g, "") // Remove any remaining asterisks
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return <span>{cleanedText}</span>;
};

const LearningPathDiagram: React.FC<LearningPathDiagramProps> = ({
  steps,
  className,
}) => {
  return (
    <div className={cn("w-full my-6 px-2", className)}>
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col mb-8 relative">
            {/* Node and content container */}
            <motion.div
              className="flex items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step node */}
              <div
                className={cn(
                  "min-w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br border-2 shadow-lg text-white font-bold",
                  colorMap[step.type]
                )}
              >
                {iconMap[step.type]}
              </div>

              {/* Content with safe text display */}
              <div className="ml-4 bg-gray-900 p-3 rounded-md flex-grow border-l-2 border-gray-700">
                <h3
                  className={cn(
                    "font-bold",
                    step.type === "prerequisite"
                      ? "text-blue-400"
                      : step.type === "core"
                      ? "text-green-400"
                      : step.type === "practice"
                      ? "text-yellow-400"
                      : "text-purple-400"
                  )}
                >
                  <SafeTextDisplay text={step.title} />
                </h3>
                <p className="text-xs mt-1 text-gray-300">
                  <SafeTextDisplay text={step.description} />
                </p>
              </div>
            </motion.div>

            {/* Arrow to next step */}
            {index < steps.length - 1 && (
              <motion.div
                className="absolute left-6 top-12 h-8 flex items-center justify-center -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <div className="w-0.5 h-full bg-gray-600 rounded-full"></div>
                <ChevronRight className="absolute bottom-0 text-gray-400 -translate-x-1/2 translate-y-3" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathDiagram;
