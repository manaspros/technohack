"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Image, Mic, Video, FileCode, Upload } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { FileUploadDemo } from "@/app/components/fileupload";
import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  short?: string;
  end?: string;
}

interface SearchResult {
  actions: Action[];
}

const allActions = [
  {
    id: "1",
    label: "Analyze Image",
    icon: <Image className="h-5 w-5 text-blue-500" />,
    description: "Visual AI",
    short: "⌘I",
    end: "Vision",
  },
  {
    id: "2",
    label: "Process Audio",
    icon: <Mic className="h-5 w-5 text-orange-500" />,
    description: "Speech AI",
    short: "⌘A",
    end: "Audio",
  },
  {
    id: "3",
    label: "Video Analysis",
    icon: <Video className="h-5 w-5 text-purple-500" />,
    description: "Motion AI",
    short: "⌘V",
    end: "Visual",
  },
  {
    id: "4",
    label: "Code Interpreter",
    icon: <FileCode className="h-5 w-5 text-green-500" />,
    description: "Code AI",
    short: "⌘C",
    end: "Active",
  },
];

// Placeholders for the vanishing input
const searchPlaceholders = [
  "Ask me anything about images, audio, or video...",
  "How to detect objects in an image?",
  "Can you transcribe this audio file for me?",
  "Explain how multimodal AI understands different data types",
  "What's the best way to process video content?",
];

interface ActionSearchBarProps {
  actions?: Action[];
  showFileUploadButton?: boolean;
  showFileUpload?: boolean;
}

function ActionSearchBar({
  actions = allActions,
  showFileUploadButton = true,
  showFileUpload: externalShowFileUpload,
}: ActionSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const debouncedQuery = useDebounce(query, 200);

  // Use external state if provided, otherwise use local state
  const displayFileUpload =
    externalShowFileUpload !== undefined
      ? externalShowFileUpload
      : showFileUpload;

  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      setResult({ actions: allActions });
      return;
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredActions = allActions.filter((action) => {
      const searchableText = action.label.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    setResult({ actions: filteredActions });
  }, [debouncedQuery, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsTyping(true);
  };

  const handleSubmit = (e?: React.FormEvent, submittedText?: string) => {
    if (e) e.preventDefault();
    const text = submittedText || query;
    if (!text?.trim()) return;

    router.push(`/chatbot?q=${encodeURIComponent(text)}`);
  };

  const toggleFileUpload = () => {
    setShowFileUpload((prev) => !prev);
  };

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: {
          duration: 0.4,
        },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
        },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Reset selectedAction when focusing the input
  const handleFocus = () => {
    setSelectedAction(null);
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 200);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative flex flex-col justify-start items-center">
        <div className="w-full sticky top-0 bg-background z-10 pt-2 pb-1">
          <div className="flex justify-between items-center mb-2">
            <label
              className="text-base font-medium text-gray-400 dark:text-gray-300 block"
              htmlFor="search"
            >
              Ask or Upload Files
            </label>
            {/* Only show upload button when showFileUploadButton is true */}
            {showFileUploadButton && (
              <button
                onClick={toggleFileUpload}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  displayFileUpload
                    ? "bg-green-600 text-black font-bold"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                aria-label="Toggle file upload"
              >
                <Upload className="h-4 w-4 inline mr-2" />
                {displayFileUpload ? "Hide Upload" : "Upload Media"}
              </button>
            )}
          </div>

          {/* Replace the regular input with the vanishing input */}
          <PlaceholdersAndVanishInput
            placeholders={searchPlaceholders}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            name="search-query"
            className="focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500 h-14 md:h-16"
            inputClassName="focus:ring-0 text-base md:text-lg"
            placeholderClassName="text-base md:text-lg"
          />

          <div className="w-full max-w-sm mt-1">
            <AnimatePresence>
              {isFocused && result && !selectedAction && (
                <motion.div
                  className="w-full border rounded-md shadow-sm overflow-hidden dark:border-gray-800 bg-white dark:bg-black"
                  variants={container}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <motion.ul>
                    {result.actions.map((action) => (
                      <motion.li
                        key={action.id}
                        className="px-3 py-2 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer rounded-md"
                        variants={item}
                        layout
                        onClick={() => {
                          setSelectedAction(action);
                          setQuery(action.label);
                          setTimeout(() => handleSubmit(), 300);
                        }}
                      >
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{action.icon}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {action.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              {action.description}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {action.short}
                          </span>
                          <span className="text-xs text-gray-400 text-right">
                            {action.end}
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                  <div className="mt-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Press ⌘K to open commands</span>
                      <span>ESC to cancel</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {displayFileUpload && (
            <motion.div
              className="w-full mt-3 mb-0"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FileUploadDemo />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ActionSearchBar;
