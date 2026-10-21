"use client";

import { useCases } from "@/data/data";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";


const EASE = [0.16, 1, 0.3, 1] as const;


export const UseCasesShowcase = ({ items }: { items: typeof useCases }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((a) => (a + 1) % items.length);
    }, 3800);
    return () => clearTimeout(timer);
  }, [active, items.length]);

  const current = items[active];

  return (
    <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-[0.9fr_1.3fr] md:gap-6">
      <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
        {items.map(({ icon: ItemIcon, title }, i) => {
          const isActive = i === active;
          return (
            <button
              key={title}
              type="button"
              onClick={() => setActive(i)}
              className={`group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors md:shrink ${
                isActive
                  ? "border-[#0041aa] bg-[#0041aa]/[0.06] text-[#0041aa]"
                  : "border-[#dcdcdc] bg-[#ffffff] text-[#131313]/70 hover:border-[#0041aa]/40 hover:text-[#131313]"
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#0041aa] text-white"
                    : "bg-[#eaeaea] text-[#131313]/70 group-hover:bg-[#dcdcdc]"
                }`}
              >
                <ItemIcon className="size-4" />
              </span>
              <span className="whitespace-nowrap md:whitespace-normal">
                {title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[30rem] overflow-hidden rounded-2xl border border-[#dcdcdc] sm:min-h-[34rem] md:min-h-[28rem]">
        <AnimatePresence>
          <motion.div
            key={current.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0 bg-cover bg-top"
            style={{ backgroundImage: `url(${current.image})` }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-black/50" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative flex h-full flex-col p-8 sm:p-10"
          >
            <h3 className="font-bricolage text-2xl font-semibold tracking-tight text-white">
              {current.title}
            </h3>
            <p className="mt-3 max-w-md text-base leading-7 text-white/80">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dashes for the current position in the auto-advance. */}
        <div className="absolute bottom-8 left-8 z-10 flex gap-1.5 sm:left-10">
          {items.map((item, i) => (
            <span
              key={item.title}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
