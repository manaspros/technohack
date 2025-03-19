"use client";

import { motion, AnimatePresence } from "motion/react";
import { Award, X, MessageSquareText, Image, Mic } from "lucide-react";
import { useState, createContext, useContext, ReactNode } from "react";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
};

interface AchievementContextType {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined
);

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error(
      "useAchievements must be used within an AchievementProvider"
    );
  }
  return context;
}

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_chat",
      title: "Hello World!",
      description: "Send your first message",
      icon: <MessageSquareText className="h-5 w-5 text-yellow-400" />,
      unlocked: false,
    },
    {
      id: "upload_image",
      title: "Pixel Painter",
      description: "Upload your first image",
      icon: <Image className="h-5 w-5 text-blue-400" />,
      unlocked: false,
    },
    {
      id: "audio_analysis",
      title: "Sound Wizard",
      description: "Analyze an audio file",
      icon: <Mic className="h-5 w-5 text-purple-400" />,
      unlocked: false,
    },
    // Add more achievements as needed
  ]);

  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);

  // Function to unlock an achievement
  const unlockAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unlocked: true } : a))
    );

    const achievement = achievements.find((a) => a.id === id);
    if (achievement && !achievement.unlocked) {
      setCurrentAchievement(achievement);
      setShowNotification(true);

      // Hide notification after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  return (
    <AchievementContext.Provider value={{ achievements, unlockAchievement }}>
      {children}
      <AchievementNotification
        showNotification={showNotification}
        currentAchievement={currentAchievement}
        onClose={() => setShowNotification(false)}
      />
    </AchievementContext.Provider>
  );
}

function AchievementNotification({
  showNotification,
  currentAchievement,
  onClose,
}: {
  showNotification: boolean;
  currentAchievement: Achievement | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {showNotification && currentAchievement && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed top-16 right-4 bg-gray-800 border-2 border-yellow-500 p-3 rounded-lg shadow-lg z-50 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <div className="bg-yellow-500 rounded-full p-2 flex-shrink-0">
              <Award className="h-5 w-5 text-black" />
            </div>
            <div>
              <h4 className="font-pixel text-yellow-400">
                Achievement Unlocked!
              </h4>
              <p className="font-bold text-white mt-1">
                {currentAchievement.title}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {currentAchievement.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AchievementPanel() {
  const { achievements } = useAchievements();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 border-2 border-yellow-500 rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
      >
        <Award className="h-6 w-6 text-yellow-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 border-2 border-yellow-500 p-6 rounded-lg z-50 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-pixel text-yellow-400">
                  Achievements
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      achievement.unlocked
                        ? "bg-gray-700"
                        : "bg-gray-900 opacity-70"
                    }`}
                  >
                    <div
                      className={`rounded-full p-2 ${
                        achievement.unlocked ? "bg-yellow-500" : "bg-gray-700"
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {achievement.title}
                      </p>
                      <p className="text-sm text-gray-300">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <Award className="ml-auto h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
