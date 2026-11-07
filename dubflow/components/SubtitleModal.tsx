"use client";

import React, { useState, useEffect } from "react";
import { FaYoutube } from "react-icons/fa";
import {
  Subtitles,
  Languages,
  Folder,
  HelpCircle,
  X,
  Sparkles,
  Check,
  Play,
  Pause,
  ChevronDown,
  FileText,
  Clock,
  ArrowRight,
  AlertCircle,
  UploadCloud,
  FileCode,
  SlidersHorizontal,
  Video
} from "lucide-react";

interface SubtitleGeneratorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (data: {
    sourceType: "url" | "file";
    videoId?: string;
    fileName?: string;
    language: string;
    format: string;
    title: string;
  }) => void;
}

export const SubtitleGeneratorModal = ({
  isOpen = true,
  onClose,
  onSuccess
}: SubtitleGeneratorModalProps) => {
  const [sourceType, setSourceType] = useState<"url" | "file">("url");
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [targetLang, setTargetLang] = useState("Hindi (HI)");
  const [subtitleFormat, setSubtitleFormat] = useState("SRT");
  const [title, setTitle] = useState("Hindi Subtitle Generation");
  const [notes, setNotes] = useState("");
  const [folder, setFolder] = useState("Marketing Captions");
  const [isPlaying, setIsPlaying] = useState(false);

  // Parsing & Validation State for YouTube URL
  const [videoId, setVideoId] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Active Feature Toggles for Subtitles
  const [features, setFeatures] = useState({
    autoSync: true,
    burnIn: false,
    profanityFilter: false,
  });

  // Automated YouTube URL Parser
  const parseYouTubeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setVideoId(null);
      setUrlError(null);
      return;
    }

    if (trimmed.includes("youtube.com/shorts/")) {
      setVideoId(null);
      setUrlError("YouTube Shorts links are not supported. Please use standard video links.");
      return;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);

    if (match && match[2].length === 11) {
      const extractedId = match[2];
      setVideoId(extractedId);
      setUrlError(null);

      setIsLoadingMetadata(true);
      setTimeout(() => {
        setIsLoadingMetadata(false);
        if (title === "Hindi Subtitle Generation" || title === "") {
          setTitle(`Hindi Captions #${extractedId.slice(0, 5)}`);
        }
      }, 400);
    } else {
      setVideoId(null);
      setUrlError("Invalid YouTube URL. Please enter a valid video link (e.g., youtube.com/watch?v=...)");
    }
  };

  useEffect(() => {
    if (sourceType === "url") {
      parseYouTubeUrl(youtubeUrl);
    }
  }, [youtubeUrl, sourceType]);

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (!title || title === "Hindi Subtitle Generation") {
        setTitle(file.name.replace(/\.[^/.]+$/, "") + " (Captions)");
      }
    }
  };

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateSubtitles = () => {
    const isValid = sourceType === "url" ? (videoId && !urlError) : !!uploadedFile;
    if (isValid) {
      onSuccess?.({
        sourceType,
        videoId: videoId || undefined,
        fileName: uploadedFile?.name,
        language: targetLang,
        format: subtitleFormat,
        title: title || "New Subtitle Project",
      });
    }
  };

  if (!isOpen) return null;

  const isFormValid = sourceType === "url" ? (videoId && !urlError) : !!uploadedFile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-xs font-sans text-zinc-900 selection:bg-sky-100 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl h-[90vh] max-h-[720px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* 1. Modal Top Navigation Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="hover:text-zinc-800 transition-colors cursor-pointer">Subtitles</span>
            <span>&rsaquo;</span>
            <span className="flex items-center gap-1.5 font-semibold text-zinc-900">
              <Subtitles className="h-4 w-4 text-sky-600" />
              <span>New Subtitle Generator</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
              <Check className="h-3 w-3 text-sky-600" />
              <span>Draft saved</span>
            </span>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-md hover:bg-zinc-100 active:scale-95 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. Main Dual-Column Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 overflow-y-auto lg:overflow-hidden">
          
          {/* Left Column: Form Controls (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-full p-5 space-y-4 bg-white overflow-y-auto">
            
            {/* Input Source Toggle (YouTube Link vs. File Upload) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                <label>Media Input Source</label>
                <HelpCircle className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/80 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSourceType("url")}
                  className={`flex items-center justify-center gap-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                    sourceType === "url"
                      ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <FaYoutube className="h-3.5 w-3.5 text-red-600" />
                  <span>YouTube URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("file")}
                  className={`flex items-center justify-center gap-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                    sourceType === "file"
                      ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5 text-sky-600" />
                  <span>Upload Video</span>
                </button>
              </div>
            </div>

            {/* Dynamic Source Input: URL or File Dropzone */}
            {sourceType === "url" ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                  <label htmlFor="youtube-url">YouTube Video Link</label>
                  {videoId && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-sky-600 font-medium">
                      <Check className="h-3 w-3" /> Video ID: {videoId}
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <FaYoutube className="h-4 w-4 text-red-600" />
                  </div>
                  <input
                    id="youtube-url"
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`w-full rounded-xl border py-2.5 pl-9 pr-9 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all shadow-2xs ${
                      urlError
                        ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : videoId
                        ? "border-sky-200 bg-sky-50/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        : "border-zinc-200 bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    }`}
                  />
                  {videoId && (
                    <div className="absolute right-3 flex items-center">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  )}
                </div>

                {urlError && (
                  <div className="flex items-start gap-1.5 pt-0.5 text-[11px] font-medium text-red-600 animate-in fade-in duration-150">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{urlError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 block">Upload Video File</label>
                <div className="relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-zinc-200 hover:border-sky-400 bg-zinc-50/50 hover:bg-sky-50/20 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600 mb-1.5 group-hover:scale-105 transition-transform">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  {uploadedFile ? (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-zinc-900 truncate max-w-[240px]">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[10px] font-mono text-sky-600">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB • Video Ready
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs font-medium text-zinc-700">
                        Click or drag video file here
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Supports MP4, MOV, AVI, MKV (up to 2GB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Target Subtitle Language & Output Format */}
            <div className="grid grid-cols-2 gap-3">
              {/* Target Language */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                  <label>Subtitle Language</label>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <Languages className="h-4 w-4 text-sky-600" />
                  </div>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-8 text-xs font-medium text-zinc-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="Hindi (HI)">Hindi (HI) • हिंदी</option>
                    <option value="Tamil (TA)">Tamil (TA) • தமிழ்</option>
                    <option value="Telugu (TE)">Telugu (TE) • తెలుగు</option>
                    <option value="Marathi (MR)">Marathi (MR) • मराठी</option>
                    <option value="Bengali (BN)">Bengali (BN) • বাংলা</option>
                    <option value="Kannada (KN)">Kannada (KN) • ಕನ್ನಡ</option>
                    <option value="Gujarati (GU)">Gujarati (GU) • ગુજરાતી</option>
                    <option value="English (EN)">English (EN) • English</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-zinc-400" />
                </div>
              </div>

              {/* Output Subtitle Format */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                  <label>Export Format</label>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <FileCode className="h-4 w-4 text-sky-600" />
                  </div>
                  <select
                    value={subtitleFormat}
                    onChange={(e) => setSubtitleFormat(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-8 text-xs font-medium text-zinc-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="SRT">SubRip (.SRT)</option>
                    <option value="VTT">WebVTT (.VTT)</option>
                    <option value="TXT">Plain Text (.TXT)</option>
                    <option value="JSON">JSON Captions (.JSON)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-zinc-400" />
                </div>
              </div>
            </div>

            {/* Project Name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                <label htmlFor="sub-title">Project Name</label>
              </div>
              <input
                id="sub-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your subtitle project a name..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-2xs"
              />
            </div>

            {/* Custom Vocabulary / Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                <label htmlFor="glossary">Custom Vocabulary & Glossary</label>
                <HelpCircle className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
              </div>
              <textarea
                id="glossary"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add brand terms, acronyms, or specific spelling rules..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right Column: Preview & Output Folder (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full p-5 space-y-4 bg-zinc-50/20 overflow-y-auto">
            <div className="space-y-4">
              
              {/* Folder Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                  <label>Folder</label>
                  <HelpCircle className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none text-zinc-400">
                    <Folder className="h-4 w-4 text-sky-600" />
                  </div>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-8 text-xs font-medium text-zinc-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="Marketing Captions">Marketing Captions</option>
                    <option value="Video Subtitles">Video Subtitles</option>
                    <option value="Personal Archive">Personal Archive</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-zinc-400" />
                </div>
              </div>

              {/* Live Video Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                  <span>Subtitle Preview Canvas</span>
                  <HelpCircle className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
                </div>

                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-950 flex flex-col justify-between p-3 shadow-inner group transition-all">
                  {sourceType === "url" && videoId ? (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt="YouTube Video Thumbnail"
                        className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-90 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-zinc-950/40" />

                      {/* Top Overlay Badge */}
                      <div className="relative z-10 flex items-center justify-between text-white/90">
                        <span className="flex items-center gap-1.5 font-mono text-[9px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          <FaYoutube className="h-3 w-3 text-red-500" />
                          <span>YouTube Stream</span>
                        </span>
                        <span className="font-mono text-[9px] bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-zinc-200 border border-white/10">
                          {subtitleFormat} Output
                        </span>
                      </div>

                      {/* Subtitle Overlay Visual Preview */}
                      <div className="relative z-10 my-auto text-center px-4">
                        <div className="inline-block rounded-md bg-black/80 backdrop-blur-xs border border-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg max-w-[90%]">
                          "जब मीडिया कंटेंट की बात आती है, तो लोकलाइजेशन..."
                        </div>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-zinc-200">
                        <span className="flex items-center gap-1 font-sans bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          <Clock className="h-3 w-3 text-sky-400" /> 04:32 Duration
                        </span>
                        <span className="text-sky-400 font-semibold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          Ready for Captions
                        </span>
                      </div>
                    </>
                  ) : sourceType === "file" && uploadedFile ? (
                    <div className="relative flex flex-col justify-between h-full z-10">
                      <div className="flex items-center justify-between text-white/90">
                        <span className="flex items-center gap-1.5 font-mono text-[9px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          <Video className="h-3 w-3 text-sky-400" />
                          <span>Local File Stream</span>
                        </span>
                        <span className="font-mono text-[9px] bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-zinc-200 border border-white/10">
                          {subtitleFormat} Output
                        </span>
                      </div>

                      <div className="my-auto text-center px-4">
                        <div className="inline-block rounded-md bg-black/80 backdrop-blur-xs border border-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                          "यह सब कई कामों को बेहतर ढंग से अंजाम देने पर..."
                        </div>
                      </div>

                      <div className="flex items-center justify-between font-mono text-[10px] text-zinc-300">
                        <span className="text-zinc-200 font-sans truncate max-w-[160px]">
                          {uploadedFile.name}
                        </span>
                        <span className="text-sky-400 font-semibold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          Ready
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-1.5 p-4 text-zinc-400">
                      <Subtitles className="h-8 w-8 text-zinc-700" />
                      <p className="text-xs font-medium text-zinc-300">
                        Provide a YouTube URL or upload a video file to generate subtitle preview
                      </p>
                    </div>
                  )}
                </div>

                {/* Subtitle Format Info Box */}
                {isFormValid && (
                  <div className="rounded-xl border border-zinc-200/80 bg-white p-2.5 space-y-1 shadow-2xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-semibold text-zinc-800 truncate">
                        {isLoadingMetadata ? "Parsing media..." : title || "Subtitle Stream"}
                      </h4>
                      <span className="font-mono text-[9px] font-semibold text-sky-600 bg-sky-50 border border-sky-100 px-1.5 py-0.2 rounded">
                        {subtitleFormat}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Target: {targetLang} • Auto-synced timestamps
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Action Footer Bar */}
        <div className="shrink-0 flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/50 px-5 py-3">
          {/* Subtitle Feature Toggles */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => toggleFeature("autoSync")}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                features.autoSync
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Clock className={`h-3 w-3 ${features.autoSync ? "text-sky-600" : "text-zinc-400"}`} />
              <span>Auto-Sync Timestamps</span>
            </button>

            <button
              onClick={() => toggleFeature("burnIn")}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                features.burnIn
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Video className={`h-3 w-3 ${features.burnIn ? "text-sky-600" : "text-zinc-400"}`} />
              <span>Burn-in Video Captions</span>
            </button>

            <button
              onClick={() => toggleFeature("profanityFilter")}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                features.profanityFilter
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <SlidersHorizontal className={`h-3 w-3 ${features.profanityFilter ? "text-sky-600" : "text-zinc-400"}`} />
              <span>Profanity Filter</span>
            </button>
          </div>

          {/* Create CTA Button */}
          <button
            onClick={handleGenerateSubtitles}
            disabled={!isFormValid}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all shrink-0 ${
              isFormValid
                ? "bg-zinc-900 hover:bg-zinc-800 active:scale-95 cursor-pointer"
                : "bg-zinc-300 cursor-not-allowed opacity-70"
            }`}
          >
            <span>Generate Subtitles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
