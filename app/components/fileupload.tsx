"use client";
import React, { useState } from "react";
import { FileUpload } from "./ui/file-upload";
import { motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function FileUploadDemo() {
  interface UploadedFile {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  }

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileUpload = (files: UploadedFile[]): void => {
    setFiles(files);
    if (files.length > 0) {
      // Simulate processing time
      setTimeout(() => {
        setUploadComplete(true);
      }, 1500);
    }
  };

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
          <p className="font-mono text-lg">
            Your multimodal AI is analyzing the content...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
