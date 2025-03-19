"use client";

import { Home, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

export default function NavigationButton() {
  const pathname = usePathname() || "";
  const isChatbot = pathname === "/chatbot" || pathname.startsWith("/chatbot");

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Link
        href={isChatbot ? "/" : "/chatbot"}
        className="flex items-center justify-center w-12 h-12 bg-gray-800 border-2 border-green-500 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        aria-label={isChatbot ? "Go to Home" : "Go to Chatbot"}
      >
        {isChatbot ? (
          <Home className="w-5 h-5 text-green-400" />
        ) : (
          <MessageSquare className="w-5 h-5 text-green-400" />
        )}
      </Link>
      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-mono text-gray-300 whitespace-nowrap transition-opacity">
        {isChatbot ? "Home" : "Chatbot"}
      </span>
    </motion.div>
  );
}
