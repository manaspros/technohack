import React, { useState, useRef, useEffect } from "react";
import { Message } from "../services/api";
import "./ChatInterface.css";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing animation effect
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setIsTyping((prev) => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
    setIsTyping(false);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage("");
    await onSendMessage(message);
  };

  // Function to render different message types with retro styling
  const renderMessage = (message: Message, index: number) => {
    let messageClass = "";
    switch (message.role) {
      case "user":
        messageClass = "user-message";
        break;
      case "assistant":
        messageClass = "assistant-message";
        break;
      case "system":
        messageClass = "system-message";
        break;
      default:
        messageClass = "other-message";
    }

    return (
      <div key={index} className={`message ${messageClass}`}>
        <div className="message-header">
          {message.role === "user"
            ? "> YOU:"
            : message.role === "assistant"
            ? "> AI:"
            : "> SYS:"}
        </div>
        <div className="message-content">{message.content}</div>
      </div>
    );
  };

  return (
    <div className="retro-chat-interface">
      <div className="chat-header">
        <span className="terminal-text">RAG TERMINAL v1.0</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <span className="blink">_</span> WELCOME TO RAG CHATBOT TERMINAL.
            TYPE A MESSAGE TO BEGIN.
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {isLoading && (
          <div className="loading-message">
            <span className="message-header"> AI:</span>
            <span className="typing-indicator">{isTyping ? "_" : ""}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-prefix">{">"}</div>
        <input
          type="text"
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!inputMessage.trim() || isLoading}
        >
          SEND
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
