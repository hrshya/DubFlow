import React, { useState, useEffect } from "react";
import { 
  Link2, 
  Check, 
  Loader2, 
  Sparkles, 
  MousePointer2,
  FileVideo,
  CornerDownLeft,
  Globe
} from "lucide-react";

export const VideoLinkDemo = () => {
  const [phase, setPhase] = useState<"idle" | "paste" | "click" | "fetching" | "ready">("idle");
  const [inputValue, setInputValue] = useState("");
  const [progress, setProgress] = useState(0);

  const sampleUrl = "https://youtu.be/dubbing-demo";

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const pushTimer = (t: ReturnType<typeof setTimeout>) => timers.push(t);
    const pushInterval = (i: ReturnType<typeof setInterval>) => intervals.push(i);

    const clearAll = () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      timers.length = 0;
      intervals.length = 0;
    };

    const cycle = () => {
      if (cancelled) return;

      setPhase("idle");
      setInputValue("");
      setProgress(0);

      pushTimer(
        setTimeout(() => {
          if (cancelled) return;
          setPhase("paste");

          let charIndex = 0;
          const typingInterval = setInterval(() => {
            if (charIndex <= sampleUrl.length) {
              setInputValue(sampleUrl.slice(0, charIndex));
              charIndex += 2;
            } else {
              clearInterval(typingInterval);

              pushTimer(
                setTimeout(() => {
                  if (cancelled) return;
                  setPhase("click");

                  pushTimer(
                    setTimeout(() => {
                      if (cancelled) return;
                      setPhase("fetching");

                      const fetchInterval = setInterval(() => {
                        setProgress((p) => {
                          if (p >= 100) {
                            clearInterval(fetchInterval);
                            return 100;
                          }
                          return p + 15;
                        });
                      }, 80);
                      pushInterval(fetchInterval);

                      pushTimer(
                        setTimeout(() => {
                          if (cancelled) return;
                          setPhase("ready");

                          pushTimer(
                            setTimeout(() => {
                              clearAll();
                              cycle();
                            }, 3200)
                          );
                        }, 1000)
                      );
                    }, 300)
                  );
                }, 500)
              );
            }
          }, 30);
          pushInterval(typingInterval);
        }, 700)
      );
    };

    cycle();

    return () => {
      cancelled = true;
      clearAll();
    };
  }, []);

  return (
    <div className="w-full max-w-md rounded-xl border bg-white border-zinc-200 p-4 font-sans text-zinc-900 selection:bg-zinc-100">
      {/* Compact Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
            <Link2 className="h-3.5 w-3.5 text-zinc-800" />
            <span>Start with a video link</span>
          </div>
          <p className="mt-0.5 text-[11px] text-zinc-500 leading-tight">
            Bring the video you want to dub by sharing its link.
          </p>
        </div>
        <span className="shrink-0 rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
          ⌘V
        </span>
      </div>

      {/* Input Row & Animated Demo */}
      <div className="relative space-y-2">
        <div className="relative flex items-center rounded-lg border border-zinc-200 p-1">
          <Globe className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <input
            type="text"
            readOnly
            value={inputValue}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full bg-transparent px-2 py-1 font-mono text-[11px] text-zinc-800 placeholder-zinc-400 focus:outline-none"
          />
          <button
            className={`relative flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
              phase === "click"
                ? "bg-black text-white scale-95"
                : "bg-black text-white"
            }`}
          >
            {phase === "fetching" ? (
              <Loader2 className="h-3 w-3 animate-spin text-zinc-300" />
            ) : phase === "ready" ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <>
                <span>Import</span>
                <CornerDownLeft className="h-2.5 w-2.5 text-zinc-400" />
              </>
            )}
          </button>

          {/* Animated Cursor */}
          <div
            className={`pointer-events-none absolute z-20 transition-all duration-500 ease-out ${
              phase === "idle"
                ? "bottom-0 right-4 translate-y-2 opacity-0"
                : phase === "paste"
                ? "bottom-1.5 right-12 opacity-100"
                : phase === "click"
                ? "bottom-1.5 right-8 scale-90 opacity-100"
                : "opacity-0"
            }`}
          >
            <MousePointer2 className="h-4 w-4 fill-white text-white drop-shadow" />
          </div>
        </div>

        {/* Compact Dynamic Status Box */}
        <div className="flex h-12 items-center justify-between rounded-lg border border-zinc-100 px-3 py-1.5">
          {phase === "fetching" && (
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                <span>Extracting audio...</span>
              </div>
              <div className="h-1 w-20 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full bg-black transition-all duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {phase === "ready" && (
            <div className="flex w-full items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded border border-zinc-200">
                  <FileVideo className="h-3.5 w-3.5 text-zinc-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-[11px] font-medium text-zinc-900">
                    dubbing_demo.mp4
                  </h4>
                  <p className="font-mono text-[10px] text-zinc-400">02:15 • 1080p</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-800">
                <Sparkles className="mr-1 h-2.5 w-2.5 text-zinc-500" /> Ready
              </span>
            </div>
          )}

          {(phase === "idle" || phase === "paste" || phase === "click") && (
            <div className="flex w-full items-center justify-between text-[11px] text-zinc-400">
              <span>Supports YouTube, Vimeo, MP4</span>
              <span className="font-mono text-[10px] text-zinc-300">Auto-sync</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
