"use client"

import React, { useState, useEffect } from "react";
import { FaYoutube } from "react-icons/fa";
import {
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
  Users,
  Mic,
  Subtitles
} from "lucide-react";

interface YouTubeDubModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (data: { videoId: string; url: string; language: string; title: string }) => void;
}

export const YouTubeDubModal = ({
  isOpen = true,
  onClose,
  onSuccess
}: YouTubeDubModalProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [targetLang, setTargetLang] = useState("Hindi (HI)");
  const [title, setTitle] = useState("YouTube Video Localization");
  const [notes, setNotes] = useState("");
  const [folder, setFolder] = useState("Marketing Dubs");
  const [isPlaying, setIsPlaying] = useState(false);

  // Parsing & Validation State
  const [videoId, setVideoId] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Active Feature Toggles
  const [features, setFeatures] = useState({
    diarization: true,
    voiceCloning: true,
    autoCaptions: true,
  });

  // Automated YouTube URL Parser
  const parseYouTubeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setVideoId(null);
      setUrlError(null);
      return;
    }

    // Shorts handling
    if (trimmed.includes("youtube.com/shorts/")) {
      setVideoId(null);
      setUrlError("YouTube Shorts links are not supported. Please use standard video links.");
      return;
    }

    // Extract 11-character YouTube Video ID regex
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);

    if (match && match[2].length === 11) {
      const extractedId = match[2];
      setVideoId(extractedId);
      setUrlError(null);

      // Simulate dynamic metadata extraction
      setIsLoadingMetadata(true);
      setTimeout(() => {
        setIsLoadingMetadata(false);
        if (title === "YouTube Video Localization" || title === "") {
          setTitle(`YouTube Stream #${extractedId.slice(0, 5)}`);
        }
      }, 400);
    } else {
      setVideoId(null);
      setUrlError("Invalid YouTube URL. Please enter a valid video link (e.g., youtube.com/watch?v=...)");
    }
  };

  useEffect(() => {
    parseYouTubeUrl(youtubeUrl);
  }, [youtubeUrl]);

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateDub = () => {
    if (videoId && !urlError) {
      onSuccess?.({
        videoId,
        url: youtubeUrl,
        language: targetLang,
        title: title || `Dub Project (${videoId})`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-xs font-sans text-zinc-900 selection:bg-sky-100 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl h-[90vh] max-h-[720px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* 1. Top Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="hover:text-zinc-800 transition-colors cursor-pointer">Dubs</span>
            <span>&rsaquo;</span>
            <span className="flex items-center gap-1.5 font-semibold text-zinc-900">
              <FaYoutube className="h-4 w-4 text-red-600" />
              <span>New YouTube Dub</span>
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
          
          {/* Left Column: Input Form (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-full p-5 space-y-4 bg-white overflow-y-auto">
            
            {/* YouTube Input + Automated Parsing Validation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                <div className="flex items-center gap-1">
                  <label htmlFor="youtube-url">YouTube URL</label>
                  <HelpCircle className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
                </div>
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

              {/* Specific Validation Error Message */}
              {urlError && (
                <div className="flex items-start gap-1.5 pt-0.5 text-[11px] font-medium text-red-600 animate-in fade-in duration-150">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{urlError}</span>
                </div>
              )}
            </div>

            {/* Target Indian Language Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                <label>Target Dubbing Language</label>
                <HelpCircle className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
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
                  <option value="Malayalam (ML)">Malayalam (ML) • മലയാളം</option>
                  <option value="Punjabi (PA)">Punjabi (PA) • ਪੰਜਾਬੀ</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            {/* Project Title */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                <label htmlFor="dub-title">Project Name</label>
              </div>
              <input
                id="dub-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your dub project a title..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-2xs"
              />
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                <label htmlFor="comments">Dubbing Notes & Terminology</label>
                <HelpCircle className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
              </div>
              <textarea
                id="comments"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add speaker nuances, custom terminology mappings, or tone guidance..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right Column: Dynamic Thumbnail & Folder (5 Cols) */}
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
                    <option value="Marketing Dubs">Marketing Dubs</option>
                    <option value="Product Tutorials">Product Tutorials</option>
                    <option value="Personal Projects">Personal Projects</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-zinc-400" />
                </div>
              </div>

              {/* Real YouTube Thumbnail Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                  <span>Video Preview</span>
                  <HelpCircle className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
                </div>

                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-950 flex flex-col justify-between p-3 shadow-inner group transition-all">
                  {videoId ? (
                    <>
                      {/* Dynamic Thumbnail Image */}
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt="YouTube Video Thumbnail"
                        className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                          // Fallback if maxres is missing
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-zinc-950/40" />

                      {/* Top Bar Overlay */}
                      <div className="relative z-10 flex items-center justify-between text-white/90">
                        <span className="flex items-center gap-1.5 font-mono text-[9px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          <FaYoutube className="h-3 w-3 text-red-500" />
                          <span>YouTube Stream</span>
                        </span>
                        <span className="font-mono text-[9px] bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-zinc-200 border border-white/10">
                          1080p HD
                        </span>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="relative z-10 flex justify-center my-auto">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4 fill-zinc-900" />
                          ) : (
                            <Play className="ml-0.5 h-4 w-4 fill-zinc-900" />
                          )}
                        </button>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-zinc-200">
                        <span className="flex items-center gap-1 font-sans bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          <Clock className="h-3 w-3 text-sky-400" /> 04:32 Duration
                        </span>
                        <span className="text-sky-400 font-semibold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          Ready to Dub
                        </span>
                      </div>
                    </>
                  ) : urlError ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-1.5 p-4 text-zinc-400">
                      <AlertCircle className="h-7 w-7 text-red-400" />
                      <p className="text-xs font-medium text-zinc-300">
                        Cannot load video stream
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Check the YouTube URL formatting on the left
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-1.5 p-4 text-zinc-400">
                      <FaYoutube className="h-8 w-8 text-zinc-700" />
                      <p className="text-xs font-medium text-zinc-300">
                        Enter a YouTube URL to load thumbnail & preview
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata Output Card */}
                {videoId && (
                  <div className="rounded-xl border border-zinc-200/80 bg-white p-2.5 space-y-1 shadow-2xs animate-in fade-in duration-150">
                    <h4 className="text-[11px] font-semibold text-zinc-800 truncate">
                      {isLoadingMetadata ? "Loading video title..." : title || "YouTube Stream"}
                    </h4>
                    <p className="text-[10px] text-zinc-400 truncate font-mono">
                      https://youtube.com/watch?v={videoId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Action Footer Bar */}
        <div className="shrink-0 flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/50 px-5 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => toggleFeature("diarization")}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                features.diarization
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Users className={`h-3 w-3 ${features.diarization ? "text-sky-600" : "text-zinc-400"}`} />
              <span>Speaker Diarization</span>
            </button>

            <button
              onClick={() => toggleFeature("voiceCloning")}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                features.voiceCloning
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Mic className={`h-3 w-3 ${features.voiceCloning ? "text-sky-600" : "text-zinc-400"}`} />
              <span>Voice Cloning</span>
            </button>

            <button
              onClick={() => toggleFeature("autoCaptions")}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                features.autoCaptions
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Subtitles className={`h-3 w-3 ${features.autoCaptions ? "text-sky-600" : "text-zinc-400"}`} />
              <span>Auto Captions</span>
            </button>
          </div>

          <button
            onClick={handleCreateDub}
            disabled={!videoId || !!urlError}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all shrink-0 ${
              videoId && !urlError
                ? "bg-zinc-900 hover:bg-zinc-800 active:scale-95 cursor-pointer"
                : "bg-zinc-300 cursor-not-allowed opacity-70"
            }`}
          >
            <span>Create Dub</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
