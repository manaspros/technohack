import React, { useState, useEffect } from "react";
import "./ConversationManager.css";

interface ConversationManagerProps {
  sessionId: string | null;
  isLoading: boolean;
  onSaveConversation: (filename: string) => Promise<boolean>;
  onLoadConversation: (conversationName: string) => Promise<boolean>;
  onListConversations: () => Promise<string[]>;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
  sessionId,
  isLoading,
  onSaveConversation,
  onLoadConversation,
  onListConversations,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [conversations, setConversations] = useState<string[]>([]);
  const [selectedConversation, setSelectedConversation] = useState("");
  const [filename, setFilename] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Fetch conversations when panel opens
  useEffect(() => {
    if (isPanelOpen) {
      fetchConversations();
    }
  }, [isPanelOpen]);

  const fetchConversations = async () => {
    try {
      setIsLoadingList(true);
      const list = await onListConversations();
      setConversations(list);
    } catch (error) {
      setStatusMessage("Failed to load conversations");
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleSaveConversation = async () => {
    if (!filename.trim()) {
      setStatusMessage("Please enter a filename");
      return;
    }

    try {
      setStatusMessage("Saving conversation...");
      const result = await onSaveConversation(filename);
      if (result) {
        setStatusMessage(`Conversation saved as ${filename}`);
        setFilename("");
        // Refresh conversation list
        fetchConversations();
      } else {
        setStatusMessage("Failed to save conversation");
      }
    } catch (error) {
      setStatusMessage("Error saving conversation");
    }
  };

  const handleLoadConversation = async () => {
    if (!selectedConversation) {
      setStatusMessage("Please select a conversation to load");
      return;
    }

    try {
      setStatusMessage("Loading conversation...");
      const result = await onLoadConversation(selectedConversation);
      if (result) {
        setStatusMessage(`Loaded conversation: ${selectedConversation}`);
        setIsPanelOpen(false); // Close panel after successful load
      } else {
        setStatusMessage("Failed to load conversation");
      }
    } catch (error) {
      setStatusMessage("Error loading conversation");
    }
  };

  return (
    <div className="retro-conversation-manager">
      <button
        className="conversation-manager-toggle"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        {isPanelOpen ? "CLOSE CONVERSATION MENU" : "CONVERSATION MENU"}
      </button>

      {isPanelOpen && (
        <div className="conversation-panel">
          <div className="panel-section">
            <h2 className="section-title">SAVE CONVERSATION</h2>
            <div className="input-group">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename"
                disabled={isLoading || !sessionId}
              />
              <button
                onClick={handleSaveConversation}
                disabled={isLoading || !sessionId || !filename.trim()}
              >
                SAVE
              </button>
            </div>
          </div>

          <div className="panel-section">
            <h2 className="section-title">LOAD CONVERSATION</h2>
            {isLoadingList ? (
              <div className="loading-text">LOADING...</div>
            ) : conversations.length > 0 ? (
              <>
                <select
                  value={selectedConversation}
                  onChange={(e) => setSelectedConversation(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">-- Select Conversation --</option>
                  {conversations.map((conv, index) => (
                    <option key={index} value={conv}>
                      {conv}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleLoadConversation}
                  disabled={isLoading || !selectedConversation}
                >
                  LOAD
                </button>
              </>
            ) : (
              <div className="no-conversations">NO SAVED CONVERSATIONS</div>
            )}
          </div>

          {statusMessage && (
            <div className="status-message">{statusMessage}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationManager;
