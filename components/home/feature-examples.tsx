"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Camera, Headphones, Code, FilmIcon, Zap } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Define example data
const examples = [
  {
    title: "Image Analysis",
    icon: <Camera className="h-6 w-6 text-blue-400" />,
    description: "Upload images for smart visual recognition and description",
    query: "Analyze this image for me",
  },
  {
    title: "Audio Processing",
    icon: <Headphones className="h-6 w-6 text-green-400" />,
    description: "Convert speech to text or analyze sound patterns",
    query: "Transcribe this audio file",
  },
  {
    title: "Code Intelligence",
    icon: <Code className="h-6 w-6 text-purple-400" />,
    description: "Understand, explain and debug any programming language",
    query: "Explain this code snippet",
  },
  {
    title: "Video Understanding",
    icon: <FilmIcon className="h-6 w-6 text-yellow-400" />,
    description: "Extract insights and analyze video content",
    query: "What's happening in this video?",
  },
];

export function FeatureExamples() {
  const router = useRouter();

  const handleExampleClick = (query: string) => {
    router.push(`/chatbot?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {examples.map((example, idx) => (
        <motion.div
          key={example.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + idx * 0.1, duration: 0.3 }}
          onClick={() => handleExampleClick(example.query)}
          className="relative bg-gray-800 border-2 border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors group"
        >
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={60}
            glow={true}
            disabled={false}
            proximity={40}
            inactiveZone={0.01}
          />
          <div className="relative z-10 flex items-start gap-4">
            <div className="mt-1">{example.icon}</div>
            <div>
              <h4 className="font-mono text-green-400 font-bold mb-2 text-xl">
                {example.title}
              </h4>
              <p className="text-base text-gray-300 mb-3">
                {example.description}
              </p>
              <div className="flex items-center text-sm text-gray-400 group-hover:text-blue-400 transition-colors">
                <Zap className="h-4 w-4 mr-2 inline" />
                <span>Try this capability</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
