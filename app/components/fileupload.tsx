"use client";
import React, { useState, useEffect } from "react";
import { FileUpload } from "./ui/file-upload";
import { motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Loader } from "lucide-react";

export function FileUploadDemo() {
  interface UploadedFile {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  }

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(
    null
  );

  // Function to ensure loading is shown for at least 1.5 seconds
  const ensureMinimumLoadingTime = (callback: () => void) => {
    const currentTime = Date.now();
    const elapsedTime = processingStartTime
      ? currentTime - processingStartTime
      : 0;
    const remainingTime = Math.max(0, 1500 - elapsedTime);

    setTimeout(callback, remainingTime);
  };

  const handleFileUpload = (files: UploadedFile[]): void => {
    setFiles(files);

    if (files.length > 0) {
      // Record processing start time
      setProcessingStartTime(Date.now());
      setUploadComplete(true);
    }
  };

  // Reset the demo when files are removed
  useEffect(() => {
    if (files.length === 0 && uploadComplete) {
      setUploadComplete(false);
      setProcessingStartTime(null);
    }
  }, [files, uploadComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="min-h-[400px] border-2 border-dashed bg-gray-900/50 dark:bg-black/30 border-green-500/40 dark:border-green-700/40 rounded-lg mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <GlowingEffect
            blur={20}
            borderWidth={2}
            spread={180}
            glow={true}
            disabled={false}
            proximity={100}
            inactiveZone={0.01}
          />
        </div>
        <div className="relative z-10">
          <FileUpload onChange={handleFileUpload} />
        </div>
      </div>

      {uploadComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <h3 className="text-xl font-pixel mb-3 text-green-400">
            Processing Files
          </h3>
          <p className="font-mono text-lg mb-4">
            Your multimodal AI is analyzing the content...
          </p>

          <div className="flex items-center justify-center gap-3 text-green-400 font-mono">
            <Loader className="h-5 w-5 animate-spin" />
            <span>Analyzing data points...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
