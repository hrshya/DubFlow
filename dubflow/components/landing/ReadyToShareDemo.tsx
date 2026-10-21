import React, { useState, useEffect } from "react";
import { 
  Video, 
  Share2, 
  Check, 
  MousePointer2, 
  Sparkles, 
  Globe,
  Play
} from "lucide-react";

export const ReadyToShareDemo = () => {
  const [phase, setPhase] = useState<"idle" | "hover" | "click" | "shared">("idle");
  const [copied, setCopied] = useState(false);
  const [visibleItems, setVisibleItems] = useState(0);

  const activities = [
    { name: "Spanish (ES) Dubbed Track", detail: "Audio auto-synced • 1080p HD", tag: "Just now" },
    { name: "Public Shareable Link", detail: "Anyone with link can view", tag: "Ready" },
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

      setPhase("idle");
      setCopied(false);
      setVisibleItems(0);

      // 1. Hover cursor over Share button
      pushTimer(
        setTimeout(() => {
          if (cancelled) return;
          setPhase("hover");

          // 2. Click Share button
          pushTimer(
            setTimeout(() => {
              if (cancelled) return;
              setPhase("click");
              setCopied(true);

              // 3. Reveal output details sequentially
              pushTimer(
                setTimeout(() => {
                  if (cancelled) return;
                  setPhase("shared");
                  setVisibleItems(1);

                  pushTimer(
                    setTimeout(() => {
                      if (cancelled) return;
                      setVisibleItems(2);

                      // Hold completed state and loop
                      pushTimer(
                        setTimeout(() => {
                          clearAll();
                          cycle();
                        }, 3200)
                      );
                    }, 350)
                  );
                }, 300)
              );
            }, 450)
          );
        }, 800)
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
      {/* Header with Emerald / Mint Accent */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Video className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 tracking-tight">
              A video ready to share
            </h3>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Get the dubbed video as the finished result of your workflow.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-100 bg-emerald-50/70 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
          <Sparkles className="h-2.5 w-2.5" /> Ready
        </span>
      </div>

      {/* Shareable Link Box & Animated Trigger */}
      <div className="relative space-y-2">
        <div className="relative flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-1.5 pl-2.5">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate font-mono text-[11px] text-zinc-700">
              dubbed.video/v/sp-9f2k
            </span>
          </div>

          <button
            className={`relative flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
              phase === "click"
                ? "bg-emerald-700 text-white scale-95"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-white" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3 w-3 text-emerald-100" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Animated Cursor */}
          <div
            className={`pointer-events-none absolute z-20 transition-all duration-500 ease-out ${
              phase === "idle"
                ? "bottom-0 right-4 translate-y-3 opacity-0"
                : phase === "hover"
                ? "top-2.5 right-6 opacity-100"
                : phase === "click"
                ? "top-2.5 right-5 scale-90 opacity-100"
                : "opacity-0"
            }`}
          >
            <MousePointer2 className="h-4 w-4 fill-zinc-900 text-zinc-900 drop-shadow" />
          </div>
        </div>

        {/* Dynamic Activity / Output List */}
        <div className="space-y-1.5 min-h-[72px]">
          {visibleItems === 0 && (
            <div className="flex h-14 items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 text-[11px] text-zinc-400">
              <span>Rendering completed</span>
              <span className="font-mono text-[10px] text-zinc-300">Ready for export</span>
            </div>
          )}

          {activities.slice(0, visibleItems).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-2 text-[11px] shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Play className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate font-medium text-zinc-900 text-[11px]">
                    {item.name}
                  </h4>
                  <p className="truncate text-[10px] text-zinc-400">{item.detail}</p>
                </div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
