import React, { useState, useEffect } from "react";
import { 
  Captions, 
  Copy, 
  Check, 
  Play, 
  MousePointer2,
  FileDown,
  Sparkles
} from "lucide-react";

export const CaptionAlongsideDemo = () => {
  const [phase, setPhase] = useState<"line1" | "line2" | "hover-copy" | "click-copy" | "copied">("line1");
  const [copied, setCopied] = useState(false);

  const captionLines = [
    { time: "00:01", text: "Welcome to this demonstration of automated video dubbing." },
    { time: "00:04", text: "Captions are automatically synchronized with target audio tracks." },
  ];

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const pushTimer = (t: ReturnType<typeof setTimeout>) => timers.push(t);

    const clearAll = () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };

    const cycle = () => {
      if (cancelled) return;

      setPhase("line1");
      setCopied(false);

      // Line 1 -> Line 2
      pushTimer(
        setTimeout(() => {
          if (cancelled) return;
          setPhase("line2");

          // Move cursor to Copy button
          pushTimer(
            setTimeout(() => {
              if (cancelled) return;
              setPhase("hover-copy");

              // Click Copy
              pushTimer(
                setTimeout(() => {
                  if (cancelled) return;
                  setPhase("click-copy");
                  setCopied(true);

                  // Hold copied state
                  pushTimer(
                    setTimeout(() => {
                      if (cancelled) return;
                      setPhase("copied");

                      // Restart cycle
                      pushTimer(
                        setTimeout(() => {
                          clearAll();
                          cycle();
                        }, 3000)
                      );
                    }, 350)
                  );
                }, 400)
              );
            }, 700)
          );
        }, 1100)
      );
    };

    cycle();

    return () => {
      cancelled = true;
      clearAll();
    };
  }, []);

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 font-sans text-zinc-900 shadow-sm">
      {/* Header with Sky Blue Accent */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Captions className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 tracking-tight">
              Get captions alongside it
            </h3>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Auto-synced captions for easy review and export.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-sky-100 bg-sky-50/70 px-1.5 py-0.5 text-[10px] font-medium text-sky-600">
          <Sparkles className="h-2.5 w-2.5" /> Auto CC
        </span>
      </div>

      {/* Main Interactive Container */}
      <div className="relative space-y-2">
        {/* Sync Control Bar */}
        <div className="relative flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-1.5 pl-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-700">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-zinc-900 text-white">
              <Play className="h-2.5 w-2.5 fill-white" />
            </div>
            <span className="font-mono text-[10px] text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
              {phase === "line1" ? "00:01" : "00:04"}
            </span>
            <span className="font-mono text-[10px] text-zinc-400">/ 00:10</span>
          </div>

          <button
            className={`relative flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
              phase === "click-copy"
                ? "bg-sky-700 text-white scale-95"
                : "bg-sky-500 text-white hover:bg-sky-600"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-sky-100" />
                <span>Copy CC</span>
              </>
            )}
          </button>

          {/* Animated Cursor */}
          <div
            className={`pointer-events-none absolute z-20 transition-all duration-500 ease-out ${
              phase === "line1" || phase === "line2"
                ? "bottom-0 right-4 translate-y-3 opacity-0"
                : phase === "hover-copy"
                ? "top-2.5 right-6 opacity-100"
                : phase === "click-copy"
                ? "top-2.5 right-5 scale-90 opacity-100"
                : "opacity-0"
            }`}
          >
            <MousePointer2 className="h-4 w-4 fill-zinc-900 text-zinc-900 drop-shadow" />
          </div>
        </div>

        {/* Live Synchronized Caption Output */}
        <div className="space-y-1 rounded-lg border border-zinc-100 bg-white p-1.5">
          {captionLines.map((line, idx) => {
            const isActive =
              (idx === 0 && phase === "line1") ||
              (idx === 1 && (phase === "line2" || phase === "hover-copy" || phase === "click-copy" || phase === "copied"));

            return (
              <div
                key={line.time}
                className={`flex items-start gap-2 rounded px-2 py-1 text-[11px] transition-all duration-200 ${
                  isActive
                    ? "bg-sky-50/60 text-zinc-900 font-medium border-l-2 border-sky-500"
                    : "text-zinc-400"
                }`}
              >
                <span
                  className={`mt-0.5 shrink-0 font-mono text-[10px] ${
                    isActive ? "text-sky-600 font-semibold" : "text-zinc-400"
                  }`}
                >
                  {line.time}
                </span>
                <p className="leading-tight">{line.text}</p>
              </div>
            );
          })}
        </div>

        {/* Export Formats Bar */}
        <div className="flex h-7 items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/40 px-2.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <FileDown className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-[10px] font-medium text-zinc-500">Export Formats</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">.SRT</span>
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">.VTT</span>
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">.SBV</span>
          </div>
        </div>
      </div>
    </div>
  );
};
