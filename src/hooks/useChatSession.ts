import { useState, useEffect, useCallback } from "react";
import chatApi, { Message, SessionInfo } from "../services/api";

interface UseChatSessionProps {
  initialSessionId?: string;
}

interface UseChatSessionResult {
  sessionId: string | null;
  messages: Message[];
  sessionInfo: SessionInfo | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  toggleFeature: (
    feature: "rag" | "websearch",
    enabled: boolean
  ) => Promise<void>;
  saveConversation: (filename: string) => Promise<boolean>;
  loadConversation: (conversationName: string) => Promise<boolean>;
  listConversations: () => Promise<string[]>;
  resetSession: () => void;
}

export const useChatSession = ({
  initialSessionId,
}: UseChatSessionProps = {}): UseChatSessionResult => {
  const [sessionId, setSessionId] = useState<string | null>(
    initialSessionId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load session info when sessionId changes
  useEffect(() => {
    const fetchSessionInfo = async () => {
      if (!sessionId) return;

      try {
        setIsLoading(true);
        const info = await chatApi.getSession(sessionId);
        setSessionInfo(info);

        // Also fetch message history
        const history = await chatApi.getSessionHistory(sessionId);
        setMessages(history);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load session info"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionInfo();
  }, [sessionId]);

  // Send message to the chat API
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Add user message to local state immediately for fast feedback
        const userMessage: Message = { role: "user", content };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        // Send to the API
        const response = await chatApi.sendMessage({
          message: content,
          session_id: sessionId || undefined,
        });

        // Update sessionId if we got a new one
        if (
          response.session_id &&
          (!sessionId || response.session_id !== sessionId)
        ) {
          setSessionId(response.session_id);
        }

        // Add assistant response to messages
        const assistantMessage: Message = {
          role: "assistant",
          content: response.message,
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        // Refresh session info
        if (sessionId) {
          const info = await chatApi.getSession(sessionId);
          setSessionInfo(info);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        // Add error message to chat
        const errorMessage: Message = {
          role: "system",
          content: `Error: ${
            err instanceof Error ? err.message : "Failed to send message"
          }`,
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  // Toggle features (RAG or web search)
  const toggleFeature = useCallback(
    async (feature: "rag" | "websearch", enabled: boolean) => {
      if (!sessionId) {
        setError("No active session. Please send a message first.");
        return;
      }

      try {
        setIsLoading(true);
        const result = await chatApi.toggleFeature({
          session_id: sessionId,
          feature,
          enabled,
        });

        // Update local session info
        if (result.success && sessionInfo) {
          setSessionInfo({
            ...sessionInfo,
            rag_enabled: feature === "rag" ? enabled : sessionInfo.rag_enabled,
            web_search_enabled:
              feature === "websearch"
                ? enabled
                : sessionInfo.web_search_enabled,
          });
        }

        // Add system message about the toggle
        const toggleMessage: Message = {
          role: "system",
          content: result.message,
        };
        setMessages((prevMessages) => [...prevMessages, toggleMessage]);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : `Failed to toggle ${feature}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, sessionInfo]
  );

  // List all saved conversations
  const listConversations = useCallback(async (): Promise<string[]> => {
    try {
      const result = await chatApi.listConversations();
      return result.conversations;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to list conversations"
      );
      return [];
    }
  }, []);

  // Save the current conversation
  const saveConversation = useCallback(
    async (filename: string): Promise<boolean> => {
      if (!sessionId) {
        setError("No active session. Please send a message first.");
        return false;
      }

      try {
        setIsLoading(true);
        const result = await chatApi.saveConversation({
          session_id: sessionId,
          filename,
        });

        // Add system message about saving
        const saveMessage: Message = {
          role: "system",
          content: result.message,
        };
        setMessages((prevMessages) => [...prevMessages, saveMessage]);
        setError(null);
        return result.success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save conversation"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  // Load a saved conversation
  const loadConversation = useCallback(
    async (conversationName: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const result = await chatApi.loadConversation({
          conversation_name: conversationName,
        });

        if (result.success && result.session_id) {
          // Update session ID which will trigger fetching messages
          setSessionId(result.session_id);

          // Add system message about loading
          const loadMessage: Message = {
            role: "system",
            content: result.message,
          };
          setMessages([loadMessage]); // Will be replaced when history loads
          setError(null);
          return true;
        } else {
          throw new Error("Failed to load conversation");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load conversation"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Reset the current session
  const resetSession = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setSessionInfo(null);
    setError(null);
  }, []);

  return {
    sessionId,
    messages,
    sessionInfo,
    isLoading,
    error,
    sendMessage,
    toggleFeature,
    saveConversation,
    loadConversation,
    listConversations,
    resetSession,
  };
};

export default useChatSession;
