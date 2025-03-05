"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  User,
  Bot,
  Lightbulb,
  BookOpen,
  List,
  Reply,
  ActivitySquare,
  Network,
  Map,
} from "lucide-react";
import { motion } from "framer-motion";
import BlinkingCursor from "../components/BlinkingCursor";
import LearningPathDiagram from "../components/LearningPathDiagram";
import { cn } from "@/lib/utils";
import styles from "../components/CustomScrollbar.module.css";

// ...existing types and constants...
type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  role?: string;
  parts?: string;
  isLearningPath?: boolean;
  questions?: string[];
  learningSteps?: LearningStep[];
  showDiagram?: boolean;
};

type LearningStep = {
  id: string;
  title: string;
  description: string;
  type: "prerequisite" | "core" | "practice" | "advanced";
};

// API endpoint configuration
const API_URL = "https://techstack-backend.onrender.com/chat";

// Function to detect questions in the text
const detectQuestions = (text: string): string[] => {
  // ...existing code...
  if (!text) return [];

  const questions: string[] = [];

  // Pattern to match sentences ending with question marks
  const questionRegex = /([^.!?]+\?)/g;
  const matches = text.match(questionRegex);

  if (matches) {
    matches.forEach((question) => {
      questions.push(question.trim());
    });
  }

  return questions;
};

// Function to detect if content has a learning structure (even if not explicitly a learning path)
const hasLearningStructure = (text: string): boolean => {
  // Check for numbered steps or phases
  const hasSteps =
    /(?:^|\n)(?:step|phase|part|level|stage|\d+)[:\.\)\-]?\s+/gi.test(text);

  // Check for section headers
  const hasHeaders = /(?:^|\n)#{1,3}\s+/g.test(text);

  // Check for multiple numbered list items
  const numberedItems = text.match(/(?:^|\n)\d+\.\s+/g);
  const hasOrderedList = numberedItems && numberedItems.length >= 3; // At least 3 numbered items

  // Check for keywords that suggest a learning sequence
  const hasLearningKeywords =
    /\b(?:prerequisites?|fundamentals|essentials|basics|first|second|third|then|next|finally|advanced|begin by|start with)\b/i.test(
      text
    );

  // Return true if any of the structured content patterns are detected
  return hasSteps || hasHeaders || hasOrderedList || hasLearningKeywords;
};

// Helper function to clean text with markdown symbols
const cleanMarkdownText = (text: string): string => {
  if (!text) return "";

  // Remove markdown formatting symbols without losing content
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold asterisks
    .replace(/\*(.*?)\*/g, "$1") // Remove italic asterisks
    .replace(/__(.*?)__/g, "$1") // Remove bold underscores
    .replace(/_(.*?)_/g, "$1") // Remove italic underscores
    .replace(/`(.*?)`/g, "$1") // Remove code backticks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Keep link text, remove URL
};

// Improved function to extract learning steps from a learning path text
const extractLearningSteps = (text: string): LearningStep[] => {
  // ...existing function with better pattern matching...
  if (!text) return [];

  console.log(
    "Extracting learning steps from:",
    text.substring(0, 100) + "..."
  );
  const steps: LearningStep[] = [];

  // Try to identify different sections in the learning path
  const sections = [
    {
      pattern:
        /prerequisites?|before you start|foundation|basics|getting started/i,
      type: "prerequisite",
    },
    {
      pattern: /core|fundamentals|key concepts|essentials|primary|main/i,
      type: "core",
    },
    {
      pattern:
        /practice|projects?|exercises|hands-on|building|create|implement|coding/i,
      type: "practice",
    },
    {
      pattern:
        /advanced|deeper|next steps|further|mastery|optimization|expert/i,
      type: "advanced",
    },
  ];

  // More permissive pattern to catch different numbering styles and headers
  const stepPatterns = [
    // Match explicit steps/phases
    /(?:^|\n)(?:Step|Phase|Part|Level|Stage)[\s:-]+(\d+|[A-Z])[\s:-]*([^\n]+)/gi,
    // Match numbered headers like "1. Title" or "1) Title"
    /(?:^|\n)(\d+)[\.:\)\-]\s+([^\n]+)/gi,
    // Match markdown headers with potential prefixes
    /(?:^|\n)#{1,3}\s+(?:(?:Step|Phase|Part|Stage|Level)[\s:-]+)?([^\n]+)/gi,
  ];

  let match;
  let stepCount = 0;

  // Try each pattern in sequence
  for (const pattern of stepPatterns) {
    const regex = new RegExp(pattern);

    while ((match = regex.exec(text)) !== null) {
      stepCount++;
      // Extract title (different positions based on regex pattern)
      const rawTitle = match[2] || match[1] || `Step ${stepCount}`;
      const title = cleanMarkdownText(rawTitle);

      // Get content following this step
      const startIdx = match.index + match[0].length;
      const endIdx = text.indexOf("\n\n", startIdx + 10);
      let rawDescription = text
        .substring(
          startIdx,
          endIdx > -1 ? endIdx : Math.min(startIdx + 150, text.length)
        )
        .trim();

      // Clean the description of markdown symbols
      let description = cleanMarkdownText(rawDescription);

      // Additional cleanup
      description = description.replace(/^\s*[-•*]\s*/, "").trim();
      description = description.replace(/^[:\-–]\s*/, "").trim();

      if (!description) description = "No details provided for this step";
      if (description.length > 100) {
        description = description.substring(0, 97) + "...";
      }

      // Determine the type of step
      let stepType: "prerequisite" | "core" | "practice" | "advanced";

      // Check content for keywords to determine type
      const sectionMatched = sections.find((section) =>
        section.pattern.test(title.toLowerCase())
      );

      if (sectionMatched) {
        stepType = sectionMatched.type as any;
      } else if (stepCount <= 2) {
        stepType = "prerequisite";
      } else if (stepCount <= 5) {
        stepType = "core";
      } else if (stepCount <= 8) {
        stepType = "practice";
      } else {
        stepType = "advanced";
      }

      steps.push({
        id: `step-${stepCount}`,
        title,
        description,
        type: stepType,
      });
    }

    // If we found steps with this pattern, stop trying others
    if (steps.length > 0) break;
  }

  // If no structured steps found, try to extract from regular numbered lists
  if (steps.length === 0) {
    const listItemRegex = /(?:^|\n)(\d+)\.\s+([^\n]+)/g;

    while ((match = listItemRegex.exec(text)) !== null) {
      const number = match[1];
      const rawContent = match[2].trim();
      const content = cleanMarkdownText(rawContent);

      // Only include meaningful list items (longer than just a few characters)
      if (content.length > 10) {
        const stepType =
          stepCount < 2
            ? "prerequisite"
            : stepCount < 4
            ? "core"
            : stepCount < 6
            ? "practice"
            : "advanced";

        steps.push({
          id: `list-${number}`,
          title: `Step ${number}: ${content.substring(0, 40)}${
            content.length > 40 ? "..." : ""
          }`,
          description: content,
          type: stepType,
        });

        stepCount++;
      }
    }
  }

  // If still no steps found, create basic steps from the text structure
  if (steps.length === 0 && hasLearningStructure(text)) {
    // Create default learning steps for structured content
    const paragraphs = text
      .split("\n\n")
      .filter((p) => p.trim().length > 0)
      .slice(0, 5); // Use first 5 paragraphs at most

    const stepTypes = ["prerequisite", "core", "core", "practice", "advanced"];

    paragraphs.forEach((paragraph, idx) => {
      // Extract a title from the paragraph
      let title = paragraph.split(/[.!?]/)[0].trim();
      if (title.length > 50) title = title.substring(0, 47) + "...";

      // Get a short description
      let description = paragraph.substring(title.length).trim().slice(0, 100);
      if (!description && paragraph.length > title.length) {
        description = paragraph
          .slice(title.length + 1, title.length + 100)
          .trim();
      }
      if (description.length > 97) description += "...";

      steps.push({
        id: `auto-${idx}`,
        title: title || `Step ${idx + 1}`,
        description: description || "Continue following this guide",
        type: stepTypes[idx] as
          | "prerequisite"
          | "core"
          | "practice"
          | "advanced",
      });
    });
  }

  return steps;
};

// Enhanced formatBotMessage function with code block support
const formatBotMessage = (text: string, isLearningPath: boolean = false) => {
  if (!text) return "";

  // Format learning path sections specially
  if (isLearningPath) {
    // ...existing learning path formatting...
    text = text.replace(
      /^(Step \d+:|#+ Step \d+:|#+ \d+\.|Phase \d+:)/gim,
      '<h3 class="font-bold text-green-400 text-lg mt-4 mb-2">$1</h3>'
    );

    // Add learning path intro
    text =
      `<div class="bg-gray-900 p-3 mb-4 rounded-md border-l-4 border-green-400">
              <h2 class="font-bold text-xl text-green-400 mb-2">Learning Path</h2>
              <p class="text-sm opacity-80">Follow this structured guide to master this technology.</p>
            </div>` + text;
  }

  // Process code blocks first before other formatting
  // Match code blocks with language specification: ```language ... ```
  let formattedText = text.replace(
    /```([a-zA-Z0-9_-]*)\n([\s\S]*?)\n```/g,
    (_, language, code) => {
      // Clean the language name
      const lang = language.trim().toLowerCase() || "plaintext";

      // Determine language-specific styling
      let langClass = "";
      let langLabel = lang;

      // Handle common programming languages
      if (["javascript", "js", "typescript", "ts"].includes(lang)) {
        langClass = "text-yellow-300";
        langLabel =
          lang === "js" ? "JavaScript" : lang === "ts" ? "TypeScript" : lang;
      } else if (["python", "py"].includes(lang)) {
        langClass = "text-blue-300";
        langLabel = "Python";
      } else if (["bash", "shell", "sh", "zsh"].includes(lang)) {
        langClass = "text-green-300";
        langLabel = "Terminal";
      } else if (["html", "xml"].includes(lang)) {
        langClass = "text-orange-300";
        langLabel = lang.toUpperCase();
      } else if (["css", "scss", "sass"].includes(lang)) {
        langClass = "text-pink-300";
        langLabel = lang.toUpperCase();
      } else if (["json"].includes(lang)) {
        langClass = "text-cyan-300";
        langLabel = "JSON";
      } else if (["sql"].includes(lang)) {
        langClass = "text-blue-300";
        langLabel = "SQL";
      }

      // Escape HTML in the code
      const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Return styled code block
      return `
        <div class="my-4 rounded-md overflow-hidden border border-gray-700 bg-gray-900">
          <div class="flex justify-between items-center px-4 py-1 bg-gray-800 border-b border-gray-700">
            <span class="text-xs font-semibold ${
              langClass || "text-gray-300"
            }">${langLabel}</span>
            <span class="text-xs text-gray-400">code</span>
          </div>
          <pre class="p-4 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">${escapedCode}</pre>
        </div>
      `;
    }
  );

  // Handle inline code blocks (text between backticks)
  formattedText = formattedText.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-gray-900 text-orange-300 font-mono text-sm">$1</code>'
  );

  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formattedText = formattedText.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${url}</a>`;
  });

  // Rest of formatting (bold, italic, lists, etc.)
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g,
    "<strong class='text-green-400'>$1</strong>"
  );
  formattedText = formattedText.replace(
    /\*(.*?)\*/g,
    "<strong class='text-green-400'>$1</strong>"
  );
  formattedText = formattedText.replace(/_(.*?)_/g, "<em>$1</em>");

  if (!isLearningPath) {
    formattedText = formattedText.replace(
      /^##\s(.+)$/gm,
      '<h3 class="font-bold text-green-400 text-lg mt-4 mb-2">$1</h3>'
    );
    formattedText = formattedText.replace(
      /^#\s(.+)$/gm,
      '<h2 class="font-bold text-xl text-green-400 mt-5 mb-3">$1</h2>'
    );
  }

  formattedText = formattedText.replace(
    /^[-*]\s(.+)$/gm,
    '<div class="flex items-start mb-2"><span class="mr-2 text-green-400">→</span><span>$1</span></div>'
  );

  formattedText = formattedText.replace(
    /^(\d+)\.\s(.+)$/gm,
    '<div class="flex items-start mb-2"><span class="mr-2 text-purple-400 min-w-[1.5rem] text-right">$1.</span><span>$2</span></div>'
  );

  formattedText = formattedText
    .split("\n")
    .map((line) => {
      if (
        line.includes('<div class="flex items-start') ||
        line.includes("<h2") ||
        line.includes("<h3") ||
        line.includes("<pre") ||
        line.includes("<code") ||
        line.includes('<div class="my-4 rounded-md')
      ) {
        return line;
      }
      return line + "<br />";
    })
    .join("");

  return formattedText;
};

export default function ChatbotPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialQueryProcessedRef = useRef(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // ...existing useEffects and handler functions...
  useEffect(() => {
    if (initialQuery && !initialQueryProcessedRef.current) {
      initialQueryProcessedRef.current = true;
      handleUserMessage(initialQuery);
    } else if (!initialQuery && !initialQueryProcessedRef.current) {
      initialQueryProcessedRef.current = true;
      // Add welcome message if no initial query
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: "Hello! I'm your Tech Learning Assistant. Ask me about any technology or programming language you want to learn, and I can help guide your learning journey.",
          sender: "bot",
          timestamp: new Date(),
          role: "model",
          parts: "Hello! I'm your Tech Learning Assistant.",
          questions: [],
        };
        setMessages([welcomeMessage]);
      }, 500);
    }
  }, [initialQuery]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle diagram view for a specific message
  const toggleDiagram = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, showDiagram: !msg.showDiagram } : msg
      )
    );
  };

  // Function to get chat history in the format expected by the API
  const getChatHistory = () => {
    return messages.map((message) => ({
      role: message.sender === "user" ? "user" : "model",
      parts: message.text,
    }));
  };

  // Function to handle responding to a specific question
  const handleRespondToQuestion = (question: string) => {
    // Create a response template
    const responseTemplate = `Regarding your question: "${question}"\n\nMy answer is: `;
    setInputValue(responseTemplate);

    // Focus the input field
    const inputField = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    if (inputField) {
      inputField.focus();
      // Position cursor at the end
      inputField.setSelectionRange(
        responseTemplate.length,
        responseTemplate.length
      );
    }
  };

  // Function to call the backend API
  const fetchBotResponse = async (
    userText: string,
    generateLearningPath: boolean = false
  ) => {
    try {
      setError(null);
      const oldChats = getChatHistory();

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newChat: userText,
          oldChats: oldChats,
          generateLearningPath,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API call failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to communicate with the chatbot"
      );
      return null;
    }
  };

  // Modified handleUserMessage to automatically detect and display learning paths
  const handleUserMessage = async (
    text: string,
    generateLearningPath: boolean = false
  ) => {
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: generateLearningPath ? `Create learning path for: ${text}` : text,
      sender: "user",
      timestamp: new Date(),
      role: "user",
      parts: text,
      questions: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Get response from the API
    const response = await fetchBotResponse(text, generateLearningPath);
    setIsTyping(false);

    if (response) {
      // Detect questions in the response text
      const questions = detectQuestions(response.answer);

      // Check if this is an explicit learning path or has learning structure
      const isExplicitLearningPath = !!response.isLearningPath;
      const hasStructure = hasLearningStructure(response.answer);
      const shouldShowLearningPath = isExplicitLearningPath || hasStructure;

      // Extract learning steps if appropriate
      let learningSteps = undefined;
      if (shouldShowLearningPath) {
        console.log("Detected structured content in response");
        learningSteps = extractLearningSteps(response.answer);
        console.log("Extracted steps:", learningSteps?.length || 0);
      }

      // Determine if we should auto-display the diagram
      const autoShowDiagram =
        isExplicitLearningPath ||
        (hasStructure && learningSteps && learningSteps.length >= 3);

      const botMessage: Message = {
        id: Date.now().toString(),
        text: response.answer,
        sender: "bot",
        timestamp: new Date(),
        role: response.role || "model",
        parts: response.answer,
        isLearningPath: shouldShowLearningPath,
        questions: questions,
        learningSteps: learningSteps || [],
        showDiagram: autoShowDiagram,
      };

      setMessages((prev) => [...prev, botMessage]);
    } else {
      // Handle error case
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error processing your request. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
        role: "model",
        parts: "Error message",
        questions: [],
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleUserMessage(inputValue);
  };

  const handleRequestLearningPath = () => {
    if (!inputValue.trim()) return;
    handleUserMessage(inputValue, true);
  };

  return (
    <div className="w-full h-[80vh] flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-pixel mb-2">Tech Learning Assistant</h1>
        <p className="text-sm font-mono">
          Ask about any programming language, framework, or tech stack
        </p>
      </div>

      {/* Messages container with custom scrollbar */}
      <div
        className={cn(
          "flex-grow overflow-y-auto px-4 py-2 border-2 border-green-400 bg-gray-950 rounded-lg mb-4",
          styles.pixelScrollbar
        )}
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "mb-4 px-3 py-2 rounded-lg",
              message.sender === "user"
                ? "ml-auto bg-purple-800 text-white max-w-[80%]"
                : message.isLearningPath
                ? "bg-gray-800 text-green-400 w-full"
                : "bg-gray-800 text-green-400 max-w-[80%]"
            )}
            ref={index === messages.length - 1 ? lastMessageRef : null}
          >
            <div className="flex items-start gap-2">
              <div className="mt-1">
                {message.sender === "user" ? (
                  <User className="h-5 w-5" />
                ) : message.isLearningPath ? (
                  <BookOpen className="h-5 w-5" />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>
              <div className="w-full">
                {message.sender === "user" ? (
                  <p className="font-mono text-sm">{message.text}</p>
                ) : (
                  <div
                    className="font-mono text-sm list-content"
                    dangerouslySetInnerHTML={{
                      __html: formatBotMessage(
                        message.text,
                        message.isLearningPath
                      ),
                    }}
                  />
                )}

                {/* Show Learning Path Diagram for structured content */}
                {message.isLearningPath &&
                  message.learningSteps &&
                  message.learningSteps.length > 0 && (
                    <div className="mt-4 mb-2">
                      {message.showDiagram ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-400">
                              <Map className="h-4 w-4" />
                              <span className="font-bold text-sm">
                                Learning Roadmap
                              </span>
                            </div>
                            <button
                              onClick={() => toggleDiagram(message.id)}
                              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded"
                            >
                              <ActivitySquare className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="mt-2 border-t border-gray-700 pt-4">
                            <LearningPathDiagram
                              steps={message.learningSteps}
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleDiagram(message.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
                        >
                          <Network className="h-4 w-4" />
                          <span>Show Visual Learning Path</span>
                        </button>
                      )}
                    </div>
                  )}

                {/* Display questions with response buttons if there are any */}
                {message.sender === "bot" &&
                  message.questions &&
                  message.questions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-700">
                      <p className="text-xs font-semibold mb-2 text-purple-400">
                        Questions asked:
                      </p>
                      {message.questions.map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className="mb-2 bg-gray-900 rounded-md p-2 flex items-start"
                        >
                          <p className="text-sm text-green-300 flex-grow">
                            {question}
                          </p>
                          <button
                            onClick={() => handleRespondToQuestion(question)}
                            className="ml-2 flex items-center text-xs bg-purple-700 hover:bg-purple-600 text-white px-2 py-1 rounded"
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Respond
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                <p className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="bg-gray-800 text-green-400 rounded-lg px-3 py-2 mb-4 max-w-[80%] flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            <span className="font-mono">
              Thinking
              <BlinkingCursor />
            </span>
          </div>
        )}
        {error && (
          <div className="bg-red-800 text-white rounded-lg px-3 py-2 mb-4 max-w-full">
            <p className="font-mono text-sm">Error: {error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow px-4 py-2 bg-gray-800 text-green-400 font-mono border-2 border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ask about a technology or framework..."
            disabled={isTyping}
          />
          <button
            type="submit"
            className={cn(
              "px-4 py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded-lg transition-colors",
              isTyping && "opacity-50 cursor-not-allowed"
            )}
            disabled={isTyping || !inputValue.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Learning Path Button */}
        <button
          type="button"
          onClick={handleRequestLearningPath}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors",
            (isTyping || !inputValue.trim()) && "opacity-50 cursor-not-allowed"
          )}
          disabled={isTyping || !inputValue.trim()}
        >
          <Lightbulb className="h-4 w-4" />
          <span>Generate Learning Path</span>
          <List className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
