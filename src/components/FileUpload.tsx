import React, { useState, useRef } from "react";
import "./FileUpload.css";

interface FileUploadProps {
  isUploading: boolean;
  uploadProgress: number;
  lastUploadResult: {
    success: boolean;
    filename: string;
    message: string;
  } | null;
  error: string | null;
  onFileUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  isUploading,
  uploadProgress,
  lastUploadResult,
  error,
  onFileUpload,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onFileUpload(selectedFile);
      // Clear the selected file after upload attempt
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="retro-file-upload">
      <div className="file-upload-header">
        <span className="file-header-text">DOCUMENT UPLOAD</span>
      </div>

      <div className="file-upload-content">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={disabled || isUploading}
        />

        <div className="file-selection">
          <span className="file-label">SELECTED FILE:</span>
          <span className="file-name">
            {selectedFile ? selectedFile.name : "NONE"}
          </span>
          <button
            className="browse-button"
            onClick={handleBrowseClick}
            disabled={disabled || isUploading}
          >
            BROWSE
          </button>
        </div>

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={disabled || isUploading || !selectedFile}
        >
          {isUploading ? "UPLOADING..." : "UPLOAD TO KNOWLEDGE BASE"}
        </button>

        {isUploading && (
          <div className="progress-container">
            <div className="progress-label">
              UPLOADING: {Math.round(uploadProgress)}%
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {lastUploadResult && (
          <div
            className={`upload-result ${
              lastUploadResult.success ? "success" : "error"
            }`}
          >
            {lastUploadResult.message}
          </div>
        )}

        {error && <div className="upload-error">ERROR: {error}</div>}
      </div>
    </div>
  );
};

export default FileUpload;
