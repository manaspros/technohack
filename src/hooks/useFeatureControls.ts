import { useState, useEffect, useCallback } from "react";
import chatApi from "../services/api";

interface FeatureControlsProps {
  initialSessionId?: string | null;
  initialSettings?: {
    memory: boolean;
    webSearch: boolean;
  };
  onStatusMessage?: (message: string) => void;
  onError?: (message: string) => void;
}

export function useFeatureControls({
  initialSessionId = null,
  initialSettings = { memory: false, webSearch: false },
  onStatusMessage,
  onError,
}: FeatureControlsProps) {
  // Feature toggle states
  const [chatSettings, setChatSettings] = useState(initialSettings);

  // Session management
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);

  // Status tracking
  const [updatingToggles, setUpdatingToggles] = useState({
    rag: false,
    websearch: false,
  });

  // Feature usage indicators
  const [activeFeatures, setActiveFeatures] = useState({
    rag: false,
    webSearch: false,
  });

  // Controls state
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Initialize from the backend when session ID changes
  useEffect(() => {
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

        if (onError) onError(errorMessage);
      } finally {
        // Clear loading states
        setUpdatingToggles({
          rag: false,
          websearch: false,
        });
      }
    };

    fetchSessionInfo();
  }, [sessionId]);

  // Reset active features when settings change
  useEffect(() => {
    if (!chatSettings.memory) {
      setActiveFeatures((prev) => ({ ...prev, rag: false }));
    }
    if (!chatSettings.webSearch) {
      setActiveFeatures((prev) => ({ ...prev, webSearch: false }));
    }
  }, [chatSettings]);

  // Handle option toggle
  const handleOptionChange = async (id: string, isActive: boolean) => {
    // Update local UI state immediately for responsive feel
    setChatSettings((prev) => ({
      ...prev,
      [id]: isActive,
    }));

    // Map UI control IDs to API feature names
    const featureMap = {
      memory: "rag",
      webSearch: "websearch",
    };

    // Skip API call if no session exists yet
    if (!sessionId) {
      if (onStatusMessage) {
        onStatusMessage(
          `No active session. ${id} toggle will apply after sending a message.`
        );
      }
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

        if (onStatusMessage) {
          onStatusMessage(result.message);
        }
      }
    } catch (error) {
      console.error(`Error toggling ${id}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : `Failed to toggle ${id}`;

      // Revert UI state as API call failed
      setChatSettings((prev) => ({
        ...prev,
        [id]: !isActive, // Revert to previous state
      }));

      if (onError) onError(errorMessage);
    } finally {
      // Clear loading state for the specific toggle
      if (id === "memory") {
        setUpdatingToggles((prev) => ({ ...prev, rag: false }));
      } else if (id === "webSearch") {
        setUpdatingToggles((prev) => ({ ...prev, websearch: false }));
      }
    }
  };

  // Toggle file upload display
  const toggleFileUpload = useCallback(() => {
    setShowFileUpload((prev) => !prev);
    if (onStatusMessage) {
      onStatusMessage(
        `File upload ${!showFileUpload ? "opened" : "closed"} [Alt+U]`
      );
    }
  }, [showFileUpload, onStatusMessage]);

  // Toggle control panel expanded state
  const toggleControlsExpanded = useCallback(() => {
    setControlsExpanded((prev) => !prev);
    if (onStatusMessage) {
      onStatusMessage(
        `Controls ${controlsExpanded ? "collapsed" : "expanded"} [Alt+C]`
      );
    }
  }, [controlsExpanded, onStatusMessage]);

  // Update active features based on AI response
  const updateActiveFeatures = useCallback((responseText: string) => {
    // Simple heuristic to detect feature usage from response content
    const usedRag =
      responseText.toLowerCase().includes("from knowledge base") ||
      responseText.toLowerCase().includes("according to your documents");

    const usedWebSearch =
      responseText.toLowerCase().includes("web search") ||
      responseText.toLowerCase().includes("i found online");

    setActiveFeatures({
      rag: usedRag,
      webSearch: usedWebSearch,
    });
  }, []);

  // Update session ID
  const updateSessionId = useCallback(
    (newSessionId: string | null) => {
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
      }
    },
    [sessionId]
  );

  return {
    // States
    chatSettings,
    updatingToggles,
    activeFeatures,
    controlsExpanded,
    showFileUpload,
    sessionId,

    // Actions
    handleOptionChange,
    toggleFileUpload,
    toggleControlsExpanded,
    updateActiveFeatures,
    updateSessionId,

    // Setters for direct control
    setActiveFeatures,
    setShowFileUpload,
    setControlsExpanded,
  };
}
