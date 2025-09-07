"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Upload as UploadIcon, Settings, ArrowRight, CheckCircle, Clock } from "lucide-react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Input from "@/components/Input";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { cn } from "@/lib/utils";

type UploadMode = "file" | "url";
type ProcessingState = "idle" | "uploading" | "transcribing" | "summarizing" | "complete" | "error";

const Upload = () => {
  const [mode, setMode] = useState<UploadMode>("file");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    language: "auto",
    detail: "standard" as "brief" | "standard" | "deep",
    timestamps: false,
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (mode === "file" && !selectedFile) return;
    if (mode === "url" && !url.trim()) return;

    // Simulate processing flow
    setProcessingState("uploading");
    setProgress(10);

    setTimeout(() => {
      setProcessingState("transcribing");
      setProgress(40);
    }, 1000);

    setTimeout(() => {
      setProcessingState("summarizing");
      setProgress(80);
    }, 3000);

    setTimeout(() => {
      setProcessingState("complete");
      setProgress(100);
    }, 5000);
  };

  const getProcessingMessage = () => {
    switch (processingState) {
      case "uploading":
        return "Uploading audio file...";
      case "transcribing":
        return "Transcribing audio content...";
      case "summarizing":
        return "Generating summary...";
      case "complete":
        return "Summary complete!";
      default:
        return "";
    }
  };

  const isProcessing = ["uploading", "transcribing", "summarizing"].includes(processingState);
  const canSubmit = (mode === "file" && selectedFile) || (mode === "url" && url.trim());

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Container size="md">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Upload Your Podcast
            </h1>
            <p className="text-lg text-ink-300">
              Transform any podcast into a concise, actionable summary
            </p>
          </motion.div>

          {/* Processing Status */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-xl p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-ink-100">{getProcessingMessage()}</p>
                  <p className="text-sm text-ink-400">This usually takes 1-3 minutes</p>
                </div>
              </div>
              <ProgressBar value={progress} variant="brand" showLabel />

              {/* Processing Steps */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { step: "Upload", state: "uploading", icon: UploadIcon },
                  { step: "Transcribe", state: "transcribing", icon: Clock },
                  { step: "Summarize", state: "summarizing", icon: CheckCircle },
                ].map(({ step, state, icon: Icon }) => {
                  const isActive = processingState === state;
                  const isComplete = ["transcribing", "summarizing", "complete"].includes(processingState) && 
                    (state === "uploading" || 
                     (state === "transcribing" && ["summarizing", "complete"].includes(processingState)));

                  return (
                    <div
                      key={step}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg transition-all",
                        isActive && "bg-brand-600/10 border border-brand-600/20",
                        isComplete && "bg-success/10 border border-success/20"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 mb-2",
                          isActive && "text-brand-400 animate-pulse",
                          isComplete && "text-success",
                          !isActive && !isComplete && "text-ink-500"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive && "text-brand-400",
                          isComplete && "text-success",
                          !isActive && !isComplete && "text-ink-500"
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {processingState === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-xl p-6 mb-8 border border-success/20 bg-success/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
                <div>
                  <h3 className="font-semibold text-ink-100">Summary Ready!</h3>
                  <p className="text-sm text-ink-400">Your podcast has been processed successfully</p>
                </div>
              </div>
              <Button variant="hero" className="w-full">
                View Summary
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Upload Form */}
          {!isProcessing && processingState !== "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-xl p-6 mb-6"
            >
              {/* Mode Tabs */}
              <div className="flex rounded-lg bg-ink-800/50 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setMode("file")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    mode === "file"
                      ? "bg-brand-600 text-white shadow-md"
                      : "text-ink-400 hover:text-ink-200"
                  )}
                >
                  <UploadIcon className="w-4 h-4" />
                  Upload Audio
                </button>
                <button
                  type="button"
                  onClick={() => setMode("url")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    mode === "url"
                      ? "bg-brand-600 text-white shadow-md"
                      : "text-ink-400 hover:text-ink-200"
                  )}
                >
                  <Link2 className="w-4 h-4" />
                  Paste URL
                </button>
              </div>

              {/* Upload Methods */}
              {mode === "file" ? (
                <FileDropzone onFileSelect={handleFileSelect} />
              ) : (
                <div className="space-y-4">
                  <Input
                    placeholder="https://open.spotify.com/episode/... or RSS feed URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    size="lg"
                    leftIcon={<Link2 className="w-4 h-4" />}
                    hint="Supports Spotify, Apple Podcasts, RSS feeds, and direct audio URLs"
                  />
                </div>
              )}

              {/* Options */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowOptions(!showOptions)}
                  className="flex items-center gap-2 text-sm text-ink-300 hover:text-ink-100 focus-ring rounded-lg p-2"
                >
                  <Settings className="w-4 h-4" />
                  Advanced Options
                  <motion.div
                    animate={{ rotate: showOptions ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </button>

                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4 pl-6 border-l border-ink-700"
                  >
                    <div>
                      <label className="block text-sm font-medium text-ink-200 mb-2">
                        Language
                      </label>
                      <select
                        value={options.language}
                        onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full rounded-lg border border-ink-600 bg-ink-800/50 px-3 py-2 text-sm text-ink-100 focus-ring"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ink-200 mb-2">
                        Summary Detail Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["brief", "standard", "deep"] as const).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setOptions(prev => ({ ...prev, detail: level }))}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                              options.detail === level
                                ? "bg-brand-600 text-white"
                                : "bg-ink-800 text-ink-300 hover:bg-ink-700"
                            )}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="timestamps"
                        checked={options.timestamps}
                        onChange={(e) => setOptions(prev => ({ ...prev, timestamps: e.target.checked }))}
                        className="w-4 h-4 text-brand-600 bg-ink-800 border-ink-600 rounded focus:ring-brand-500"
                      />
                      <label htmlFor="timestamps" className="text-sm text-ink-200">
                        Include timestamps in summary
                      </label>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  Generate Summary
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Upload;