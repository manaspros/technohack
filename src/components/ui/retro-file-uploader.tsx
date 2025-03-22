import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { FileUp, X, Check, AlertCircle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetroFileUploaderProps {
  onFileSelect: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  lastResult: {
    success: boolean;
    filename: string;
    message: string;
  } | null;
  disabled?: boolean;
  acceptedFileTypes?: string; // e.g., ".pdf,.txt,.md,.csv"
  maxFileSizeInMB?: number;
}

export function RetroFileUploader({
  onFileSelect,
  isUploading,
  uploadProgress,
  lastResult,
  disabled = false,
  acceptedFileTypes = ".pdf,.txt,.md,.csv,.json,.html,.js,.py,.cpp,.java,.c,.cs",
  maxFileSizeInMB = 10,
}: RetroFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileValidationError, setFileValidationError] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileValidationError(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size
      if (file.size > maxFileSizeInMB * 1024 * 1024) {
        setFileValidationError(`File size exceeds ${maxFileSizeInMB}MB limit`);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onFileSelect(selectedFile);
        // The file state will be cleared on successful upload by the parent
      } catch (error) {
        console.error("File upload error:", error);
      }
    }
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    setFileValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="retro-file-uploader w-full bg-gray-900 border-2 border-green-500/30 rounded-md p-4">
      <div className="mb-3 text-center font-pixel text-green-400 text-sm border-b border-green-500/20 pb-2">
        DOCUMENT UPLOAD
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        disabled={disabled || isUploading}
      />

      {/* File selection display */}
      {!isUploading && !lastResult && (
        <div className="mb-4">
          <div className="flex items-center justify-between bg-gray-800 p-2 rounded-md border border-gray-700">
            <div className="truncate font-mono text-xs text-gray-300">
              {selectedFile ? (
                <div className="flex items-center">
                  <FileUp className="h-3 w-3 mr-2 text-green-400" />
                  <span className="truncate max-w-[200px] inline-block">
                    {selectedFile.name}
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">No file selected</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={triggerFileSelect}
                className="bg-gray-700 hover:bg-gray-600 text-green-400 px-2 py-1 rounded text-xs font-mono"
                disabled={disabled || isUploading}
              >
                Browse
              </button>

              {selectedFile && (
                <button
                  type="button"
                  onClick={resetFileSelection}
                  className="text-gray-400 hover:text-red-400 px-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {fileValidationError && (
            <div className="mt-2 text-red-500 text-xs font-mono flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {fileValidationError}
            </div>
          )}

          {selectedFile && !fileValidationError && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-black py-2 rounded font-pixel text-sm transition-colors"
            >
              UPLOAD DOCUMENT
            </button>
          )}

          <div className="mt-3 text-gray-400 text-xs font-mono">
            <div className="mb-1">Supported file types:</div>
            <div className="flex flex-wrap gap-1">
              {acceptedFileTypes.split(",").map((type) => (
                <span
                  key={type}
                  className="bg-gray-800 px-1.5 py-0.5 rounded-sm"
                >
                  {type.replace(".", "")}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 text-xs font-mono flex items-center">
              <Loader className="h-3 w-3 mr-2 animate-spin" />
              UPLOADING: {Math.round(uploadProgress)}%
            </span>
          </div>

          <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
              initial={{ width: "0%" }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {selectedFile && (
            <div className="mt-2 text-gray-400 text-xs font-mono truncate">
              {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </div>
          )}
        </div>
      )}

      {/* Upload result message */}
      {lastResult && (
        <div
          className={`mb-4 p-3 rounded-md border ${
            lastResult.success
              ? "bg-green-900/20 border-green-500/30"
              : "bg-red-900/20 border-red-500/30"
          }`}
        >
          <div className="flex items-start gap-2">
            {lastResult.success ? (
              <Check className="h-4 w-4 text-green-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
            )}
            <div>
              <div className="font-mono text-sm mb-1 text-gray-100">
                {lastResult.success ? "Upload Successful" : "Upload Failed"}
              </div>
              <div className="text-xs font-mono text-gray-300">
                {lastResult.message}
              </div>
              {lastResult.filename && (
                <div className="text-xs mt-1 font-mono text-gray-400">
                  File: {lastResult.filename}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={resetFileSelection}
            className="mt-3 w-full bg-gray-700 hover:bg-gray-600 py-1 rounded text-xs font-mono text-gray-300"
          >
            UPLOAD ANOTHER FILE
          </button>
        </div>
      )}
    </div>
  );
}
