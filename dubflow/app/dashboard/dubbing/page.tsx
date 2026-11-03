"use client";

import { useState } from "react";
import { FaYoutube } from "react-icons/fa";
import { YouTubeDubModal } from "@/components/YoutubeModel";

export default function DubbingPage() {
  const [isYouTubeDubModalOpen, setIsYouTubeDubModalOpen] = useState(false);

  return (
    <main className="flex flex-col gap-6 px-4 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dubbing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a dubbed version of a YouTube video.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setIsYouTubeDubModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <FaYoutube aria-hidden="true" className="h-4 w-4" />
          New YouTube Dub
        </button>
      </div>

      <YouTubeDubModal
        isOpen={isYouTubeDubModalOpen}
        onClose={() => setIsYouTubeDubModalOpen(false)}
      />
    </main>
  );
}
