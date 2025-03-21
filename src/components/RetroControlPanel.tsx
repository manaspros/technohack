import React, { useState } from "react";
import "./RetroControlPanel.css";

interface RetroControlPanelProps {
  sessionId: string | null;
  ragEnabled: boolean;
  webSearchEnabled: boolean;
  onToggleRag: (enabled: boolean) => Promise<void>;
  onToggleWebSearch: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const RetroControlPanel: React.FC<RetroControlPanelProps> = ({
  sessionId,
  ragEnabled,
  webSearchEnabled,
  onToggleRag,
  onToggleWebSearch,
  isLoading,
  error,
}) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const handleToggleRag = async () => {
    if (isLoading || !sessionId) return;
    await onToggleRag(!ragEnabled);
  };

  const handleToggleWebSearch = async () => {
    if (isLoading || !sessionId) return;
    await onToggleWebSearch(!webSearchEnabled);
  };

  return (
    <div
      className={`retro-control-panel ${
        isPanelExpanded ? "expanded" : "collapsed"
      }`}
    >
      <div
        className="panel-header"
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
      >
        <div className="panel-title">CONTROL PANEL</div>
        <div className="panel-toggle">{isPanelExpanded ? "[-]" : "[+]"}</div>
      </div>

      {isPanelExpanded && (
        <div className="panel-content">
          <div className="control-row">
            <div className="control-label">RAG Retrieval:</div>
            <div className="control-switch">
              <button
                className={`toggle-button ${ragEnabled ? "active" : ""}`}
                onClick={handleToggleRag}
                disabled={isLoading || !sessionId}
              >
                {ragEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          <div className="control-row">
            <div className="control-label">Web Search:</div>
            <div className="control-switch">
              <button
                className={`toggle-button ${webSearchEnabled ? "active" : ""}`}
                onClick={handleToggleWebSearch}
                disabled={isLoading || !sessionId}
              >
                {webSearchEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          <div className="session-info">
            {sessionId ? (
              <div className="session-active">SESSION ACTIVE</div>
            ) : (
              <div className="session-inactive">NO SESSION</div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading && <div className="loading-indicator">PROCESSING...</div>}
        </div>
      )}
    </div>
  );
};

export default RetroControlPanel;
