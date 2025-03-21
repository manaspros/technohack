import { useState, useCallback } from "react";
import chatApi, { DocumentUploadResponse } from "../services/api";

interface UseDocumentUploadProps {
  sessionId: string | null;
}

interface UseDocumentUploadResult {
  isUploading: boolean;
  uploadProgress: number;
  lastUploadResult: DocumentUploadResponse | null;
  error: string | null;
  uploadDocument: (file: File) => Promise<DocumentUploadResponse | null>;
  resetUploadState: () => void;
}

export const useDocumentUpload = ({
  sessionId,
}: UseDocumentUploadProps): UseDocumentUploadResult => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [lastUploadResult, setLastUploadResult] =
    useState<DocumentUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = useCallback(
    async (file: File): Promise<DocumentUploadResponse | null> => {
      if (!sessionId) {
        setError("No active session. Please send a message first.");
        return null;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        // Simulate progress for better user feedback (actual progress not available with axios by default)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const increment = Math.random() * 15;
            const newValue = prev + increment;
            return newValue >= 90 ? 90 : newValue; // Cap at 90% until complete
          });
        }, 500);

        const result = await chatApi.uploadDocument(sessionId, file);

        clearInterval(progressInterval);
        setUploadProgress(100);
        setLastUploadResult(result);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload document"
        );
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [sessionId]
  );

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setLastUploadResult(null);
    setError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    lastUploadResult,
    error,
    uploadDocument,
    resetUploadState,
  };
};

export default useDocumentUpload;
