import { useState } from "react";
import chatApi from "../services/api";

interface UseDocumentUploadProps {
  sessionId: string | null;
  onStatusMessage?: (message: string) => void;
  onUploadSuccess?: (file: File, result: any) => void;
  onUploadError?: (error: string) => void;
}

export function useDocumentUpload({
  sessionId,
  onStatusMessage,
  onUploadSuccess,
  onUploadError,
}: UseDocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadResult, setLastUploadResult] = useState<{
    success: boolean;
    filename: string;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!sessionId) {
      const errorMessage = "No active session. Send a message first.";
      setError(errorMessage);
      if (onStatusMessage) onStatusMessage(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      return false;
    }

    try {
      // Reset state
      setUploadProgress(0);
      setLastUploadResult(null);
      setError(null);
      setIsUploading(true);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newValue = Math.min(prev + Math.random() * 15, 90);
          return newValue;
        });
      }, 500);

      // Upload file
      const result = await chatApi.uploadDocument(sessionId, file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setLastUploadResult(result);

      // Show success message
      const message = `File uploaded: ${file.name}`;
      if (onStatusMessage) onStatusMessage(message);
      if (onUploadSuccess) onUploadSuccess(file, result);

      return true;
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      setError(errorMessage);

      if (onStatusMessage) onStatusMessage(`Error: ${errorMessage}`);
      if (onUploadError) onUploadError(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadProgress(0);
    setLastUploadResult(null);
    setError(null);
  };

  return {
    isUploading,
    uploadProgress,
    lastUploadResult,
    error,
    handleFileUpload,
    resetUpload,
  };
}
