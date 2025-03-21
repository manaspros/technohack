"use client";
import React, { useState, useEffect } from "react";
import { FileUpload } from "./ui/file-upload";
import { motion, AnimatePresence } from "motion/react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Loader, Sparkles, Upload, Check, X, RefreshCw } from "lucide-react";
import { useAchievements } from "@/components/ui/achievement-notification";
import { cn } from "@/lib/utils";

interface FileUploadDemoProps {
  onUpload?: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function FileUploadDemo({
  onUpload,
  disabled = false,
}: FileUploadDemoProps) {
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
  const { unlockAchievement } = useAchievements();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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
      setUploadSuccess(false);

      // Check file types to unlock relevant achievements
      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          unlockAchievement("upload_image");
        } else if (file.type.startsWith("audio/")) {
          unlockAchievement("audio_analysis");
        }
      });

      // After a short delay, show success state
      setTimeout(() => {
        setUploadSuccess(true);
      }, 2000);
    }
  };

  // Reset the file upload state to allow new uploads
  const resetFileUpload = () => {
    setFiles([]);
    setUploadComplete(false);
    setProcessingStartTime(null);
    setUploadSuccess(false);
  };

  // Reset the demo when files are removed
  useEffect(() => {
    if (files.length === 0 && uploadComplete) {
      setUploadComplete(false);
      setProcessingStartTime(null);
      setUploadSuccess(false);
    }
  }, [files, uploadComplete]);

  // Get file icon based on type
  const getFileTypeIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("audio/")) return "🔊";
    if (type.startsWith("video/")) return "🎬";
    if (type.startsWith("text/")) return "📝";
    if (type.includes("pdf")) return "📄";
    return "📁";
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file && onUpload) {
      await onUpload(file);
      setFile(null); // Reset file selection after upload

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!uploadComplete ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[400px] border-2 border-dashed bg-gray-900/50 dark:bg-black/30 border-green-500/40 dark:border-green-700/40 rounded-lg mb-6 relative overflow-hidden"
          >
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
          </motion.div>
        ) : (
          <motion.div
            key={uploadSuccess ? "success" : "processing"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            {uploadSuccess ? (
              <div className="rounded-lg bg-gray-800/80 border border-green-500/30 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 flex justify-between items-center border-b border-green-500/20">
                  <h3 className="text-lg font-pixel text-green-400 flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Files Ready
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">
                      {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                      uploaded
                    </span>
                    <button
                      onClick={resetFileUpload}
                      className="text-xs flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                      title="Upload new files"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>New</span>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {files.map((file, idx) => (
                      <motion.div
                        key={`${file.name}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between bg-gray-750/50 rounded-md p-3 border border-gray-700/50 hover:bg-gray-700/40 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-gray-900 flex items-center justify-center text-lg">
                            {getFileTypeIcon(file.type)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-mono text-green-300 truncate max-w-[200px]">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-800/80 px-2 py-1 rounded">
                            {file.type.split("/")[0]}
                          </span>
                          <button
                            onClick={() =>
                              setFiles(
                                files.filter((f) => f.name !== file.name)
                              )
                            }
                            className="opacity-60 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/30">
                    <div className="flex items-center text-gray-300">
                      <Sparkles className="h-4 w-4 text-green-400 mr-2" />
                      <span className="font-mono text-sm">
                        AI is ready to analyze your files
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm font-mono transition-colors"
                        onClick={resetFileUpload}
                      >
                        Upload More
                      </button>
                      <button
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-pixel text-black transition-colors"
                        onClick={() => {
                          // This would integrate with your AI system
                          console.log("Processing files:", files);
                        }}
                      >
                        Analyze
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center rounded-lg bg-gray-800/80 border border-green-500/30 p-6">
                <div className="mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 rounded-full border-t-2 border-r-2 border-green-500"
                  />
                </div>
                <h3 className="text-lg font-pixel mb-2 text-green-400">
                  Processing Files
                </h3>
                <p className="font-mono text-sm mb-4 text-gray-300">
                  Your multimodal AI is analyzing the content...
                </p>

                <div className="flex items-center justify-center gap-3 text-green-400 font-mono">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing data points...</span>
                </div>

                <div className="w-full mt-6 bg-gray-900/50 rounded-full h-1.5">
                  <motion.div
                    className="bg-green-500 h-1.5 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
