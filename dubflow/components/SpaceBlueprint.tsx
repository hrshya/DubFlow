import React, { useState } from "react";
import {
  Languages,
  Play,
  Pause,
  Download,
  RotateCcw,
  RotateCw,
  ChevronDown,
  Globe,
  Check,
  Captions,
  ExternalLink,
} from "lucide-react";

export const SpaceBlueprint = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const scriptBlocks = [
    {
      id: "01",
      speaker: "Narrator",
      cps: "20 CPS",
      time: "0:00:01.520 - 0:00:06.080",
      original: "When it comes to media content, accessibility and localization set you apart.",
      translation: "जब मीडिया कंटेंट की बात आती है, तो एक्सेसिबिलिटी और लोकलाइजेशन आपको दूसरों से अलग बनाते हैं।",
      active: false
    },
    {
      id: "02",
      speaker: "Guest",
      cps: "16 CPS",
      time: "0:00:06.600 - 0:00:09.100",
      original: "It comes down to multiple jobs being done well.",
      translation: "यह सब कई कामों को बेहतर ढंग से अंजाम देने पर निर्भर करता है।",
      active: true
    },
    {
      id: "03",
      speaker: "Professor",
      cps: "21 CPS",
      time: "0:00:09.320 - 0:00:12.160",
      original: "Start with the most important element first.",
      translation: "सबसे पहले सबसे महत्वपूर्ण तत्व से शुरुआत करें।",
      active: false
    }
  ];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white font-sans text-zinc-900 shadow-xl shadow-zinc-200/30 selection:bg-sky-100">
      {/* 1. Workspace Top Navigation Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Target Language Dropdown (Hindi) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50/80 px-2.5 py-1 text-xs font-semibold text-sky-700 shadow-2xs">
            <Languages className="h-3.5 w-3.5 text-sky-600" />
            <span>Hindi (HI)</span>
            <ChevronDown className="h-3 w-3 text-sky-400" />
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-zinc-200/80 bg-white px-2 py-0.5 font-mono text-[10px] text-zinc-600 shadow-2xs">
            <Check className="h-3 w-3 text-sky-600" />
            <span>0:01:44 Reviewed</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button className="flex h-7.5 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-[11px] font-medium text-white shadow-2xs hover:bg-zinc-800 transition-all active:scale-95">
            <Download className="h-3 w-3" />
            <span>Export Dub</span>
          </button>
        </div>
      </div>

      {/* 2. Main Dual-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100">
        
        {/* Left Column: Dubbing Script Editor (7 Cols) */}
        <div className="lg:col-span-7 p-3.5 space-y-2.5 bg-white">
          {/* Section Sub-Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
              <Captions className="h-3.5 w-3.5 text-sky-600" />
              <span>Dub Script</span>
            </div>

            <div className="flex items-center gap-2.5 text-[10px] font-medium text-zinc-400">
              <button className="flex items-center gap-1 hover:text-zinc-700 transition-colors">
                <RotateCcw className="h-3 w-3" />
                <span>Undo</span>
              </button>
              <button className="flex items-center gap-1 hover:text-zinc-700 transition-colors">
                <RotateCw className="h-3 w-3" />
                <span>Redo</span>
              </button>
            </div>
          </div>

          {/* Script Subtitle Cards */}
          <div className="space-y-2">
            {scriptBlocks.map((block) => (
              <div
                key={block.id}
                className={`rounded-xl border p-2.5 space-y-1.5 transition-all duration-150 ${
                  block.active
                    ? "border-sky-300 border-l-[3px] border-l-sky-500 bg-sky-50/20 shadow-2xs"
                    : "border-zinc-200/80 bg-zinc-50/30 hover:border-zinc-300 hover:bg-zinc-50/60"
                }`}
              >
                {/* Meta Row */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono ${block.active ? "text-sky-600 font-semibold" : "text-zinc-400"}`}>
                      {block.id}
                    </span>
                    
                    {/* Clean Speaker Badge */}
                    <span className="rounded border border-zinc-200/80 bg-zinc-100/80 px-1.5 py-0.2 text-[9px] font-semibold text-zinc-700">
                      {block.speaker}
                    </span>

                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[9px] ${
                        block.active
                          ? "bg-sky-100/80 text-sky-700 font-medium"
                          : "bg-zinc-100/80 text-zinc-500"
                      }`}
                    >
                      {block.cps}
                    </span>
                  </div>

                  <span className={`font-mono ${block.active ? "text-sky-600 font-medium" : "text-zinc-400"}`}>
                    {block.time}
                  </span>
                </div>

                {/* Source Line (English) */}
                <p className="text-[11px] text-zinc-500 leading-snug pl-0.5">
                  {block.original}
                </p>

                {/* Target Line (Hindi) */}
                <div
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium leading-relaxed transition-colors ${
                    block.active
                      ? "border border-sky-200/80 bg-white text-zinc-900 shadow-2xs"
                      : "border border-sky-100/60 bg-sky-50/50 text-sky-950"
                  }`}
                >
                  {block.translation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Preview Canvas & Source Info (5 Cols) */}
        <div className="lg:col-span-5 p-3.5 space-y-3 bg-zinc-50/20 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Video Preview Canvas */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-950 flex flex-col justify-between p-2.5 shadow-inner">
              {/* Overlay Top Bar */}
              <div className="flex items-center justify-between text-white/80 z-10">
                <span className="flex items-center gap-1 font-mono text-[9px] bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                  <Globe className="h-2.5 w-2.5 text-sky-400" />
                  <span>Preview Stream</span>
                </span>
                <span className="font-mono text-[9px] text-zinc-400">1080p</span>
              </div>

              {/* Center Play Button */}
              <div className="relative z-10 flex justify-center my-auto">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-zinc-900" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4 fill-zinc-900" />
                  )}
                </button>
              </div>

              {/* Progress Scrubber Bar */}
              <div className="relative z-10 flex items-center justify-between font-mono text-[9px] text-zinc-300">
                <span>0:00:07</span>
                <div className="flex-1 mx-2 h-1 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-sky-500 w-[8%]" />
                </div>
                <span>0:04:32</span>
              </div>
            </div>

            {/* Media Source Link Card */}
            <div className="rounded-xl border border-zinc-200/80 bg-white p-2.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-800">
                <span>Source Media URL</span>
                <span className="font-mono text-[9px] font-medium text-sky-600 bg-sky-50 border border-sky-100 px-1.5 py-0.2 rounded">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 p-2">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <span className="truncate font-mono text-[11px] text-zinc-700">
                    youtube.com/watch?v=your-video
                  </span>
                </div>
                <ExternalLink className="h-3 w-3 shrink-0 text-zinc-400 hover:text-zinc-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Multi-Track Timeline Editor */}
      <div className="border-t border-zinc-200/80 bg-zinc-50/50 p-3 space-y-1.5">
        {/* Ruler Timestamps */}
        <div className="flex items-center justify-between font-mono text-[9px] text-zinc-400 px-1">
          <span>0:00:12</span>
          <span>0:00:14</span>
          <span>0:00:16</span>
          <span className="text-sky-600 font-semibold">0:00:18</span>
          <span>0:00:20</span>
          <span>0:00:22</span>
        </div>

        {/* Track Container */}
        <div className="relative h-10 w-full rounded-xl border border-zinc-200/90 bg-white p-1 overflow-hidden flex items-center gap-1 shadow-inner">
          {/* Playhead Line */}
          <div className="absolute top-0 bottom-0 left-[55%] w-0.5 bg-sky-500 z-20 shadow-xs">
            <div className="absolute -top-1 -left-[3px] h-2 w-2 rounded-full bg-sky-500" />
          </div>

          {/* Subtitle Clip 01 */}
          <div className="h-full w-[32%] rounded-lg bg-zinc-100/90 border border-zinc-200/80 px-2 flex items-center text-[10px] font-medium text-zinc-600 truncate">
            01 · Narrator
          </div>

          {/* Subtitle Clip 02 (Active Selected Clip) */}
          <div className="h-full w-[46%] rounded-lg bg-sky-600 text-white border border-sky-700 px-2 flex items-center text-[10px] font-medium truncate shadow-2xs">
            02 · Guest (यह सब कई कामों को...)
          </div>

          {/* Subtitle Clip 03 */}
          <div className="h-full w-[22%] rounded-lg bg-zinc-100/90 border border-zinc-200/80 px-2 flex items-center text-[10px] font-medium text-zinc-500 truncate">
            03 · Professor
          </div>
        </div>
      </div>
    </div>
  );
};
