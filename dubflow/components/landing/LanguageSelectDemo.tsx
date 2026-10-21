import React, { useState, useEffect } from "react";
import { 
  Languages, 
  ChevronDown, 
  Check, 
  Globe, 
  MousePointer2, 
  Sparkles,
  Search
} from "lucide-react";

export const LanguageSelectDemo = () => {
  const [phase, setPhase] = useState<"idle" | "point" | "click" | "open" | "hover-lang" | "select">("idle");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const languages = [
    { code: "es", name: "Spanish", region: "Spain / LATAM" },
    { code: "fr", name: "French", region: "France" },
    { code: "de", name: "German", region: "Germany" },
    { code: "ja", name: "Japanese", region: "Japan" },
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
      setSelectedLang(null);

      // Phase 1: Move cursor to trigger
      pushTimer(
        setTimeout(() => {
          if (cancelled) return;
          setPhase("point");

          // Phase 2: Click trigger
          pushTimer(
            setTimeout(() => {
              if (cancelled) return;
              setPhase("click");

              // Phase 3: Open dropdown
              pushTimer(
                setTimeout(() => {
                  if (cancelled) return;
                  setPhase("open");

                  // Phase 4: Move cursor to Spanish
                  pushTimer(
                    setTimeout(() => {
                      if (cancelled) return;
                      setPhase("hover-lang");

                      // Phase 5: Select Spanish
                      pushTimer(
                        setTimeout(() => {
                          if (cancelled) return;
                          setPhase("select");
                          setSelectedLang("Spanish");

                          // Pause at finished state, then restart cycle
                          pushTimer(
                            setTimeout(() => {
                              clearAll();
                              cycle();
                            }, 3200)
                          );
                        }, 400)
                      );
                    }, 500)
                  );
                }, 200)
              );
            }, 300)
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

  const isOpen = phase === "open" || phase === "hover-lang";

  return (
    <div className="w-full max-w-md rounded-xl border bg-white border-zinc-200 p-4 font-sans text-zinc-900 selection:bg-zinc-100">
      {/* Compact Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
            <Languages className="h-3.5 w-3.5 text-zinc-800" />
            <span>Choose your target language</span>
          </div>
          <p className="mt-0.5 text-[11px] text-zinc-500 leading-tight">
            Select a language to create a localized version of your video.
          </p>
        </div>
        <span className="shrink-0 rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
          30+ Languages
        </span>
      </div>

      {/* Interactive Selector Area */}
      <div className="relative">
        {/* Dropdown Trigger Button */}
        <div
          className={`relative flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all duration-200 ${
            phase === "click"
              ? "border-zinc-400 bg-zinc-50 scale-[0.99]"
              : isOpen
              ? "border-zinc-400 bg-white"
              : "border-zinc-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-zinc-400" />
            <span
              className={`font-medium ${
                selectedLang ? "text-zinc-900" : "text-zinc-500"
              }`}
            >
              {selectedLang ? selectedLang : "Select target language..."}
            </span>
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-zinc-800" : ""
            }`}
          />
        </div>

        {/* Dropdown Menu Popup */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-200/50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="mb-1 flex items-center gap-1.5 rounded border border-zinc-100 bg-zinc-50/80 px-2 py-1 text-[11px]">
              <Search className="h-3 w-3 text-zinc-400" />
              <span className="text-zinc-400 font-mono text-[10px]">Search languages...</span>
            </div>

            <div className="space-y-0.5">
              {languages.map((lang) => {
                const isTarget = lang.name === "Spanish";
                const isHovered = phase === "hover-lang" && isTarget;

                return (
                  <div
                    key={lang.code}
                    className={`flex items-center justify-between rounded px-2 py-1.5 text-xs transition-colors ${
                      isHovered
                        ? "bg-zinc-100 text-zinc-900 font-medium"
                        : "text-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-400 uppercase w-4">
                        {lang.code}
                      </span>
                      <span>{lang.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{lang.region}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Animated Simulated Cursor */}
        <div
          className={`pointer-events-none absolute z-30 transition-all duration-500 ease-out ${
            phase === "idle"
              ? "bottom-0 right-2 translate-y-3 opacity-0"
              : phase === "point"
              ? "top-2.5 right-6 opacity-100"
              : phase === "click"
              ? "top-2.5 right-6 scale-90 opacity-100"
              : phase === "open"
              ? "top-10 left-12 opacity-100"
              : phase === "hover-lang"
              ? "top-[78px] left-24 opacity-100"
              : "opacity-0"
          }`}
        >
          <MousePointer2 className="h-4 w-4 fill-black text-black drop-shadow" />
        </div>
      </div>

      {/* Selected Output State Card */}
      <div className="mt-2 flex h-10 items-center justify-between rounded-lg border border-zinc-100 px-3 text-[11px]">
        {phase === "select" ? (
          <div className="flex w-full items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-[10px] font-mono font-semibold text-zinc-800">
                ES
              </span>
              <span className="font-medium text-zinc-900">Spanish localized track</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded border border-zinc-200 px-1.5 py-0.5 font-medium text-zinc-800 text-[10px]">
              <Sparkles className="h-2.5 w-2.5 text-zinc-500" /> Localized
            </span>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between text-zinc-400">
            <span>Supports 30+ accent variations</span>
            <span className="font-mono text-[10px] text-zinc-300">AI Voice Sync</span>
          </div>
        )}
      </div>
    </div>
  );
};
