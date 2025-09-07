"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

const FileDropzone = ({
  onFileSelect,
  accept = ".mp3,.m4a,.wav,.mp4",
  maxSize = 100 * 1024 * 1024, // 100MB
  className,
  disabled = false,
}: FileDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    
    const allowedTypes = accept.split(",").map(type => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return `File type must be one of: ${allowedTypes.join(", ")}`;
    }
    
    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      if (disabled) return;
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragOver && !disabled
            ? "border-brand-500 bg-brand-900/10"
            : "border-ink-600 hover:border-ink-500",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-error/50 bg-error/5"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload audio file"
        />

        {selectedFile && !error ? (
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center"
            >
              <CheckCircle className="h-12 w-12 text-success" />
            </motion.div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-ink-100">{selectedFile.name}</p>
              <p className="text-sm text-ink-400">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-ink-300 hover:text-ink-100 focus-ring rounded-lg"
            >
              <X className="h-4 w-4" />
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-center"
              animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
            >
              {error ? (
                <AlertCircle className="h-12 w-12 text-error" />
              ) : (
                <Upload className="h-12 w-12 text-ink-400" />
              )}
            </motion.div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-ink-100">
                {error ? "Upload failed" : "Drop your audio file here"}
              </p>
              <p className="text-sm text-ink-400">
                {error ? error : `or click to browse • ${accept} • max ${Math.round(maxSize / (1024 * 1024))}MB`}
              </p>
            </div>

            {isDragOver && !disabled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brand-400 text-sm font-medium"
              >
                Release to upload
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FileDropzone;