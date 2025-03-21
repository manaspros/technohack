"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  Globe,
  Mic,
  PlusSquare,
  FileUp,
  Settings2,
  Minimize,
  Keyboard,
} from "lucide-react";

interface ControlOption {
  id: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  tooltip: string;
  type: "toggle" | "button";
}

interface RetroControlPanelProps {
  className?: string;
  onOptionChange?: (id: string, isActive: boolean) => void;
  onFileOpen?: () => void;
  onVoiceRecord?: () => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  activeOptions?: Record<string, boolean>;
}

export function RetroControlPanel({
  className,
  onOptionChange,
  onFileOpen,
  onVoiceRecord,
  expanded = true,
  onToggleExpanded,
  activeOptions = {
    memory: true,
    webSearch: false,
  },
}: RetroControlPanelProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const controlOptions: ControlOption[] = [
    {
      id: "memory",
      icon: <BrainCircuit className="h-4 w-4" />,
      label: "Memory",
      tooltip: "Toggle AI memory (Alt+M)",
      type: "toggle",
    },
    {
      id: "webSearch",
      icon: <Globe className="h-4 w-4" />,
      label: "Web",
      tooltip: "Toggle web search (Alt+W)",
      type: "toggle",
    },
    {
      id: "upload",
      icon: <PlusSquare className="h-4 w-4" />,
      label: "Upload",
      tooltip: "Upload files (Alt+U)",
      type: "button",
    },
    {
      id: "voice",
      icon: <Mic className="h-4 w-4" />,
      label: "Voice",
      tooltip: "Voice input (Alt+V)",
      type: "button",
    },
  ];

  const handleToggle = (id: string) => {
    onOptionChange?.(id, !activeOptions[id]);
  };

  const handleButtonClick = (id: string) => {
    if (id === "upload") {
      onFileOpen?.();
    } else if (id === "voice") {
      onVoiceRecord?.();
    }
  };

  return (
    <div
      className={cn(
        "w-full px-2 sm:px-3 py-1 sm:py-2 relative my-1 sm:my-2",
        expanded ? "bg-gray-800/70 rounded-md border border-gray-700" : "",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          {expanded ? (
            <>
              {controlOptions.map((option) => (
                <React.Fragment key={option.id}>
                  {option.type === "toggle" ? (
                    <RetroToggle
                      id={option.id}
                      label={option.label}
                      isActive={!!activeOptions[option.id]}
                      onToggle={() => handleToggle(option.id)}
                      icon={
                        activeOptions[option.id] && option.activeIcon
                          ? option.activeIcon
                          : option.icon
                      }
                      onMouseEnter={() => setShowTooltip(option.tooltip)}
                      onMouseLeave={() => setShowTooltip(null)}
                      tooltipText={option.tooltip}
                    />
                  ) : (
                    <RetroButton
                      id={option.id}
                      label={option.label}
                      icon={option.icon}
                      onClick={() => handleButtonClick(option.id)}
                      isActive={option.id === "voice" && isRecording}
                      onMouseEnter={() => setShowTooltip(option.tooltip)}
                      onMouseLeave={() => setShowTooltip(null)}
                      tooltipText={option.tooltip}
                    />
                  )}
                </React.Fragment>
              ))}

              <div className="ml-1 md:ml-2">
                <button
                  className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  onClick={() =>
                    setShowKeyboardShortcuts(!showKeyboardShortcuts)
                  }
                  aria-label="Show keyboard shortcuts"
                >
                  <Keyboard className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-300" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onToggleExpanded}
              className="text-[10px] sm:text-xs flex items-center gap-1 bg-gray-800 border border-gray-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-gray-700 transition-colors text-gray-300"
              aria-label="Show controls"
            >
              <Settings2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="font-mono">Controls</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {showTooltip && expanded && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute left-3 bottom-full mb-1 bg-gray-900 text-white text-xs font-mono py-1 px-2 rounded border border-green-500/30 pointer-events-none"
            >
              {showTooltip}
            </motion.div>
          )}
        </AnimatePresence>

        {expanded && (
          <button
            onClick={onToggleExpanded}
            className="text-gray-400 hover:text-gray-100 transition-colors"
            aria-label={expanded ? "Collapse controls" : "Expand controls"}
          >
            <Minimize className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 bg-gray-900 rounded-md text-[10px] sm:text-xs font-mono p-1.5 sm:p-2 border border-gray-700"
          >
            <div className="text-green-400 font-pixel mb-1 text-[10px] sm:text-xs">
              Keyboard Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-0.5 sm:gap-y-1">
              <div className="flex justify-between">
                <span>Alt+M</span>
                <span className="text-gray-400">Memory</span>
              </div>
              <div className="flex justify-between">
                <span>Alt+W</span>
                <span className="text-gray-400">Web Search</span>
              </div>
              <div className="flex justify-between">
                <span>Alt+U</span>
                <span className="text-gray-400">Upload</span>
              </div>
              <div className="flex justify-between">
                <span>Alt+V</span>
                <span className="text-gray-400">Voice</span>
              </div>
              <div className="flex justify-between">
                <span>Alt+C</span>
                <span className="text-gray-400">Controls</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RetroToggleProps {
  id: string;
  label: string;
  isActive: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  tooltipText: string;
}

function RetroToggle({
  id,
  label,
  isActive,
  onToggle,
  icon,
  onMouseEnter,
  onMouseLeave,
  tooltipText,
}: RetroToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastActiveState = useRef(isActive);

  // Apply electronic transition effect when state changes
  React.useEffect(() => {
    if (!buttonRef.current) return;

    // Skip on initial render
    if (lastActiveState.current !== isActive) {
      const button = buttonRef.current;

      // Remove existing animation classes
      button.classList.remove(
        "electronic-transition-on",
        "electronic-transition-off"
      );

      // Force browser to recognize the change before adding new animation
      void button.offsetWidth;

      // Add appropriate animation class
      if (isActive) {
        button.classList.add("electronic-transition-on");
      } else {
        button.classList.add("electronic-transition-off");
      }
    }

    lastActiveState.current = isActive;
  }, [isActive]);

  return (
    <div
      className="group flex flex-col items-center justify-center relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        ref={buttonRef}
        className={cn(
          "flex flex-col items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md transition-colors",
          isActive
            ? "bg-green-500/30 border-2 border-green-500"
            : "bg-gray-900/90 border-2 border-gray-700 hover:border-gray-600"
        )}
        onClick={onToggle}
        aria-pressed={isActive}
        aria-label={`${label} - ${tooltipText}`}
      >
        <div
          className={cn(
            "text-xs sm:text-sm mt-0.5 sm:mt-1 transition-colors",
            isActive ? "text-green-400" : "text-gray-500"
          )}
        >
          {icon}
        </div>
        <div
          className={cn(
            "text-[6px] xs:text-[7px] sm:text-[8px] md:text-[10px] font-mono mt-0.5 sm:mt-1 transition-colors",
            isActive ? "text-green-300" : "text-gray-500"
          )}
        >
          {label}
        </div>
      </button>

      <div className="absolute -top-1 right-0">
        <div
          className={cn(
            "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-gray-700",
            isActive
              ? "bg-green-500 shadow-[0_0_4px_0_rgba(74,222,128,0.7)]"
              : "bg-gray-800"
          )}
        />
      </div>
    </div>
  );
}

interface RetroButtonProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  tooltipText: string;
}

function RetroButton({
  id,
  label,
  icon,
  onClick,
  isActive,
  onMouseEnter,
  onMouseLeave,
  tooltipText,
}: RetroButtonProps) {
  return (
    <div
      className="group flex flex-col items-center justify-center relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        className={cn(
          "flex flex-col items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md transition-colors",
          isActive
            ? "bg-red-500/30 border-2 border-red-500"
            : "bg-gray-900/90 border-2 border-gray-700 hover:bg-gray-800/80"
        )}
        onClick={onClick}
        aria-label={`${label} - ${tooltipText}`}
      >
        <div
          className={cn(
            "text-xs sm:text-sm mt-0.5 sm:mt-1 transition-colors",
            isActive ? "text-red-400" : "text-gray-300"
          )}
        >
          {icon}
        </div>
        <div
          className={cn(
            "text-[6px] xs:text-[7px] sm:text-[8px] md:text-[10px] font-mono mt-0.5 sm:mt-1",
            isActive ? "text-red-300" : "text-gray-400"
          )}
        >
          {label}
        </div>
      </button>

      {id === "voice" && isActive && (
        <div className="absolute top-0 right-0">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shadow-[0_0_8px_0_rgba(239,68,68,0.7)]"
          />
        </div>
      )}
    </div>
  );
}

export function RetroFileUploadButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "group flex items-center gap-1 bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 px-2 py-1 rounded transition-all active:scale-95",
        className
      )}
      onClick={onClick}
      aria-label="Upload files"
    >
      <FileUp className="h-3 w-3 text-green-400" />
      <span className="font-mono text-xs text-gray-300">Upload</span>
    </button>
  );
}

export function RetroVoiceButton({
  onClick,
  isRecording,
  className,
}: {
  onClick: () => void;
  isRecording?: boolean;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "group relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full transition-all active:scale-95",
        isRecording
          ? "bg-red-500/30 border-2 border-red-500"
          : "bg-gray-800 hover:bg-gray-700 border-2 border-gray-700",
        className
      )}
      onClick={onClick}
      aria-label={isRecording ? "Stop recording" : "Start voice recording"}
      aria-pressed={isRecording}
      title={
        isRecording ? "Stop recording (Alt+V)" : "Start voice recording (Alt+V)"
      }
    >
      <Mic
        className={cn(
          "h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-colors",
          isRecording ? "text-red-400" : "text-green-400"
        )}
      />

      {isRecording && (
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 rounded-full border-2 border-red-500 opacity-50"
        />
      )}
    </button>
  );
}
