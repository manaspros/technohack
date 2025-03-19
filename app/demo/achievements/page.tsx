"use client";

import { useState } from "react";
import {
  useAchievements,
  AchievementPanel,
} from "@/components/ui/achievement-notification";
import { Button } from "@/components/ui/button";
import { Award, MessageSquareText, Image, Mic } from "lucide-react";

export default function AchievementDemoPage() {
  const { unlockAchievement, achievements } = useAchievements();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-pixel mb-8 text-center">
        Achievement System
      </h1>
      <p className="text-center font-mono mb-8">
        Gamify your AI interactions with achievements and rewards
      </p>

      <div className="max-w-md mx-auto bg-gray-800 rounded-lg border-2 border-gray-700 p-6">
        <h2 className="text-xl font-pixel mb-6 flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-400" />
          Test Achievements
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-yellow-400" />
              <span className="font-mono">First Message</span>
            </div>
            <Button
              onClick={() => unlockAchievement("first_chat")}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Unlock
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-blue-400" />
              <span className="font-mono">Upload Image</span>
            </div>
            <Button
              onClick={() => unlockAchievement("upload_image")}
              className="bg-blue-500 text-black hover:bg-blue-400"
            >
              Unlock
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-400" />
              <span className="font-mono">Audio Analysis</span>
            </div>
            <Button
              onClick={() => unlockAchievement("audio_analysis")}
              className="bg-purple-500 text-black hover:bg-purple-400"
            >
              Unlock
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="font-mono mb-4">
          Click the achievement button in the bottom right to view all
          achievements
        </p>
      </div>

      {/* Achievement panel is available here too */}
      <AchievementPanel />
    </div>
  );
}
