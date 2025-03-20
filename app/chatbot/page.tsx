"use client";

import { useState, useEffect, useRef } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { AnimatePresence, motion } from "motion/react";
import {
  MessageSquareText,
  Bot,
  User,
  Loader,
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

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const { unlockAchievement } = useAchievements();
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  // Add the ref outside the effect
  const processedQueryRef = useRef<boolean>(false);

  // Chat settings state
  const [chatSettings, setChatSettings] = useState({
    memory: true,
    webSearch: false,
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

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    submittedText: string
  ) => {
    e.preventDefault();
    const text = submittedText || inputValue;

    if (!text?.trim()) return;

    // Prevent duplicate submissions while loading
    if (isLoading) return;

    // Add console log to debug duplicates
    console.log("Submitting message:", text);

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

    // Check for first message achievement
    if (!hasSentFirstMessage) {
      unlockAchievement("first_chat");
      setHasSentFirstMessage(true);
    }

    // Add memory context if enabled
    const useMemory = chatSettings.memory;
    const useWebSearch = chatSettings.webSearch;

    // Log settings being used
    console.log(`Using memory: ${useMemory}, Web search: ${useWebSearch}`);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can analyze that image for you. Let me take a look...",
        "Based on the code you shared, I'd recommend refactoring the main function.",
        "That's an interesting question! The multimodal approach combines several types of data processing.",
        "I can help you understand how neural networks process audio data.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      // Add the actual message and remove loading state
      setMessages((prev) => [
        ...prev,
        {
          text: randomResponse,
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      setIsLoading(false);
      setLoadingStartTime(null);
    }, 1500);
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

  // Enhanced handle option change with status feedback
  const handleOptionChange = (id: string, isActive: boolean) => {
    setChatSettings((prev) => ({
      ...prev,
      [id]: isActive,
    }));

    playSound("toggle");

    // Show status message with keyboard shortcut hint
    let statusMsg = "";
    switch (id) {
      case "memory":
        statusMsg = `Memory ${isActive ? "enabled" : "disabled"} [Alt+M]`;
        break;
      case "webSearch":
        statusMsg = `Web search ${isActive ? "enabled" : "disabled"} [Alt+W]`;
        break;
    }

    if (statusMsg) {
      showTemporaryStatus(statusMsg);
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

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto pt-4 md:pt-0">
      <div className="flex items-center justify-center mb-4 md:mb-6">
        <MessageSquareText className="h-5 w-5 md:h-6 md:w-6 text-green-400 mr-2" />
        <h1 className="text-xl md:text-2xl font-pixel">
          Multimodal AI Chatbot
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

          {/* Show loading indicator only when waiting for a response */}
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
                    <Loader className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
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
              <span className="px-1.5 py-0.5 rounded bg-gray-900 text-xs flex items-center gap-1 border border-green-500/20">
                <BrainCircuit className="h-3 w-3 text-green-400" />
                <span className="hidden sm:inline text-green-300">Memory</span>
              </span>
            )}
            {chatSettings.webSearch && (
              <span className="px-1.5 py-0.5 rounded bg-gray-900 text-xs flex items-center gap-1 border border-green-500/20">
                <Globe className="h-3 w-3 text-green-400" />
                <span className="hidden sm:inline text-green-300">Web</span>
              </span>
            )}
          </span>
        </div>

        {/* Add Control Panel */}
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
              <FileUploadDemo />
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
