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

// Import API client
import chatApi from "@/src/services/api";

// Import components
import { ChatMessageList } from "@/src/components/chat/ChatMessageList";
import { StatusIndicator } from "@/src/components/chat/StatusIndicator";
import { FeatureBadges } from "@/src/components/chat/FeatureBadges";
import { ChatUploader } from "@/src/components/chat/ChatUploader";

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

  // Add state for toggle loading
  const [updatingToggles, setUpdatingToggles] = useState({
    rag: false,
    websearch: false,
  });
  
  // Add state for active features
  const [activeFeatures, setActiveFeatures] = useState({
    rag: false,
    webSearch: false,
  });

  // Chat settings state
  const [chatSettings, setChatSettings] = useState({
    memory: true,
    webSearch: false,
  });

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

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

        if (result.success) {
          // Show success status with keyboard shortcut hint
          let statusMsg = "";
          switch (id) {
            case "memory":
              statusMsg = `RAG ${isActive ? "enabled" : "disabled"} [Alt+M]`;
              break;
            case "webSearch":
              statusMsg = `Web search ${isActive ? "enabled" : "disabled"} [Alt+W]`;
              break;
          }
          
          if (statusMsg) {
            showTemporaryStatus(statusMsg);
          }
        } else {
          // If API call was not successful, revert UI state
          setChatSettings((prev) => ({
            ...prev,
            [id]: !isActive, // Revert to previous state
          }));
          
          showTemporaryStatus(`Error: ${result.message || `Failed to toggle ${id}`}`);
          setApiError(`Failed to toggle ${id}: ${result.message || "Unknown error"}`);
        }
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

  // Modified handleSubmit to create a session and establish chat settings
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    submittedText?: string
  ) => {
    e.preventDefault();
    const text = submittedText || inputValue;

    if (!text?.trim()) return;

    // Prevent duplicate submissions while loading
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
        message: text.trim(),
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

      // Add response to messages
      setMessages((prev) => [
        ...prev,
        {
          text: response.message,
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      // Update active features based on response content
      const usedRag = 
        response.message.toLowerCase().includes("from knowledge base") ||
        response.message.toLowerCase().includes("according to your documents");
      
      const usedWebSearch = 
        response.message.toLowerCase().includes("web search") ||
        response.message.toLowerCase().includes("i found online");
      
      setActiveFeatures({
        rag: usedRag,
        webSearch: usedWebSearch,
      });

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
      const errorMsg = `Error: ${errorMessage}

To fix connection issues:
1. Make sure the API server is running (python run_api.py)
2. Check that your .env.local has NEXT_PUBLIC_API_URL set correctly
3. Verify there are no CORS issues or firewalls blocking the connection`;

      setMessages((prev) => [
        ...prev,
        {
          text: errorMsg,
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

  // Add effect to fetch session info when session ID changes
  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionInfo = async () => {
      try {
        // Set updating toggles to true while fetching
        setUpdatingToggles({
          rag: true,
          websearch: true,
        });

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
        console.error("Failed to fetch session info:", error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Failed to fetch session state";
        setApiError(errorMessage);
        showTemporaryStatus(`Error syncing features: ${errorMessage}`);
      } finally {
        // Clear updating toggles
        setUpdatingToggles({
          rag: false,
          websearch: false,
        });
      }
    };

    fetchSessionInfo();
  }, [sessionId]);

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
        oscillator
