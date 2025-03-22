import { cn } from "@/lib/utils";
import { BrainCircuit, Globe } from "lucide-react";

interface FeatureBadgesProps {
  chatSettings?: {
    memory?: boolean;
    webSearch?: boolean;
  };
  activeFeatures?: {
    rag?: boolean;
    webSearch?: boolean;
  };
  sessionId: string | null;
}

export function FeatureBadges({
  chatSettings = { memory: false, webSearch: false },
  activeFeatures = { rag: false, webSearch: false },
  sessionId = null,
}: FeatureBadgesProps) {
  return (
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm md:text-base font-medium text-gray-400 dark:text-gray-300 flex items-center gap-2">
        <span className="hidden sm:inline">Features:</span>
        {chatSettings?.memory && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded bg-gray-900 text-xs flex items-center gap-1 border border-green-500/20",
              activeFeatures?.rag ? "bg-green-900/20" : ""
            )}
          >
            <BrainCircuit
              className={cn(
                "h-3 w-3 text-green-400",
                activeFeatures?.rag ? "animate-pulse" : ""
              )}
            />
            <span className="hidden sm:inline text-green-300">RAG</span>
          </span>
        )}
        {chatSettings?.webSearch && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded bg-gray-900 text-xs flex items-center gap-1 border border-green-500/20",
              activeFeatures?.webSearch ? "bg-green-900/20" : ""
            )}
          >
            <Globe
              className={cn(
                "h-3 w-3 text-green-400",
                activeFeatures?.webSearch ? "animate-pulse" : ""
              )}
            />
            <span className="hidden sm:inline text-green-300">Web</span>
          </span>
        )}
        {sessionId && (
          <span className="px-1.5 py-0.5 rounded bg-gray-900 text-xs flex items-center gap-1 border border-green-500/20">
            <span className="hidden sm:inline text-green-300">
              Session: {sessionId.substring(0, 6)}
            </span>
          </span>
        )}
      </span>
    </div>
  );
}
