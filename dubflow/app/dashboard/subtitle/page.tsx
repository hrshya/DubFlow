"use client";

import { useState } from "react";
import { Captions, Plus } from "lucide-react";
import { SubtitleGeneratorModal } from "@/components/SubtitleModal";

export default function SubtitlePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastConfiguredProject, setLastConfiguredProject] = useState<{
    title: string;
    language: string;
    format: string;
  } | null>(null);

  return (
    <main className="flex flex-col gap-6 px-4 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subtitles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create subtitles for a YouTube video or an uploaded video file.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          New Subtitle Project
        </button>
      </div>

      {lastConfiguredProject && (
        <section
          aria-label="Last configured subtitle project"
          className="flex items-start gap-3 rounded-lg border bg-card p-4"
        >
          <Captions aria-hidden="true" className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h2 className="font-medium">{lastConfiguredProject.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {lastConfiguredProject.language} · {lastConfiguredProject.format}
            </p>
          </div>
        </section>
      )}

      <SubtitleGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={({ title, language, format }) => {
          setLastConfiguredProject({ title, language, format });
          setIsModalOpen(false);
        }}
      />
    </main>
  );
}
