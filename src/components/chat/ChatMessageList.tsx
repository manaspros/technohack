import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, User } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { PixelSpinner } from "@/components/ui/pixel-spinner";
import { ChatMessage } from "@/src/hooks/useChatSession";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  showScrollTop?: boolean;
  onScrollToTop?: () => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  onScroll,
  showScrollTop,
  onScrollToTop,
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto mb-4 pr-2 md:pr-4 font-mono"
      onScroll={onScroll}
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
                  <PixelSpinner type="scan" size="sm" color="#4ade80" />
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
  );
}
