import React, { useState } from "react";
import RetroControlPanel from "../components/RetroControlPanel";
import ChatInterface from "../components/ChatInterface";
import FileUpload from "../components/FileUpload";
import ConversationManager from "../components/ConversationManager";
import useChatSession from "../hooks/useChatSession";
import useDocumentUpload from "../hooks/useDocumentUpload";
import "./RagChatPage.css";

const RagChatPage: React.FC = () => {
  const {
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
  } = useChatSession();

  const {
    isUploading,
    uploadProgress,
    lastUploadResult,
    error: uploadError,
    uploadDocument,
  } = useDocumentUpload({ sessionId });

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    await uploadDocument(file);
  };

  const handleToggleRag = async (enabled: boolean) => {
    await toggleFeature("rag", enabled);
  };

  const handleToggleWebSearch = async (enabled: boolean) => {
    await toggleFeature("websearch", enabled);
  };

  return (
    <div className="rag-chat-page">
      <div className="retro-header">
        <h1>RAG CHATBOT TERMINAL</h1>
        <div className="system-status">
          {sessionId ? "SYSTEM ONLINE" : "AWAITING CONNECTION"}
        </div>
      </div>

      <div className="main-content">
        <div className="control-section">
          <RetroControlPanel
            sessionId={sessionId}
            ragEnabled={sessionInfo?.rag_enabled ?? true}
            webSearchEnabled={sessionInfo?.web_search_enabled ?? true}
            onToggleRag={handleToggleRag}
            onToggleWebSearch={handleToggleWebSearch}
            isLoading={isLoading}
            error={error}
          />

          <FileUpload
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            lastUploadResult={lastUploadResult}
            error={uploadError}
            onFileUpload={handleFileUpload}
            disabled={!sessionId}
          />

          <ConversationManager
            sessionId={sessionId}
            isLoading={isLoading}
            onSaveConversation={saveConversation}
            onLoadConversation={loadConversation}
            onListConversations={listConversations}
          />
        </div>

        <div className="chat-section">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
          />
        </div>
      </div>

      <div className="retro-footer">
        <div className="session-info">
          {sessionId && (
            <>
              SESSION: {sessionId.substr(0, 8)}...{" "}
              <span className="message-count">
                MESSAGES: {sessionInfo?.message_count || 0}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RagChatPage;
