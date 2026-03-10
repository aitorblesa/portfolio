import { useEffect } from "react";
import type { GalleryItem } from "./types/types";

interface GalleryModalProps {
  isOpen: boolean;
  currentIdx: number;
  galleryData: GalleryItem[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function GalleryModal({
  isOpen,
  currentIdx,
  galleryData,
  onClose,
  onNext,
  onPrev,
}: GalleryModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || galleryData.length === 0) return null;

  const data = galleryData[currentIdx];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close modal"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-full w-full max-w-7xl items-center justify-center">
        <button
          type="button"
          className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-xl text-white backdrop-blur-xl transition-colors hover:bg-white hover:text-black md:left-6"
          onClick={onPrev}
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 6l-6 6l6 6" />
          </svg>
        </button>

        <div className="grid h-full w-full max-w-6xl grid-rows-[minmax(0,1fr)_96px] items-center">
          <div className="flex min-h-0  items-center justify-center overflow-hidden px-4">
            <img
              src={data.fullUrl}
              alt={data.title}
              className="max-h-[72vh] w-auto max-w-full rounded-xl object-contain"
            />
          </div>

          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-accent text-center">
            {data.title}
          </h2>
        </div>

        <button
          type="button"
          className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-xl text-accent-color backdrop-blur-xl transition-colors hover:bg-white hover:text-black md:right-6"
          onClick={onNext}
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </button>

        <button
          type="button"
          className="absolute right-2 top-2 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/60 text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition-colors hover:bg-white hover:text-black md:right-6 md:top-6"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-x"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
