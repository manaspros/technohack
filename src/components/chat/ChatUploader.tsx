import { motion, AnimatePresence } from "motion/react";
import { RetroFileUploader } from "@/src/components/ui/retro-file-uploader";

interface ChatUploaderProps {
  showFileUpload: boolean;
  onFileSelect: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  lastResult: {
    success: boolean;
    filename: string;
    message: string;
  } | null;
  disabled: boolean;
}

export function ChatUploader({
  showFileUpload,
  onFileSelect,
  isUploading,
  uploadProgress,
  lastResult,
  disabled,
}: ChatUploaderProps) {
  return (
    <AnimatePresence>
      {showFileUpload && (
        <motion.div
          className="w-full mb-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
        >
          <RetroFileUploader
            onFileSelect={onFileSelect}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            lastResult={lastResult}
            disabled={disabled}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
