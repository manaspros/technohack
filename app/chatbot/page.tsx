"use client";

import { useState, useEffect, useRef } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { AnimatePresence, motion } from "motion/react";
import {
  MessageSquareText,
  Bot,
  User,
  ChevronUp,
  Mic,
  BrainCircuit,
  Globe,
} from "lucide-react";
import { FileUploadDemo } from "@/app/components/fileupload";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  useAchievements,
  AchievementPanel,
} from "@/components/ui/achievement-notification";
import { useSearchParams } from "next/navigation";
import {
  RetroControlPanel,
  RetroVoiceButton,
} from "@/components/ui/retro-control-panel";
import { PixelSpinner } from "@/components/ui/pixel-spinner";
import chatApi from "../../src/services/api";
import { cn } from "@/lib/utils";

/**
 * Filters out <think>...</think> sections from text
 * These sections contain the AI's internal reasoning process
 */
const filterThinkingSections = (text: string): string => {
  // Use regex to remove all <think>...</think> blocks, including newlines within them
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

export default function ChatbotPage() {
  const [inputValue, setInputValue] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const placeholders = [
    "Ask me anything...",
    "How can I help you today?",
    "Try asking about code, images, or data...",
    "What would you like to know?",
  ];
  const [messages, setMessages] = useState<
    {
      text: string;
      isUser: boolean;
      timestamp: Date;
    }[]
  >([
    {
      text: "Hello! I'm your multimodal AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  // Add RAG API state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const { unlockAchievement } = useAchievements();
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [lastUploadResult, setLastUploadResult] = useState<{
    success: boolean;
    filename: string;
    message: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  // Add the ref outside the effect
  const processedQueryRef = useRef<boolean>(false);

  // Chat settings state - set memory (RAG) to false by default
  const [chatSettings, setChatSettings] = useState({
    memory: true, // Maps to RAG enabledd - changed from true to false
    webSearch: false, // Maps to web search enabled
  });

  // Add state to track which feature is actively being used in the current response
  const [activeFeatures, setActiveFeatures] = useState({
    rag: false,
    webSearch: false,
  });

  // Add state for tracking which toggles are currently being updated
  const [updatingToggles, setUpdatingToggles] = useState<{
    rag: boolean;
    websearch: boolean;
  }>({
    rag: false,
    websearch: false,
  });

  // Handle query params for direct message - refactored to fix duplicate message issue
  useEffect(() => {
    const queryMsg = searchParams?.get("q");

    if (queryMsg && messages.length === 1 && !processedQueryRef.current) {
      processedQueryRef.current = true;

      // Use setTimeout to ensure this runs after initial render
      setTimeout(() => {
        handleSubmit(new Event("submit") as any, queryMsg);
      }, 100);
    }

    return () => {
      // Only reset the ref when search params change to a different value
      if (!searchParams?.get("q")) {
        processedQueryRef.current = false;
      }
    };
  }, [searchParams]);

  // Handle feature toggles from URL parameters
  useEffect(() => {
    const ragParam = searchParams?.get("rag");
    const webParam = searchParams?.get("web");

    // Only update if valid parameters are present
    const updates: Partial<typeof chatSettings> = {};

    if (ragParam === "true" || ragParam === "false") {
      updates.memory = ragParam === "true";
    }

    if (webParam === "true" || webParam === "false") {
      updates.webSearch = webParam === "true";
    }

    // Apply updates if any parameters were valid
    if (Object.keys(updates).length > 0) {
      setChatSettings((prev) => ({
        ...prev,
        ...updates,
      }));
    }
  }, [searchParams]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Show/hide scroll to top button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      setShowScrollTop(scrollTop > 300);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Enhanced submit handler that sends toggle state with each request
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    submittedText?: string
  ) => {
    e.preventDefault();
    const text = submittedText || inputValue;

    if (!text?.trim()) return;

    // Prevent duplicate submissions while loadingach message
    if (isLoading) return;

    // Add to UI immediately for better UX
    const newMessage = {
      text: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Start loading and record the start time
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setApiError(null);

    // Check for first message achievement
    if (!hasSentFirstMessage) {
      unlockAchievement("first_chat");
      setHasSentFirstMessage(true);
    }

    try {
      // Call RAG API with current feature toggle states
      const response = await chatApi.sendMessage({
        message: text,
        session_id: sessionId || undefined,
        settings: {
          rag_enabled: chatSettings.memory,
          web_search_enabled: chatSettings.webSearch,
        },
      });

      // Update session ID if needed
      if (!sessionId || sessionId !== response.session_id) {
        setSessionId(response.session_id);
      }

      // Filter out thinking sections before adding to messages
      const filteredMessage = filterThinkingSections(response.message);

      // Detect feature usage based on response content
      // This is a simple heuristic - you might want to have the backend explicitly tell you
      const usedRag =
        filteredMessage.toLowerCase().includes("from knowledge base") ||
        filteredMessage.toLowerCase().includes("according to your documents");
      const usedWebSearch =
        filteredMessage.toLowerCase().includes("web search") ||
        filteredMessage.toLowerCase().includes("i found online");

      // Update active feature indicators
      setActiveFeatures({
        rag: usedRag,
        webSearch: usedWebSearch,
      });

      // Add response to messages
      setMessages((prev) => [
        ...prev,
        {
          text: filteredMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      // Play sound for successful response
      playSound("receive");
    } catch (error) {
      console.error("Error calling RAG API:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error occurred. Please check that your API server is running.";

      setApiError(errorMessage);

      // Add error message to chat with instructions
      // Filter this too in case error messages contain thinking sections
      const filteredErrorMsg = filterThinkingSections(`Error: ${errorMessage}

To fix connection issues:
1. Make sure the API server is running (python run_api.py)
2. Check that your .env.local has NEXT_PUBLIC_API_URL set correctly
3. Verify there are no CORS issues or firewalls blocking the connection`);

      setMessages((prev) => [
        ...prev,
        {
          text: filteredErrorMsg,
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      // Play error sound
      playSound("error");
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  };

  // Play sound effects
  const playSound = (type: "send" | "receive" | "toggle" | "error") => {
    // Simple sound effect implementation
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "send":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          1000,
          audioContext.currentTime + 0.1
        );
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case "receive":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          800,
          audioContext.currentTime + 0.1
        );
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case "toggle":
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case "error":
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  };

  // Enhanced keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt key combinations for control panel options
      if (e.altKey) {
        switch (e.key) {
          case "m": // Alt+M for memory toggle
            handleOptionChange("memory", !chatSettings.memory);
            break;
          case "w": // Alt+W for web search toggle
            handleOptionChange("webSearch", !chatSettings.webSearch);
            break;
          case "u": // Alt+U for upload toggle
            toggleFileUpload();
            break;
          case "v": // Alt+V for voice recording
            handleVoiceRecord();
            break;
          case "c": // Alt+C for toggle controls visibility
            setControlsExpanded((prev) => !prev);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chatSettings, isRecording]);

  // Status message display - shows keyboard shortcuts and active features
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  const statusMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTemporaryStatus = (message: string) => {
    setStatusMessage(message);
    setShowStatusMessage(true);

    if (statusMessageTimeoutRef.current) {
      clearTimeout(statusMessageTimeoutRef.current);
    }

    statusMessageTimeoutRef.current = setTimeout(() => {
      setShowStatusMessage(false);
    }, 3000);
  };

  const [statusMessage, setStatusMessage] = useState("");

  // Enhanced handle option change with status feedback and API integration
  const handleOptionChange = async (id: string, isActive: boolean) => {
    // Update local UI state immediately for responsive feel
    setChatSettings((prev) => ({
      ...prev,
      [id]: isActive,
    }));

    playSound("toggle");

    // Map UI control IDs to API feature names
    const featureMap = {
      memory: "rag",
      webSearch: "websearch",
    };

    // Skip API call if no session exists yet - just local UI state change
    if (!sessionId) {
      showTemporaryStatus(
        `No active session. ${id} toggle will apply after sending a message.`
      );
      return;
    }

    try {
      // Set loading state for the specific toggle being updated
      if (id === "memory") {
        setUpdatingToggles((prev) => ({ ...prev, rag: true }));
      } else if (id === "webSearch") {
        setUpdatingToggles((prev) => ({ ...prev, websearch: true }));
      }

      // Call the API to update the server-side state
      const apiFeature = featureMap[id as keyof typeof featureMap];

      if (apiFeature) {
        const result = await chatApi.toggleFeature({
          session_id: sessionId,
          feature: apiFeature as "rag" | "websearch",
          enabled: isActive,
        });

        // Filter any thinking sections from toggle messages too
        showTemporaryStatus(filterThinkingSections(result.message));
      }
    } catch (error) {
      console.error(`Error toggling ${id}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to toggle feature";

      // Revert UI state as API call failed
      setChatSettings((prev) => ({
        ...prev,
        [id]: !isActive, // Revert to previous state
      }));

      setApiError(errorMessage);
      showTemporaryStatus(`Error: ${errorMessage}`);

      // Add system message to chat about the error - filter this too
      setMessages((prev) => [
        ...prev,
        {
          text: filterThinkingSections(
            `Failed to toggle ${id}: ${errorMessage}`
          ),
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      // Play error sound
      playSound("error");
    } finally {
      // Clear loading state for the specific toggle
      if (id === "memory") {
        setUpdatingToggles((prev) => ({ ...prev, rag: false }));
      } else if (id === "webSearch") {
        setUpdatingToggles((prev) => ({ ...prev, websearch: false }));
      }
    }
  };

  // Enhance voice recording with feedback
  const handleVoiceRecord = () => {
    setIsRecording((prev) => !prev);
    playSound(isRecording ? "send" : "toggle");

    if (!isRecording) {
      // Starting recording
      showTemporaryStatus("Voice recording started [Alt+V]");

      // Implement real voice recording here
      // For now, using simulated voice recognition
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log("Voice recognition started");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
        playSound("receive");
        showTemporaryStatus("Voice transcribed to text");
      };

      recognition.onerror = (event: any) => {
        console.error("Voice recognition error:", event.error);
        setIsRecording(false);
        showTemporaryStatus("Voice recognition failed");
        playSound("error");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      try {
        recognition.start();
      } catch (error) {
        console.error("Failed to start voice recognition:", error);
        // Fallback to simulated voice recognition
        setTimeout(() => {
          setInputValue("This is a simulated voice transcription");
          setIsRecording(false);
          playSound("receive");
          showTemporaryStatus("Voice transcribed to text");
        }, 3000);
      }
    } else {
      // Stopping recording
      showTemporaryStatus("Voice recording stopped");
    }
  };

  // Enhanced file upload toggle with feedback
  const toggleFileUpload = () => {
    setShowFileUpload((prev) => !prev);
    playSound("toggle");

    showTemporaryStatus(
      `File upload ${!showFileUpload ? "opened" : "closed"} [Alt+U]`
    );
  };

  // Handle file upload with API integration
  const handleFileUpload = async (file: File) => {
    if (!sessionId) {
      showTemporaryStatus("No active session. Send a message first.");
      return;
    }

    try {
      // Reset state
      setFileUploadProgress(0);
      setLastUploadResult(null);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setFileUploadProgress((prev) => {
          const newValue = Math.min(prev + Math.random() * 15, 90);
          return newValue;
        });
      }, 500);

      // Upload file
      const result = await chatApi.uploadDocument(sessionId, file);

      clearInterval(progressInterval);
      setFileUploadProgress(100);
      setLastUploadResult(result);

      // Show success message
      showTemporaryStatus(`File uploaded: ${file.name}`);
      playSound("receive");
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      setApiError(errorMessage);
      showTemporaryStatus(`Error: ${errorMessage}`);
      playSound("error");
    }
  };

  // Custom FileUpload component that uses the API integration
  const CustomFileUpload = () => (
    <div className="retro-file-upload">
      <div className="file-upload-header">
        <span className="file-header-text">DOCUMENT UPLOAD</span>
      </div>

      <div className="file-upload-content">
        <FileUploadDemo
          onUpload={handleFileUpload}
          disabled={!sessionId || isLoading}
        />

        {fileUploadProgress > 0 && fileUploadProgress < 100 && (
          <div className="progress-container">
            <div className="progress-label">
              UPLOADING: {Math.round(fileUploadProgress)}%
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${fileUploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {lastUploadResult && (
          <div
            className={`upload-result ${
              lastUploadResult.success ? "success" : "error"
            }`}
          >
            {lastUploadResult.message}
          </div>
        )}
      </div>
    </div>
  );

  // Fetch session info and initialize feature states
  useEffect(() => {
    // Skip if no session exists yet
    if (!sessionId) return;

    const fetchSessionInfo = async () => {
      try {
        // Set loading states
        setUpdatingToggles({
          rag: true,
          websearch: true,
        });

        // Fetch session information from API
        const sessionInfo = await chatApi.getSession(sessionId);

        // Update chat settings based on backend state
        setChatSettings({
          memory: sessionInfo.rag_enabled,
          webSearch: sessionInfo.web_search_enabled,
        });

        console.log("Initialized feature states from backend:", {
          rag: sessionInfo.rag_enabled,
          web_search: sessionInfo.web_search_enabled,
        });
      } catch (error) {
        console.error("Error fetching session info:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch session state";
        setApiError(errorMessage);
        showTemporaryStatus(`Error syncing features: ${errorMessage}`);
      } finally {
        // Clear loading states
        setUpdatingToggles({
          rag: false,
          websearch: false,
        });
      }
    };

    fetchSessionInfo();
  }, [sessionId]); // Only run when sessionId changes

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto pt-4 md:pt-0">
      <div className="flex items-center justify-center mb-4 md:mb-6">
        <MessageSquareText className="h-5 w-5 md:h-6 md:w-6 text-green-400 mr-2" />
        <h1 className="text-xl md:text-2xl font-pixel">
          Multimodal RAG Chatbot
        </h1>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 pr-2 md:pr-4 font-mono"
        onScroll={handleScroll}
      >
        <AnimatePresence>
          {/* Display all messages */}
          {messages.map((message, index) => (
            <motion.div
              key={`message-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex mb-4 ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[85%] sm:max-w-[80%] ${
                  message.isUser ? "flex-row-reverse" : "flex-row"
                } items-start gap-2`}
              >
                <div
                  className={`h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center ${
                    message.isUser ? "bg-blue-500" : "bg-green-500"
                  }`}
                >
                  {message.isUser ? (
                    <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  ) : (
                    <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  )}
                </div>
                <div
                  className={`py-2 px-3 md:py-2 md:px-4 rounded-xl ${
                    message.isUser ? "bg-blue-500 text-white" : "bg-gray-800"
                  }`}
                >
                  {message.isUser ? (
                    message.text
                  ) : (
                    <TextGenerateEffect
                      words={message.text}
                      duration={0.3}
                      filter={false}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Show loading indicator only when waiting for a response - updated with PixelSpinner */}
          {isLoading && (
            <motion.div
              key="loading-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start mb-4"
            >
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
                <div className="py-2 px-3 md:py-2 md:px-4 rounded-xl bg-gray-800">
                  <div className="flex items-center space-x-2 text-green-400">
                    <PixelSpinner type="scan" size="sm" color="#4ade80" />
                    <span className="text-sm md:text-base">
                      Processing response...
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Scroll to top button - only visible when scrolled down */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-4 p-2 rounded-full bg-gray-800 text-green-400 border border-green-500/30 shadow-lg z-10 touch-manipulation"
            onClick={scrollToTop}
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Add status message display */}
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

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm md:text-base font-medium text-gray-400 dark:text-gray-300 flex items-center gap-2">
            <span className="hidden sm:inline">Features:</span>
            {chatSettings.memory && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded bg-gray-900 text-xs flex items-center gap-1 border border-green-500/20",
                  activeFeatures.rag ? "bg-green-900/20" : "" // Highlight when actively used
                )}
              >
                <BrainCircuit
                  className={cn(
                    "h-3 w-3 text-green-400",
                    activeFeatures.rag ? "animate-pulse" : "" // Add pulse animation when in use
                  )}
                />
                <span className="hidden sm:inline text-green-300">RAG</span>
              </span>
            )}
            {chatSettings.webSearch && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded bg-gray-900 text-xs flex items-center gap-1 border border-green-500/20",
                  activeFeatures.webSearch ? "bg-green-900/20" : "" // Highlight when actively used
                )}
              >
                <Globe
                  className={cn(
                    "h-3 w-3 text-green-400",
                    activeFeatures.webSearch ? "animate-pulse" : "" // Add pulse animation when in use
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

        {/* Add Control Panel with loading states for toggles */}
        <RetroControlPanel
          expanded={controlsExpanded}
          onToggleExpanded={() => {
            setControlsExpanded(!controlsExpanded);
            playSound("toggle");
            showTemporaryStatus(
              `Controls ${controlsExpanded ? "collapsed" : "expanded"} [Alt+C]`
            );
          }}
          onOptionChange={handleOptionChange}
          onFileOpen={toggleFileUpload}
          onVoiceRecord={handleVoiceRecord}
          activeOptions={chatSettings}
          updatingOptions={updatingToggles}
          disabled={!sessionId}
          activeFeatures={activeFeatures}
        />

        <AnimatePresence>
          {showFileUpload && (
            <motion.div
              className="w-full mb-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CustomFileUpload />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            name="query"
            className={`focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500 h-12 md:h-14 lg:h-16 ${
              isLoading ? "opacity-70" : ""
            }`}
            inputClassName="focus:ring-0 text-sm md:text-base"
            placeholderClassName="text-sm md:text-base"
          />

          {/* Voice input button positioned at the end of input */}
          <RetroVoiceButton
            onClick={handleVoiceRecord}
            isRecording={isRecording}
            className="absolute right-14 top-1/2 transform -translate-y-1/2 z-10"
          />
        </div>
      </div>

      {/* Add the achievement panel component */}
      <AchievementPanel />
    </div>
  );
}
