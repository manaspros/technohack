"use client";

import { useState, useEffect } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquareText, Bot, User, Upload, Loader } from "lucide-react";
import { FileUploadDemo } from "@/app/components/fileupload";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function ChatbotPage() {
  const [inputValue, setInputValue] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
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

  // Function to ensure loading is shown for at least 1 second
  const ensureMinimumLoadingTime = (callback: () => void) => {
    const currentTime = Date.now();
    const elapsedTime = loadingStartTime ? currentTime - loadingStartTime : 0;
    const remainingTime = Math.max(0, 1000 - elapsedTime);

    setTimeout(callback, remainingTime);
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

      // Ensure loading is shown for at least 1 second
      ensureMinimumLoadingTime(() => {
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
      });
    }, 500);
  };

  const toggleFileUpload = () => {
    setShowFileUpload((prev) => !prev);
  };

  const placeholders = [
    "Upload an image for analysis...",
    "Ask me about machine learning concepts...",
    "Share some code for review...",
    "How can multimodal AI help your project?",
    "Describe a problem you're trying to solve...",
  ];

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto">
      <div className="flex items-center justify-center mb-6">
        <MessageSquareText className="h-6 w-6 text-green-400 mr-2" />
        <h1 className="text-2xl font-pixel">Multimodal AI Chatbot</h1>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 pr-4 font-mono">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex mb-4 ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.isUser ? "flex-row-reverse" : "flex-row"
                } items-start gap-2`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    message.isUser ? "bg-blue-500" : "bg-green-500"
                  }`}
                >
                  {message.isUser ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div
                  className={`py-2 px-4 rounded-xl ${
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

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="py-2 px-4 rounded-xl bg-gray-800">
                  <div className="flex items-center space-x-2 text-green-400">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Processing response...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-gray-400 dark:text-gray-300 block">
            Ask or Upload Files
          </span>
          <button
            onClick={toggleFileUpload}
            className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              showFileUpload
                ? "bg-green-600 text-black font-bold"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
            aria-label="Toggle file upload"
          >
            <Upload className="h-4 w-4 inline mr-2" />
            {showFileUpload ? "Hide Upload" : "Upload Media"}
          </button>
        </div>

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

        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          name="query"
          className="focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500 h-14 md:h-16"
          inputClassName="focus:ring-0 text-base md:text-lg"
          placeholderClassName="text-base md:text-lg"
        />
      </div>
    </div>
  );
}
