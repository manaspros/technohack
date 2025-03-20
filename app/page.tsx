"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ActionSearchBar from "../components/kokonutui/action-search-bar";
import {
  Code,
  Camera,
  Headphones,
  Zap,
  FilmIcon,
  Search,
  X,
  Sparkles,
  MessageSquare,
  Award,
  Upload,
  LayoutGrid,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import HeroHighlightDemo from "@/components/hero-highlight-demo";
import PixelLoader from "@/components/ui/pixel-loader";
import { RetroControlPanel } from "@/components/ui/retro-control-panel";

// Define tutorial steps
const tutorialSteps = [
  {
    id: "basics",
    title: "Quick Tutorial",
    tips: [
      {
        icon: <Search className="h-4 w-4 text-green-400" />,
        text: "Ask questions or upload files using the search bar",
      },
      {
        icon: <Upload className="h-4 w-4 text-green-400" />,
        text: "Upload images, audio, or code for analysis",
      },
      {
        icon: <LayoutGrid className="h-4 w-4 text-green-400" />,
        text: "Explore example capabilities below",
      },
    ],
  },
  {
    id: "multimodal",
    title: "Multimodal AI",
    tips: [
      {
        icon: <Camera className="h-4 w-4 text-green-400" />,
        text: "Upload images for visual analysis and understanding",
      },
      {
        icon: <Headphones className="h-4 w-4 text-green-400" />,
        text: "Process audio files for transcription and analysis",
      },
      {
        icon: <Code className="h-4 w-4 text-green-400" />,
        text: "Share code for review and improvement suggestions",
      },
    ],
  },
  {
    id: "achievements",
    title: "Achievements",
    tips: [
      {
        icon: <Award className="h-4 w-4 text-green-400" />,
        text: "Earn achievements by using different features",
      },
      {
        icon: <MessageSquare className="h-4 w-4 text-green-400" />,
        text: "Send messages to the AI to unlock communication badges",
      },
      {
        icon: <Sparkles className="h-4 w-4 text-green-400" />,
        text: "Click the trophy icon to view your achievements",
      },
    ],
  },
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialIndex, setCurrentTutorialIndex] = useState(0);
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Settings state - remove sound
  const [settings, setSettings] = useState({
    memory: true,
    webSearch: false,
  });

  // Store tutorial preference in localStorage
  useEffect(() => {
    // Check if user has previously hidden the tutorial
    const tutorialHidden = localStorage.getItem("tutorialHidden") === "true";
    if (tutorialHidden) {
      setShowTutorial(false);
    }
  }, []);

  const hideTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("tutorialHidden", "true");
  };

  const goToNextTip = () => {
    if (currentTutorialIndex < tutorialSteps.length - 1) {
      setCurrentTutorialIndex(currentTutorialIndex + 1);
    } else {
      setCurrentTutorialIndex(0); // Loop back to the first tip
    }
  };

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

  // Handle control panel option changes
  const handleOptionChange = (id: string, isActive: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [id]: isActive,
    }));
  };

  // Toggle file upload
  const toggleFileUpload = () => {
    setShowFileUpload((prev) => !prev);
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

  const currentTutorialStep = tutorialSteps[currentTutorialIndex];

  return (
    <div className="space-y-6">
      {/* Hero highlight section */}
      <section className="mt-0 mb-6 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16">
        <HeroHighlightDemo />
      </section>

      <section className="mt-0 mb-4">
        <h2 className="text-2xl font-bold font-pixel mb-4 text-center">
          Ask, Upload or Record Anything
        </h2>

        {/* Add RetroControlPanel above ActionSearchBar */}
        <div className="max-w-3xl mx-auto px-4">
          <RetroControlPanel
            expanded={controlsExpanded}
            onToggleExpanded={() => setControlsExpanded(!controlsExpanded)}
            onOptionChange={handleOptionChange}
            onFileOpen={toggleFileUpload}
            activeOptions={settings}
          />
        </div>

        <ActionSearchBar
          showFileUploadButton={false}
          showFileUpload={showFileUpload}
        />
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

      {showTutorial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 max-w-md bg-gray-800 border-2 border-green-500 p-4 rounded-lg shadow-lg z-40"
          key={`tutorial-${currentTutorialIndex}`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-pixel text-green-400">
              {currentTutorialStep.title}
            </h3>
            <button
              onClick={hideTutorial}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {currentTutorialStep.tips.map((tip, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="bg-gray-700 p-2 rounded-full">{tip.icon}</div>
                <p className="text-sm text-gray-200 font-mono">{tip.text}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={hideTutorial}
              className="text-xs text-gray-400 hover:text-white font-mono"
            >
              Don't show again
            </button>
            <button
              onClick={goToNextTip}
              className="bg-green-600 text-black px-3 py-1 rounded text-xs font-pixel"
            >
              Next Tip →
            </button>
          </div>

          {/* Tutorial progress indicator */}
          <div className="flex justify-center gap-1 mt-3">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentTutorialIndex
                    ? "bg-green-500"
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
