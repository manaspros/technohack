import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  FileCode,
  Headphones,
  Video,
  File,
  X,
  Upload,
} from "lucide-react";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileUploadProps {
  onChange?: (files: File[]) => void;
}

export const FileUpload = ({ onChange }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (name: string) => {
    const updatedFiles = files.filter((file) => file.name !== name);
    setFiles(updatedFiles);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <Camera className="h-5 w-5 text-blue-400" />;
    } else if (fileType.includes("audio")) {
      return <Headphones className="h-5 w-5 text-green-400" />;
    } else if (fileType.includes("video")) {
      return <Video className="h-5 w-5 text-purple-400" />;
    } else if (
      fileType.includes("text") ||
      fileType.includes("application/json") ||
      fileType.includes("javascript")
    ) {
      return <FileCode className="h-5 w-5 text-yellow-400" />;
    }
    return <File className="h-5 w-5 text-gray-400" />;
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: handleFileChange,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
      "video/*": [".mp4", ".webm", ".mov"],
      "text/*": [".txt", ".md", ".json", ".js", ".ts", ".html", ".css"],
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className={cn(
          "p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden",
          isDragging && "bg-green-500/10"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-30">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center py-10">
          <motion.div
            className="relative mb-6 w-16 h-16 border-2 border-dashed border-green-500/50 rounded-full flex items-center justify-center"
            animate={{
              boxShadow: isDragging
                ? "0 0 0 4px rgba(74, 222, 128, 0.3)"
                : "0 0 0 0px rgba(74, 222, 128, 0)",
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{
                rotate: isDragActive ? 180 : 0,
                scale: isDragActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <Upload className="w-8 h-8 text-green-500" />
            </motion.div>
          </motion.div>

          <p className="relative z-20 font-pixel text-2xl text-green-400 mb-4">
            {isDragActive ? "Drop Files Here" : "Multimodal Upload"}
          </p>
          <p className="relative z-20 font-mono text-lg text-gray-300 dark:text-gray-300 mt-2 mb-6 text-center">
            {isDragActive
              ? "Release to upload files for AI analysis"
              : "Drag or drop files here to analyze with AI"}
          </p>
          <p className="relative z-20 font-mono text-sm text-gray-400 dark:text-gray-400 text-center max-w-md mx-auto">
            Supports images, audio, video, text, code, and documents
          </p>

          <div className="relative flex flex-wrap justify-center gap-4 mt-8">
            <FileTypeOption icon={<Camera />} label="Images" />
            <FileTypeOption icon={<Headphones />} label="Audio" />
            <FileTypeOption icon={<Video />} label="Video" />
            <FileTypeOption icon={<FileCode />} label="Code" />
          </div>

          {/* No longer showing files here - moved to the success state component */}
        </div>

        {isDragging && (
          <motion.div
            className="absolute inset-0 border-2 border-dashed border-green-500 bg-green-500/5 rounded-lg z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </div>
  );
};

const FileTypeOption = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-2">
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-6 w-6 text-gray-300",
        })}
      </div>
      <span className="text-xs font-mono text-gray-400">{label}</span>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
// This function is no longer needed as we're using the string.includes() method
