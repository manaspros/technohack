"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ActionSearchBar from "./components/ActionSearchBar";
import { Code, BookOpen, LineChart, Terminal, Zap, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleExampleClick = (query: string) => {
    router.push(`/chatbot?q=${encodeURIComponent(query)}`);
  };

  const examples = [
    {
      title: "Learn React Fundamentals",
      icon: <Code className="h-5 w-5 text-blue-400" />,
      description: "Master React hooks, components and state management",
      query: "Create a learning path for React beginners",
    },
    {
      title: "Python Data Science",
      icon: <LineChart className="h-5 w-5 text-green-400" />,
      description: "Journey from Python basics to ML models",
      query: "How to learn Python for data science from scratch?",
    },
    {
      title: "Full-Stack Web Dev",
      icon: <Globe className="h-5 w-5 text-purple-400" />,
      description: "Frontend, backend, databases and deployment",
      query: "Create a step-by-step roadmap to become a full-stack developer",
    },
    {
      title: "DevOps Essentials",
      icon: <Terminal className="h-5 w-5 text-yellow-400" />,
      description: "CI/CD, containers, and cloud platforms",
      query: "What are the steps to learn DevOps?",
    },
  ];

  return (
    <>
      <div className="min-h-[70vh] flex flex-col items-center justify-start gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-xl md:text-2xl font-pixel mb-4 text-green-400">
            Your AI Learning Assistant
          </h2>
          <p className="font-mono mb-8 text-sm md:text-base">
            Ask any question about programming languages, frameworks, or tech
            stacks and get structured learning paths with code examples.
          </p>
        </motion.div>

        <ActionSearchBar />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full"
        >
          <h3 className="font-pixel text-lg text-center mb-5">
            Try asking about...
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {examples.map((example, idx) => (
              <motion.div
                key={example.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1, duration: 0.3 }}
                onClick={() => handleExampleClick(example.query)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{example.icon}</div>
                  <div>
                    <h4 className="font-mono text-green-400 font-bold mb-1">
                      {example.title}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2">
                      {example.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
                      <Zap className="h-3 w-3 mr-1 inline" />
                      <span>Try this example</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 mb-12 text-center"
        >
          <Link
            href="/chatbot"
            className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span className="font-pixel">Start Learning Now</span>
          </Link>
        </motion.div>
      </div>
    </>
  );
}
