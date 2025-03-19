"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ActionSearchBar from "../components/kokonutui/action-search-bar";
import { Code, Camera, Headphones, Zap, FilmIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import HeroHighlightDemo from "@/components/hero-highlight-demo";
import PixelLoader from "@/components/ui/pixel-loader";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time to show the loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleExampleClick = (query: string) => {
    router.push(`/chatbot?q=${encodeURIComponent(query)}`);
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <PixelLoader size="large" text="Initializing AI" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero highlight section */}
      <section className="mt-0 mb-6 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16">
        <HeroHighlightDemo />
      </section>

      <section className="mt-0 mb-10">
        <h2 className="text-2xl font-bold font-pixel mb-4 text-center">
          Ask, Upload or Record Anything
        </h2>
        <ActionSearchBar />
      </section>

      <div className="min-h-[40vh] flex flex-col items-center justify-start gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full"
        >
          <h3 className="font-pixel text-2xl text-center mb-6">
            Try interacting with...
          </h3>

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
        </motion.div>
      </div>
    </div>
  );
}
